// src/engine/constants.ts
import type { AttrKey, LifeStage } from './types';

export const STAGE_BOUNDS: Record<LifeStage, [number, number]> = {
  childhood: [1, 6],
  school: [7, 18],
  college: [19, 22],
  career: [23, 60],
  retirement: [61, 80],
};

export const STAGE_OF_AGE = (age: number): LifeStage => {
  if (age <= 6) return 'childhood';
  if (age <= 18) return 'school';
  if (age <= 22) return 'college';
  if (age <= 60) return 'career';
  return 'retirement';
};

// 阈值（占位，playtest 调）
export const THRESHOLDS = {
  lowHappiness: 20,
  lowConstitution: 15,
  peakCombined: 150, // 快乐 + 财富
  midlifeAgeRange: [40, 50] as [number, number],
};

// 评分权重（占位，playtest 调）
export const RATING_WEIGHTS = {
  attrAvg: 0.6,
  lifespan: 0.15,
  achievement: 0.15,
  twist: 0.1,
};

export const RATING_THRESHOLDS = {
  S: 85,
  A: 70,
  B: 55,
  C: 40,
};

export const BASE_LIFESPAN = 75;
export const LIFESPAN_VARIANCE = 15;
export const CONSTITUTION_DECAY_AGE = 35;
export const ATTR_FLOOR = 0;
export const ATTR_CEIL = 100;

export const clampAttr = (n: number): number =>
  Math.max(ATTR_FLOOR, Math.min(ATTR_CEIL, Math.round(n)));
