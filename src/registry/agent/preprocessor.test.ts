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
  it('Generates neural prompt for image classification', async () => {
    const userPrompt =
      'state of art algorithms on 2d image classification with best accuracy on imagenet';
    const expectedSubstring =
      '2D image classification algorithms evaluated on ImageNet';
    const neuralPrompt = await preprocessNeuralPrompt({ userPrompt });

    assert(
      neuralPrompt.includes(expectedSubstring),
      `The neural prompt should include the substring: "${expectedSubstring}"`,
    );
  });

  it('Generates neural prompt for code generation model', async () => {
    const userPrompt = 'the best LLM model for code generation';
    const expectedSubstring = 'top-performing LLM models for code generation';
    const neuralPrompt = await preprocessNeuralPrompt({ userPrompt });

    assert(
      neuralPrompt.includes(expectedSubstring),
      `The neural prompt should include the substring: "${expectedSubstring}"`,
    );
  });
});
