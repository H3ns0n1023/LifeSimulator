// src/content/college/dream-gaokao.ts
import type { GameEvent } from '../../engine/types';

export const dreamGaokao: GameEvent = {
  id: 'foreshadow_dream_gaokao',
  stage: 'college',
  ageRange: [19, 22],
  once: true,
  trigger: { baseWeight: 5 },
  text: '你做了一个梦，梦里又回到了高考考场，笔尖发抖，却奇怪地看懂了所有题……醒来只剩恍惚。',
  choices: [{
    label: '继续',
    outcomes: [{
      weight: 100,
      condition: { all: [] },
      apply: (s) => { s.flags.add('foreshadow_dream_gaokao'); },
      result: '梦境消散。',
    }],
  }],
};
