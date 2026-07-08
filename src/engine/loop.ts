// src/engine/loop.ts
import type { GameState, GameEvent, Outcome } from './types';
import { filterEligible } from './trigger';
import { evaluateCondition } from './condition';
import {
  STAGE_OF_AGE,
  HEALTH_DECAY_AGE,
  HEALTH_DECAY_PROBABILITY,
  SAVINGS,
  ALLOWANCE,
  LOTTERY,
} from './constants';
import { worsenHealth, applyYearlySalary, adjustSavings } from './status';

/**
 * Select 0-3 event IDs for the current year.
 *
 * Priority:
 * 1. If state.nextEvent is set (招牌链强制触发), return [nextEvent] only.
 * 2. Otherwise, filter eligible events and independently sample each one
 *    using baseWeight/10 as its trigger probability (capped at 1.0).
 *    Stops after 3 picks.
 */
export function selectEventsForYear(
  events: ReadonlyArray<GameEvent>,
  state: GameState,
  rng: () => number,
): string[] {
  // 招牌链强制触发
  if (state.nextEvent) return [state.nextEvent];

  const eligible = filterEligible(events, state);
  if (eligible.length === 0) return [];

  // 每个 eligible 事件独立按 baseWeight 抽：
  // baseWeight 10 = 1.0 概率，baseWeight 0 = 永不触发
  const picked: string[] = [];
  for (const ev of eligible) {
    const prob = Math.min(1, ev.trigger.baseWeight / 10);
    if (rng() < prob) picked.push(ev.id);
    if (picked.length >= 3) break;
  }
  return picked;
}

/**
 * Advance the state by one year:
 * - age += 1
 * - stage updated to match new age
 * - 40 岁后每年有 HEALTH_DECAY_PROBABILITY 概率健康降一档（事件驱动式衰老）
 * - 按就业状态自动变动薪资（普调/晋升/失业消耗/创业波动/退休金）
 *
 * salary 变动会以虚拟 "note_" 事件 ID 形式记入 history，
 * 让玩家在历史栏看到「今年涨薪 / 降薪 / 生意波动」。
 */
export function applyYearlyTick(state: GameState, rng: () => number): void {
  state.age += 1;
  state.stage = STAGE_OF_AGE(state.age);
  // 薪资年度变动（用同一个 rng 流，保证可复现）
  const salaryNote = applyYearlySalary(state, rng);
  // —— 存款年度结算（利息 + 学生零花钱入账）——
  const financeNotes: string[] = [];
  if (salaryNote) financeNotes.push(salaryNote);
  // 学生期：每年零花钱按月额 × 12 累计入存款（allowance 保持月额不变）
  if (state.employment === 'student' && state.allowance > 0) {
    const yearlyAllowance = state.allowance * 12;
    adjustSavings(state, yearlyAllowance);
    financeNotes.push(`零花钱累计 +${yearlyAllowance}`);
  }
  // 存款年利息（仅成年后就业/失业/退休有存款时）
  if (state.savings > 0 && state.employment !== 'student') {
    const interest = Math.round(state.savings * SAVINGS.interestRate);
    if (interest > 0) {
      adjustSavings(state, interest);
      financeNotes.push(`存款利息 +${interest}`);
    }
  }
  // —— 彩票年底开奖（本年买过彩票才开）——
  if (state.flags.has('lottery_bought_this_year')) {
    state.flags.delete('lottery_bought_this_year');
    const r = rng();
    if (r < LOTTERY.jackpotProb) {
      adjustSavings(state, LOTTERY.jackpotPrize);
      financeNotes.push(`彩票中头奖 +${LOTTERY.jackpotPrize}！`);
    } else if (r < LOTTERY.secondProb) {
      adjustSavings(state, LOTTERY.secondPrize);
      financeNotes.push(`彩票中奖 +${LOTTERY.secondPrize}`);
    } else if (r < LOTTERY.thirdProb) {
      adjustSavings(state, LOTTERY.thirdPrize);
      financeNotes.push(`彩票小奖 +${LOTTERY.thirdPrize}`);
    } else {
      financeNotes.push('彩票未中奖');
    }
  }
  if (financeNotes.length > 0) {
    const noteId = `note_salary_${state.age}`;
    if (!state.history.includes(noteId)) state.history.push(noteId);
    state.flags.add(`last_salary_note|${financeNotes.join('，')}`); // UI 可读取展示
  }
  // 健康随年龄概率性下降（40 岁后）
  if (state.age > HEALTH_DECAY_AGE) {
    if (rng() < HEALTH_DECAY_PROBABILITY) {
      worsenHealth(state);
    }
  }
}

/**
 * Check whether the player has died / reached an ending.
 * Returns true if:
 * - age >= lifespan, OR
 * - 健康恶化到 critical 档（濒危），OR
 * - nextEvent points at an ending_* id
 */
export function checkDeath(state: GameState, lifespan: number): boolean {
  if (state.age >= lifespan) return true;
  if (state.health === 'critical') return true;
  if (state.nextEvent?.startsWith('ending_')) return true;
  return false;
}

/**
 * Apply an outcome to the state:
 * - run outcome.apply(state)
 * - push eventId to history if not already present (dedup)
 * - set state.nextEvent = outcome.nextEvent (clears if undefined)
 */
export function applyOutcomeToState(state: GameState, outcome: Outcome, eventId: string): void {
  outcome.apply(state);
  if (!state.history.includes(eventId)) state.history.push(eventId);
  state.nextEvent = outcome.nextEvent;
}

/**
 * Detect threshold events (baseWeight === 0) whose conditions are met.
 *
 * 阈值事件完全用声明式 Condition DSL 表达（不再硬编码 if ev.id === ...）。
 * 只需把复合条件写进 trigger.requires 即可。
 *
 * Returns an array of event IDs to append to the event queue.
 */
export function detectThresholdEvents(
  thresholdEvents: ReadonlyArray<GameEvent>,
  state: GameState,
): string[] {
  const triggered: string[] = [];
  for (const ev of thresholdEvents) {
    if (ev.trigger.baseWeight > 0) continue; // 只看 baseWeight=0 的阈值事件
    if (state.history.includes(ev.id)) continue;
    if (!ev.trigger.requires?.every((c) => evaluateCondition(c, state))) continue;
    triggered.push(ev.id);
  }
  return triggered;
}
