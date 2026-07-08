// src/content/college/_index.ts
import type { GameEvent } from '../../engine/types';
import { addScore, adjustSalary, transitionEmployment, worsenHealth } from '../../engine/status';

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
          weight: 100, condition: { all: [] },
          apply: (s) => { addScore(s, 'career', 5); addScore(s, 'fame', 5); s.flags.add('skill_debate'); },
          result: '你学会了在台上不结巴地说话，还能引经据典。',
        }],
      },
      {
        label: '加入编程社',
        outcomes: [{
          weight: 100, condition: { all: [] },
          apply: (s) => { addScore(s, 'career', 8); s.flags.add('skill_coding'); },
          result: '你第一次跑通了 Hello World，激动得发朋友圈。',
        }],
      },
      {
        label: '都不感兴趣，回宿舍躺着',
        outcomes: [{
          weight: 100, condition: { all: [] },
          apply: (s) => { addScore(s, 'freedom', 5); },
          result: '你成了宿舍公认的睡神。',
        }],
      },
    ],
  },

  // 2. 实习 — 20-22 岁（影响就业起点）
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
            weight: 60, condition: { scoreGte: { career: 15 } },
            apply: (s) => { adjustSalary(s, 3000); addScore(s, 'career', 5); s.flags.add('skill_intern'); },
            result: '实习三个月，你拿到了第一笔像样的工资。',
          },
          {
            weight: 40, condition: { all: [] },
            apply: (s) => { adjustSalary(s, 1000); },
            result: '实习主要是打杂，但你至少混了份简历。',
          },
        ],
      },
      {
        label: '水一个就好',
        outcomes: [{
          weight: 100, condition: { all: [] },
          apply: (s) => { addScore(s, 'freedom', 5); adjustSalary(s, 500); },
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
            weight: 60, condition: { any: [{ flag: 'skill_debate' }, { flag: 'choice_charm_practice' }] },
            apply: (s) => { addScore(s, 'family', 10); s.flags.add('milestone_first_love'); },
            result: '你们开始一起上自习、一起吃食堂。大学有了甜味。',
          },
          {
            weight: 40, condition: { all: [] },
            apply: (s) => { addScore(s, 'family', 3); },
            result: '对方礼貌地笑了一下，然后换了个座位。心痛。',
          },
        ],
      },
      {
        label: '暗恋就好',
        outcomes: [{
          weight: 100, condition: { all: [] },
          apply: (s) => { addScore(s, 'family', 3); },
          result: '你每天去图书馆，只为那一个笑容。',
        }],
      },
    ],
  },

  // 4. 求职 — 22 岁（关键节点：学生 → 就业状态机转换）
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
          condition: { any: [{ flag: 'skill_coding' }, { scoreGte: { career: 25 } }] },
          apply: (s) => {
            transitionEmployment(s, 'employed');
            s.flags.add('milestone_first_job_tech');
            adjustSalary(s, 15000);
            addScore(s, 'career', 10);
            worsenHealth(s); // 996 伤身
          },
          result: '你拿到了大厂 offer，月薪一万五。入职第一天就开始 996。',
        }],
      },
      {
        label: '找份轻松的工作',
        outcomes: [{
          weight: 100, condition: { all: [] },
          apply: (s) => {
            transitionEmployment(s, 'employed');
            adjustSalary(s, 6000);
            addScore(s, 'freedom', 5);
          },
          result: '你进了一家小公司，月薪六千，朝九晚五。',
        }],
      },
      {
        label: '考研，再苟三年',
        outcomes: [{
          weight: 100, condition: { scoreGte: { career: 15 } },
          apply: (s) => { addScore(s, 'career', 10); s.flags.add('milestone_grad_school'); },
          result: '你成功上岸，再读三年。学生身份得以延长。',
        }],
      },
      {
        label: '家里蹲，待业',
        outcomes: [{
          weight: 100, condition: { all: [] },
          apply: (s) => { transitionEmployment(s, 'unemployed'); addScore(s, 'freedom', 5); },
          result: '你不想工作。简历投了几份都石沉大海，索性在家躺平。',
        }],
      },
    ],
  },

  // 5. 挂科危机 — 19-21 岁
  {
    id: 'college_fail_exam',
    stage: 'college', ageRange: [19, 21], once: true,
    trigger: { baseWeight: 5 },
    text: '高数成绩出来了：38 分。再挂一门就要留级了。辅导员的脸色不太好看。',
    choices: [
      {
        label: '通宵刷题，补考必过',
        outcomes: [{
          weight: 100, condition: { all: [] },
          apply: (s) => { addScore(s, 'career', 5); addScore(s, 'freedom', -3); worsenHealth(s); s.flags.add('choice_fail_redeemed'); },
          result: '补考你考了 82 分。教授扶了扶眼镜，没说什么。',
        }],
      },
      {
        label: '求教授网开一面',
        outcomes: [
          {
            weight: 50, condition: { flag: 'skill_debate' },
            apply: (s) => { addScore(s, 'career', 3); s.flags.add('choice_fail_smooth'); },
            result: '你陪教授喝了三壶茶，最终以 60 分飘过。人情世故学了一课。',
          },
          {
            weight: 50, condition: { all: [] },
            apply: (s) => { addScore(s, 'freedom', -3); s.flags.add('milestone_left_college'); transitionEmployment(s, 'unemployed'); },
            result: '教授不为所动。你被退学了，提前步入社会。',
          },
        ],
      },
      {
        label: '佛系，挂就挂吧',
        outcomes: [{
          weight: 100, condition: { all: [] },
          apply: (s) => { addScore(s, 'freedom', 8); s.flags.add('choice_lie_flat'); },
          result: '你成了宿舍传奇——「淡定哥/姐」。学籍亮起红灯，但你毫不在意。',
        }],
      },
    ],
  },

  // 6. 交换生机会 — 20-22 岁
  {
    id: 'college_exchange',
    stage: 'college', ageRange: [20, 22], once: true,
    trigger: { baseWeight: 4 },
    text: '院里有个去海外交换一学期的名额，竞争激烈。你心动了一下。',
    choices: [
      {
        label: '拼命申请，世界那么大我想看看',
        outcomes: [
          {
            weight: 50, condition: { any: [{ flag: 'skill_debate' }, { flag: 'skill_coding' }] },
            apply: (s) => { addScore(s, 'career', 8); addScore(s, 'fame', 5); s.flags.add('milestone_exchange_abroad'); },
            result: '你去了陌生的国度，第一次见识了世界的辽阔。',
          },
          {
            weight: 30, condition: { all: [] },
            apply: (s) => { addScore(s, 'career', 2); },
            result: '面试被刷，你的英语还差得远。你默默背起了单词。',
          },
        ],
      },
      {
        label: '国内待着也挺好',
        outcomes: [{
          weight: 100, condition: { all: [] },
          apply: (s) => { addScore(s, 'freedom', 3); },
          result: '你不折腾了。食堂的麻辣香锅不香吗？',
        }],
      },
    ],
  },

  // ★7. 留学移民招牌链铺垫 — 那张没盖到的签证章
  {
    id: 'foreshadow_overseas_dream',
    stage: 'college', ageRange: [20, 22], once: true,
    trigger: { baseWeight: 5 },
    text: '深夜自习室里，你打开一个移民论坛看了整整三小时。屏幕停在「拿绿卡的 10 种方式」。',
    choices: [
      {
        label: '收藏帖子，悄悄立誓',
        outcomes: [{
          weight: 100, condition: { all: [] },
          apply: (s) => { s.flags.add('foreshadow_overseas_dream'); addScore(s, 'career', 3); },
          result: '你关掉论坛，但那个念头像颗种子，再没消失过。',
        }],
      },
      {
        label: '关掉帖子，这不是你的人生',
        outcomes: [{
          weight: 100, condition: { all: [] },
          apply: (s) => { addScore(s, 'family', 3); },
          result: '你删掉了书签。故土难离，也没什么不好。',
        }],
      },
    ],
  },

  // 8. 毕业旅行 — 22 岁
  {
    id: 'college_graduation_trip',
    stage: 'college', ageRange: [22, 22], once: true,
    trigger: { baseWeight: 5 },
    text: '毕业典礼结束，舍友提议来场说走就走的旅行，目的地：318 川藏线。',
    choices: [
      {
        label: '去！青春不能留遗憾',
        outcomes: [{
          weight: 100, condition: { salaryGte: 2000 },
          apply: (s) => { addScore(s, 'freedom', 15); addScore(s, 'family', 5); s.flags.add('achievement_graduation_trip'); },
          result: '雪山、星空、徒步、暴晒——你和兄弟们成了彼此一辈子的话题。',
        }],
      },
      {
        label: '算了，攒钱要紧',
        outcomes: [{
          weight: 100, condition: { all: [] },
          apply: (s) => { addScore(s, 'career', 3); },
          result: '你看着舍友朋友圈的照片，说不清是羡慕还是庆幸。',
        }],
      },
    ],
  },
];
