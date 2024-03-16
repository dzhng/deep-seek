import { fetchRequestHandler } from '@trpc/server/adapters/fetch';

import { appRouter } from '@/registry/routers';

// 5 min duration, max for vercel pro plan
export const maxDuration = 300;
export const runtime = 'nodejs';

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: () => ({}),
  });

export const GET = handler;
export const POST = handler;
