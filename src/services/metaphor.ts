import Metaphor from 'metaphor-node';

export const metaphor = new Metaphor(process.env.EXA_KEY ?? '');
