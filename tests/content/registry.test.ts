// tests/content/registry.test.ts
import { describe, it, expect } from 'vitest';
import { ALL_EVENTS, ALL_ENDINGS } from '../../src/content/_registry';

describe('content registry', () => {
  it('all event IDs are unique', () => {
    const ids = ALL_EVENTS.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all ending IDs are unique', () => {
    const ids = ALL_ENDINGS.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all nextEvent references point to existing events or endings', () => {
    const eventIds = new Set(ALL_EVENTS.map((e) => e.id));
    const endingIds = new Set(ALL_ENDINGS.map((e) => e.id));
    for (const ev of ALL_EVENTS) {
      for (const c of ev.choices) {
        for (const o of c.outcomes) {
          if (!o.nextEvent) continue;
          if (!eventIds.has(o.nextEvent) && !endingIds.has(o.nextEvent)) {
            throw new Error(`Event ${ev.id} references unknown nextEvent: ${o.nextEvent}`);
          }
        }
      }
    }
  });

  it('exactly one default ending (priority 0, condition true)', () => {
    const defaults = ALL_ENDINGS.filter((e) => e.priority === 0);
    expect(defaults.length).toBe(1);
  });
});
