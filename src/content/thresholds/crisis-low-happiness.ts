// src/content/thresholds/crisis-low-happiness.ts
import type { GameEvent } from '../../engine/types';
import { THRESHOLDS } from '../../engine/constants';

export const crisisLowHappiness: GameEvent = {
  id: 'threshold_low_happiness',
  stage: 'career', // any non-childhood stage works; we filter via trigger.requires
  ageRange: [20, 75],
  once: true,
  trigger: {
    baseWeight: 0, // 不参与常规抽取 —— 由 loop 检测阈值触发
    requires: [
      { attrLt: { 快乐: THRESHOLDS.lowHappiness } }, // 20，constants 里
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
          s.attrs.快乐 += 15;
          s.attrs.财富 -= 5;
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
          s.attrs.快乐 -= 5;
          s.attrs.体质 -= 10;
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
          s.attrs.快乐 -= 5;
          s.attrs.财富 += 15;
          s.flags.add('crisis_low_happiness_fired');
        },
        result: '你把痛苦转化为产出，老板很高兴。',
      }],
    },
    {
      label: '（需要智力 60）顿悟人生',
      hint: '需要 智力≥60',
      visibleWhen: { attrGte: { 智力: 60 } },
      outcomes: [{
        weight: 100,
        condition: { attrGte: { 智力: 60 } },
        apply: (s) => {
          s.flags.add('choice_midlife_monk_early');
          s.attrs.快乐 += 30;
          s.flags.add('crisis_low_happiness_fired');
        },
        nextEvent: 'ending_monk',
        result: '你突然看破了红尘。',
      }],
    },
  ],
};
