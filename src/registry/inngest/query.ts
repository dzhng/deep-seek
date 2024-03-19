import { preprocessPrompt } from '@/registry/agent/preprocessor';
import { inngest } from '@/registry/inngest/client';
import { searchAndBrowse } from '@/registry/search/search-browse';

export const run = inngest.createFunction(
  { id: 'run-query', name: 'Run query' },
  { event: 'app/query.run' },
  async ({ event, step }) => {
    console.info('Running query', event.data.prompt);

    const preprocessed = await step.run('preprocess-prompt', async () =>
      preprocessPrompt({ userPrompt: event.data.prompt }),
    );

    const res = await step.run('search-browse', async () =>
      searchAndBrowse({
        query: preprocessed.objective,
        nodesToExtract: [
          `${preprocessed.mainField.name} - ${preprocessed.mainField.description}`,
        ],
      }),
    );

    console.log(res);
  },
);
