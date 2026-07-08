// src/content/school/secret-reading.ts
import type { GameEvent } from '../../engine/types';

export const secretReading: GameEvent = {
  id: 'foreshadow_writer_dream',
  stage: 'school',
  ageRange: [12, 17],
  once: true,
  trigger: { baseWeight: 5 },
  text: '你躲在课桌下偷看小说，被老师抓个正着。老师叹了口气：「爱看书不是坏事，但别在上课时。」',
  choices: [
    {
      label: '心里默默记下这个梦想',
      outcomes: [{
        weight: 100,
        condition: { all: [] },
        apply: (s) => { s.flags.add('foreshadow_writer_dream'); s.attrs.智力 += 2; },
        result: '也许有一天，你也能写出让人入迷的故事。',
      }],
    },
    {
      label: '从此再也不敢看闲书',
      outcomes: [{
        weight: 100,
        condition: { all: [] },
        apply: (s) => { s.attrs.快乐 -= 3; },
        result: '你压抑了自己的爱好。',
      }],
    },
  ],
};
