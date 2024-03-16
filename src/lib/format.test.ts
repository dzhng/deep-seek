import assert from 'node:assert';
import { describe, it } from 'node:test';

import { minifyText } from './format';

describe('minifyText', () => {
  it('Should minify text with newlines and spaces correctly', () => {
    const testString = `
          
                US Markets Loading...
                  
                    H
                    M
                    S
                  
                  
          
    
                          
                            Insider asked Bing's personalities the same five questions and compared their answers.
                          
   `;

    const resString = `US Markets Loading...
H
M
S
Insider asked Bing's personalities the same five questions and compared their answers.`;

    const res = minifyText(testString);
    assert.strictEqual(res, resString);
  });

  it('Should minify text with tabs correctly', () => {
    const testString = `		
\t\t\t
\t\t
\t
Back in 2021, the developers of the privacy-focused web browser Brave announced their own search engine to compete with Google and Bing.
    `;

    const resString =
      'Back in 2021, the developers of the privacy-focused web browser Brave announced their own search engine to compete with Google and Bing.';

    const res = minifyText(testString);
    assert.strictEqual(res, resString);
  });
});
