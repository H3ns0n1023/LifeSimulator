// tests/engine/loop.test.ts
import { describe, it, expect } from 'vitest';
import { selectEventsForYear, applyYearlyTick, checkDeath, applyOutcomeToState, detectThresholdEvents } from '../../src/engine/loop';
import { makeState, sampleEvent, rngFor } from '../fixtures';
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
    applyYearlyTick(s, rngFor(1));
    expect(s.age).toBe(23);
    expect(s.stage).toBe('career');
  });

  it('does not worsen health before 40', () => {
    const s = makeState({ age: 30, health: 'healthy' });
    applyYearlyTick(s, rngFor(1));
    expect(s.health).toBe('healthy');
  });

  it('may worsen health after 40 (rng-controlled, boundary: decay starts at 41+)', () => {
    // age 40 -> tick -> 41 -> 41 > 40 → 进入衰老窗口
    // 实现：rng() < 0.15 命中（15% 概率恶化），所以低 rng 才触发
    const s = makeState({ age: 40, health: 'healthy' });
    applyYearlyTick(s, () => 0.05); // 0.05 < 0.15 → 命中，恶化一档
    expect(s.age).toBe(41);
    expect(s.health).toBe('subhealthy');
  });

  it('health does not worsen when rng roll above probability', () => {
    // rng 永远返回 0.999 > 0.15 → 不恶化
    const s = makeState({ age: 50, health: 'healthy' });
    applyYearlyTick(s, () => 0.999);
    expect(s.health).toBe('healthy');
  });

  it('health worsens at most one rank per year (no cascade)', () => {
    const s = makeState({ age: 50, health: 'mild' });
    applyYearlyTick(s, () => 0.05); // 命中，只降一档
    expect(s.health).toBe('severe'); // mild→severe，不会跳到 critical
  });

  it('health stays at critical (does not overflow)', () => {
    const s = makeState({ age: 50, health: 'critical' });
    applyYearlyTick(s, () => 0.999);
    expect(s.health).toBe('critical');
  });

  it('updates stage to retirement after 60', () => {
    const s = makeState({ age: 60, stage: 'career' });
    applyYearlyTick(s, rngFor(1));
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

  it('returns true when health is critical', () => {
    const s = makeState({ health: 'critical' });
    expect(checkDeath(s, 80)).toBe(true);
  });

  it('returns false when health is severe (not yet critical)', () => {
    const s = makeState({ health: 'severe' });
    expect(checkDeath(s, 80)).toBe(false);
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
});

describe('detectThresholdEvents', () => {
  it('fires baseWeight=0 event when its requires are met', () => {
    const ev: GameEvent = {
      id: 'threshold_test',
      stage: 'career',
      ageRange: [20, 80],
      once: true,
      trigger: { baseWeight: 0, requires: [{ healthGte: 'severe' }] },
      text: '健康危机',
      choices: [{ label: '继续', outcomes: [{ weight: 1, condition: { all: [] }, apply: () => {}, result: '' }] }],
    };
    const s = makeState({ health: 'severe', age: 30 });
    expect(detectThresholdEvents([ev], s)).toContain('threshold_test');
  });

  it('does not fire threshold event when requires not met', () => {
    const ev: GameEvent = {
      id: 'threshold_test',
      stage: 'career',
      ageRange: [20, 80],
      once: true,
      trigger: { baseWeight: 0, requires: [{ healthGte: 'severe' }] },
      text: '健康危机',
      choices: [{ label: '继续', outcomes: [{ weight: 1, condition: { all: [] }, apply: () => {}, result: '' }] }],
    };
    const s = makeState({ health: 'healthy', age: 30 });
    expect(detectThresholdEvents([ev], s)).not.toContain('threshold_test');
  });

  it('skips baseWeight>0 events (those are for selectEventsForYear)', () => {
    const ev: GameEvent = {
      ...sampleEvent,
      id: 'regular_not_threshold',
      trigger: { baseWeight: 5 },
    };
    const s = makeState();
    expect(detectThresholdEvents([ev], s)).not.toContain('regular_not_threshold');
  });

  it('does not re-fire already-triggered (history) threshold events', () => {
    const ev: GameEvent = {
      id: 'threshold_once',
      stage: 'career',
      ageRange: [20, 80],
      once: true,
      trigger: { baseWeight: 0, requires: [{ healthGte: 'severe' }] },
      text: '健康危机',
      choices: [{ label: '继续', outcomes: [{ weight: 1, condition: { all: [] }, apply: () => {}, result: '' }] }],
    };
    const s = makeState({ health: 'severe', age: 30, history: ['threshold_once'] });
    expect(detectThresholdEvents([ev], s)).not.toContain('threshold_once');
  });
});
