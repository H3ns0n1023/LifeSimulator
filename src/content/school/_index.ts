// src/content/school/_index.ts
import type { GameEvent } from '../../engine/types';
import { addScore, worsenHealth, addDisease } from '../../engine/status';

export const schoolEvents: GameEvent[] = [
  // 1. 初恋 — 10-13 岁，家庭线
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
            condition: { flag: 'choice_charm_practice' },
            apply: (s) => { addScore(s, 'family', 10); s.flags.add('choice_first_crush'); },
            result: '对方红着脸收下了。这段暗恋成了甜甜的秘密。',
          },
          {
            weight: 100,
            condition: { notFlag: 'choice_charm_practice' },
            apply: (s) => { addScore(s, 'family', 3); },
            result: '你鼓起勇气递了纸条，对方尴尬地笑了笑，没有回应。',
          },
        ],
      },
      {
        label: '默默藏在心里',
        outcomes: [{
          weight: 100, condition: { all: [] },
          apply: (s) => { addScore(s, 'family', 5); s.flags.add('choice_charm_practice'); },
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
            weight: 70,
            condition: { all: [{ flag: 'milestone_prodigy_class' }, { flag: 'milestone_rich_family' }] },
            apply: (s) => { addScore(s, 'career', 12); },
            result: '神童底子 + 家里请得起名师一对一，你的成绩火箭般蹿升。',
          },
          {
            weight: 60,
            condition: { flag: 'milestone_prodigy_class' },
            apply: (s) => { addScore(s, 'career', 10); },
            result: '你的成绩明显进步。神童的底子毕竟还在。',
          },
          {
            // 贫困家境：拼命但更苦，失眠更重
            weight: 50,
            condition: { all: [{ notFlag: 'milestone_prodigy_class' }, { flag: 'milestone_poor_family' }] },
            apply: (s) => { addScore(s, 'career', 6); addDisease(s, 'insomnia'); worsenHealth(s); },
            result: '你借来的旧教辅翻烂了，台灯下熬到凌晨。成绩涨了一点，但身体有点扛不住。',
          },
          {
            weight: 40,
            condition: { notFlag: 'milestone_prodigy_class' },
            apply: (s) => { addScore(s, 'career', 5); addDisease(s, 'insomnia'); },
            result: '你拼了命，成绩却原地踏步。失眠开始找上你。',
          },
        ],
      },
      {
        label: '佛系对待，劳逸结合',
        outcomes: [{
          // 有钢琴等文艺特长的孩子，佛系得更优雅，fame 加分
          weight: 100, condition: { flag: 'skill_piano' },
          apply: (s) => { addScore(s, 'freedom', 5); addScore(s, 'career', 3); addScore(s, 'fame', 5); },
          result: '你弹着钢琴调节心情，反而成了班里的"文艺标杆"。心态出奇地好。',
        },{
          weight: 100, condition: { all: [] },
          apply: (s) => { addScore(s, 'freedom', 5); addScore(s, 'career', 3); },
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
            weight: 50, condition: { healthIn: ['healthy'] },
            apply: (s) => { addScore(s, 'fame', 5); s.flags.add('achievement_school_team'); },
            result: '你被选进校队，晒黑了但结实了不少。',
          },
          {
            weight: 50, condition: { any: [{ healthIn: ['subhealthy'] }, { healthIn: ['mild'] }, { healthIn: ['severe'] }] },
            apply: (s) => { worsenHealth(s); },
            result: '你跑得气喘吁吁，教练婉拒了你。但至少锻炼了一次。',
          },
        ],
      },
      {
        label: '在旁边鼓掌就好',
        outcomes: [{
          weight: 100, condition: { all: [] },
          apply: (s) => { addScore(s, 'freedom', 3); },
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
          weight: 100, condition: { all: [] },
          apply: (s) => { addScore(s, 'freedom', 8); addScore(s, 'fame', 3); s.flags.add('choice_rebel_hard'); },
          result: '你妈气得三天没跟你说话。但你觉得特别酷。',
        }],
      },
      {
        label: '乖乖去洗掉',
        outcomes: [{
          weight: 100, condition: { all: [] },
          apply: (s) => { addScore(s, 'family', 3); s.flags.add('choice_rebel_soft'); },
          result: '你把头发剃成了平头，看起来格外听话。',
        }],
      },
    ],
  },

  // 5. 高考 — 18 岁（决定大学去向，影响事业线起点）
  {
    id: 'school_gaokao',
    stage: 'school', ageRange: [18, 18], once: true,
    trigger: { baseWeight: 10 },
    text: '高考来了。你走出考场，心情复杂。',
    choices: [{ label: '继续', outcomes: [
      {
        weight: 30,
        condition: { flag: 'milestone_prodigy_class' },
        apply: (s) => { s.flags.add('milestone_top_university'); addScore(s, 'career', 15); addScore(s, 'fame', 5); },
        result: '你考上了顶尖大学。少年班的天赋终于在高考爆发。',
      },
      {
        weight: 40,
        condition: { all: [{ notFlag: 'milestone_prodigy_class' }, { scoreGte: { career: 15 } }] },
        apply: (s) => { s.flags.add('milestone_top_university'); addScore(s, 'career', 10); },
        result: '你考上了顶尖大学。',
      },
      {
        weight: 40,
        condition: { scoreGte: { career: 5 } },
        apply: (s) => { s.flags.add('milestone_average_university'); addScore(s, 'career', 3); },
        result: '你考上了一所普通大学。',
      },
      {
        weight: 20,
        condition: { all: [] },
        apply: (s) => { addScore(s, 'freedom', 5); s.flags.add('milestone_failed_gaokao'); },
        result: '高考失利，你上了大专。但你心态不错，条条大路通罗马。',
      },
    ]}],
  },

  // 6. 校园霸凌 — 10-13 岁（呼应留守儿童铺垫）
  {
    id: 'school_bullying',
    stage: 'school', ageRange: [10, 13], once: true,
    trigger: { baseWeight: 4 },
    text: (s) => s.flags.has('milestone_left_behind')
      ? '他们专挑你这种"没爹妈撑腰"的。厕所角落里，几个高年级男生围住你：「带钱了吗？反正也没人管你。」'
      : '厕所角落里，几个高年级男生围住了你。「带钱了吗？明天记得多带点。」领头的拍了拍你的脸。',
    choices: [
      {
        label: '忍气吞声，把钱交出来',
        outcomes: [{
          weight: 100, condition: { all: [] },
          apply: (s) => { addDisease(s, 'depression'); s.flags.add('choice_bully_yield'); },
          result: (s) => s.flags.has('milestone_left_behind')
            ? '他们拿了钱走开。你躲在隔间里，想起远方的妈妈——可她在打工的城市，连电话都打不通。'
            : '他们拿了钱走开。你躲在隔间里，拳头攥得发白。',
        }],
      },
      {
        label: '奋起反抗，打回去',
        outcomes: [
          // 勇敢 flag（choice_brave_kid）+ 健康 → 高成功率（weight 80）
          {
            weight: 80, condition: { all: [{ flag: 'choice_brave_kid' }, { healthIn: ['healthy'] }] },
            apply: (s) => { addScore(s, 'fame', 12); addScore(s, 'freedom', 5); s.flags.add('choice_bully_fight_back'); },
            result: '你想起小时候敢一个人开灯面对黑夜，这次也没怕。你一拳打肿了领头的眼睛，他们再没敢找你。',
          },
          {
            weight: 50, condition: { healthIn: ['healthy'] },
            apply: (s) => { addScore(s, 'fame', 8); s.flags.add('choice_bully_fight_back'); },
            result: '你一拳打肿了领头的眼睛。他们再也没敢找你麻烦。',
          },
          {
            weight: 50, condition: { any: [{ healthIn: ['subhealthy'] }, { healthIn: ['mild'] }, { healthIn: ['severe'] }] },
            apply: (s) => { worsenHealth(s); s.flags.add('choice_bully_fight_back'); },
            result: '你被打得鼻青脸肿，但老师终于注意到了这件事。',
          },
        ],
      },
      {
        // 留守儿童"告诉家长"心酸版；非留守正常版
        label: (s) => s.flags.has('milestone_left_behind') ? '告诉爷爷奶奶' : '告诉老师/家长',
        outcomes: [{
          weight: 100, condition: { all: [] },
          apply: (s) => { addScore(s, 'family', 5); s.flags.add('choice_bully_tell'); },
          result: (s) => s.flags.has('milestone_left_behind')
            ? '爷爷奶奶拄着拐杖去找了校长。霸凌者被处分了，但你想：要是爸妈在，该多好。'
            : '成年人介入了。霸凌者被处分，但你也成了他们眼里的「告密者」。',
        }],
      },
    ],
  },

  // 7. 网游诱惑 — 14-17 岁
  {
    id: 'school_game_addiction',
    stage: 'school', ageRange: [14, 17], once: true,
    trigger: { baseWeight: 5 },
    text: '网吧包夜，队友喊你「再开一把，这把上分！」屏幕荧光映着你熬红的眼睛。',
    choices: [
      {
        label: '再开最后一把（其实是无数把）',
        outcomes: [{
          weight: 100, condition: { all: [] },
          apply: (s) => { addScore(s, 'freedom', 8); addDisease(s, 'insomnia'); worsenHealth(s); s.flags.add('choice_game_sink'); },
          result: '天亮了，你登上了钻石，也跌下了成绩榜。',
        }],
      },
      {
        label: '克制住，回宿舍睡觉',
        outcomes: [{
          weight: 100, condition: { all: [] },
          apply: (s) => { addScore(s, 'career', 5); },
          result: '你战胜了诱惑。第二天数学测验，你脑子格外清醒。',
        }],
      },
      {
        label: '不如试试做游戏的人？',
        hint: '一个奇怪的念头',
        outcomes: [{
          weight: 100, condition: { all: [] },
          apply: (s) => { addScore(s, 'career', 8); addScore(s, 'fame', 3); s.flags.add('foreshadow_indie_dev'); },
          result: '你开始琢磨：是不是可以自己做一个游戏？这个念头埋下了种子。',
        }],
      },
    ],
  },

  // 8. 作弊的诱惑 — 16-17 岁
  {
    id: 'school_cheat_choice',
    stage: 'school', ageRange: [16, 17], once: true,
    trigger: { baseWeight: 4 },
    text: '期末考前座位的同学把小抄往你桌上一推：「一起用？」监考老师正在低头喝水。',
    choices: [
      {
        label: '冒险一搏',
        outcomes: [
          {
            weight: 60, condition: { all: [] },
            apply: (s) => { addScore(s, 'career', 3); s.flags.add('choice_cheat_success'); },
            result: '你没被发现，进了年级前五十。但每次想起都后怕。',
          },
          {
            weight: 40, condition: { all: [] },
            apply: (s) => { addScore(s, 'freedom', 3); s.flags.add('choice_cheat_caught'); },
            result: '监考老师就在你身后。通报批评，记过处分。',
          },
        ],
      },
      {
        label: '把小抄推回去',
        outcomes: [{
          weight: 100, condition: { all: [] },
          apply: (s) => { addScore(s, 'family', 5); s.flags.add('choice_cheat_refuse'); },
          result: '你考了真实的成绩，不高，但每一分都是自己的。',
        }],
      },
    ],
  },

  // 9. 班干部选举 — 11-14 岁
  {
    id: 'school_class_monitor',
    stage: 'school', ageRange: [11, 14], once: true,
    trigger: { baseWeight: 4 },
    text: '新学期班主任说要民主选举班长。你举手竞选吗？',
    choices: [
      {
        label: '上台演讲竞选',
        outcomes: [
          {
            weight: 50, condition: { flag: 'choice_charm_practice' },
            apply: (s) => { addScore(s, 'career', 8); addScore(s, 'fame', 5); s.flags.add('milestone_class_monitor'); },
            result: '你高票当选。从此走上了「学生干部」的不归路。',
          },
          {
            weight: 50, condition: { notFlag: 'choice_charm_practice' },
            apply: (s) => { addScore(s, 'career', 3); },
            result: '你演讲磕磕巴巴，落选了。但你迈出了第一步。',
          },
        ],
      },
      {
        label: '安静做个普通学生',
        outcomes: [{
          weight: 100, condition: { all: [] },
          apply: (s) => { addScore(s, 'freedom', 3); addScore(s, 'career', 3); },
          result: '你不用操心班级琐事，专心读书。',
        }],
      },
    ],
  },

  // ★10. 少年班招牌链触发 — 神童的代价（呼应童年铺垫）
  {
    id: 'school_prodigy_track',
    stage: 'school', ageRange: [10, 13], once: true,
    trigger: {
      baseWeight: 8,
      requires: [{ flag: 'foreshadow_child_prodigy' }],
    },
    text: '当年那位阿姨又来了，带着一份天才选拔测试题。妈妈翻出那张压在抽屉底的名片，犹豫地看着你。',
    choices: [
      {
        label: '通过选拔，进入少年班',
        outcomes: [
          {
            weight: 50, condition: { scoreGte: { career: 20 } },
            apply: (s) => { addScore(s, 'career', 20); addScore(s, 'fame', 10); addDisease(s, 'insomnia'); s.flags.add('milestone_prodigy_class'); },
            result: '你 12 岁就进了大学。同学们都比你大七八岁，他们看你的眼神，说不清是佩服还是怪异。',
          },
          {
            weight: 35, condition: { scoreGte: { career: 10 } },
            apply: (s) => { addScore(s, 'career', 10); s.flags.add('choice_prodigy_failed'); },
            result: '你没通过最后的面试。妈妈松了口气，你却莫名失落。',
          },
          {
            weight: 15, condition: { all: [
              { scoreGte: { career: 20 } },
              { flag: 'foreshadow_child_prodigy' },
            ]},
            apply: (s) => { s.flags.add('twist_burnt_out'); addDisease(s, 'depression'); },
            nextEvent: 'ending_burnt_out',
            result: '选拔的压力压垮了你。你开始讨厌一切与「聪明」有关的事。',
          },
        ],
      },
      {
        label: '放弃，过普通孩子的人生',
        outcomes: [{
          weight: 100, condition: { all: [] },
          apply: (s) => { addScore(s, 'freedom', 10); addScore(s, 'family', 5); s.flags.add('choice_prodigy_reject'); },
          result: '你撕掉了名片。从此你只是个普通的孩子——但你会快乐得多。',
        }],
      },
    ],
  },
];
