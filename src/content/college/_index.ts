// src/content/college/_index.ts
import type { GameEvent } from '../../engine/types';

export const collegeEvents: GameEvent[] = [
  // 1. 社团加入 — 19-21 岁
  {
    id: 'college_club_join',
    stage: 'college', ageRange: [19, 21], once: true,
    trigger: { baseWeight: 5 },
    text: '社团招新摊位一字排开，学长学姐们吆喝得热火朝天。',
    choices: [
      {
        label: '加入辩论社',
        outcomes: [{
          weight: 100,
          condition: { all: [] },
          apply: (s) => { s.skills.软 += 8; s.attrs.快乐 += 3; },
          result: '你学会了在台上不结巴地说话，还能引经据典。',
        }],
      },
      {
        label: '加入编程社',
        outcomes: [{
          weight: 100,
          condition: { all: [] },
          apply: (s) => { s.skills.硬 += 8; s.attrs.快乐 += 3; },
          result: '你第一次跑通了 Hello World，激动得发朋友圈。',
        }],
      },
      {
        label: '都不感兴趣，回宿舍躺着',
        outcomes: [{
          weight: 100,
          condition: { all: [] },
          apply: (s) => { s.skills.摸 += 5; s.attrs.快乐 += 2; },
          result: '你成了宿舍公认的睡神。',
        }],
      },
    ],
  },

  // 2. 实习 — 20-22 岁
  {
    id: 'college_internship',
    stage: 'college', ageRange: [20, 22], once: true,
    trigger: { baseWeight: 6 },
    text: '同学们都在找实习，你也投了几份简历。终于有一家让你去面试了。',
    choices: [
      {
        label: '认真准备，拿个 offer',
        outcomes: [
          {
            weight: 60,
            condition: { attrGte: { 智力: 50 } },
            apply: (s) => { s.attrs.财富 += 8; s.skills.硬 += 5; s.attrs.快乐 += 3; },
            result: '实习三个月，你拿到了第一笔像样的工资。',
          },
          {
            weight: 40,
            condition: { attrLt: { 智力: 50 } },
            apply: (s) => { s.attrs.财富 += 3; s.attrs.快乐 -= 2; },
            result: '实习主要是打杂，但你至少混了份简历。',
          },
        ],
      },
      {
        label: '水一个就好',
        outcomes: [{
          weight: 100,
          condition: { all: [] },
          apply: (s) => { s.skills.摸 += 5; s.attrs.财富 += 2; },
          result: '你在实习公司摸鱼三个月，学到了如何装忙。',
        }],
      },
    ],
  },

  // 3. 初恋 — 19-22 岁
  {
    id: 'college_first_love',
    stage: 'college', ageRange: [19, 22], once: true,
    trigger: { baseWeight: 5 },
    text: '图书馆里那个总坐窗边的人，今天忽然对你笑了一下。',
    choices: [
      {
        label: '主动搭讪',
        outcomes: [
          {
            weight: 60,
            condition: { attrGte: { 魅力: 40 } },
            apply: (s) => { s.attrs.快乐 += 10; s.attrs.魅力 += 5; s.flags.add('milestone_first_love'); },
            result: '你们开始一起上自习、一起吃食堂。大学有了甜味。',
          },
          {
            weight: 40,
            condition: { attrLt: { 魅力: 40 } },
            apply: (s) => { s.attrs.快乐 -= 3; s.attrs.魅力 += 2; },
            result: '对方礼貌地笑了一下，然后换了个座位。心痛。',
          },
        ],
      },
      {
        label: '暗恋就好',
        outcomes: [{
          weight: 100,
          condition: { all: [] },
          apply: (s) => { s.attrs.快乐 += 2; s.attrs.魅力 += 1; },
          result: '你每天去图书馆，只为那一个笑容。',
        }],
      },
    ],
  },

  // 4. 求职 — 22 岁 (transcribed from brief)
  {
    id: 'college_first_job_hunt',
    stage: 'college', ageRange: [22, 22], once: true,
    trigger: { baseWeight: 10 },
    text: '毕业季到了，你开始找工作。',
    choices: [
      {
        label: '去大厂卷',
        outcomes: [{
          weight: 100,
          condition: { attrGte: { 智力: 60 } },
          apply: (s) => {
            s.flags.add('milestone_has_job');
            s.flags.add('milestone_first_job_tech');
            s.attrs.财富 += 15;
            s.attrs.体质 -= 10;
            s.attrs.快乐 -= 5;
          },
          result: '你拿到了大厂 offer，入职第一天就开始 996。',
        }],
      },
      {
        label: '找份轻松的工作',
        outcomes: [{
          weight: 100,
          condition: { all: [] },
          apply: (s) => {
            s.flags.add('milestone_has_job');
            s.attrs.财富 += 5;
            s.attrs.快乐 += 5;
          },
          result: '你进了一家小公司，朝九晚五。',
        }],
      },
    ],
  },
];
