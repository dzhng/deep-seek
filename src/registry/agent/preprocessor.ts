import { z } from 'zod';

import { opusCompletion } from '@/services/llm';
import { toXML } from '@/lib/xml';

// given a user prompt, preprocess and decompose into the exact object to find and the enriched fields
export async function preprocessPrompt({
  userPrompt,
}: {
  userPrompt: string;
}): Promise<{
  entity: { name: string; description: string };
  columns: { name: string; description: string }[];
  startDate?: Date;
}> {
  const schema = z.object({
    entity: z
      .object({
        name: z
          .string()
          .describe('The name of the entity the results will consist of'),
        description: z
          .string()
          .describe('Describe the entity in more details.'),
      })
      .describe('The type of entity that the result will consist of.'),
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
        'What additional columns should be in the final output, in additional to the main entity column.',
      ),
    startDate: z
      .string()
      .nullish()
      .describe(
        'Earliest date that any results should be from. Respond in ISO 8601 format (e.g. 2023-01-01T00:00:00.000Z)',
      ),
  });

  const examples: { prompt: string; output: z.infer<typeof schema> }[] = [
    {
      prompt:
        'state of art algorithms on 2d image classification with best accuracy on imagenet',
      output: {
        entity: {
          name: 'Research paper',
          description: 'The name of the research paper',
        },
        columns: [
          { name: 'Model', description: 'The name of the model used' },
          {
            name: 'Accuracy',
            description:
              'The accuracy of image classification model evaluated using imagenet',
          },
          { name: 'Year', description: 'The year of the model release.' },
          {
            name: 'Data',
            description:
              'The exact training/validation/test dataset split has been used',
          },
          {
            name: 'Number of params',
            description: 'The model size, how many parameters',
          },
        ],
        startDate: undefined,
      },
    },
    {
      prompt: 'Best laptops 2024',
      output: {
        entity: {
          name: 'Laptop',
          description: 'Model of the laptop',
        },
        columns: [
          { name: 'Brand', description: 'The brand of the laptop' },
          { name: 'Price', description: 'The starting price of the laptop' },
          {
            name: 'Storage',
            description: 'The amount of starting storage the laptop has in GB',
          },
          {
            name: 'RAM',
            description:
              'The amount of RAM the laptop has in its starting config',
          },
        ],
        startDate: '2023-01-01T00:00:00.000Z',
      },
    },
    {
      prompt: 'Best stocks 2024',
      output: {
        entity: {
          name: 'Stock',
          description: 'The name or ticker symbol of the stock',
        },
        columns: [
          {
            name: 'Company',
            description: 'The name of the company the stock represents',
          },
          { name: 'Price', description: 'The current price of the stock' },
          {
            name: 'YTD Return',
            description:
              'The year-to-date return percentage of the stock in 2024',
          },
          {
            name: 'Market Cap',
            description: 'The market capitalization of the company in billions',
          },
          {
            name: 'Sector',
            description: 'The market sector that the company operates in',
          },
        ],
        startDate: '2024-01-01T00:00:00.000Z',
      },
    },
  ];

  const examplesString = toXML({
    // do this mapping so all the keys falls under one "example" node in xml
    examples: examples.map(example => ({ example })),
  });

  const now = new Date();
  const prompt = `Given a prompt from the user, return the columns that should be shown to the user as part of the end result. Each column will be researched seperately and should be a key question that help the user understand the result more. Today is: ${now.toISOString()}\n${toXML({ prompt: userPrompt })}\n\nHere are some potiential examples:\n${examplesString}`;

  const res = await opusCompletion(prompt, {
    systemMessage:
      'You are an AI planner that is part of a larger information retrieval system. The final output from the information retrieval system is a table with a list of results.',
    schema,
  });

  return {
    ...res.data,
    startDate: res.data.startDate ? new Date(res.data.startDate) : undefined,
  };
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
        "The best wine under $2 in the USA, excluding wines above $2, non-USA origin, including specific brand names, varietals, flavor profiles, tasting notes, regions of origin within America, any awards or recognition, average price under $2, availability at major retailers or online,  Here's a great $2 wine you can try in the United States:",
    },
    {
      prompt: 'Best laptops 2024',
      output:
        'Here are some of the best 2024 laptops, excluding older models from 2023 or earlier, including specific product names, key specs like CPU, GPU, RAM, storage, display, battery life, pros and cons of each model, starting prices, release dates, comparisons between top contenders:',
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
