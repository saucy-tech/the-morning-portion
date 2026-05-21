export const SITE_NAME = 'The Morning Portion';
export const SITE_DESCRIPTION =
  'Morning scripture reflections rooted in the Sunday School lesson series.';
export const SITE_IMAGE = '/images/the-morning-portion-logo.png';

function getVercelUrl() {
  if (!process.env.VERCEL_URL) {
    return undefined;
  }

  return `https://${process.env.VERCEL_URL}`;
}

export const SITE_URL =
  process.env.NEXT_PUBLIC_MORNING_PORTION_URL ||
  process.env.NEXT_PUBLIC_DAILY_WORD_URL ||
  getVercelUrl() ||
  (process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://morningportion.com');

export const PERSONAL_SITE_URL = process.env.NEXT_PUBLIC_PERSONAL_SITE_URL || 'https://saucy.tech';
