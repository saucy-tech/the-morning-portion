import { NextRequest } from 'next/server';

import { handleSubscribe } from '@/lib/subscribe';

export async function POST(req: NextRequest) {
  return handleSubscribe(req);
}
