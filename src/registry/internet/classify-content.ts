import { z } from 'zod';

import { BrowseResult } from '@/services/browse';
import { haikuCompletion } from '@/services/llm';

const SystemPrompt = `You are an expert AI agent tasked with browsing and classifying websites. Follow the user's instructions exactly. Never say common misconceptions, outdated information, lies, fiction, myths, jokes, or memes. The user has an IQ of 200 and require expert level knowledge. Never write any information that is not in the original content.`;

export async function classifyContent({
  entity,
  content,
}: {
  entity: string;
  content: BrowseResult;
}): Promise<'list' | 'content' | 'unrelated'> {
  const { data } = await haikuCompletion(
    `Given an input entity type, classify the given document into one of 3 buckets:\nlist: this document contains multiple sections talking about multiple instance of the given entity.\ncontent: this document is related to a specific instance of the entity.\nunrelated: this document does not contain any information about the entity given.\n\nInputs:\n<entity>${entity}</entity>\n<document>\n<title>${content.title}</title>\n<content>\n${content.content}\n</content>\n</document>`,
    {
      systemMessage: SystemPrompt,
      schema: z.object({
        reason: z
          .string()
          .describe('Describe how you would classify this content'),
        type: z
          .string()
          .describe(
            'The final classification of the given document, should be either "list", "content", or "unrelated", without quotes.',
          ),
      }),
      autoSlice: true,
      minimumResponseTokens: 2000,
    },
  );

  return (
    ['list', 'content', 'unrelated'].includes(data.type)
      ? data.type
      : 'unrelated'
  ) as 'list' | 'content' | 'unrelated';
}
