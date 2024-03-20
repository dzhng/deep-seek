import { describe, it } from 'node:test';

import { generateQueryQuestions } from '@/registry/search/research';
import { search } from '@/registry/search/search';

describe('searchAndBrowse', () => {
  it('It should extract the right content for a search result', async () => {
    const { objective, queries } = await generateQueryQuestions(
      'Best laptops under $2000',
    );
    const content = await search({
      objective,
      queries,
    });

    //query: 'Best laptops under $2000',
    //nodeType: 'Laptop - Name and model of the laptop',

    console.log('CONTENT', content);
  });
});
