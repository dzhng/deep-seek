import { inngest } from '@/registry/inngest/client';

export const noop = inngest.createFunction(
  { id: 'test-noop', name: 'Inngest test function' },
  { event: 'test/noop' },
  async () => {
    console.log('test complete');
  },
);
