import assert from 'node:assert';
import { describe, it } from 'node:test';

import { preprocessPrompt } from '@/registry/agent/preprocessor';

const testCases = [{ input: {} as any, output: {} as any }];

describe('Agent preprocessor', async () => {
  it('Should pass baseline test', async () => {
    for (const test of testCases) {
      const res = await preprocessPrompt(test.input);

      const score = await scoreResults({
        id: 'preprocessor/baseline',
        scoreId: 'xyz',
        input: test.input,
        currentOutput: res,
        idealOutput: test.output,
      });

      assert(score >= 4);
    }
  });
});
