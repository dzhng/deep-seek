import Metaphor from 'metaphor-node';

export const metaphor = new Metaphor(process.env.METAPHOR_API_KEY ?? '');
