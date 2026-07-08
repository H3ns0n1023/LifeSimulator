// src/content/chains/slacker-author.ts
import type { GameEvent } from '../../engine/types';
import { addScore, adjustSalary } from '../../engine/status';

export const slackerWriting: GameEvent = {
  id: 'career_slacker_writing',
  stage: 'career',
  ageRange: [25, 50],
  once: true,
  trigger: {
    baseWeight: 6,
    requires: [{ employment: 'employed' }, { flag: 'foreshadow_writer_dream' }],
  },
  text: '下午三点，你工位上的代码已经跑起来了。你打开了一个空白文档……',
  choices: [
    {
      label: '继续摸鱼刷手机',
      outcomes: [{
        weight: 70,
        condition: { all: [] },
        apply: (s) => { addScore(s, 'freedom', 3); },
        result: '你刷了一下午短视频，毫无收获。',
      }],
    },
    {
      label: '偷偷写小说',
      outcomes: [
        {
          weight: 50,
          condition: { all: [] },
          apply: (s) => { addScore(s, 'fame', 5); addScore(s, 'spirit', 3); },
          result: '你写了 2000 字，发到网上。无人问津，但你心情很好。',
        },
        {
          weight: 25,
          condition: { scoreGte: { fame: 15 } },
          apply: (s) => { adjustSalary(s, 3000); addScore(s, 'fame', 10); s.flags.add('twist_slacker_author'); },
          result: '你的小说小爆了一下，每月多了一笔稳定副业收入。',
        },
        {
          weight: 8,
          condition: { all: [
            { scoreGte: { fame: 25 } },
            { flag: 'foreshadow_writer_dream' },
          ]},
          apply: (s) => {
            s.flags.add('twist_slacker_bestseller');
            addScore(s, 'fame', 50);
            addScore(s, 'freedom', 30);
          },
          nextEvent: 'ending_slacker_author',
          result: '你的小说成了年度 IP，影视版权卖出天价。你辞职全职写作。',
        },
      ],
    },
  ],
};
