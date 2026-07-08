// src/content/retirement/_index.ts
import type { GameEvent } from '../../engine/types';

export const retirementEvents: GameEvent[] = [
  // 1. 退休 — 61-62 岁 (transcribed from brief)
  {
    id: 'retirement_pension',
    stage: 'retirement', ageRange: [61, 62], once: true,
    trigger: { baseWeight: 10 },
    text: '你正式退休了。',
    choices: [{ label: '继续', outcomes: [{
      weight: 100,
      condition: { all: [] },
      apply: (s) => { s.attrs.快乐 += 10; s.flags.add('milestone_retired'); },
      result: '你开始享受退休生活。',
    }]}],
  },

  // 2. 回望一生 — 70-80 岁 (authored, reflective callback)
  {
    id: 'retirement_legacy',
    stage: 'retirement', ageRange: [70, 80], once: true,
    trigger: { baseWeight: 7 },
    text: '一个阳光很好的下午，你坐在阳台上晒太阳，忽然想起很多事。',
    choices: [{ label: '回忆一生', outcomes: [
      // 富有版本
      {
        weight: 100,
        condition: { flag: 'milestone_house_owner' },
        apply: (s) => { s.attrs.快乐 += 8; s.flags.add('achievement_reflected'); },
        result: '你看着这套属于自己的房子，心想：这辈子至少没白忙。',
      },
      // 成家版本
      {
        weight: 100,
        condition: { flag: 'milestone_family' },
        apply: (s) => { s.attrs.快乐 += 10; s.flags.add('achievement_reflected'); },
        result: '孙辈在客厅嬉闹，你眯着眼笑。吵是吵了点，但热闹。',
      },
      // 丁克/已婚无子版本
      {
        weight: 100,
        condition: { flag: 'milestone_married' },
        apply: (s) => { s.attrs.快乐 += 6; s.flags.add('achievement_reflected'); },
        result: '老伴递来一杯茶。这么多年，你们依然聊得来。',
      },
      // 单身版本
      {
        weight: 100,
        condition: { flag: 'choice_stay_single' },
        apply: (s) => { s.attrs.快乐 += 4; s.attrs.智力 += 2; s.flags.add('achievement_reflected'); },
        result: '你翻开旧日记，独自行过的山川一一浮现。一个人也挺浪漫。',
      },
      // 大厂/科技职业版本
      {
        weight: 100,
        condition: { flag: 'milestone_first_job_tech' },
        apply: (s) => { s.attrs.智力 += 3; s.flags.add('achievement_reflected'); },
        result: '你想起当年深夜写的代码、上线的大版本——现在那些系统还在跑。',
      },
      // 被裁/失业版本
      {
        weight: 100,
        condition: { flag: 'milestone_fired' },
        apply: (s) => { s.attrs.快乐 += 5; s.flags.add('achievement_reflected'); },
        result: '被裁那天你以为是终点，原来只是拐了个弯。',
      },
      // 兜底版本
      {
        weight: 100,
        condition: { all: [] },
        apply: (s) => { s.attrs.快乐 += 3; s.flags.add('achievement_reflected'); },
        result: '一生说长不长，说短不短。你闭上眼，阳光很暖。',
      },
    ]}],
  },
];
