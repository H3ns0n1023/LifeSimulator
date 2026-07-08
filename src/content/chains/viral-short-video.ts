// src/content/chains/viral-short-video.ts
// 招牌链：平凡人的一条爆款视频 —— 呼应 foreshadow_indie_dev（school）
import type { GameEvent } from '../../engine/types';
import { addScore, adjustSalary, addDisease } from '../../engine/status';

export const viralShortVideo: GameEvent = {
  id: 'career_viral_video',
  stage: 'career',
  ageRange: [24, 40],
  once: true,
  trigger: {
    baseWeight: 6,
    requires: [{ flag: 'foreshadow_indie_dev' }, { employment: 'employed' }],
  },
  text: '你随手拍的一段"程序员的一天"发到短视频平台。第二天醒来，99 万播放，几千条私信。',
  choices: [
    {
      label: '抓住风口，全职做内容',
      outcomes: [
        // 常规层：成为小网红
        {
          weight: 50,
          condition: { all: [] },
          apply: (s) => {
            adjustSalary(s, 8000);
            addScore(s, 'fame', 15);
            addScore(s, 'freedom', 5);
            s.flags.add('twist_micro_influencer');
          },
          result: '你成了小有名气的职场博主，接了几个广告，月入翻了三倍。',
        },
        // 反转层：算法翻脸，被反噬
        {
          weight: 30,
          condition: { all: [] },
          apply: (s) => {
            addScore(s, 'fame', 10);
            addDisease(s, 'depression');
            s.flags.add('twist_canceled');
          },
          nextEvent: 'ending_canceled',
          result: '一句话被断章取义，你被网暴了。评论区像潮水一样淹没你。',
        },
        // 罕见反转层：成为顶流
        {
          weight: 8,
          condition: { all: [
            { scoreGte: { fame: 20 } },
            { flag: 'foreshadow_indie_dev' },
          ]},
          apply: (s) => {
            s.flags.add('twist_top_influencer');
            addScore(s, 'fame', 60);
            addScore(s, 'career', 30);
          },
          nextEvent: 'ending_top_influencer',
          result: '你的 IP 火遍全网，签约费九位数。曾经嘲笑你的同学排队求合影。',
        },
      ],
    },
    {
      label: '低调，只把它当爱好',
      outcomes: [{
        weight: 100,
        condition: { all: [] },
        apply: (s) => { addScore(s, 'freedom', 8); addScore(s, 'fame', 5); s.flags.add('choice_low_key_creator'); },
        result: '你拒绝了所有 MCN，继续做自己喜欢的视频。粉丝不多，但都真心。',
      }],
    },
    {
      label: '删掉视频，回归本职',
      outcomes: [{
        weight: 100,
        condition: { all: [] },
        apply: (s) => { addScore(s, 'career', 3); s.flags.add('choice_quit_creator'); },
        result: '流量让你害怕。你删了视频，重新打开 IDE。',
      }],
    },
  ],
};
