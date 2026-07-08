// src/engine/condition.ts
import type { Condition, GameState } from './types';

export function evaluateCondition(condition: Condition, state: GameState): boolean {
  if ('flag' in condition) return state.flags.has(condition.flag);
  if ('notFlag' in condition) return !state.flags.has(condition.notFlag);
  if ('attrGte' in condition) {
    return Object.entries(condition.attrGte).every(([k, v]) => state.attrs[k as keyof typeof state.attrs] >= v!);
  }
  if ('attrLt' in condition) {
    return Object.entries(condition.attrLt).every(([k, v]) => state.attrs[k as keyof typeof state.attrs] < v!);
  }
  if ('skillGte' in condition) {
    return Object.entries(condition.skillGte).every(([k, v]) => state.skills[k as keyof typeof state.skills] >= v!);
  }
  if ('skillLt' in condition) {
    return Object.entries(condition.skillLt).every(([k, v]) => state.skills[k as keyof typeof state.skills] < v!);
  }
  if ('all' in condition) return condition.all.every((c) => evaluateCondition(c, state));
  if ('any' in condition) return condition.any.some((c) => evaluateCondition(c, state));
  return false;
}
