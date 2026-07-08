// tests/engine/status.test.ts
import { describe, it, expect } from 'vitest';
import {
  worsenHealth, improveHealth, setHealth, healthAtLeast,
  addDisease, removeDisease, hasDisease,
  transitionEmployment, transitionMarriage,
  setSalary, adjustSalary, applyYearlySalary,
  setSavings, adjustSavings, setAllowance, adjustAllowance,
  netWorth, wealthTier,
  addScore, totalScore, topTrack,
} from '../../src/engine/status';
import { makeState } from '../fixtures';

describe('健康档位操作', () => {
  it('worsenHealth 降一档', () => {
    const s = makeState({ health: 'healthy' });
    expect(worsenHealth(s)).toBe(true);
    expect(s.health).toBe('subhealthy');
  });

  it('worsenHealth 到 critical 后不再升档（返回 false）', () => {
    const s = makeState({ health: 'critical' });
    expect(worsenHealth(s)).toBe(false);
    expect(s.health).toBe('critical');
  });

  it('improveHealth 升一档', () => {
    const s = makeState({ health: 'severe' });
    expect(improveHealth(s)).toBe(true);
    expect(s.health).toBe('mild');
  });

  it('improveHealth 到 healthy 后不再升档', () => {
    const s = makeState({ health: 'healthy' });
    expect(improveHealth(s)).toBe(false);
    expect(s.health).toBe('healthy');
  });

  it('setHealth 直接设档', () => {
    const s = makeState({ health: 'healthy' });
    setHealth(s, 'critical');
    expect(s.health).toBe('critical');
  });

  it('healthAtLeast 比较严重程度', () => {
    const s = makeState({ health: 'severe' });
    expect(healthAtLeast(s, 'mild')).toBe(true);
    expect(healthAtLeast(s, 'critical')).toBe(false);
  });
});

describe('病症管理', () => {
  it('addDisease 幂等', () => {
    const s = makeState({ health: 'healthy' });
    addDisease(s, 'hypertension');
    addDisease(s, 'hypertension'); // 重复不报错
    expect(hasDisease(s, 'hypertension')).toBe(true);
    expect(s.diseases.size).toBe(1);
  });

  it('addDisease 重病自动降健康档', () => {
    const s = makeState({ health: 'healthy' });
    addDisease(s, 'hypertension'); // impact = mild
    expect(s.health).toBe('mild');
  });

  it('addDisease 不升档（已是更严重档位时）', () => {
    const s = makeState({ health: 'critical' });
    addDisease(s, 'hypertension'); // impact = mild，但当前已 critical
    expect(s.health).toBe('critical');
  });

  it('removeDisease 不自动恢复健康', () => {
    const s = makeState({ health: 'mild' });
    s.diseases.add('hypertension');
    removeDisease(s, 'hypertension');
    expect(hasDisease(s, 'hypertension')).toBe(false);
    expect(s.health).toBe('mild'); // 需手动 improveHealth
  });
});

describe('就业状态机', () => {
  it('合法转换成功', () => {
    const s = makeState({ employment: 'employed' });
    transitionEmployment(s, 'retired');
    expect(s.employment).toBe('retired');
  });

  it('非法转换抛错（防止状态冲突）', () => {
    const s = makeState({ employment: 'student' });
    expect(() => transitionEmployment(s, 'retired')).toThrow(/非法就业转换/);
  });

  it('deceased 不可逆', () => {
    const s = makeState({ employment: 'deceased' });
    expect(() => transitionEmployment(s, 'employed')).toThrow(/非法就业转换/);
  });
});

describe('婚姻状态机', () => {
  it('合法转换成功', () => {
    const s = makeState({ marriage: 'single' });
    transitionMarriage(s, 'married');
    expect(s.marriage).toBe('married');
  });

  it('married 可离婚', () => {
    const s = makeState({ marriage: 'married' });
    transitionMarriage(s, 'divorced');
    expect(s.marriage).toBe('divorced');
  });

  it('married 不能直接变 single（必须先离婚/丧偶）', () => {
    const s = makeState({ marriage: 'married' });
    // married 的合法去向是 married/divorced/widowed，没有 single
    expect(() => transitionMarriage(s, 'single')).toThrow(/非法婚姻转换/);
  });

  it('married 可以维持 married（确认婚姻状态）', () => {
    const s = makeState({ marriage: 'married' });
    transitionMarriage(s, 'married'); // 自转合法
    expect(s.marriage).toBe('married');
  });
});

