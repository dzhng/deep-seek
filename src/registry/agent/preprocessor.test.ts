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
  it('Generates neural prompt for code generation model', async () => {
    const neuralPrompt = await preprocessNeuralPrompt({
      userPrompt: 'the best LLM model for code generation',
    });
    console.log('neuralPrompt', neuralPrompt);
  });
});
