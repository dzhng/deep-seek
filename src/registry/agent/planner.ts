import { z } from 'zod';

import { opusCompletion } from '@/services/llm';
import { toXML } from '@/lib/xml';
import { AgentToolName } from '@/registry/agent/tools';

export async function createResearchPlan({ objective }: { objective: string }) {
  const schema = z.object({
    scratchpad: z
      .string()
      .describe(
        'Think step-by-step about what tool to choose, write down your thoughts here.',
      ),
    tool: z.object({
      name: z.string().describe('The name of the tool to use.'),
      parameters: z
        .object({
          name: z.string().describe('The name of the parameter.'),
          value: z
            .union([z.string(), z.number()])
            .describe('The value of the parameter.'),
        })
        .array()
        .describe('Tool parameters.'),
    }),
  });

  // Follows this shape due to how anthropic expects its function calls to be formatted: https://docs.anthropic.com/claude/docs/functions-external-tools#example-tool-use-prompt
  //
  // The list of tools should be composable. For example, given the following query: "Find all the speakers in this event: https://partiful.com/e/kEQfMgxPaDKJXgFNT6n5, find their emails, twitter profile picture, 5 most recent tweets, and any recent news about them or their company."
  //
  // The ideal plan should be:
  // - browse (to get the initial list of speakers)
  // - TODO
  const tools: {
    tool_name: AgentToolName;
    description: string;
    parameters: {
      name: string;
      type: 'string' | 'number';
      description: string;
    }[];
  }[] = [
    {
      tool_name: 'browse',
      description: 'Browse one URL and find specific items on the site.',
      parameters: [
        { name: 'url', type: 'string', description: 'The url to browse.' },
        {
          name: 'query',
          type: 'string',
          description: 'What to find on the site.',
        },
      ],
    },
    {
      tool_name: 'search',
      description:
        'Use a search engine to search for a query and return URLs and preview snippets of the results.',
      parameters: [
        { name: 'query', type: 'string', description: 'The search query.' },
      ],
    },
    {
      tool_name: 'finish',
      description:
        "Use this tool when you have all the data you need to return the final answer to the user's query",
      parameters: [
        {
          name: 'result',
          type: 'string',
          description: 'The final result to return to the user.',
        },
      ],
    },
    {
      tool_name: 'error',
      description:
        'Use this tool when you are stuck or detect an error in the system',
      parameters: [
        {
          name: 'message',
          type: 'string',
          description: 'The error message to show the user.',
        },
      ],
    },
  ];

  const toolsString = toXML({
    // do this mapping so all the keys falls under one "example" node in xml
    tools: tools.map(tool_description => ({ tool_description })),
  });

  const prompt = `User prompt:\n${toXML({ objective })}`;

  const res = await opusCompletion(prompt, {
    systemMessage: `You are an AI planner that is part of a larger information retrieval system. Your job is to choose the right next tool to use given the current state of the system.\nHere is the list of tools that is available to you:\n${toolsString}`,
    schema,
  });

  console.log('PROMPT', prompt);
  console.log('RES', res.content);
  return { data: res.data, respond: res.respond };
}
