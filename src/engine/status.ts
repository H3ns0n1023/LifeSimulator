// src/engine/status.ts
// 状态机受控转换函数 + 健康档位操作 + 病症管理
// 所有对 employment / marriage / health 的修改都应走这里，以保证一致性。
import type { GameState, HealthStage, Employment, Marriage, EndingTrack, EducationLevel, Major } from './types';
import {
  HEALTH_RANK,
  HEALTH_ORDER,
  EMPLOYMENT_TRANSITIONS,
  MARRIAGE_TRANSITIONS,
  DISEASE_IMPACT,
  SCORE_MAX,
  SALARY_RAISE,
  SALARY_UNEMPLOYED_DRAIN,
  SALARY_SELF_EMPLOYED,
  SALARY_PENSION_RATE,
  SALARY_PENSION_GROWTH,
  SAVINGS,
  WEALTH_TIER,
} from './constants';

// 薪资机制配置聚合（applyYearlySalary 用）
const salaryConfig = {
  RAISE: SALARY_RAISE,
  UNEMPLOYED_DRAIN: SALARY_UNEMPLOYED_DRAIN,
  SELF: SALARY_SELF_EMPLOYED,
  PENSION_RATE: SALARY_PENSION_RATE,
  PENSION_GROWTH: SALARY_PENSION_GROWTH,
};

// ============ 健康档位操作 ============

/** 健康恶化一档（不会超过 critical）。返回是否真的恶化了。 */
export function worsenHealth(s: GameState): boolean {
  const cur = HEALTH_RANK[s.health];
  if (cur >= HEALTH_RANK.critical) return false;
  s.health = HEALTH_ORDER[cur + 1];
  return true;
}

/** 健康好转一档（不会超过 healthy）。返回是否真的好转了。 */
export function improveHealth(s: GameState): boolean {
  const cur = HEALTH_RANK[s.health];
  if (cur <= HEALTH_RANK.healthy) return false;
  s.health = HEALTH_ORDER[cur - 1];
  return true;
}

/** 直接设置健康档位（用于重病确诊）。 */
export function setHealth(s: GameState, stage: HealthStage): void {
  s.health = stage;
}

/** 健康严重程度是否 >= 某档（critical 最严重）。 */
export function healthAtLeast(s: GameState, stage: HealthStage): boolean {
  return HEALTH_RANK[s.health] >= HEALTH_RANK[stage];
}

// ============ 病症管理 ============

/**
 * 确诊一个病症。
 * - 若病症在 DISEASE_IMPACT 里且当前健康档位比它应导致的档位轻，则把健康降到该档。
 * - 已确诊过则幂等（不重复降档）。
 */
export function addDisease(s: GameState, disease: string): void {
  if (s.diseases.has(disease)) return; // 幂等
  s.diseases.add(disease);
  const impact = DISEASE_IMPACT[disease];
  if (impact && HEALTH_RANK[s.health] < HEALTH_RANK[impact]) {
    s.health = impact;
  }
}

/** 移除一个病症（治愈）。注意：不会自动恢复健康档位，需手动 improveHealth。 */
export function removeDisease(s: GameState, disease: string): void {
  s.diseases.delete(disease);
}

/** 是否患有某病。 */
export function hasDisease(s: GameState, disease: string): boolean {
  return s.diseases.has(disease);
}

// ============ 就业状态机 ============

/**
 * 受控的就业状态转换。
 * 查 EMPLOYMENT_TRANSITIONS 表，非法转换抛错（开发期立刻发现冲突）。
 */
export function transitionEmployment(s: GameState, target: Employment): void {
  const allowed = EMPLOYMENT_TRANSITIONS[s.employment];
  if (!allowed.includes(target)) {
    throw new Error(
      `[状态机] 非法就业转换：${s.employment} → ${target}（当前年龄 ${s.age}）。` +
      `合法去向：${allowed.join(' / ') || '（无，终局状态）'}`,
    );
  }
  s.employment = target;
}

/** 当前是否处于某一就业状态。 */
export function isEmployedAs(s: GameState, e: Employment): boolean {
  return s.employment === e;
}

