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

  // —— 月薪 ——
  it('salaryGte: returns true when salary >= threshold', () => {
    expect(evaluateCondition({ salaryGte: 8000 }, makeState({ salary: 8000 }))).toBe(true);
  });

  it('salaryGte: returns false when salary < threshold', () => {
    expect(evaluateCondition({ salaryGte: 10000 }, makeState({ salary: 8000 }))).toBe(false);
  });

  it('salaryLt: returns true when salary < threshold', () => {
    expect(evaluateCondition({ salaryLt: 10000 }, makeState({ salary: 8000 }))).toBe(true);
  });

  // —— 存款 ——
  it('savingsGte: returns true when savings >= threshold', () => {
    expect(evaluateCondition({ savingsGte: 5000 }, makeState({ savings: 5000 }))).toBe(true);
  });

  it('savingsGte: returns false when savings < threshold', () => {
    expect(evaluateCondition({ savingsGte: 10000 }, makeState({ savings: 5000 }))).toBe(false);
  });

  it('savingsLt: returns true when savings < threshold', () => {
    expect(evaluateCondition({ savingsLt: 10000 }, makeState({ savings: 5000 }))).toBe(true);
  });

  // —— 零花钱 ——
  it('allowanceGte: returns true when allowance >= threshold', () => {
    expect(evaluateCondition({ allowanceGte: 200 }, makeState({ allowance: 200 }))).toBe(true);
  });

  it('allowanceLt: returns true when allowance < threshold', () => {
    expect(evaluateCondition({ allowanceLt: 100 }, makeState({ allowance: 50 }))).toBe(true);
  });

  // —— 健康档位 ——
  it('healthIn: returns true when health is in list', () => {
    expect(evaluateCondition({ healthIn: ['healthy', 'subhealthy'] }, makeState({ health: 'healthy' }))).toBe(true);
  });

  it('healthIn: returns false when health not in list', () => {
    expect(evaluateCondition({ healthIn: ['healthy'] }, makeState({ health: 'severe' }))).toBe(false);
  });

  it('healthGte: returns true when health rank >= threshold rank', () => {
    // severe(rank 3) >= mild(rank 2) → true
    expect(evaluateCondition({ healthGte: 'mild' }, makeState({ health: 'severe' }))).toBe(true);
  });

  it('healthGte: returns false when health rank < threshold rank', () => {
    // healthy(rank 0) >= mild(rank 2) → false
    expect(evaluateCondition({ healthGte: 'mild' }, makeState({ health: 'healthy' }))).toBe(false);
  });

  // —— 病症 ——
  it('disease: returns true when disease present', () => {
    const s = makeState();
    s.diseases.add('hypertension');
    expect(evaluateCondition({ disease: 'hypertension' }, s)).toBe(true);
  });

  it('notDisease: returns true when disease absent', () => {
    expect(evaluateCondition({ notDisease: 'cancer' }, makeState())).toBe(true);
  });

  // —— 就业状态机 ——
  it('employment: returns true when matches', () => {
    expect(evaluateCondition({ employment: 'employed' }, makeState({ employment: 'employed' }))).toBe(true);
  });

  it('employmentIn: returns true when in list', () => {
    expect(evaluateCondition({ employmentIn: ['employed', 'selfEmployed'] }, makeState({ employment: 'employed' }))).toBe(true);
  });

  it('notEmployment: returns true when different', () => {
    expect(evaluateCondition({ notEmployment: 'unemployed' }, makeState({ employment: 'employed' }))).toBe(true);
  });

  // —— 婚姻状态机 ——
  it('marriage: returns true when matches', () => {
    expect(evaluateCondition({ marriage: 'single' }, makeState({ marriage: 'single' }))).toBe(true);
  });

  it('marriageIn: returns true when in list', () => {
    expect(evaluateCondition({ marriageIn: ['married', 'divorced'] }, makeState({ marriage: 'divorced' }))).toBe(true);
  });

  // —— 年龄 ——
  it('ageGte: returns true when age >= threshold', () => {
    expect(evaluateCondition({ ageGte: 18 }, makeState({ age: 25 }))).toBe(true);
  });

  it('ageLt: returns true when age < threshold', () => {
    expect(evaluateCondition({ ageLt: 30 }, makeState({ age: 25 }))).toBe(true);
  });

  // —— 结局积分 ——
  it('scoreGte: returns true when all listed tracks meet threshold', () => {
    const s = makeState({ scores: { career: 80, family: 50, freedom: 0, fame: 0, spirit: 0 } });
    expect(evaluateCondition({ scoreGte: { career: 80 } }, s)).toBe(true);
  });

  it('scoreGte: returns false when any listed track below threshold', () => {
    const s = makeState({ scores: { career: 30, family: 50, freedom: 0, fame: 0, spirit: 0 } });
    expect(evaluateCondition({ scoreGte: { career: 80 } }, s)).toBe(false);
  });

  // —— 组合 ——
  it('all: returns true when all sub-conditions true', () => {
    expect(evaluateCondition(
      { all: [{ salaryGte: 5000 }, { employment: 'employed' }] },
      makeState({ salary: 8000, employment: 'employed' }),
    )).toBe(true);
  });

  it('all: returns false when any sub-condition false', () => {
    expect(evaluateCondition(
      { all: [{ salaryGte: 5000 }, { employment: 'unemployed' }] },
      makeState({ salary: 8000, employment: 'employed' }),
    )).toBe(false);
  });

  it('any: returns true when at least one sub-condition true', () => {
    expect(evaluateCondition(
      { any: [{ salaryLt: 5000 }, { employment: 'employed' }] },
      makeState({ salary: 8000, employment: 'employed' }),
    )).toBe(true);
  });

  it('all empty array returns true (always-pass sentinel)', () => {
    expect(evaluateCondition({ all: [] }, makeState())).toBe(true);
  });
});
