// src/engine/rating.ts
import type { GameState, Rating } from './types';
import { RATING_WEIGHTS, RATING_THRESHOLDS } from './constants';

const countFlagsByPrefix = (flags: Set<string>, prefix: string): number =>
  [...flags].filter((f) => f.startsWith(prefix)).length;

export function calcRating(s: GameState): Rating {
  const allAttr = [...Object.values(s.attrs), ...Object.values(s.skills)];
  const attrAvg = allAttr.reduce((a, b) => a + b, 0) / allAttr.length;
  const lifespanScore = ((s.age - 1) / 80) * 100;
  const achievementBonus = countFlagsByPrefix(s.flags, 'achievement_') * 5;
  const chainBonus = countFlagsByPrefix(s.flags, 'twist_') * 10;

  const score =
    attrAvg * RATING_WEIGHTS.attrAvg +
    lifespanScore * RATING_WEIGHTS.lifespan +
    achievementBonus * RATING_WEIGHTS.achievement +
    chainBonus * RATING_WEIGHTS.twist;

  if (score >= RATING_THRESHOLDS.S) return 'S';
  if (score >= RATING_THRESHOLDS.A) return 'A';
  if (score >= RATING_THRESHOLDS.B) return 'B';
  if (score >= RATING_THRESHOLDS.C) return 'C';
  return 'D';
}
