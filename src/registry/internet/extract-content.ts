import { flatten } from 'lodash';
import { z } from 'zod';

import { BrowseResult } from '@/services/browse';
import { haikuCompletion } from '@/services/llm';
import { splitSentence } from '@/lib/sentence-splitter';
import { ContentResult } from '@/registry/types';

const SystemPrompt = `You are an expert AI agent tasked with browsing and classifying websites. Follow the user's instructions exactly. Never say common misconceptions, outdated information, lies, fiction, myths, jokes, or memes. The user has an IQ of 200 and require expert level knowledge. Never write any information that is not in the original content.`;

const completion: typeof haikuCompletion = (prompt, opt) =>
  haikuCompletion(prompt, { ...opt, systemMessage: SystemPrompt });

// insert markers into the page content for the llm to use as anchor for text extraction
export function processContent(content: string): {
  content: string;
  sentences: string[];
} {
  const lines = content.split('\n');
  let markerIndex = 2;

  const processed = lines.map(line => {
    if (!line) {
      return { content: '', sentences: [] };
    }

    const sentences = splitSentence(line, 16);
    // add marker at beginning of line, then at end of each sentence.
    return {
      content: sentences.map(s => `${s}<m>${markerIndex++}</m>`).join(' '),
      sentences,
    };
  });

  return {
    content: `<m>1</m>${processed.map(p => p.content).join('\n')}`,
    sentences: flatten(
      processed.map(p =>
        p.sentences.map(
          (s, idx) => s + (idx === p.sentences.length - 1 ? '\n' : ' '),
        ),
      ),
    ),
  };
}

export async function extractContent({
  page,
  query,
  nodeType,
}: {
  page: BrowseResult;
  query: string;
  nodeType?: string;
}): Promise<ContentResult[]> {
  const processed = processContent(page.content);
  const { data } = await completion(
    `Given the following page content, extract any relevant text from the page that can be used to answer the following query:\n<query>${query}</query>\n\nThe content will be marked by markers that looks like this: <m>1</m>, select the text in between 2 markers to extract it. Make sure the content extracted is comprehensive enough that it can makes sense on its own. The text extracted should contain detailed information about the query. The text extracted will form nodes on a knowledge graph.${nodeType ? ` Make sure the extracted content is of this type:\n<type>${nodeType}</type>` : ''}\n\nPage content:\n<page>\n<title>\n${page.title}\n<title>\n<content>\n${processed.content}\n</content>\n</page>`,
    {
      schema: z.object({
        markers: z
          .object({
            reason: z.string().describe('Describe why this text is selected.'),
            title: z
              .string()
              .describe(
                'The title of this node on the knowledge graph, be as specific as possible. If the extracted text talks about a specific product, use the exact name of the product as the title.',
              ),
            from: z.number().describe('The initial marker id to start from.'),
            to: z
              .number()
              .describe(
                'The marker id to end selection at, make sure it is AFTER the from marker.',
              ),
          })
          .array()
          .describe(
            'Markers to select to extract the text. Return empty array if no relevant text is found in the content.',
          ),
      }),
      autoSlice: true,
      minimumResponseTokens: 2000,
    },
  );

  return data.markers.map(marker => ({
    reason: marker.reason,
    title: marker.title,
    text: processed.sentences
      .slice(marker.from - 1, marker.to - 1)
      .join('')
      .trim(),
  }));
}
