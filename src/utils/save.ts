// src/utils/save.ts
import type { GameState } from '../engine/types';

const SAVE_KEY = 'life-sim-save-v1';

export interface SaveData {
  version: string;
  state: GameState;
  unlockedEndings: string[];
  totalPlaythroughs: number;
  lastCarryover?: string;
}

export function saveGame(data: SaveData): void {
  // Set 不能直接 JSON，转 array（flags 与 diseases 都是 Set）
  const serializable = {
    ...data,
    state: {
      ...data.state,
      flags: [...data.state.flags],
      diseases: [...data.state.diseases],
    },
  };
  localStorage.setItem(SAVE_KEY, JSON.stringify(serializable));
}

export function loadGame(): SaveData | null {
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return {
      ...parsed,
      state: {
        ...parsed.state,
        // 新增字段旧档容错（savings/allowance 是 number，旧档缺失默认 0）
        savings: parsed.state.savings ?? 0,
        allowance: parsed.state.allowance ?? 0,
        flags: new Set<string>(parsed.state.flags ?? []),
        diseases: new Set<string>(parsed.state.diseases ?? []),
      },
    };
  } catch {
    return null;
  }
}

export function hasSave(): boolean {
  return localStorage.getItem(SAVE_KEY) !== null;
}

export function clearSave(): void {
  localStorage.removeItem(SAVE_KEY);
}
