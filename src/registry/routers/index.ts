import { mergeRouters } from '@/lib/trpc/server';
import { queryRouter } from '@/registry/routers/query';
import { testRouter } from '@/registry/routers/test';

export const appRouter = mergeRouters(testRouter, queryRouter);

export type AppRouter = typeof appRouter;
