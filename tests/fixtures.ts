// tests/fixtures.ts
import type { GameState, GameEvent } from '../src/engine/types';
import { mulberry32 } from '../src/engine/rng';

/**
 * 造一个测试用 GameState。
 * 默认是个"职场中期、健康、单身、有工作"的状态，便于测引擎逻辑。
 * 真实游戏起手 age=1/student，见 stores/game.ts 的 newGame。
 */
export function makeState(overrides: Partial<GameState> = {}): GameState {
  return {
    age: 25,
    stage: 'career',
    salary: 8000,
    health: 'healthy',
    diseases: new Set<string>(),
    employment: 'employed',
    marriage: 'single',
    scores: { career: 0, family: 0, freedom: 0, fame: 0, spirit: 0 },
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
        // 常规层：月薪 >= 5000 触发
        { weight: 50, condition: { salaryGte: 5000 }, apply: () => {}, result: 'A 常规' },
        // 反转层：月薪 < 5000 触发
        { weight: 50, condition: { salaryLt: 5000 }, apply: () => {}, result: 'A 反转' },
      ],
    },
    { label: '选项 B', outcomes: [
      { weight: 100, condition: { all: [] }, apply: () => {}, result: 'B 兜底' },
    ]},
  ],
};
