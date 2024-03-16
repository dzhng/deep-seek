import { z } from 'zod';

import { protectedProcedure, router } from '@/lib/trpc/server';
import { inngest } from '@/registry/inngest/client';

export const queryRouter = router({
  run: protectedProcedure
    .input(
      z.object({
        prompt: z.string().trim(),
      }),
    )
    .mutation(async ({ input }) => {
      await inngest.send({ name: 'app/query.run', data: input });
    }),
});
