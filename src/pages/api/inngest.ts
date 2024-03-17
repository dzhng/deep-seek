import { serve } from 'inngest/next';

import { inngest } from '@/registry/inngest/client';
import { functions } from '@/registry/inngest/functions';

export default serve({
  client: inngest,
  functions,
  //streaming: 'allow',
});
