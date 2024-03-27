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
