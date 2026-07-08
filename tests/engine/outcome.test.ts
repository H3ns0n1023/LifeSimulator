// tests/engine/outcome.test.ts
import { describe, it, expect } from 'vitest';
import { resolveChoice } from '../../src/engine/outcome';
import { makeState, rngFor } from '../fixtures';
import type { Choice } from '../../src/engine/types';

const choice: Choice = {
  label: 'test',
  outcomes: [
    { weight: 100, condition: { salaryGte: 5000 }, apply: () => {}, result: '常规' },
    { weight: 100, condition: { salaryLt: 5000 }, apply: () => {}, result: '反转' },
    { weight: 1, condition: { all: [{ salaryLt: 5000 }, { flag: 'foreshadow_x' }] }, apply: () => {}, result: '罕见' },
  ],
};

describe('resolveChoice', () => {
  it('returns only outcomes whose condition matches', () => {
    const s = makeState({ salary: 8000 }); // 高薪
    const result = resolveChoice(choice, s, rngFor(1));
    expect(result?.result).toBe('常规');
  });

  it('returns反转 when condition matches', () => {
    const s = makeState({ salary: 3000 });
    const result = resolveChoice(choice, s, rngFor(1));
    // 低薪时常规和罕见都可能匹配，但罕见 weight=1 vs 反转 weight=100，
    // rngFor(1) 第一次抽样几乎必然选反转
    expect(['反转', '罕见']).toContain(result?.result);
  });

  it('rare outcome requires both low salary and flag', () => {
    const s = makeState({ salary: 3000 });
    s.flags.add('foreshadow_x');
    const rareChoice: Choice = {
      label: 'x', outcomes: [
        { weight: 1, condition: { all: [{ salaryLt: 5000 }, { flag: 'foreshadow_x' }] }, apply: () => {}, result: '罕见' },
      ],
    };
    const result = resolveChoice(rareChoice, s, rngFor(1));
    expect(result?.result).toBe('罕见');
  });

  it('returns undefined when no outcome matches', () => {
    const choice2: Choice = {
      label: 'x', outcomes: [
        { weight: 100, condition: { salaryGte: 50000 }, apply: () => {}, result: 'x' },
      ],
    };
    const result = resolveChoice(choice2, makeState({ salary: 8000 }), rngFor(1));
    expect(result).toBeUndefined();
  });
});
