import assert from 'assert';
import { describe, it } from 'node:test';

import {
  preprocessNeuralPrompt,
  preprocessPrompt,
} from '@/registry/agent/preprocessor';

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

describe('preprocessNeuralPrompt', () => {
  it('Shampoo use case', async () => {
    const neuralPrompt = await preprocessNeuralPrompt({
      userPrompt: 'Best shampoo in 2024',
    });
    console.log('neuralPrompt \n', neuralPrompt);
  });

  it('Stock use case', async () => {
    const neuralPrompt = await preprocessNeuralPrompt({
      userPrompt: 'Top performing stocks in 2024',
    });
    console.log('neuralPrompt \n', neuralPrompt);
  });
});
