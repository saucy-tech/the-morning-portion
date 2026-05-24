import { NextRequest, NextResponse } from 'next/server';

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_SUBSCRIBE = 5;
const MAX_REQUEST_SIZE = 1024 * 1024;
const REQUEST_TIMEOUT = 30_000;
const DEFAULT_REFERRER = 'https://morningportion.com';

interface RateLimitBucket {
  count: number;
  expires: number;
}

interface KitResult {
  ok: boolean;
  alreadySubscribed?: boolean;
  data?: unknown;
}

const rateLimitStore = new Map<string, RateLimitBucket>();

function getClientIP(request: Request): string {
  return (
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-real-ip') ||
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    'unknown'
  );
}

function rateLimit(request: Request): { allowed: boolean; resetTime: number } {
  const key = `subscribe:${getClientIP(request)}`;
  const now = Date.now();
  const bucket = rateLimitStore.get(key);

  if (!bucket || bucket.expires <= now) {
    rateLimitStore.set(key, {
      count: 1,
      expires: now + RATE_LIMIT_WINDOW_MS,
    });
    return { allowed: true, resetTime: now + RATE_LIMIT_WINDOW_MS };
  }

  if (bucket.count >= RATE_LIMIT_SUBSCRIBE) {
    return { allowed: false, resetTime: bucket.expires };
  }

  bucket.count += 1;
  return { allowed: true, resetTime: bucket.expires };
}

function validateEmail(email: unknown): { valid: boolean; sanitized?: string; error?: string } {
  if (typeof email !== 'string') {
    return { valid: false, error: 'Email must be a string' };
  }

  const sanitized = email.trim().toLowerCase();
  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

  if (!emailRegex.test(sanitized)) {
    return { valid: false, error: 'Invalid email format' };
  }

  if (sanitized.length > 254) {
    return { valid: false, error: 'Email too long' };
  }

  return { valid: true, sanitized };
}

function getReferrer(request: Request): string {
  return (
    request.headers.get('referer') ||
    process.env.NEXT_PUBLIC_MORNING_PORTION_URL ||
    DEFAULT_REFERRER
  );
}

async function readKitJson(response: Response): Promise<unknown> {
  return response.json().catch(() => ({}));
}

function extractKitMessage(data: unknown): string {
  if (!data || typeof data !== 'object') {
    return '';
  }

  const record = data as Record<string, unknown>;
  if (Array.isArray(record.errors)) {
    return record.errors.filter((error): error is string => typeof error === 'string').join(' ');
  }

  if (typeof record.message === 'string') {
    return record.message;
  }

  const error = record.error;
  if (typeof error === 'string') {
    return error;
  }

  if (
    error &&
    typeof error === 'object' &&
    'message' in error &&
    typeof (error as { message: unknown }).message === 'string'
  ) {
    return (error as { message: string }).message;
  }

  return '';
}

function isAlreadySubscribedMessage(message: string): boolean {
  const normalized = message.toLowerCase();
  return (
    normalized.includes('already subscribed') ||
    normalized.includes('already a subscriber') ||
    normalized.includes('subscriber already') ||
    normalized.includes('already exists')
  );
}

function getSubscriberId(data: unknown): number | null {
  if (!data || typeof data !== 'object') {
    return null;
  }

  const subscriber = (data as Record<string, unknown>).subscriber;
  if (!subscriber || typeof subscriber !== 'object') {
    return null;
  }

  const id = (subscriber as Record<string, unknown>).id;
  if (typeof id === 'number') {
    return id;
  }

  if (typeof id === 'string') {
    const parsed = Number.parseInt(id, 10);
    return Number.isNaN(parsed) ? null : parsed;
  }

  return null;
}

function secureError(message: string, status: number, logDetails?: unknown) {
  if (logDetails) {
    console.error('Subscribe error:', logDetails);
  }

  return NextResponse.json({ error: message }, { status });
}

