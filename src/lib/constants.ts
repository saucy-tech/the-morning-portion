export const SITE_NAME = 'The Morning Portion';
export const SITE_DESCRIPTION =
  'Morning scripture reflections rooted in the Sunday School lesson series.';
export const SITE_IMAGE = '/images/the-morning-portion-logo.png';
export const SITE_IMAGE_DARK = '/images/the-morning-portion-logo-dark.png';

function getVercelUrl() {
  if (!process.env.VERCEL_URL) {
    return undefined;
  }

  return `https://${process.env.VERCEL_URL}`;
}

function getPublicExternalUrl(value: string | undefined) {
  if (!value) {
    return undefined;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }

  try {
    const url = new URL(trimmed);
    const isHttps = url.protocol === 'https:';
    const isLocalHttp = process.env.NODE_ENV === 'development' && url.protocol === 'http:';

    if (!isHttps && !isLocalHttp) {
      return undefined;
    }

    return url.toString();
  } catch {
    return undefined;
  }
}

export const SITE_URL =
  process.env.NEXT_PUBLIC_MORNING_PORTION_URL ||
  process.env.NEXT_PUBLIC_DAILY_WORD_URL ||
  getVercelUrl() ||
  (process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://morningportion.com');

export const PERSONAL_SITE_URL = process.env.NEXT_PUBLIC_PERSONAL_SITE_URL || 'https://saucy.tech';

export const MORNING_PORTION_LIGHTNING_URL = getPublicExternalUrl(
  process.env.NEXT_PUBLIC_MORNING_PORTION_LIGHTNING_URL
);

export const STRIPE_PAYMENT_LINK_URL = getPublicExternalUrl(
  process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK_URL
);
