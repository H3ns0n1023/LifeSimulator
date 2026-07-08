// src/content/childhood/_index.ts
import type { GameEvent } from '../../engine/types';

export const childhoodEvents: GameEvent[] = [
  {
    id: 'childhood_family_rich',
    stage: 'childhood', ageRange: [1, 3], once: true,
    trigger: { baseWeight: 3 },
    text: '你出生在一个殷实的家庭。父母带你到处旅行。',
    choices: [{ label: '继续', outcomes: [{
      weight: 100, condition: { all: [] },
      apply: (s) => { s.attrs.财富 += 10; s.attrs.智力 += 5; s.flags.add('milestone_rich_family'); },
      result: '你见多识广，比同龄人成熟。',
    }]}],
  },
  {
    id: 'childhood_family_poor',
    stage: 'childhood', ageRange: [1, 3], once: true,
    trigger: { baseWeight: 3, excludes: ['childhood_family_rich'] },
    text: '你的家境普通，父母为生活奔波。',
    choices: [{ label: '继续', outcomes: [{
      weight: 100, condition: { all: [] },
      apply: (s) => { s.attrs.体质 -= 5; s.attrs.智力 += 3; s.flags.add('milestone_poor_family'); },
      result: '你早早学会了独立。',
    }]}],
  },
  {
    id: 'childhood_talent_music',
    stage: 'childhood', ageRange: [4, 6], once: true,
    trigger: { baseWeight: 4 },
    text: '你听到邻居弹钢琴，眼睛一亮。',
    choices: [
      { label: '央求父母学钢琴', outcomes: [{
        weight: 100, condition: { attrGte: { 财富: 30 } },
        apply: (s) => { s.attrs.魅力 += 8; s.attrs.财富 -= 5; },
        result: '你开始学钢琴，气质逐渐显现。',
      }]},
      { label: '算了', outcomes: [{
        weight: 100, condition: { all: [] },
        apply: () => {},
        result: '你只是听听就算了。',
      }]},
    ],
  },
  {
    id: 'childhood_first_friend',
    stage: 'childhood', ageRange: [5, 6], once: true,
    trigger: { baseWeight: 5 },
    text: '你在公园认识了第一个好朋友。',
    choices: [{ label: '继续', outcomes: [{
      weight: 100, condition: { all: [] },
      apply: (s) => { s.attrs.快乐 += 10; s.flags.add('milestone_first_friend'); },
      result: '童年有了伙伴。',
    }]}],
  },
];
