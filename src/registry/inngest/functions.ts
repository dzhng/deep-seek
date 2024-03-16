import * as query from './query';
import * as test from './test';

export const functions = [test.noop, query.run];
