import Metaphor from 'metaphor-node';

import { toXML } from '@/lib/xml';
import { browse } from '@/registry/internet/processor/browse';

const metaphor = new Metaphor(process.env.METAPHOR_API_KEY ?? '');

export type AgentToolName = 'browse' | 'search' | 'finish' | 'error';

export async function invokeTool({
  name,
  parameters,
}: {
  name: AgentToolName;
  parameters: { name: string; value: string | number }[];
}): Promise<string | undefined> {
  if (name === 'browse') {
    const url = parameters.find(p => p.name === 'url')?.value;
    if (!url || typeof url !== 'string') {
      return;
    }
    const res = await browse({ url });
    return toXML({ browseResult: res?.content });
  } else if (name === 'search') {
    const query = parameters.find(p => p.name === 'query')?.value;
    if (!query || typeof query !== 'string') {
      return;
    }
    const res = await metaphor.search(query, {
      type: 'keyword',
      useAutoprompt: true,
      numResults: 10,
    });
    return toXML({
      searchResults: res.results.map(r => ({
        result: { url: r.url, title: r.title },
      })),
    });
  }
}
