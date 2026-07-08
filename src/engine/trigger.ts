// src/engine/trigger.ts
import type { GameEvent, GameState } from './types';
import { evaluateCondition } from './condition';

export function filterEligible(events: ReadonlyArray<GameEvent>, state: GameState): GameEvent[] {
  return events.filter((ev) => {
    if (ev.stage !== 'special' && ev.stage !== state.stage) return false;
    const [min, max] = ev.ageRange;
    if (state.age < min || state.age > max) return false;
    if (ev.once && state.history.includes(ev.id)) return false;
    if (ev.trigger.excludes?.some((id) => state.history.includes(id))) return false;
    if (ev.trigger.requires && !ev.trigger.requires.every((c) => evaluateCondition(c, state))) return false;
    return true;
  });
}
