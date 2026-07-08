// src/engine/rating.ts
import type { GameState, Rating } from './types';
import { RATING_WEIGHTS, RATING_THRESHOLDS } from './constants';
import { totalScore } from './status';

const countFlagsByPrefix = (flags: Set<string>, prefix: string): number =>
  [...flags].filter((f) => f.startsWith(prefix)).length;

/**
 * 计算评级。
 * 评分构成（占位权重，playtest 调）：
 * - scoreAvg (0.6)：五线积分平均分（0-100）
 * - lifespan (0.2)：寿命分，满分 85 岁
 * - achievement (0.1)：每个 achievement_* flag +5
 * - twist (0.1)：每个 twist_* flag +10（奖励发现招牌反转）
 */
export function calcRating(s: GameState): Rating {
  const scoreTotal = totalScore(s);
  const scoreAvg = scoreTotal / 5; // 五线平均
  const lifespanScore = ((s.age - 1) / 85) * 100;
  const achievementBonus = countFlagsByPrefix(s.flags, 'achievement_') * 5;
  const chainBonus = countFlagsByPrefix(s.flags, 'twist_') * 10;

  const score =
    scoreAvg * RATING_WEIGHTS.scoreAvg +
    lifespanScore * RATING_WEIGHTS.lifespan +
    achievementBonus * RATING_WEIGHTS.achievement +
    chainBonus * RATING_WEIGHTS.twist;

  if (score >= RATING_THRESHOLDS.S) return 'S';
  if (score >= RATING_THRESHOLDS.A) return 'A';
  if (score >= RATING_THRESHOLDS.B) return 'B';
  if (score >= RATING_THRESHOLDS.C) return 'C';
  return 'D';
}
