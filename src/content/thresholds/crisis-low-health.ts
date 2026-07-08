// src/content/thresholds/crisis-low-health.ts
import type { GameEvent } from '../../engine/types';
import { improveHealth, adjustSalary, worsenHealth, setHealth } from '../../engine/status';
import { THRESHOLDS } from '../../engine/constants';

export const crisisLowHealth: GameEvent = {
  id: 'threshold_low_health',
  stage: 'special',
  ageRange: [25, 85],
  once: true,
  trigger: {
    baseWeight: 0,
    requires: [
      { healthGte: THRESHOLDS.lowHealth },
      { notFlag: 'crisis_low_health_fired' },
    ],
  },
  text: '你最近总是胸闷气短，体重也涨了不少。健康亮起红灯。',
  choices: [
    {
      label: '住院体检',
      outcomes: [{
        weight: 100,
        condition: { salaryGte: 8000 },
        apply: (s) => { improveHealth(s); adjustSalary(s, -3000); s.flags.add('crisis_low_health_fired'); },
        result: '医生警告你注意身体，你乖乖听话。',
      }],
    },
    {
      label: '开始健身',
      outcomes: [{
        weight: 100,
        condition: { all: [] },
        apply: (s) => { improveHealth(s); s.flags.add('crisis_low_health_fired'); },
        result: '你开始跑步，慢慢恢复。',
      }],
    },
    {
      label: '硬扛，没时间管这些',
      outcomes: [{
        weight: 100,
        condition: { all: [] },
        apply: (s) => { worsenHealth(s); s.flags.add('crisis_low_health_fired'); },
        result: '你继续硬撑。健康进一步恶化。',
      }],
    },
  ],
};
