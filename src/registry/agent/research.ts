import { z } from 'zod';

import { sonnetCompletion } from '@/services/llm';
import { toXML } from '@/lib/xml';

// given a user prompt, preprocess and decompose into the exact object to find and the enriched fields
export async function preprocessSearchQuery({
  query,
}: {
  query: string;
}): Promise<string> {
  const schema = z.object({
    query: z
      .string()
      .describe('The query that would be used for a google search.'),
  });

  const examples: { prompt: string; output: string }[] = [
    {
      prompt: 'Apple Macbook Air M3 - Price',
      output: 'Price of Apple Macbook Air M3',
    },
  ];

  const examplesString = toXML({
    // do this mapping so all the keys falls under one "example" node in xml
    examples: examples.map(example => ({ example })),
  });

  const prompt = `Given a prompt from the user, return the query that would be used to find the answer to the prompt via a Google Search. \n${toXML({ prompt: query })}\n\nHere are some potiential examples:\n${examplesString}`;

  const res = await sonnetCompletion(prompt, {
    systemMessage:
      'You are an AI planner that is part of a larger information retrieval system.',
    schema,
  });

  return res.data.query;
}
