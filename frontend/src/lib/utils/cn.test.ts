import { describe, it, expect } from 'vitest';
import { cn } from './cn';

describe('cn utility', () => {
  it('merges class names correctly', () => {
    expect(cn('class1', 'class2')).toBe('class1 class2');
    expect(cn('p-4', 'p-8')).toBe('p-8');
    expect(cn('class1', { class2: true, class3: false })).toBe('class1 class2');
  });
});
