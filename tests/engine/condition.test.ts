// tests/engine/condition.test.ts
import { describe, it, expect } from 'vitest';
import { evaluateCondition } from '../../src/engine/condition';
import { makeState } from '../fixtures';

describe('evaluateCondition', () => {
  it('flag: returns true when flag present', () => {
    const s = makeState();
    s.flags.add('milestone_has_job');
    expect(evaluateCondition({ flag: 'milestone_has_job' }, s)).toBe(true);
  });

  it('flag: returns false when flag absent', () => {
    expect(evaluateCondition({ flag: 'milestone_has_job' }, makeState())).toBe(false);
  });

  it('notFlag: inverts flag check', () => {
    expect(evaluateCondition({ notFlag: 'milestone_has_job' }, makeState())).toBe(true);
  });

  it('attrGte: returns true when attr >= threshold', () => {
    expect(evaluateCondition({ attrGte: { 体质: 30 } }, makeState())).toBe(true);
  });

  it('attrGte: returns false when attr < threshold', () => {
    const s = makeState({ attrs: { 智力: 50, 魅力: 50, 体质: 20, 运气: 50, 财富: 50, 快乐: 50 } });
    expect(evaluateCondition({ attrGte: { 体质: 30 } }, s)).toBe(false);
  });

  it('attrLt: returns true when attr < threshold', () => {
    const s = makeState({ attrs: { 智力: 50, 魅力: 50, 体质: 20, 运气: 50, 财富: 50, 快乐: 50 } });
    expect(evaluateCondition({ attrLt: { 体质: 30 } }, s)).toBe(true);
  });

  it('skillGte: checks skill value', () => {
    expect(evaluateCondition({ skillGte: { 硬: 25 } }, makeState())).toBe(true);
  });

  it('all: returns true when all sub-conditions true', () => {
    expect(evaluateCondition({ all: [{ attrGte: { 体质: 30 } }, { attrLt: { 体质: 60 } }] }, makeState())).toBe(true);
  });

  it('all: returns false when any sub-condition false', () => {
    expect(evaluateCondition({ all: [{ attrGte: { 体质: 30 } }, { attrLt: { 体质: 40 } }] }, makeState())).toBe(false);
  });

  it('any: returns true when at least one sub-condition true', () => {
    expect(evaluateCondition({ any: [{ attrLt: { 体质: 30 } }, { attrGte: { 体质: 40 } }] }, makeState())).toBe(true);
  });

  it('all empty array returns true (always-pass sentinel)', () => {
    expect(evaluateCondition({ all: [] }, makeState())).toBe(true);
  });
});
