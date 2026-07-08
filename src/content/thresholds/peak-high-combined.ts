// src/content/thresholds/peak-high-combined.ts
import type { GameEvent } from '../../engine/types';
import { addScore } from '../../engine/status';

export const peakHighCombined: GameEvent = {
  id: 'threshold_peak_high',
  stage: 'special',
  ageRange: [30, 75],
  once: true,
  trigger: {
    baseWeight: 0,
    requires: [
      { notFlag: 'peak_high_combined_fired' },
      { scoreGte: { career: 40, family: 40 } },
    ],
  },
  text: '你的人生达到了前所未有的高度。事业和家庭双丰收，外人看来你赢了。',
  choices: [
    {
      label: '继续冲刺，野心不止',
      outcomes: [{
        weight: 100,
        condition: { all: [] },
        apply: (s) => { s.flags.add('peak_high_combined_fired'); s.flags.add('choice_empire_arc'); addScore(s, 'career', 10); },
        result: '你踏上了商业帝国的征途。',
      }],
    },
    {
      label: '知足常乐，享受生活',
      outcomes: [{
        weight: 100,
        condition: { all: [] },
        apply: (s) => { s.flags.add('peak_high_combined_fired'); s.flags.add('choice_content_life'); addScore(s, 'freedom', 10); },
        result: '你开始享受人生。',
      }],
    },
    {
      label: '突然感到空虚',
      outcomes: [{
        weight: 100,
        condition: { all: [] },
        apply: (s) => { s.flags.add('peak_high_combined_fired'); addScore(s, 'spirit', 10); },
        result: '一切都有了，但你不知道自己想要什么。你开始追问人生的意义。',
      }],
    },
  ],
};
