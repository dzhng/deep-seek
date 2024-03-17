import { serve } from 'inngest/next';

import { inngest } from '@/registry/inngest/client';
import { functions } from '@/registry/inngest/functions';

export const runtime = 'nodejs';

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions,
  streaming: 'allow',
});
