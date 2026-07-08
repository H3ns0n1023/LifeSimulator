// tests/engine/ending.test.ts
import { describe, it, expect } from 'vitest';
import { resolveEnding } from '../../src/engine/ending';
import { makeState } from '../fixtures';
import type { Ending } from '../../src/engine/types';

const endings: Ending[] = [
  { id: 'default', priority: 0, condition: () => true, title: '平凡', desc: () => '', rating: () => 'C' },
  { id: 'rich', priority: 50, condition: (s) => s.attrs.财富 >= 85, title: '富豪', desc: () => '', rating: () => 'S' },
  { id: 'twist', priority: 100, condition: (s) => s.flags.has('twist_x'), title: '反转', desc: () => '', rating: () => 'B' },
];

describe('resolveEnding', () => {
  it('returns highest-priority matching ending', () => {
    const s = makeState();
    s.flags.add('twist_x');
    expect(resolveEnding(endings, s).id).toBe('twist');
  });

  it('falls back to lower priority when higher does not match', () => {
    const s = makeState({ attrs: { 智力: 50, 魅力: 50, 体质: 50, 运气: 50, 财富: 90, 快乐: 50 } });
    expect(resolveEnding(endings, s).id).toBe('rich');
  });

  it('falls back to default when nothing else matches', () => {
    expect(resolveEnding(endings, makeState()).id).toBe('default');
  });
});
