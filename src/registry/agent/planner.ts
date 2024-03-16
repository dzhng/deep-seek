import { toXML } from 'jstoxml';
import { z } from 'zod';

import { opusCompletion } from '@/services/llm';

// given a user prompt, preprocess and decompose into the exact object to find and the enriched fields
export async function preprocessPrompt({
  userPrompt,
}: {
  userPrompt: string;
}): Promise<{
  objective: string;
  direction?: string;
  urls: string[];
  fields: { name: string; description: string }[];
}> {
  const schema = z.object({
    objective: z
      .string()
      .describe('The overall objective in one short sentence.'),
    direction: z
      .string()
      .describe(
        'Summarize how an information retrieval system would execute this.',
      )
      .optional(),
    urls: z
      .string()
      .array()
      .describe(
        'A list of URLs that is included in the user prompt, can be an empty array if nothing is included.',
      ),
    fields: z
      .object({
        name: z.string().describe('A 1 - 3 word name for the column.'),
        description: z
          .string()
          .describe(
            'Describe the information that is contained in this column.',
          ),
      })
      .array()
      .describe('What columns should be in the final output.'),
  });

  const examples: { prompt: string; output: z.infer<typeof schema> }[] = [
    {
      prompt:
        'Find all the speakers in this event: https://partiful.com/e/kEQfMgxPaDKJXgFNT6n5, find their emails, twitter profile picture, 5 most recent tweets, and any recent news about them or their company.',
      output: {
        objective: 'Find all the speakers in this event and enrich.',
        direction:
          'Go to the URL, extract a list of speaker speakers, then research each fields individually.',
        urls: ['https://partiful.com/e/kEQfMgxPaDKJXgFNT6n5'],
        fields: [
          { name: 'Email', description: 'Email of the speaker' },
          {
            name: 'Twitter picture',
            description: 'URL of the twitter profile picture',
          },
          { name: 'Recent tweets', description: 'List of recent tweets' },
          { name: 'Recent news', description: 'Summary of recent news' },
        ],
      },
    },
    {
      prompt:
        'Find a list of all the companies who have spoken at agi house the last month.',
      output: {
        objective:
          'Find all companies who have sponen at agi house last month.',
        direction:
          'Search for agi house events, extract companies from each event.',
        urls: [],
        fields: [
          { name: 'Name', description: 'Company name' },
          { name: 'Domain', description: 'Company domain' },
        ],
      },
    },
  ];

  const examplesString = toXML({
    // do this mapping so all the keys falls under one "example" node in xml
    examples: examples.map(example => ({ example })),
  });

  const prompt = `Given a prompt from the user, break it down so it can be processed by an intelligent AI that can scrape and gather information from the internet.\n${toXML({ prompt: userPrompt })}\n\nHere are some potiential examples:\n${examplesString}`;

  console.log('PROMPT', prompt);

  const res = await opusCompletion(prompt, {
    systemMessage:
      'You are an AI planner that is part of a larger information retrieval system. Your job is to break down prompts submitted by the user into precise directions for other AI agents to execute down the line. The final output from the information retrieval system is a table with a list of results.',
    schema,
  });

  return res.data;
}

export async function createResearchPlan({ prompt }: { prompt: string }) {}
