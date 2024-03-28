import { fetchRequestHandler } from '@trpc/server/adapters/fetch';

import { appRouter } from '@/registry/routers';

// note: increase this if deploying on vercel pro
export const maxDuration = 10;
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
