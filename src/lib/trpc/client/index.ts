import { createTRPCReact } from '@trpc/react-query';

import type { AppRouter } from '@/registry/routers';

export const trpc = createTRPCReact<AppRouter>({});
