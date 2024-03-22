import { enrichCell } from '@/registry/agent/enrich';
import { preprocessPrompt } from '@/registry/agent/preprocessor';
import { inngest } from '@/registry/inngest/client';
import { aggregateContent } from '@/registry/internet/aggregate-content';
import { browse } from '@/registry/search/browse';
import { generateQueryQuestions } from '@/registry/search/research';
import { retrieve } from '@/registry/search/retrieve';
import { search } from '@/registry/search/search';
import { TableCell } from '@/registry/types';

export const run = inngest.createFunction(
  { id: 'run-query', name: 'Run query' },
  { event: 'app/query.run' },
  async ({ event, step }) => {
    console.info('Running query', event.data.prompt);

    const preprocessed = await step.run('preprocess-prompt', async () =>
      preprocessPrompt({ userPrompt: event.data.prompt }),
    );

    const queryRes = await step.run('search', async () => {
      const query = await generateQueryQuestions(preprocessed.objective);
      const results = await search(query);
      return browse({ results });
    });

    const nodeType = `${preprocessed.mainField.name} - ${preprocessed.mainField.description}`;
    const retrieveRes = await step.run('retrieve', async () =>
      retrieve({
        results: queryRes,
        nodeType,
      }),
    );

    // now iterate through each item and get all data for fields
    const enrichedRes = await step.run('enrich', async () => {
      const ret: TableCell[][] = [];
      for (const res of retrieveRes) {
        const row: TableCell[] = [
          { text: res.title, confidence: 1, sources: res.urls },
        ];

        for (const field of preprocessed.fields) {
          const cell = await enrichCell({
            query: `${field.name} - ${field.description}`,
            content: [res],
          });
          row.push(cell);
        }

        ret.push(row);
      }

      return ret;
    });

    console.log(enrichedRes);
  },
);
