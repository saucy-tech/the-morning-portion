import { NextRequest, NextResponse } from 'next/server';

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_SUBSCRIBE = 5;
const MAX_REQUEST_SIZE = 1024 * 1024;
const REQUEST_TIMEOUT = 30_000;

interface RateLimitBucket {
  count: number;
  expires: number;
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

function secureError(message: string, status: number, logDetails?: unknown) {
  if (logDetails) {
    console.error('Subscribe error:', logDetails);
  }

  return NextResponse.json({ error: message }, { status });
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
    response.headers.set('Retry-After', Math.ceil((limit.resetTime - Date.now()) / 1000).toString());
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
  if (!emailValidation.valid) {
    return secureError(emailValidation.error ?? 'Invalid email', 400);
  }

  const formId = process.env.CONVERTKIT_FORM_ID;
  const apiKey = process.env.CONVERTKIT_API_KEY;
  if (!formId || !apiKey) {
    return secureError('Service temporarily unavailable', 503, 'ConvertKit not configured');
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    const response = await fetch(`https://api.convertkit.com/v3/forms/${formId}/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'The-Daily-Word/1.0',
      },
      body: JSON.stringify({
        email: emailValidation.sanitized,
        api_key: apiKey,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      return secureError('Failed to subscribe', 502, data);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof Error && error.name === 'AbortError') {
      return secureError('Request timeout', 504);
    }

    return secureError('Failed to subscribe', 502, error);
  }
}
