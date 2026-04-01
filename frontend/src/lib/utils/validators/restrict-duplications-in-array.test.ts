import { describe, it, expect } from 'vitest';
import { hasDuplicateIndicesInArray } from './restrict-duplications-in-array';

describe('hasDuplicateIndicesInArray', () => {
  it('returns false for no duplicates', () => {
    expect(hasDuplicateIndicesInArray([1, 2, 3])).toBe(false);
  });
  
  it('returns true for duplicates', () => {
    expect(hasDuplicateIndicesInArray([1, 2, 2, 3])).toBe(true);
  });
});
