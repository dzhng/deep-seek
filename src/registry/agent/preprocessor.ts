import { z } from 'zod';

import { opusCompletion } from '@/services/llm';
import { toXML } from '@/lib/xml';

// given a user prompt, preprocess and decompose into the exact object to find and the enriched fields
export async function preprocessPrompt({
  userPrompt,
}: {
  userPrompt: string;
}): Promise<{
  columns: { name: string; description: string }[];
}> {
  const schema = z.object({
    columns: z
      .object({
        name: z.string().describe('A 1 - 3 word name for the column.'),
        description: z
          .string()
          .describe(
            'Describe the information that is contained in this column.',
          ),
      })
      .array()
      .describe(
        'What additional columns should be in the final output, in additional to the mainField.',
      ),
  });

  const examples: { prompt: string; output: string }[] = [
    {
      prompt:
        'state of art algorithms on 2d image classification with best accuracy on imagenet',
      output: JSON.stringify(
        {
          columns: [
            { name: 'Model', description: 'The name of the model.' },
            {
              name: 'Accuracy',
              description:
                'The accuracy of image classification model evaluated using imagenet',
            },
            { name: 'Year', description: 'The year of the model release.' },
            {
              name: 'Data',
              description:
                'The exact training/validation/test dataset split has been used.',
            },
            {
              name: 'Number of params',
              description: 'The model size, how many parameters',
            },
            { name: 'Paper', description: 'List of recent tweets' },
          ],
        },
        null,
        2,
      ),
    },
    {
      prompt: 'the best LLM model for code generation',
      output: JSON.stringify(
        {
          columns: [
            { name: 'Model', description: 'The name of the model.' },
            {
              name: 'HumanEval',
              description:
                "HumanEval consists of 164 hand-written programming problems with corresponding unit tests. It can test out LLM through a wide range of difficulty levels. This is the most important metrics for LLM's coding capability.",
            },
            {
              name: 'MATH',
              description:
                'MATH is a dataset of 12,500 challenging competition mathematics problems. This can be used to test out if LLM can translate complex mathematical problem statements into accurate and efficient code.',
            },
            {
              name: 'F1 Score',
              description:
                ' F1 score is used to evaluate the quality of generated code by comparing it against reference solutions.',
            },
            { name: 'MMLU', description: 'Undergraduate level knowledge.' },
            { name: 'GPQA', description: 'Graduate level reasoning.' },
          ],
        },
        null,
        2,
      ),
    },
  ];

  const examplesString = toXML({
    // do this mapping so all the keys falls under one "example" node in xml
    examples: examples.map(example => ({ example })),
  });

  const prompt = `Given a prompt from the user, return the columns that should be shown to the user as part of the end result. Each column will be researched seperately and should be a key question that help the user understand the result more.\n${toXML({ prompt: userPrompt })}\n\nHere are some potiential examples:\n${examplesString}`;

  const res = await opusCompletion(prompt, {
    systemMessage:
      'You are an AI planner that is part of a larger information retrieval system. The final output from the information retrieval system is a table with a list of results.',
    schema,
    responsePrefix: '{ "columns": [',
  });

  return res.data;
}

// Given a user prompt, preprocess and generate a neural prompt in string format
export async function preprocessNeuralPrompt({
  userPrompt,
}: {
  userPrompt: string;
}): Promise<string> {
  const schema = z.object({
    prompt: z.string().describe('The original user prompt.'),
    output: z
      .string()
      .describe('The generated neural prompt based on the user input.'),
  });

  const examples: { prompt: string; output: string }[] = [
    {
      prompt: 'the best LLM model for code generation',
      output:
        'The best performing large language model for generating code, including model name and version, code generation capabilities such as completing code, fixing errors, adding comments or documentation, translating between languages, or optimizing code, evaluation metrics and benchmarks used to measure code generation quality. Here is a great LLM model for code generation:',
    },
    {
      prompt:
        'state of art algorithms on 2d image classification with best accuracy on imagenet',
      output:
        'State-of-the-art algorithms for 2D image classification with top accuracy on the ImageNet dataset, specifying algorithm names,exact reported accuracy percentage on ImageNet, computational efficiency in terms of inference speed and model size, comparisons to other leading models. Check out this state of the art algorithm for 2D image classification with the best accuracy on Imagenet:',
    },
    {
      prompt: 'best 2 dollar wine in United States',
      output:
        "The best wine under $2 in the USA, including specific brand names, varietals, flavor profiles, tasting notes, regions of origin within America, any awards or recognition, average price under $2, availability at major retailers or online, excluding wines above $2, non-USA origin.Here's a great $2 wine you can try in the United States:",
    },
  ];

  const examplesString = toXML({
    examples: examples.map(example => ({ example })),
  });

  const promot = `Given a prompt from the user, generate a neural prompt that succinctly describes the task or question at hand.\nUser Prompt: ${toXML({ prompt: userPrompt })}\n\nHere are some potential examples:\n${examplesString}`;

  const neuralPrompt = await opusCompletion(promot, {
    systemMessage:
      'You are an AI planner that is part of a larger information retrieval system. Given user input, your task is to generate a neural prompt. The neural prompt is an explict way to autocomplete user prompt to better retrieve information on the internet. It should be in string format',
    schema,
  });

  return neuralPrompt.data.output;
}
