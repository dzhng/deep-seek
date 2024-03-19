import { describe, it } from 'node:test';

import { searchAndBrowse } from '@/registry/search/search-browse';

describe('searchAndBrowse', () => {
  it('It should extract the right content for a search result', async () => {
    const content = await searchAndBrowse({
      query: 'Best laptops under $2000',
    });

    console.log('CONTENT', content);
  });
});
