// src/engine/loop.ts
import type { GameState, GameEvent, Outcome } from './types';
import { filterEligible } from './trigger';
import { evaluateCondition } from './condition';
import { STAGE_OF_AGE, CONSTITUTION_DECAY_AGE, clampAttr, THRESHOLDS } from './constants';

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
 * - 体质 -1 when post-tick age > 35 (i.e. decay starts at age 36)
 * - clamp all attrs to [0, 100] defensively
 */
export function applyYearlyTick(state: GameState): void {
  state.age += 1;
  state.stage = STAGE_OF_AGE(state.age);
  if (state.age > CONSTITUTION_DECAY_AGE) {
    state.attrs.体质 = clampAttr(state.attrs.体质 - 1);
  }
  // 防御性 clamp：保证所有属性都在 [0, 100]
  (Object.keys(state.attrs) as Array<keyof typeof state.attrs>).forEach((k) => {
    state.attrs[k] = clampAttr(state.attrs[k]);
  });
}

/**
 * Check whether the player has died / reached an ending.
 * Returns true if:
 * - age >= lifespan, OR
 * - 体质 <= 0, OR
 * - nextEvent points at an ending_* id
 */
export function checkDeath(state: GameState, lifespan: number): boolean {
  if (state.age >= lifespan) return true;
  if (state.attrs.体质 <= 0) return true;
  if (state.nextEvent?.startsWith('ending_')) return true;
  return false;
}

/**
 * Apply an outcome to the state:
 * - run outcome.apply(state)
 * - push eventId to history if not already present (dedup)
 * - set state.nextEvent = outcome.nextEvent (clears if undefined)
 * - clamp all attrs at the end
 */
export function applyOutcomeToState(state: GameState, outcome: Outcome, eventId: string): void {
  outcome.apply(state);
  if (!state.history.includes(eventId)) state.history.push(eventId);
  state.nextEvent = outcome.nextEvent;
  // clamp apply 后可能越界的属性
  (Object.keys(state.attrs) as Array<keyof typeof state.attrs>).forEach((k) => {
    state.attrs[k] = clampAttr(state.attrs[k]);
  });
}

/**
 * Detect threshold events (baseWeight === 0) whose conditions are met.
 *
 * Unlike regular events sampled by baseWeight probability, threshold events
 * fire deterministically whenever their `requires` conditions evaluate true.
 * Compound conditions (e.g. 快乐+财富>150, age in [40,50]) that cannot be
 * expressed in a single Condition are handled via special-case branches here.
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
    // 复合条件（如快乐+财富>150）在这里手动判断
    if (ev.id === 'threshold_peak_high') {
      if (state.attrs.快乐 + state.attrs.财富 <= THRESHOLDS.peakCombined) continue;
    }
    if (ev.id === 'threshold_midlife_crisis') {
      const [min, max] = THRESHOLDS.midlifeAgeRange;
      if (state.age < min || state.age > max) continue;
    }
    triggered.push(ev.id);
  }
  return triggered;
}