describe('月薪', () => {
  it('setSalary 设置值', () => {
    const s = makeState();
    setSalary(s, 15000);
    expect(s.salary).toBe(15000);
  });

  it('setSalary 不下穿 0', () => {
    const s = makeState();
    setSalary(s, -1000);
    expect(s.salary).toBe(0);
  });

  it('adjustSalary 增减', () => {
    const s = makeState({ salary: 8000 });
    adjustSalary(s, 2000);
    expect(s.salary).toBe(10000);
    adjustSalary(s, -15000);
    expect(s.salary).toBe(0); // 不下穿
  });
});

describe('结局积分', () => {
  it('addScore 加分', () => {
    const s = makeState();
    addScore(s, 'career', 30);
    expect(s.scores.career).toBe(30);
  });

  it('addScore 上限 100（防膨胀）', () => {
    const s = makeState({ scores: { career: 90, family: 0, freedom: 0, fame: 0, spirit: 0 } });
    addScore(s, 'career', 30);
    expect(s.scores.career).toBe(100);
  });

  it('addScore 不下穿 0', () => {
    const s = makeState();
    addScore(s, 'career', -10);
    expect(s.scores.career).toBe(0);
  });

  it('totalScore 五线求和', () => {
    const s = makeState({ scores: { career: 10, family: 20, freedom: 30, fame: 40, spirit: 50 } });
    expect(totalScore(s)).toBe(150);
  });

  it('topTrack 返回最高分线', () => {
    const s = makeState({ scores: { career: 10, family: 80, freedom: 5, fame: 0, spirit: 0 } });
    expect(topTrack(s)).toBe('family');
  });
});

