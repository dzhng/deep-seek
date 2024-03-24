import { describe, it } from 'node:test';

import { preprocessPrompt } from '@/registry/agent/preprocessor';

describe('preprocessPrompt', () => {
  it('Stock use case', async () => {
    const res = await preprocessPrompt({
      userPrompt: 'Top performing stocks in 2024',
    });
    console.log('Res', res);
  });

  it('Laptop use case', async () => {
    const res = await preprocessPrompt({ userPrompt: 'Best laptops 2024' });
    console.log('Res', res);
  });
});