async function subscribeWithKitV4(
  formId: string,
  apiKey: string,
  email: string,
  referrer: string,
  signal: AbortSignal
): Promise<KitResult> {
  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'User-Agent': 'The-Morning-Portion/1.0',
    'X-Kit-Api-Key': apiKey,
  };

  const encodedFormId = encodeURIComponent(formId);
  const addByEmailResponse = await fetch(
    `https://api.kit.com/v4/forms/${encodedFormId}/subscribers`,
    {
      method: 'POST',
      headers,
      body: JSON.stringify({
        email_address: email,
        referrer,
      }),
      signal,
    }
  );

  if (addByEmailResponse.ok) {
    return { ok: true };
  }

  const addByEmailData = await readKitJson(addByEmailResponse);
  const addByEmailMessage = extractKitMessage(addByEmailData);
  if (isAlreadySubscribedMessage(addByEmailMessage)) {
    return { ok: true, alreadySubscribed: true };
  }

  if (addByEmailResponse.status !== 422) {
    return { ok: false, data: addByEmailData };
  }

  const createSubscriberResponse = await fetch('https://api.kit.com/v4/subscribers', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      email_address: email,
    }),
    signal,
  });

  const createSubscriberData = await readKitJson(createSubscriberResponse);
  if (!createSubscriberResponse.ok) {
    return { ok: false, data: createSubscriberData };
  }

  const subscriberId = getSubscriberId(createSubscriberData);
  if (!subscriberId) {
    return { ok: false, data: { errors: ['Kit did not return a subscriber id'] } };
  }

  const addByIdResponse = await fetch(
    `https://api.kit.com/v4/forms/${encodedFormId}/subscribers/${subscriberId}`,
    {
      method: 'POST',
      headers,
      body: JSON.stringify({ referrer }),
      signal,
    }
  );

  if (addByIdResponse.ok) {
    return { ok: true };
  }

  const data = await readKitJson(addByIdResponse);
  const message = extractKitMessage(data);
  if (isAlreadySubscribedMessage(message)) {
    return { ok: true, alreadySubscribed: true };
  }

  return { ok: false, data };
}

export async function handleSubscribe(req: NextRequest) {
  const contentLength = req.headers.get('content-length');
  if (contentLength && parseInt(contentLength, 10) > MAX_REQUEST_SIZE) {
    return secureError('Request too large', 413);
  }

  const limit = rateLimit(req);
  if (!limit.allowed) {
    const response = NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 }
    );
    response.headers.set(
      'Retry-After',
      Math.ceil((limit.resetTime - Date.now()) / 1000).toString()
    );
    return response;
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return secureError('Invalid request body', 400);
  }

  const { email } = body as { email?: unknown };
  const emailValidation = validateEmail(email);
  if (!emailValidation.valid || !emailValidation.sanitized) {
    return secureError(emailValidation.error ?? 'Invalid email', 400);
  }
  const emailAddress = emailValidation.sanitized;

  const formId = process.env.CONVERTKIT_FORM_ID;
  const apiKey = process.env.KIT_API_KEY;
  if (!formId || !apiKey) {
    return secureError('Service temporarily unavailable', 503, 'Kit not configured');
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    const result = await subscribeWithKitV4(
      formId,
      apiKey,
      emailAddress,
      getReferrer(req),
      controller.signal
    );

    clearTimeout(timeoutId);

    if (!result.ok) {
      const message = extractKitMessage(result.data);
      if (isAlreadySubscribedMessage(message)) {
        return NextResponse.json({ success: true, alreadySubscribed: true });
      }

      return secureError('Failed to subscribe', 502, result.data);
    }

    return NextResponse.json(
      result.alreadySubscribed ? { success: true, alreadySubscribed: true } : { success: true }
    );
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof Error && error.name === 'AbortError') {
      return secureError('Request timeout', 504);
    }

    return secureError('Failed to subscribe', 502, error);
  }
}
