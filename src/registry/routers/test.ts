import { z } from 'zod';

import { protectedProcedure, router } from '@/lib/trpc/server';

export const testRouter = router({
  noop: protectedProcedure
    .input(
      z.object({
        message: z.string().trim(),
      }),
    )
    .mutation(async ({ input }) => {
      console.log('noop', input.message);
    }),
});
