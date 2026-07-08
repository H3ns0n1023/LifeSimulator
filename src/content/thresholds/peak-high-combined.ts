// src/content/thresholds/peak-high-combined.ts
import type { GameEvent } from '../../engine/types';
import { THRESHOLDS } from '../../engine/constants';

export const peakHighCombined: GameEvent = {
  id: 'threshold_peak_high',
  stage: 'career',
  ageRange: [30, 60],
  once: true,
  trigger: {
    baseWeight: 0,
    requires: [{ notFlag: 'peak_high_combined_fired' }],
    // 注：复合条件 happy+wealth>150 不能用单个 Condition 表达，需要 loop 主动检查
    // 这里 requires 只挡 flag，实际触发在 loop 里手动判断
  },
  text: '你的人生达到了前所未有的高度。财富和快乐同时爆表。',
  choices: [
    {
      label: '继续冲刺，野心不止',
      outcomes: [{
        weight: 100,
        condition: { all: [] },
        apply: (s) => {
          s.flags.add('peak_high_combined_fired');
          s.flags.add('choice_empire_arc');
        },
        result: '你踏上了商业帝国的征途。',
      }],
    },
    {
      label: '知足常乐，享受生活',
      outcomes: [{
        weight: 100,
        condition: { all: [] },
        apply: (s) => {
          s.flags.add('peak_high_combined_fired');
          s.flags.add('choice_content_life');
          s.attrs.快乐 += 10;
        },
        result: '你开始享受人生。',
      }],
    },
    {
      label: '突然感到空虚',
      outcomes: [{
        weight: 100,
        condition: { all: [] },
        apply: (s) => {
          s.flags.add('peak_high_combined_fired');
          s.attrs.快乐 -= 15;
        },
        result: '一切都有了，但你不知道自己想要什么。',
      }],
    },
  ],
};
