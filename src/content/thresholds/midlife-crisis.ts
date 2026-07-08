// src/content/thresholds/midlife-crisis.ts
import type { GameEvent } from '../../engine/types';

export const midlifeCrisis: GameEvent = {
  id: 'threshold_midlife_crisis',
  stage: 'career',
  ageRange: [40, 50],
  once: true,
  trigger: {
    baseWeight: 0,
    requires: [{ notFlag: 'midlife_crisis_fired' }],
  },
  text: '四十不惑？你觉得自己越活越迷糊。',
  choices: [
    {
      label: '事业巅峰，危机解除',
      outcomes: [{
        weight: 100,
        condition: { skillGte: { 软: 50 } },
        apply: (s) => {
          s.attrs.财富 += 20;
          s.attrs.快乐 += 5;
          s.flags.add('midlife_crisis_fired');
        },
        result: '你事业蒸蒸日上，中年危机不过是过眼云烟。',
      }],
    },
    {
      label: '辞职创业',
      outcomes: [{
        weight: 100,
        condition: { all: [] },
        apply: (s) => {
          s.attrs.财富 -= 20;
          s.flags.add('choice_startup');
          s.flags.add('midlife_crisis_fired');
        },
        result: '你赌上了全部身家。',
      }],
    },
    {
      label: '顿悟出家',
      outcomes: [{
        weight: 100,
        condition: { all: [] },
        apply: (s) => {
          s.flags.add('choice_midlife_monk');
          s.flags.add('midlife_crisis_fired');
        },
        nextEvent: 'ending_monk',
        result: '你剃度出家。',
      }],
    },
    {
      label: '摆烂到底',
      outcomes: [{
        weight: 100,
        condition: { all: [] },
        apply: (s) => {
          s.attrs.快乐 -= 20;
          s.flags.add('midlife_crisis_fired');
        },
        result: '你开始彻底躺平。',
      }],
    },
  ],
};
