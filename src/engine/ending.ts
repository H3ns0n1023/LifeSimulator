// src/engine/ending.ts
import type { Ending, GameState } from './types';

export function resolveEnding(endings: ReadonlyArray<Ending>, state: GameState): Ending {
  const sorted = [...endings].sort((a, b) => b.priority - a.priority);
  for (const ending of sorted) {
    if (ending.condition(state)) return ending;
  }
  // 不应该走到这里 —— 兜底结局必须 priority 0 condition () => true
  throw new Error('No matching ending; ensure a default ending with priority 0 exists');
}