describe('年度薪资变动 applyYearlySalary', () => {
  // —— 在职雇员 ——
  it('employed 晋升：rng 命中晋升概率时大幅涨薪', () => {
    // promotionProb=0.15，rng 返回 0.05 < 0.15 → 命中晋升
    const s = makeState({ employment: 'employed', salary: 10000, age: 25 });
    const note = applyYearlySalary(s, () => 0.05);
    // 涨幅 = 10000 * 0.15 * 1(未到35岁) = 1500
    expect(s.salary).toBe(11500);
    expect(note).toContain('晋升');
  });

  it('employed 普调：rng 未命中晋升但命中普调', () => {
    // 0.2 > 0.15(不晋升) 但 0.2 < 0.7(普调) → 普调
    const s = makeState({ employment: 'employed', salary: 10000, age: 25 });
    const note = applyYearlySalary(s, () => 0.2);
    // 涨幅 = 10000 * 0.05 = 500
    expect(s.salary).toBe(10500);
    expect(note).toContain('普调');
  });

  it('employed 35岁后涨速打折（seniorMultiplier=0.5）', () => {
    // age 40，晋升命中，涨幅 = 10000 * 0.15 * 0.5 = 750
    const s = makeState({ employment: 'employed', salary: 10000, age: 40 });
    applyYearlySalary(s, () => 0.05);
    expect(s.salary).toBe(10750);
  });

  it('employed 不涨的年份：rng 都高于阈值（不涨薪但仍存入存款）', () => {
    // 0.9 > 0.15 且 0.9 > 0.7 → 既不晋升也不普调，但每月仍按比例存入存款
    const s = makeState({ employment: 'employed', salary: 10000, age: 25, savings: 0 });
    const note = applyYearlySalary(s, () => 0.9);
    expect(s.salary).toBe(10000);
    // 存款 = salary * 12 * monthlySaveRate(0.2) = 10000 * 12 * 0.2 = 24000
    expect(s.savings).toBe(24000);
    expect(note).toContain('存款');
  });

  // —— 失业 ——
  it('unemployed 每年消耗存款 15%（月薪保持不变）', () => {
    const s = makeState({ employment: 'unemployed', salary: 10000, savings: 10000 });
    const note = applyYearlySalary(s, () => 0.5);
    // 失业扣存款不扣月薪：10000 * (1 - 0.15) = 8500
    expect(s.salary).toBe(10000);   // 月薪不变
    expect(s.savings).toBe(8500);   // 存款消耗
    expect(note).toContain('失业');
  });

  it('unemployed 存款逼近 0 但不为负', () => {
    const s = makeState({ employment: 'unemployed', salary: 100, savings: 100 });
    applyYearlySalary(s, () => 0.5);
    expect(s.savings).toBeGreaterThanOrEqual(0);
  });

  // —— 自由职业/创业 ——
  it('selfEmployed 会波动（可能涨也可能跌）', () => {
    const s1 = makeState({ employment: 'selfEmployed', salary: 10000 });
    applyYearlySalary(s1, () => 0.99); // shock 接近 +0.2，应涨
    expect(s1.salary).toBeGreaterThan(10000);

    const s2 = makeState({ employment: 'selfEmployed', salary: 10000 });
    applyYearlySalary(s2, () => 0.01); // shock 接近 -0.2，应跌
    expect(s2.salary).toBeLessThan(10000);
  });

  it('selfEmployed 薪资不为负', () => {
    const s = makeState({ employment: 'selfEmployed', salary: 100 });
    applyYearlySalary(s, () => 0.01); // 大跌
    expect(s.salary).toBeGreaterThanOrEqual(0);
  });

  // —— 退休 ——
  it('retired 退休金随通胀微涨', () => {
    const s = makeState({ employment: 'retired', salary: 5000 });
    const note = applyYearlySalary(s, () => 0.5);
    // 5000 * 0.03 = 150
    expect(s.salary).toBe(5150);
    expect(note).toContain('退休金');
  });

  // —— 学生/出家 ——
  it('student 薪资不变', () => {
    const s = makeState({ employment: 'student', salary: 0 });
    const note = applyYearlySalary(s, () => 0.5);
    expect(s.salary).toBe(0);
    expect(note).toBeNull();
  });

  it('monk 薪资不变', () => {
    const s = makeState({ employment: 'monk', salary: 0 });
    const note = applyYearlySalary(s, () => 0.5);
    expect(s.salary).toBe(0);
    expect(note).toBeNull();
  });
});

// ============ 存款 / 零花钱 / 财富档位 ============
describe('金钱细化：存款 / 零花钱 / 财富档位', () => {
  it('setSavings / adjustSavings 增减且不下穿 0', () => {
    const s = makeState({ savings: 1000 });
    adjustSavings(s, 500);
    expect(s.savings).toBe(1500);
    adjustSavings(s, -2000);
    expect(s.savings).toBe(0); // 下限 0
    setSavings(s, 800);
    expect(s.savings).toBe(800);
  });

  it('setAllowance / adjustAllowance 增减且不下穿 0', () => {
    const s = makeState({ allowance: 100 });
    adjustAllowance(s, 50);
    expect(s.allowance).toBe(150);
    adjustAllowance(s, -300);
    expect(s.allowance).toBe(0);
  });

  it('netWorth = savings + salary * 12', () => {
    const s = makeState({ salary: 8000, savings: 4000 });
    expect(netWorth(s)).toBe(4000 + 8000 * 12);
  });

  it('wealthTier 按净资产分档', () => {
    // rich：> 300000
    expect(wealthTier(makeState({ salary: 30000, savings: 0 }))).toBe('rich'); // 360000
    // poor：< 30000
    expect(wealthTier(makeState({ salary: 0, savings: 10000 }))).toBe('poor');
    // mid：介于两者之间
    expect(wealthTier(makeState({ salary: 5000, savings: 20000 }))).toBe('mid'); // 80000
  });
});
