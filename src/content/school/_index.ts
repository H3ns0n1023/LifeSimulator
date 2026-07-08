// src/content/school/_index.ts
import type { GameEvent } from '../../engine/types';

export const schoolEvents: GameEvent[] = [
  // 1. 初恋 — 10-13 岁
  {
    id: 'school_first_crush',
    stage: 'school', ageRange: [10, 13], once: true,
    trigger: { baseWeight: 5 },
    text: '你对班上那个总回头冲你笑的同学，忽然有点心跳加速。',
    choices: [
      {
        label: '递一张小纸条',
        outcomes: [
          {
            weight: 100,
            condition: { attrGte: { 魅力: 30 } },
            apply: (s) => { s.attrs.魅力 += 5; s.attrs.快乐 += 8; s.flags.add('choice_first_crush'); },
            result: '对方红着脸收下了。这段暗恋成了甜甜的秘密。',
          },
          {
            weight: 100,
            condition: { attrLt: { 魅力: 30 } },
            apply: (s) => { s.attrs.快乐 -= 3; },
            result: '你鼓起勇气递了纸条，对方尴尬地笑了笑，没有回应。',
          },
        ],
      },
      {
        label: '默默藏在心里',
        outcomes: [{
          weight: 100,
          condition: { all: [] },
          apply: (s) => { s.attrs.快乐 += 3; s.attrs.魅力 += 2; },
          result: '你把这份心动写进了日记。多年后翻看，还是有点甜。',
        }],
      },
    ],
  },

  // 2. 考试压力 — 15-17 岁
  {
    id: 'school_exam_pressure',
    stage: 'school', ageRange: [15, 17], once: true,
    trigger: { baseWeight: 6 },
    text: '月考排名出来了，你的名字又往下掉了几个位置。班主任叹着气找你谈话。',
    choices: [
      {
        label: '咬牙拼命刷题',
        outcomes: [
          {
            weight: 60,
            condition: { attrGte: { 智力: 50 } },
            apply: (s) => { s.attrs.智力 += 8; s.attrs.体质 -= 5; s.attrs.快乐 -= 5; },
            result: '你的成绩明显进步，但黑眼圈也深了一圈。',
          },
          {
            weight: 40,
            condition: { attrLt: { 智力: 50 } },
            apply: (s) => { s.attrs.智力 += 3; s.attrs.快乐 -= 8; s.attrs.体质 -= 3; },
            result: '你拼了命，成绩却原地踏步。你开始怀疑自己。',
          },
        ],
      },
      {
        label: '佛系对待，劳逸结合',
        outcomes: [{
          weight: 100,
          condition: { all: [] },
          apply: (s) => { s.attrs.智力 += 2; s.attrs.快乐 += 5; s.attrs.体质 += 2; },
          result: '你按自己的节奏走，心态出奇地好。',
        }],
      },
    ],
  },

  // 3. 运动选拔 — 12-14 岁
  {
    id: 'school_sports_tryout',
    stage: 'school', ageRange: [12, 14], once: true,
    trigger: { baseWeight: 4 },
    text: '校队教练在招新人，他吹了声哨子：「想试试的，跑一个 800 米！」',
    choices: [
      {
        label: '咬牙冲一个',
        outcomes: [
          {
            weight: 50,
            condition: { attrGte: { 体质: 40 } },
            apply: (s) => { s.attrs.体质 += 8; s.attrs.魅力 += 3; s.flags.add('achievement_school_team'); },
            result: '你被选进校队，晒黑了但结实了不少。',
          },
          {
            weight: 50,
            condition: { attrLt: { 体质: 40 } },
            apply: (s) => { s.attrs.体质 += 3; s.attrs.快乐 -= 2; },
            result: '你跑得气喘吁吁，教练婉拒了你。但至少锻炼了一次。',
          },
        ],
      },
      {
        label: '在旁边鼓掌就好',
        outcomes: [{
          weight: 100,
          condition: { all: [] },
          apply: (s) => { s.attrs.快乐 += 3; },
          result: '你做了个快乐的拉拉队。运动这事儿，不适合每个人。',
        }],
      },
    ],
  },

  // 4. 叛逆期 — 14-16 岁
  {
    id: 'school_rebellion',
    stage: 'school', ageRange: [14, 16], once: true,
    trigger: { baseWeight: 5 },
    text: '你把头发染了一撮红色，回家被老妈一顿咆哮。她指着你的脑袋问「这是要干嘛？」',
    choices: [
      {
        label: '据理力争：这是我的自由',
        outcomes: [{
          weight: 100,
          condition: { all: [] },
          apply: (s) => { s.attrs.魅力 += 5; s.attrs.快乐 += 3; s.attrs.智力 -= 2; s.flags.add('choice_rebel_hard'); },
          result: '你妈气得三天没跟你说话。但你觉得特别酷。',
        }],
      },
      {
        label: '乖乖去洗掉',
        outcomes: [{
          weight: 100,
          condition: { all: [] },
          apply: (s) => { s.attrs.快乐 -= 3; s.attrs.智力 += 2; s.flags.add('choice_rebel_soft'); },
          result: '你把头发剃成了平头，看起来格外听话。',
        }],
      },
    ],
  },

  // 5. 高考 — 18 岁 (transcribed from brief)
  {
    id: 'school_gaokao',
    stage: 'school', ageRange: [18, 18], once: true,
    trigger: { baseWeight: 10 },
    text: '高考来了。你走出考场，心情复杂。',
    choices: [{ label: '继续', outcomes: [
      {
        weight: 30,
        condition: { attrGte: { 智力: 70 } },
        apply: (s) => { s.flags.add('milestone_top_university'); s.attrs.快乐 += 10; },
        result: '你考上了顶尖大学。',
      },
      {
        weight: 50,
        condition: { all: [{ attrLt: { 智力: 70 } }, { attrGte: { 智力: 50 } }] },
        apply: (s) => { s.flags.add('milestone_average_university'); },
        result: '你考上了一所普通大学。',
      },
      {
        weight: 20,
        condition: { attrLt: { 智力: 50 } },
        apply: (s) => { s.attrs.快乐 -= 10; s.flags.add('milestone_failed_gaokao'); },
        result: '高考失利，你上了大专。',
      },
    ]}],
  },
];
