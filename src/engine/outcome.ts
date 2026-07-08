// src/engine/outcome.ts
import type { Choice, GameState, Outcome } from './types';
import { evaluateCondition } from './condition';
import { pickWeighted } from './rng';

export function resolveChoice(choice: Choice, state: GameState, rng: () => number): Outcome | undefined {
  const candidates = choice.outcomes.filter((o) => evaluateCondition(o.condition, state));
  if (candidates.length === 0) return undefined;
  return pickWeighted(
    candidates.map((o) => ({ item: o, weight: o.weight })),
    rng,
  );
}
