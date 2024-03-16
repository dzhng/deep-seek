import { mergeRouters } from '@/lib/trpc/server';
import { testRouter } from '@/registry/routers/test';

export const appRouter = mergeRouters(testRouter);

export type AppRouter = typeof appRouter;
