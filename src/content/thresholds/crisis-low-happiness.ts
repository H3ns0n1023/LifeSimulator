// src/content/thresholds/crisis-low-happiness.ts
import type { GameEvent } from '../../engine/types';
import { addScore, adjustSalary, adjustSavings, worsenHealth, addDisease } from '../../engine/status';

// 阈值事件：抑郁触发（disease=depression 时触发）
export const crisisLowHappiness: GameEvent = {
  id: 'threshold_low_happiness',
  stage: 'special',
  ageRange: [20, 80],
  once: true,
  trigger: {
    baseWeight: 0,
    requires: [
      { disease: 'depression' },
      { notFlag: 'crisis_low_happiness_fired' },
    ],
  },
  text: '你最近常常失眠，对什么都提不起兴趣。是时候做点什么了。',
  choices: [
    {
      label: '找朋友倾诉',
      outcomes: [{
        weight: 100,
        condition: { all: [] },
        apply: (s) => {
          addScore(s, 'family', 10);
          adjustSavings(s, -1000);
          s.diseases.delete('depression');
          s.flags.add('crisis_low_happiness_fired');
        },
        result: '朋友拉你出去喝酒吐槽，你好受多了。',
      }],
    },
    {
      label: '借酒消愁',
      outcomes: [{
        weight: 100,
        condition: { all: [] },
        apply: (s) => {
          worsenHealth(s);
          s.flags.add('crisis_low_happiness_fired');
        },
        result: '你越喝越颓废。',
      }],
    },
    {
      label: '化悲愤为动力，加班',
      outcomes: [{
        weight: 100,
        condition: { all: [] },
        apply: (s) => {
          adjustSalary(s, 3000);
          s.flags.add('crisis_low_happiness_fired');
        },
        result: '你把痛苦转化为产出，老板很高兴。',
      }],
    },
    {
      label: '（精神线 ≥ 30）顿悟人生',
      hint: '需要 精神线 ≥30',
      visibleWhen: { scoreGte: { spirit: 30 } },
      outcomes: [{
        weight: 100,
        condition: { scoreGte: { spirit: 30 } },
        apply: (s) => {
          s.flags.add('choice_midlife_monk_early');
          addScore(s, 'spirit', 20);
          s.diseases.delete('depression');
          s.flags.add('crisis_low_happiness_fired');
        },
        nextEvent: 'ending_monk',
        result: '你突然看破了红尘。',
      }],
    },
  ],
};
