import { last } from 'lodash';
import model from 'wink-eng-lite-web-model';
import winkNLP from 'wink-nlp';

const nlp = winkNLP(model);

export function splitSentence(text: string, minLength = 0): string[] {
  const doc = nlp.readDoc(text);
  const sentences = doc.sentences().out();
  if (minLength === 0 || sentences.length <= 1) {
    return sentences;
  }

  // combine sentences that doesn't match the min length
  return sentences
    .slice(1)
    .reduce(
      (res, cur) =>
        cur.length < minLength
          ? [...res.slice(0, -1), `${last(res)} ${cur}`]
          : [...res, cur],
      [sentences[0]],
    );
}
