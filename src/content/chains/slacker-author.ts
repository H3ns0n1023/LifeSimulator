// src/content/chains/slacker-author.ts
import type { GameEvent } from '../../engine/types';

export const slackerWriting: GameEvent = {
  id: 'career_slacker_writing',
  stage: 'career',
  ageRange: [25, 50],
  once: true,
  trigger: {
    baseWeight: 6,
    requires: [{ flag: 'milestone_has_job' }],
  },
  text: '下午三点，你工位上的代码已经跑起来了。你打开了一个空白文档……',
  choices: [
    {
      label: '继续摸鱼刷手机',
      outcomes: [{
        weight: 70,
        condition: { all: [] },
        apply: (s) => { s.attrs.快乐 += 2; s.attrs.体质 -= 1; s.skills.摸 += 2; },
        result: '你刷了一下午短视频，毫无收获。',
      }],
    },
    {
      label: '偷偷写小说',
      outcomes: [
        {
          weight: 50,
          condition: { all: [] },
          apply: (s) => { s.attrs.快乐 += 5; s.skills.摸 += 5; },
          result: '你写了 2000 字，发到网上。无人问津，但你心情很好。',
        },
        {
          weight: 25,
          condition: { skillGte: { 摸: 40 } },
          apply: (s) => {
            s.attrs.财富 += 15;
            s.flags.add('twist_slacker_author');
          },
          result: '你的小说小爆了一下，每月多了一笔稳定副业收入。',
        },
        {
          weight: 8,
          condition: { all: [
            { skillGte: { 摸: 50 } },
            { flag: 'foreshadow_writer_dream' },
          ]},
          apply: (s) => {
            s.flags.add('twist_slacker_bestseller');
            s.attrs.财富 = 95;
          },
          nextEvent: 'ending_slacker_author',
          result: '你的小说成了年度 IP，影视版权卖出天价。你辞职全职写作。',
        },
      ],
    },
  ],
};
