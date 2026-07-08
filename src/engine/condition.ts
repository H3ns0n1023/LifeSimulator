// src/engine/condition.ts
// 条件 DSL 求值。替代旧的 attrGte/attrLt/skillGte/skillLt 体系。
import type { Condition, GameState } from './types';
import { HEALTH_RANK } from './constants';

/**
 * 求值一个 Condition 节点。
 * 未命中任何分支返回 false（写错的 condition 永远 false 而非崩溃）。
 */
export function evaluateCondition(condition: Condition, state: GameState): boolean {
  // —— flag 系列 ——
  if ('flag' in condition) return state.flags.has(condition.flag);
  if ('notFlag' in condition) return !state.flags.has(condition.notFlag);

  // —— 月薪 ——
  if ('salaryGte' in condition) return state.salary >= condition.salaryGte;
  if ('salaryLt' in condition) return state.salary < condition.salaryLt;

  // —— 存款（成年经济水平，一次性大额消费能力）——
  if ('savingsGte' in condition) return state.savings >= condition.savingsGte;
  if ('savingsLt' in condition) return state.savings < condition.savingsLt;

  // —— 零花钱（学生期购买力）——
  if ('allowanceGte' in condition) return state.allowance >= condition.allowanceGte;
  if ('allowanceLt' in condition) return state.allowance < condition.allowanceLt;

  // —— 健康档位 ——
  if ('healthIn' in condition) return condition.healthIn.includes(state.health);
  if ('healthGte' in condition) {
    return HEALTH_RANK[state.health] >= HEALTH_RANK[condition.healthGte];
  }

  // —— 病症 ——
  if ('disease' in condition) return state.diseases.has(condition.disease);
  if ('notDisease' in condition) return !state.diseases.has(condition.notDisease);

  // —— 就业状态机 ——
  if ('employment' in condition) return state.employment === condition.employment;
  if ('employmentIn' in condition) return condition.employmentIn.includes(state.employment);
  if ('notEmployment' in condition) return state.employment !== condition.notEmployment;

  // —— 婚姻状态机 ——
  if ('marriage' in condition) return state.marriage === condition.marriage;
  if ('marriageIn' in condition) return condition.marriageIn.includes(state.marriage);

  // —— 年龄 ——
  if ('ageGte' in condition) return state.age >= condition.ageGte;
  if ('ageLt' in condition) return state.age < condition.ageLt;

  // —— 结局积分 ——
  if ('scoreGte' in condition) {
    return (Object.entries(condition.scoreGte) as [keyof typeof state.scores, number][])
      .every(([k, v]) => state.scores[k] >= v);
  }

  // —— 组合 ——
  if ('all' in condition) return condition.all.every((c) => evaluateCondition(c, state));
  if ('any' in condition) return condition.any.some((c) => evaluateCondition(c, state));

  return false;
}
