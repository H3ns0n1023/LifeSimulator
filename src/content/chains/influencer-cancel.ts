// src/content/chains/influencer-cancel.ts
// 招牌链：网红过气翻车 —— 呼应 twist_top_influencer（viral-short-video 罕见层）
import type { GameEvent } from '../../engine/types';
import { addScore, adjustSavings, addDisease } from '../../engine/status';

export const influencerCancel: GameEvent = {
  id: 'career_influencer_cancel',
  stage: 'career',
  ageRange: [35, 55],
  once: true,
  trigger: {
    baseWeight: 9,
    requires: [
      { flag: 'twist_top_influencer' },
      { scoreGte: { fame: 40 } },
    ],
  },
  text: '流量开始退潮。你的新视频播放量从千万跌到十万，评论区出现"过气了""江郎才尽"。MCN 提出要降你的分成，品牌方在观望。',
  choices: [
    {
      label: '铤而走险，炒作话题博流量',
      outcomes: [
        // 常规层：翻车塌房，被遗忘
        {
          weight: 50,
          condition: { all: [] },
          apply: (s) => {
            s.flags.add('twist_cancel_hard');
            addScore(s, 'fame', -30);
            addDisease(s, 'depression');
          },
          nextEvent: 'ending_influencer_forgotten',
          result: '你的炒作彻底翻车。品牌解约，粉丝脱粉。三个月后，没人记得你是谁。',
        },
        // 反转层：硬扛转型，掉粉但稳住
        {
          weight: 30,
          condition: { all: [] },
          apply: (s) => {
            addScore(s, 'fame', -15);
            addScore(s, 'spirit', 8);
            s.flags.add('choice_influencer_pivot');
          },
          result: '你放弃了博眼球，转去做小众深度内容。粉丝掉了一半，但留下的都是真心的。',
        },
        // 罕见层：洗白翻红（NG+ 记忆帮避开雷区）
        {
          weight: 10,
          condition: { flag: 'ng_plus_memory' },
          apply: (s) => {
            addScore(s, 'fame', 20);
            adjustSavings(s, 200000);
            s.flags.add('choice_influencer_comeback');
          },
          result: '前世的记忆让你避开了所有舆论雷区。一次真诚的道歉视频，让你奇迹般翻红。',
        },
      ],
    },
    {
      label: '急流勇退，体面退场',
      outcomes: [{
        weight: 100,
        condition: { all: [] },
        apply: (s) => {
          addScore(s, 'spirit', 12);
          addScore(s, 'freedom', 8);
          s.flags.add('choice_influencer_retire');
        },
        result: '你在巅峰时主动告别，留下的都是体面。江湖上偶尔还有人提起你。',
      }],
    },
  ],
};
