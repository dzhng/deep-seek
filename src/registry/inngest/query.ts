import { preprocessPrompt } from '@/registry/agent/preprocessor';
import { inngest } from '@/registry/inngest/client';
import { mergeContent } from '@/registry/internet/merge-content';
import { searchAndBrowse } from '@/registry/search/search-browse';

export const run = inngest.createFunction(
  { id: 'run-query', name: 'Run query' },
  { event: 'app/query.run' },
  async ({ event, step }) => {
    console.info('Running query', event.data.prompt);

    const preprocessed = await step.run('preprocess-prompt', async () =>
      preprocessPrompt({ userPrompt: event.data.prompt }),
    );

    const nodeType = `${preprocessed.mainField.name} - ${preprocessed.mainField.description}`;
    const browseRes = await step.run('search-browse', async () =>
      searchAndBrowse({
        query: preprocessed.objective,
        nodeType,
      }),
    );

    const merged = await step.run('merge-content', async () =>
      mergeContent({ content: browseRes, nodeType }),
    );

    // now iterate through each item and get all data for fields
  },
);
