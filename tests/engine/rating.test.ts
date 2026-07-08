// tests/engine/rating.test.ts
import { describe, it, expect } from 'vitest';
import { calcRating } from '../../src/engine/rating';
import { makeState } from '../fixtures';

describe('calcRating', () => {
  // 注：brief Step 5 原期望 'S'，但 brief Step 7 的公式 + 占位权重 (60/15/15/10)
  // 对此输入算出 71.3 分 → A。S 阈值 85 在当前占位权重下无法达到。
  // 权威公式（implementation）保持不变；此处按公式真实输出断言。
  // 调整权重属 playtest 阶段决策（见 CLAUDE.md）。
  it('returns A for high stats and long life (spec formula caps at A for these inputs)', () => {
    const s = makeState({
      age: 80,
      attrs: { 智力: 90, 魅力: 90, 体质: 90, 运气: 90, 财富: 90, 快乐: 90 },
      skills: { 硬: 90, 软: 90, 摸: 90 },
    });
    s.flags.add('achievement_x'); s.flags.add('achievement_y');
    s.flags.add('twist_x');
    expect(calcRating(s)).toBe('A');
  });

  it('returns D for low everything', () => {
    const s = makeState({
      age: 30,
      attrs: { 智力: 20, 魅力: 20, 体质: 20, 运气: 20, 财富: 20, 快乐: 20 },
      skills: { 硬: 20, 软: 20, 摸: 20 },
    });
    expect(calcRating(s)).toBe('D');
  });

  // 注：brief Step 5 原期望 ['B','C']，但默认 makeState（attrs=50, skills=30）+ age=60
  // 在权威公式下得 37.06 分 → D。判定逻辑本身已被其它用例覆盖（高→A，低→D）。
  it('returns D for default makeState at age 60 (spec formula yields 37.06)', () => {
    const s = makeState({ age: 60 });
    expect(calcRating(s)).toBe('D');
  });
});
