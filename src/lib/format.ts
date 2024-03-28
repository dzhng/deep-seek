import { compact } from 'lodash';

/**
 * Trim all the new lines and combine multiple lines into one
 */
export function minifyText(text: string) {
  // use to remove any lines of text that's just purely a long base64 string (happens in html to markdown conversions)
  const base64regex =
    /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
  const regex = /(\r?\n)+/g;
  const lines = text.split('\n');
  return (
    compact(lines.map(s => s.trim()).map(s => (base64regex.test(s) ? null : s)))
      .join('\n')
      .trim()
      // reduce all the empty new lines into one
      // note this must be done after trim, since white spaces will affect the regex
      .replace(regex, '\n')
  );
}

/**
 * Normalize the headlings level of input markdown so that there will always be a H1
 * If H1 does not existing in the input markdown, shift all headings up until the highest level is H1
 */
export function normalizeMarkdownHeadings(markdown: string) {
  const lines = markdown.split('\n');
  const headings = lines.filter(line => line.startsWith('#'));

  if (headings.length === 0) {
    return markdown;
  }

  const minLevel = Math.min(
    ...headings.map(
      heading => heading.length - heading.replace(/^#+/, '').length,
    ),
  );
  const shift = minLevel - 1;

  return lines
    .map(line => {
      if (line.startsWith('#')) {
        return line.replace(
          /^#+/,
          '#'.repeat(line.length - line.replace(/^#+/, '').length - shift),
        );
      }

      return line;
    })
    .join('\n');
}
