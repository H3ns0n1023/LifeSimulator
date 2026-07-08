// tests/engine/loop.test.ts
import { describe, it, expect } from 'vitest';
import { selectEventsForYear, applyYearlyTick, checkDeath, applyOutcomeToState } from '../../src/engine/loop';
import { makeState, sampleEvent, rngFor } from '../fixtures';
import { THRESHOLDS, BASE_LIFESPAN } from '../../src/engine/constants';
import type { GameEvent } from '../../src/engine/types';

describe('selectEventsForYear', () => {
  it('returns nextEvent id when state.nextEvent is set', () => {
    const s = makeState({ nextEvent: 'forced_next' });
    expect(selectEventsForYear([sampleEvent], s, rngFor(1))).toEqual(['forced_next']);
  });

  it('returns 0-3 events otherwise', () => {
    const s = makeState();
    const result = selectEventsForYear([sampleEvent], s, rngFor(1));
    expect(result.length).toBeLessThanOrEqual(3);
  });

  it('returns empty array when no events are eligible', () => {
    const s = makeState({ age: 10, stage: 'school' });
    const result = selectEventsForYear([sampleEvent], s, rngFor(1));
    expect(result).toEqual([]);
  });

  it('respects baseWeight as probability (baseWeight/10)', () => {
    // baseWeight 0 -> never picked
    const zeroWeight: GameEvent = {
      ...sampleEvent,
      id: 'zero_weight',
      trigger: { baseWeight: 0 },
    };
    const s = makeState();
    const result = selectEventsForYear([zeroWeight], s, rngFor(1));
    expect(result).not.toContain('zero_weight');
  });

  it('caps at 3 events even when more are eligible', () => {
    const events: GameEvent[] = Array.from({ length: 5 }, (_, i) => ({
      ...sampleEvent,
      id: `ev_${i}`,
      trigger: { baseWeight: 10 }, // prob = 1.0, always picked
    }));
    const s = makeState();
    const result = selectEventsForYear(events, s, rngFor(1));
    expect(result.length).toBe(3);
  });
});

describe('applyYearlyTick', () => {
  it('ages by 1 and updates stage', () => {
    const s = makeState({ age: 22, stage: 'college' });
    applyYearlyTick(s);
    expect(s.age).toBe(23);
    expect(s.stage).toBe('career');
  });

  it('reduces体质 by 1 each year after 35', () => {
    const s = makeState({ age: 40 });
    const before = s.attrs.体质;
    applyYearlyTick(s);
    expect(s.attrs.体质).toBe(before - 1);
  });

  it('does not reduce体质 when post-tick age is 35 (boundary: decay starts at 36+)', () => {
    // Input age 34 -> after tick age 35 -> no decay (35 is NOT > 35)
    const s = makeState({ age: 34 });
    const before = s.attrs.体质;
    applyYearlyTick(s);
    expect(s.age).toBe(35);
    expect(s.attrs.体质).toBe(before);
  });

  it('reduces体质 when post-tick age is 36 (boundary: first decay year)', () => {
    // Input age 35 -> after tick age 36 -> decay (36 > 35)
    const s = makeState({ age: 35 });
    const before = s.attrs.体质;
    applyYearlyTick(s);
    expect(s.age).toBe(36);
    expect(s.attrs.体质).toBe(before - 1);
  });

  it('does not reduce体质 before 35', () => {
    const s = makeState({ age: 30 });
    const before = s.attrs.体质;
    applyYearlyTick(s);
    expect(s.attrs.体质).toBe(before);
  });

  it('clamps attrs to 0-100 (体质 floor at 0)', () => {
    const s = makeState({ age: 40, attrs: { 智力: 50, 魅力: 50, 体质: 0, 运气: 50, 财富: 50, 快乐: 50 } });
    applyYearlyTick(s);
    expect(s.attrs.体质).toBe(0); // 不下穿到 -1
  });

  it('updates stage to retirement after 60', () => {
    const s = makeState({ age: 60, stage: 'career' });
    applyYearlyTick(s);
    expect(s.age).toBe(61);
    expect(s.stage).toBe('retirement');
  });
});

describe('checkDeath', () => {
  it('returns true when age exceeds lifespan', () => {
    const s = makeState({ age: 95 });
    expect(checkDeath(s, 80)).toBe(true);
  });

  it('returns true when age equals lifespan', () => {
    const s = makeState({ age: 80 });
    expect(checkDeath(s, 80)).toBe(true);
  });

  it('returns true when体质 is 0', () => {
    const s = makeState({ attrs: { 智力: 50, 魅力: 50, 体质: 0, 运气: 50, 财富: 50, 快乐: 50 } });
    expect(checkDeath(s, 80)).toBe(true);
  });

  it('returns true when nextEvent starts with ending_', () => {
    const s = makeState({ nextEvent: 'ending_tragic' });
    expect(checkDeath(s, 80)).toBe(true);
  });

  it('returns false otherwise', () => {
    expect(checkDeath(makeState({ age: 50 }), 80)).toBe(false);
  });
});

describe('applyOutcomeToState', () => {
  it('runs apply, pushes to history, sets nextEvent', () => {
    const s = makeState();
    let observed = 0;
    applyOutcomeToState(s, {
      weight: 1, condition: { all: [] },
      apply: () => { observed++; },
      result: 'test', nextEvent: 'next_x',
    }, 'event_xyz');
    expect(observed).toBe(1);
    expect(s.history).toContain('event_xyz');
    expect(s.nextEvent).toBe('next_x');
  });

  it('clears nextEvent when outcome has none', () => {
    const s = makeState({ nextEvent: 'old' });
    applyOutcomeToState(s, {
      weight: 1, condition: { all: [] },
      apply: () => {}, result: 'x',
    }, 'event_xyz');
    expect(s.nextEvent).toBeUndefined();
  });

  it('does not duplicate history entries (dedup)', () => {
    const s = makeState({ history: ['event_dup'] });
    applyOutcomeToState(s, {
      weight: 1, condition: { all: [] },
      apply: () => {}, result: 'x',
    }, 'event_dup');
    expect(s.history.filter((id) => id === 'event_dup').length).toBe(1);
  });

  it('clamps attrs after apply (prevents overflow above 100)', () => {
    const s = makeState({ attrs: { 智力: 99, 魅力: 50, 体质: 50, 运气: 50, 财富: 50, 快乐: 50 } });
    applyOutcomeToState(s, {
      weight: 1, condition: { all: [] },
      apply: (st) => { st.attrs.智力 += 10; }, // 99 + 10 = 109 -> clamp to 100
      result: 'x',
    }, 'event_clamp');
    expect(s.attrs.智力).toBe(100);
  });
});
