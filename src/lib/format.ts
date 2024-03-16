import { format } from 'date-fns';
import { compact } from 'lodash';

export const formatDateLong = (date: Date) => format(date, 'MMMM do, yyyy');
export const formatDateShort = (date: Date) => format(date, 'MM/dd/yyyy');

// TODO: convert this to take in user metadata instead, since we're standardizing on metadata now
export function getUserInitials(name: string) {
  const [firstName, lastName] = name.split(' ');
  return lastName ? `${firstName[0]}${lastName[0]}` : firstName.slice(0, 2);
}

export function getUserShortName({
  firstName,
  lastName,
  email,
}: {
  firstName?: string;
  lastName?: string;
  email?: string;
}) {
  return firstName ?? lastName ?? email ?? '';
}

export function getUserFullName({
  firstName,
  lastName,
  email,
}: {
  firstName?: string;
  lastName?: string;
  email?: string;
}) {
  return `${firstName || ''} ${lastName || ''}`.trim() || email;
}

/**
 * Extract the first n paragraphs from the input string. Empty lines does not count as paragraphs
 */
export function getFirstParagraphs(text: string, n = 1) {
  return compact(text.split('\n')).slice(0, n).join('\n') ?? '';
}

/**
 * Replace all the consequative new lines with just one new line char
 */
export function cleanRepetativeNewLines(text: string) {
  const regex = /(\r?\n)+/g;
  return text.replace(regex, '\n');
}

/**
 * Trim all the new lines and combine multiple lines into one
 */
export function minifyText(text: string) {
  // use to remove any lines of text that's just purely a long base64 string (happens in html to markdown conversions)
  const base64regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
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
 * Trim all the non letters from the beginning of a string
 * Useful when you want to remove characters like bullet points or heading tags
 */
export function trimNonLetters(text: string) {
  const regex = /^[^a-zA-Z0-9]+/;
  return text.replace(regex, '');
}

/**
 * Expand custom citation format [[1]] into proper markdown link format (1)[#1]
 */
export function expandCustomCitationLinks(text: string) {
  const regex = /\[\[(\d+)\]\]/g;
  return text.replace(regex, '[$1](#$1)');
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
    ...headings.map(heading => heading.length - heading.replace(/^#+/, '').length),
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

/**
 * Shift the heading levels of input markdown to add `shift` number of tiers to the headings. For example, with a shift of 2, a H1 becomes a H3. Keep the lowest heading tier to H6.
 */
export function shiftMarkdownHeadings(markdown: string, shift: number) {
  const lines = markdown.split('\n');

  return lines
    .map(line => {
      if (line.startsWith('#')) {
        const level = line.length - line.replace(/^#+/, '').length;
        const newLevel = Math.min(level + shift, 6);

        return line.replace(/^#+/, '#'.repeat(newLevel));
      }

      return line;
    })
    .join('\n');
}

/**
 * Delet all markdown headings from input markdown string
 */
export function removeMarkdownHeadings(markdown: string) {
  const lines = markdown.split('\n');

  return compact(
    lines.map(line => {
      if (line.startsWith('#')) {
        return null;
      }

      return line;
    }),
  ).join('\n');
}

/**
 * Chunks a string into an array of chunks.
 *
 * @param text - string to chunk
 * @param maxLength - maximum length of each chunk
 * @returns array of chunks
 */
export function chunkString(text: string, maxLength: number): string[] {
  const words = text.split(' ');
  const chunks: string[] = [];
  let chunk = '';

  for (const word of words) {
    if (word.length > maxLength) {
      // Truncate the word if it's too long and indicate that it was truncated:
      chunks.push(word.substring(0, maxLength - 3) + '...');
    } else if ((chunk + ' ' + word).length > maxLength) {
      chunks.push(chunk.trim());
      chunk = word;
    } else {
      chunk += (chunk ? ' ' : '') + word;
    }
  }

  if (chunk) {
    chunks.push(chunk.trim());
  }

  return chunks;
}

/**
 * Chunks an array of strings into an array of chunks while preserving existing sections.
 *
 * @param textSections - array of strings to chunk
 * @param maxLength - maximum length of each chunk
 * @returns array of chunks
 */
export function chunkMultipleStrings(textSections: string[], maxLength: number): string[] {
  return textSections.map(section => chunkString(section, maxLength)).flat();
}

export function compressString(s: string) {
  return s
    .toLowerCase()
    .replaceAll(/[^a-zA-Z\d\s]*/g, '')
    .replaceAll('\n', '')
    .replaceAll('\r', '')
    .replaceAll(' ', '');
}
