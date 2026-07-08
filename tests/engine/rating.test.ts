// tests/engine/rating.test.ts
import { describe, it, expect } from 'vitest';
import { calcRating } from '../../src/engine/rating';
import { makeState } from '../fixtures';

describe('calcRating', () => {
  // 新评分公式：scoreAvg(五线平均)*0.6 + lifespan*0.2 + achievement*0.1 + twist*0.1
  // 占位权重，阈值 S80/A65/B50/C35，playtest 阶段调整。
  it('returns high rating for high scores + long life + achievements', () => {
    const s = makeState({
      age: 80,
      scores: { career: 90, family: 80, freedom: 70, fame: 60, spirit: 50 },
    });
    s.flags.add('achievement_x'); s.flags.add('achievement_y');
    s.flags.add('twist_x');
    // scoreAvg=70, lifespan≈92.8, achievement=10, twist=10
    // score = 70*0.6 + 92.8*0.2 + 10*0.1 + 10*0.1 = 42+18.6+1+1 = 62.6 → B
    expect(calcRating(s)).toBe('B');
  });

  it('returns D for low everything', () => {
    const s = makeState({
      age: 30,
      scores: { career: 5, family: 5, freedom: 5, fame: 5, spirit: 5 },
    });
    // scoreAvg=5, lifespan≈34.1, achievement=0, twist=0
    // score = 5*0.6 + 34.1*0.2 + 0 + 0 = 3+6.8 = 9.8 → D
    expect(calcRating(s)).toBe('D');
  });

  it('returns mid rating for default makeState at age 60', () => {
    const s = makeState({ age: 60 });
    // scoreAvg=0, lifespan≈69.4, achievement=0, twist=0
    // score = 0 + 69.4*0.2 + 0 + 0 = 13.9 → D
    expect(calcRating(s)).toBe('D');
  });
});
