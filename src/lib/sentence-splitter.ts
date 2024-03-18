import model from 'wink-eng-lite-web-model';
import winkNLP from 'wink-nlp';

// Instantiate winkNLP.
const nlp = winkNLP(model);

export function splitSentence(text: string): string[] {
  const doc = nlp.readDoc(text);
  return doc.sentences().out();
}
