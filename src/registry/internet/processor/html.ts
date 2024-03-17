import { JSDOM, VirtualConsole } from 'jsdom';
import { NodeHtmlMarkdown } from 'node-html-markdown';

import { minifyText, normalizeMarkdownHeadings } from '@/lib/format';

const cssSelectorsToRemove = [
  'source',
  'style',
  'iframe',
  'noscript',
  'meta',
  'head',
  'input',
  'nav',
  'footer',
  'script',
  'style',
  'noscript',
  'svg',
  'img',
  'amp-img',
  'image',
  'picture',
  'link',
  '[role="alert"]',
  '[role="dialog"]',
  '[role="alertdialog"]',
  '[role="region"][aria-label*="skip" i]',
  '[aria-modal="true"]',
];

export function processHtml(
  html: string,
  url: string,
): { title: string; text: string; html: string } {
  try {
    const virtualConsole = new VirtualConsole();
    virtualConsole.on('error', () => {
      // No-op to skip console errors.
    });
    virtualConsole.on('log', () => {
      // No-op to skip console logs
    });
    virtualConsole.on('warn', () => {
      // No-op to skip console warns
    });

    const doc = new JSDOM(html, {
      url,
      virtualConsole,
    });

    // NOTE: save the title before we delete all the extra html
    const title = doc.window.document.title;

    for (const selector of cssSelectorsToRemove) {
      const els = doc.window.document.querySelectorAll(selector);
      for (let i = 0; i < els.length; i++) {
        const el = els[i];
        el.remove();
      }
    }

    const cleanedHtml = doc.serialize();
    const markdown = normalizeMarkdownHeadings(
      minifyText(NodeHtmlMarkdown.translate(cleanedHtml)),
    );
    const ret = {
      title: title ? title : markdown.split('\n')[0].trim().slice(0, 140),
      text: markdown,
      html: cleanedHtml,
    };

    // make sure to close jsdom window when the doc isn't needed anymore, to avoid mem leak
    doc.window.close();

    return ret;
  } catch (e) {
    console.error('Error processing jsdom', e);

    // just skip the jsdom compression process and process the markdown directly
    const markdown = normalizeMarkdownHeadings(
      minifyText(NodeHtmlMarkdown.translate(html)),
    );
    return {
      title: markdown.split('\n')[0].trim().slice(0, 140),
      text: markdown,
      html,
    };
  }
}
