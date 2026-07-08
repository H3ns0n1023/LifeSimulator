// tests/engine/trigger.test.ts
import { describe, it, expect } from 'vitest';
import { filterEligible } from '../../src/engine/trigger';
import { makeState, sampleEvent } from '../fixtures';
import type { GameEvent } from '../../src/engine/types';

const events: GameEvent[] = [
  sampleEvent, // career, 25-45, once
  {
    id: 'young_event', stage: 'school', ageRange: [10, 15], trigger: { baseWeight: 5 },
    text: '', choices: [],
  },
  {
    id: 'flagged_event', stage: 'career', ageRange: [25, 45],
    trigger: { baseWeight: 5, requires: [{ flag: 'milestone_has_job' }] },
    text: '', choices: [],
  },
  {
    id: 'already_fired', stage: 'career', ageRange: [25, 45], once: true, trigger: { baseWeight: 5 },
    text: '', choices: [],
  },
];

describe('filterEligible', () => {
  it('includes events matching age and stage', () => {
    const result = filterEligible(events, makeState());
    expect(result.some((e) => e.id === 'test_event')).toBe(true);
  });

  it('excludes events outside age range', () => {
    const result = filterEligible(events, makeState());
    expect(result.some((e) => e.id === 'young_event')).toBe(false);
  });

  it('excludes events whose requires condition fails', () => {
    const result = filterEligible(events, makeState());
    expect(result.some((e) => e.id === 'flagged_event')).toBe(false);
  });

  it('includes events whose requires condition passes', () => {
    const s = makeState();
    s.flags.add('milestone_has_job');
    const result = filterEligible(events, s);
    expect(result.some((e) => e.id === 'flagged_event')).toBe(true);
  });

  it('excludes once-events already in history', () => {
    const s = makeState({ history: ['already_fired'] });
    const result = filterEligible(events, s);
    expect(result.some((e) => e.id === 'already_fired')).toBe(false);
  });

  it('excludes events in trigger.excludes', () => {
    const s = makeState({ history: ['test_event'] });
    const ev: GameEvent = {
      id: 'mutual', stage: 'career', ageRange: [25, 45],
      trigger: { baseWeight: 5, excludes: ['test_event'] },
      text: '', choices: [],
    };
    expect(filterEligible([ev], s).length).toBe(0);
  });
});