/** 是否处于任一就业状态。 */
export function employmentIn(s: GameState, list: Employment[]): boolean {
  return list.includes(s.employment);
}

// ============ 婚姻状态机 ============

/** 受控的婚姻状态转换。查 MARRIAGE_TRANSITIONS 表，非法转换抛错。 */
export function transitionMarriage(s: GameState, target: Marriage): void {
  const allowed = MARRIAGE_TRANSITIONS[s.marriage];
  if (!allowed.includes(target)) {
    throw new Error(
      `[状态机] 非法婚姻转换：${s.marriage} → ${target}。` +
      `合法去向：${allowed.join(' / ')}`,
    );
  }
  s.marriage = target;
}

// ============ 月薪 ============

/** 设置月薪（允许归零）。 */
export function setSalary(s: GameState, value: number): void {
  s.salary = Math.max(0, Math.round(value));
}

/** 月薪增减（可负）。 */
export function adjustSalary(s: GameState, delta: number): void {
  s.salary = Math.max(0, Math.round(s.salary + delta));
}

// ============ 存款（成年经济水平）============

/** 设置存款（允许归零）。 */
export function setSavings(s: GameState, value: number): void {
  s.savings = Math.max(0, Math.round(value));
}

/** 存款增减（可负，下限 0）。 */
export function adjustSavings(s: GameState, delta: number): void {
  s.savings = Math.max(0, Math.round(s.savings + delta));
}

// ============ 零花钱（学生期）============

/** 设置零花钱（允许归零）。 */
export function setAllowance(s: GameState, value: number): void {
  s.allowance = Math.max(0, Math.round(value));
}

/** 零花钱增减（可负，下限 0）。 */
export function adjustAllowance(s: GameState, delta: number): void {
  s.allowance = Math.max(0, Math.round(s.allowance + delta));
}

// ============ 跨周目经济档位 ============

/**
 * 计算当前净资产（用于跨周目财富档位判定）。
 * 净资产 = 存款 + 月薪 × 12（年薪折算）。
 */
export function netWorth(s: GameState): number {
  return s.savings + s.salary * 12;
}

/**
 * 判定经济档位：rich / mid / poor。
 * 依据净资产阈值 WEALTH_TIER。
 */
export function wealthTier(s: GameState): 'rich' | 'mid' | 'poor' {
  const w = netWorth(s);
  if (w >= WEALTH_TIER.rich) return 'rich';
  if (w < WEALTH_TIER.poor) return 'poor';
  return 'mid';
}

// ============ 学历与专业 ============

/**
 * 设置学历层次（高考后调用）。major 可选，大学选专业时再设。
 * 同时写入对应的 milestone flag 供旧 condition 读取，并清理互斥的旧学历 flag。
 */
export function setEducation(s: GameState, level: EducationLevel, major?: Major): void {
  // 清理互斥的旧学历 flag
  const eduFlags = ['milestone_top_university', 'milestone_average_university', 'milestone_failed_gaokao'];
  for (const f of eduFlags) s.flags.delete(f);
  // 写入新层次
  s.education = level;
  if (major) s.major = major;
  // 同步兼容 flag（顶部 985/211、中部一本二本、底部大专）
  if (level === '985' || level === 'overseas') s.flags.add('milestone_top_university');
  else if (level === '211' || level === 'yiben') s.flags.add('milestone_average_university');
  else s.flags.add('milestone_failed_gaokao');
}

/**
 * 年度薪资自动变动（由 applyYearlyTick 调用，按就业状态走不同规则）：
 *
 * - employed（在职）：大概率普调 +5%，小概率晋升 +15%，35 岁后涨速减半；每月按比例存入存款
 * - unemployed（失业）：每年消耗存款 -15%（逼近 0，月薪保持上次值不变）
 * - selfEmployed（创业/自由职业）：高方差 ±20% 波动，长期微涨；按比例存入存款
 * - retired（退休）：退休金每年 +3%（抗通胀）；按比例存入存款
 * - student/monk/deceased：薪资不变
 *
 * 返回一个简短描述（可选，用于历史/日志展示）。
 */
