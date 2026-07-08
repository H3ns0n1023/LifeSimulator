// src/content/career/_index.ts
import type { GameEvent } from '../../engine/types';

export const careerEvents: GameEvent[] = [
  // 1. 首次晋升 — 27-32 岁
  {
    id: 'career_first_promotion',
    stage: 'career', ageRange: [27, 32], once: true,
    trigger: {
      baseWeight: 7,
      requires: [{ flag: 'milestone_has_job' }],
    },
    text: '领导把你叫到办公室，神秘一笑：「最近表现不错，有个升职的机会……」',
    choices: [
      {
        label: '接受晋升，迎接新挑战',
        outcomes: [
          {
            weight: 60,
            condition: { skillGte: { 硬: 30 } },
            apply: (s) => {
              s.attrs.财富 += 12;
              s.attrs.快乐 += 5;
              s.flags.add('achievement_first_promotion');
            },
            result: '你升了主管，薪水涨了一截，朋友圈晒了 offer letter。',
          },
          {
            weight: 40,
            condition: { skillLt: { 硬: 30 } },
            apply: (s) => {
              s.attrs.财富 += 5;
              s.attrs.体质 -= 5;
              s.attrs.快乐 -= 3;
            },
            result: '升是升了，但新岗位压力山大，你常常加班到深夜。',
          },
        ],
      },
      {
        label: '婉拒，保持生活平衡',
        outcomes: [{
          weight: 100,
          condition: { all: [] },
          apply: (s) => { s.attrs.快乐 += 5; s.skills.软 += 3; },
          result: '你选择做好手头的事。领导似乎有点失望，但你不后悔。',
        }],
      },
    ],
  },

  // 2. 跳槽 — 28-35 岁
  {
    id: 'career_job_hopping',
    stage: 'career', ageRange: [28, 35], once: true,
    trigger: {
      baseWeight: 6,
      requires: [{ flag: 'milestone_has_job' }],
    },
    text: '猎头找上门了：「对面公司给你涨 30%，考虑一下？」你心动了一下。',
    choices: [
      {
        label: '跳！换地方继续卷',
        outcomes: [{
          weight: 100,
          condition: { all: [] },
          apply: (s) => {
            s.attrs.财富 += 10;
            s.attrs.快乐 += 3;
            s.skills.硬 += 3;
            s.flags.add('choice_job_hop');
          },
          result: '新公司零食柜很丰盛，你愉快地入职了。',
        }],
      },
      {
        label: '留下来，老东家更稳',
        outcomes: [{
          weight: 100,
          condition: { all: [] },
          apply: (s) => { s.attrs.快乐 += 2; s.attrs.财富 += 3; },
          result: '老板看你没走，年底多发了点奖金。安稳也是一种选择。',
        }],
      },
    ],
  },

  // 3. 结婚 — 28-40 岁 (transcribed from brief)
  {
    id: 'career_marriage',
    stage: 'career', ageRange: [28, 40], once: true,
    trigger: {
      baseWeight: 8,
      requires: [{ flag: 'milestone_has_job' }],
    },
    text: '你和恋人到了谈婚论嫁的时候。',
    choices: [
      {
        label: '结婚生子',
        outcomes: [
          {
            weight: 100,
            condition: { attrGte: { 财富: 40 } },
            apply: (s) => {
              s.attrs.快乐 += 15;
              s.attrs.财富 -= 20;
              s.flags.add('milestone_family');
              s.flags.add('milestone_married');
            },
            result: '你成家了。',
          },
          {
            weight: 100,
            condition: { attrLt: { 财富: 40 } },
            apply: (s) => { s.attrs.快乐 -= 5; },
            result: '彩礼和房贷让你喘不过气，婚礼只好从简。',
          },
        ],
      },
      {
        label: '丁克',
        outcomes: [{
          weight: 100,
          condition: { all: [] },
          apply: (s) => { s.attrs.快乐 += 10; s.flags.add('milestone_married'); },
          result: '你们选择丁克，享受二人世界。',
        }],
      },
      {
        label: '不结婚',
        outcomes: [{
          weight: 100,
          condition: { all: [] },
          apply: (s) => { s.attrs.快乐 += 5; s.flags.add('choice_stay_single'); },
          result: '你享受单身生活。',
        }],
      },
    ],
  },

  // 4. 房贷 — 30-45 岁
  {
    id: 'career_house_loan',
    stage: 'career', ageRange: [30, 45], once: true,
    trigger: {
      baseWeight: 6,
      requires: [{ flag: 'milestone_has_job' }],
    },
    text: '中介带你看了一套房，落地窗、南向、地铁口……但价格也漂亮。你咬着笔杆算账。',
    choices: [
      {
        label: '咬牙买房，背三十年房贷',
        outcomes: [
          {
            weight: 100,
            condition: { attrGte: { 财富: 50 } },
            apply: (s) => {
              s.attrs.财富 -= 15;
              s.attrs.快乐 += 8;
              s.flags.add('milestone_house_owner');
              s.flags.add('choice_buy_house');
            },
            result: '你成了有房一族。每月还款心痛，但推开家门那一刻值了。',
          },
          {
            weight: 100,
            condition: { attrLt: { 财富: 50 } },
            apply: (s) => { s.attrs.快乐 -= 10; s.attrs.财富 -= 10; },
            result: '你硬着头皮贷了三十年，每月工资大半还了房贷。',
          },
        ],
      },
      {
        label: '继续租房，保持自由',
        outcomes: [{
          weight: 100,
          condition: { all: [] },
          apply: (s) => {
            s.attrs.财富 += 3;
            s.attrs.快乐 += 3;
            s.flags.add('choice_keep_renting');
          },
          result: '你把买房的钱拿去理财，继续做个轻盈的租客。',
        }],
      },
    ],
  },

  // 5. 裁员 — 35-50 岁
  {
    id: 'career_layoff',
    stage: 'career', ageRange: [35, 50], once: true,
    trigger: {
      baseWeight: 5,
      requires: [{ flag: 'milestone_has_job' }],
    },
    text: '公司传闻要「优化」，HR 约你下周一对一谈话。你心里咯噔一下。',
    choices: [{ label: '继续', outcomes: [
      {
        weight: 50,
        condition: { skillGte: { 硬: 40 } },
        apply: (s) => { s.attrs.快乐 += 3; s.attrs.财富 += 5; },
        result: '危机解除——你是核心骨干，公司还得靠你扛。',
      },
      {
        weight: 30,
        condition: { all: [
          { skillLt: { 硬: 40 } },
          { skillGte: { 软: 30 } },
        ]},
        apply: (s) => {
          s.attrs.快乐 -= 5;
          s.skills.软 += 3;
          s.flags.add('choice_survived_layoff');
        },
        result: '你被调岗降薪，但保住了饭碗。职场政治学了一课。',
      },
      {
        weight: 20,
        condition: { all: [
          { skillLt: { 硬: 40 } },
          { skillLt: { 软: 30 } },
        ]},
        apply: (s) => {
          s.flags.add('milestone_fired');
          s.flags.delete('milestone_has_job');
          s.attrs.财富 += 8;
          s.attrs.快乐 -= 10;
        },
        result: '你被裁了，拿了 N+1 赔偿。回家路上既慌又有点松口气。',
      },
    ]}],
  },
];
