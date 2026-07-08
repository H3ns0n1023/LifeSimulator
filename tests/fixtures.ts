// tests/fixtures.ts
import type { GameState, GameEvent } from '../src/engine/types';
import { mulberry32 } from '../src/engine/rng';

export function makeState(overrides: Partial<GameState> = {}): GameState {
  return {
    age: 25,
    stage: 'career',
    attrs: { 智力: 50, 魅力: 50, 体质: 50, 运气: 50, 财富: 50, 快乐: 50 },
    skills: { 硬: 30, 软: 30, 摸: 30 },
    flags: new Set<string>(),
    history: [],
    meta: { seed: 12345, playthrough: 1 },
    ...overrides,
  };
}

export const rngFor = (seed: number) => mulberry32(seed);

export const sampleEvent: GameEvent = {
  id: 'test_event',
  stage: 'career',
  ageRange: [25, 45],
  once: true,
  trigger: { baseWeight: 10 },
  text: '测试事件',
  choices: [
    {
      label: '选项 A',
      outcomes: [
        { weight: 50, condition: { attrGte: { 体质: 30 } }, apply: () => {}, result: 'A 常规' },
        { weight: 50, condition: { attrLt: { 体质: 30 } }, apply: () => {}, result: 'A 反转' },
      ],
    },
    { label: '选项 B', outcomes: [
      { weight: 100, condition: { all: [] }, apply: () => {}, result: 'B 兜底' },
    ]},
  ],
};