export function applyYearlySalary(s: GameState, rng: () => number): string | null {
  const SAL = salaryConfig; // 见文件末 import
  const notes: string[] = [];
  switch (s.employment) {
    case 'employed': {
      // 35 岁后涨速打折
      const mult = s.age > SAL.RAISE.seniorAgeCutoff ? SAL.RAISE.seniorMultiplier : 1;
      // 先判晋升（互斥），再判普调
      if (rng() < SAL.RAISE.promotionProb) {
        const raise = Math.round(s.salary * SAL.RAISE.promotionRate * mult);
        s.salary += raise;
        if (raise > 0) notes.push(`晋升！月薪 +${raise}`);
      } else if (rng() < SAL.RAISE.normalProb) {
        const raise = Math.round(s.salary * SAL.RAISE.normalRate * mult);
        s.salary += raise;
        if (raise > 0) notes.push(`普调 +${raise}`);
      }
      // 每月存入存款（年度结算 = salary * 12 * monthlySaveRate）
      const deposit = Math.round(s.salary * 12 * SAVINGS.monthlySaveRate);
      if (deposit > 0) {
        s.savings += deposit;
        notes.push(`存款 +${deposit}`);
      }
      return notes.length > 0 ? notes.join('，') : null;
    }
    case 'unemployed': {
      // 消耗存款：savings *= (1 - drain)，逼近 0；月薪保持上次值不变
      const before = s.savings;
      s.savings = Math.round(before * (1 - SAL.UNEMPLOYED_DRAIN));
      const loss = before - s.savings;
      return loss > 0 ? `失业消耗存款 -${loss}` : null;
    }
    case 'selfEmployed': {
      // ±volatility 波动 + 长期 trend 微涨
      const shock = (rng() * 2 - 1) * SAL.SELF.volatility; // [-vol, +vol]
      const trend = SAL.SELF.trend;
      const delta = Math.round(s.salary * (trend + shock));
      s.salary = Math.max(0, s.salary + delta);
      if (delta !== 0) notes.push(`生意波动 ${delta > 0 ? '+' : ''}${delta}`);
      // 创业也按比例存入存款（用波动后月薪）
      const deposit = Math.round(Math.max(0, s.salary) * 12 * SAVINGS.monthlySaveRate);
      if (deposit > 0) {
        s.savings += deposit;
        notes.push(`存款 +${deposit}`);
      }
      return notes.length > 0 ? notes.join('，') : null;
    }
    case 'retired': {
      // 退休金随通胀微涨
      const raise = Math.round(s.salary * SAL.PENSION_GROWTH);
      s.salary += raise;
      if (raise > 0) notes.push(`退休金 +${raise}`);
      // 退休也按比例存入存款
      const deposit = Math.round(s.salary * 12 * SAVINGS.monthlySaveRate);
      if (deposit > 0) {
        s.savings += deposit;
        notes.push(`存款 +${deposit}`);
      }
      return notes.length > 0 ? notes.join('，') : null;
    }
    default:
      // student / monk / deceased：薪资不变
      return null;
  }
}

// ============ 结局积分 ============

/** 给某一线加分（上限 SCORE_MAX，防膨胀）。 */
export function addScore(s: GameState, track: EndingTrack, delta: number): void {
  s.scores[track] = Math.max(0, Math.min(SCORE_MAX, s.scores[track] + delta));
}

/** 五线总分。 */
export function totalScore(s: GameState): number {
  return s.scores.career + s.scores.family + s.scores.freedom + s.scores.fame + s.scores.spirit;
}

/** 找出分数最高的线（并列取声明顺序靠前的）。 */
export function topTrack(s: GameState): EndingTrack {
  const entries: [EndingTrack, number][] = [
    ['career', s.scores.career],
    ['family', s.scores.family],
    ['freedom', s.scores.freedom],
    ['fame', s.scores.fame],
    ['spirit', s.scores.spirit],
  ];
  return entries.reduce((best, cur) => (cur[1] > best[1] ? cur : best))[0];
}
