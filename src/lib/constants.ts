export const SITE_NAME = 'The Daily Word';
export const SITE_DESCRIPTION =
  'Weekday scripture reflections rooted in the Sunday School lesson series.';

function getVercelUrl() {
  if (!process.env.VERCEL_URL) {
    return undefined;
  }

  return `https://${process.env.VERCEL_URL}`;
}

export const SITE_URL =
  process.env.NEXT_PUBLIC_DAILY_WORD_URL ||
  getVercelUrl() ||
  (process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://the-daily-word.vercel.app');

export const PERSONAL_SITE_URL = process.env.NEXT_PUBLIC_PERSONAL_SITE_URL || 'https://saucy.tech';
