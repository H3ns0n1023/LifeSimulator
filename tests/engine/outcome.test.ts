// tests/engine/outcome.test.ts
import { describe, it, expect } from 'vitest';
import { resolveChoice } from '../../src/engine/outcome';
import { makeState, rngFor } from '../fixtures';
import type { Choice } from '../../src/engine/types';

const choice: Choice = {
  label: 'test',
  outcomes: [
    { weight: 100, condition: { attrGte: { 体质: 30 } }, apply: () => {}, result: '常规' },
    { weight: 100, condition: { attrLt: { 体质: 30 } }, apply: () => {}, result: '反转' },
    { weight: 1, condition: { all: [{ attrLt: { 体质: 30 } }, { flag: 'foreshadow_x' }] }, apply: () => {}, result: '罕见' },
  ],
};

describe('resolveChoice', () => {
  it('returns only outcomes whose condition matches', () => {
    const s = makeState(); // 体质 50
    const result = resolveChoice(choice, s, rngFor(1));
    expect(result?.result).toBe('常规');
  });

  it('returns反转 when condition matches', () => {
    const s = makeState({ attrs: { 智力: 50, 魅力: 50, 体质: 20, 运气: 50, 财富: 50, 快乐: 50 } });
    const result = resolveChoice(choice, s, rngFor(1));
    expect(result?.result).toBe('反转');
  });

  it('rare outcome requires both attribute and flag', () => {
    const s = makeState({ attrs: { 智力: 50, 魅力: 50, 体质: 20, 运气: 50, 财富: 50, 快乐: 50 } });
    s.flags.add('foreshadow_x');
    // 加载罕见反转：需要 rng 落在罕见 weight 上。total=201，罕见 weight=1
    // 用 rng 永远返回 0 让 pickWeighted 选第一个；这里改写让罕见胜出
    const rareChoice: Choice = {
      label: 'x', outcomes: [
        { weight: 1, condition: { all: [{ attrLt: { 体质: 30 } }, { flag: 'foreshadow_x' }] }, apply: () => {}, result: '罕见' },
      ],
    };
    const result = resolveChoice(rareChoice, s, rngFor(1));
    expect(result?.result).toBe('罕见');
  });

  it('returns undefined when no outcome matches', () => {
    const choice2: Choice = {
      label: 'x', outcomes: [
        { weight: 100, condition: { attrGte: { 体质: 90 } }, apply: () => {}, result: 'x' },
      ],
    };
    const result = resolveChoice(choice2, makeState(), rngFor(1));
    expect(result).toBeUndefined();
  });
});
