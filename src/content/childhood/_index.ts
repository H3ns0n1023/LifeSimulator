// src/content/childhood/_index.ts
import type { GameEvent } from '../../engine/types';
import { addScore, addDisease, worsenHealth, setAllowance } from '../../engine/status';
import { ALLOWANCE } from '../../engine/constants';

export const childhoodEvents: GameEvent[] = [
  // 1. 殷实家境 — 事业线铺垫
  {
    id: 'childhood_family_rich',
    stage: 'childhood', ageRange: [1, 3], once: true,
    trigger: { baseWeight: 3 },
    text: '你出生在一个殷实的家庭。父母带你到处旅行。',
    choices: [{ label: '继续', outcomes: [{
      weight: 100, condition: { all: [] },
      apply: (s) => { addScore(s, 'career', 5); addScore(s, 'family', 3); s.flags.add('milestone_rich_family'); s.flags.add('family_rich'); setAllowance(s, ALLOWANCE.rich); },
      result: '你见多识广，比同龄人成熟。零花钱也格外宽裕。',
    }]}],
  },
  {
    id: 'childhood_family_poor',
    stage: 'childhood', ageRange: [1, 3], once: true,
    trigger: { baseWeight: 3, excludes: ['childhood_family_rich'] },
    text: '你的家境普通，父母为生活奔波。',
    choices: [{ label: '继续', outcomes: [{
      weight: 100, condition: { all: [] },
      apply: (s) => { addDisease(s, 'malnutrition'); addScore(s, 'career', 3); s.flags.add('milestone_poor_family'); s.flags.add('family_poor'); setAllowance(s, ALLOWANCE.poor); },
      result: '你早早学会了独立，但营养有点跟不上。零花钱也少得可怜。',
    }]}],
  },

  // 2. 音乐天赋 — 名望线（钢琴后续呼应 school 文艺、retirement 书法）
  {
    id: 'childhood_talent_music',
    stage: 'childhood', ageRange: [4, 6], once: true,
    trigger: { baseWeight: 4 },
    text: '你听到邻居弹钢琴，眼睛一亮。',
    choices: [
      { label: '央求父母学钢琴', outcomes: [
        // 殷实家境才能学（童年 salary 恒为 0，旧逻辑永远学不成 —— 修此 bug）
        { weight: 100, condition: { flag: 'milestone_rich_family' }, apply: (s) => { addScore(s, 'fame', 8); s.flags.add('skill_piano'); }, result: '家里买得起琴，你开始学钢琴，气质逐渐显现。' },
        { weight: 100, condition: { notFlag: 'milestone_rich_family' }, apply: (s) => { addScore(s, 'spirit', 3); }, result: '家里负担不起。你趴在窗外偷偷听，把旋律记在心里。' },
      ]},
      { label: '算了', outcomes: [{
        weight: 100, condition: { all: [] },
        apply: () => {},
        result: '你只是听听就算了。',
      }]},
    ],
  },

  // 3. 第一个朋友 — 家庭线
  {
    id: 'childhood_first_friend',
    stage: 'childhood', ageRange: [5, 6], once: true,
    trigger: { baseWeight: 5 },
    text: '你在公园认识了第一个好朋友。',
    choices: [{ label: '继续', outcomes: [{
      weight: 100, condition: { all: [] },
      apply: (s) => { addScore(s, 'family', 8); s.flags.add('milestone_first_friend'); },
      result: '童年有了伙伴。',
    }]}],
  },

  // 4. 神童铺垫 — 事业线招牌链伏笔
  {
    id: 'foreshadow_child_prodigy',
    stage: 'childhood', ageRange: [3, 5], once: true,
    trigger: { baseWeight: 4 },
    text: '你三岁就能背下整本唐诗，街坊邻居都啧啧称奇。一位戴眼镜的陌生阿姨递来名片：「我是中科大少年班的，有兴趣了解一下吗？」',
    choices: [
      {
        label: '接过名片，妈妈收了起来',
        outcomes: [{
          weight: 100, condition: { all: [] },
          apply: (s) => { s.flags.add('foreshadow_child_prodigy'); addScore(s, 'career', 5); },
          result: '名片被压在了抽屉最底层。但那扇门，一直在那里。',
        }],
      },
      {
        label: '妈妈礼貌拒绝',
        outcomes: [{
          weight: 100, condition: { all: [] },
          apply: (s) => { addScore(s, 'freedom', 3); },
          result: '「孩子该有孩子的童年。」妈妈牵着你的手走开了。',
        }],
      },
    ],
  },

  // 5. 怕黑的夜晚 — 自由线/性格
  {
    id: 'childhood_fear_dark',
    stage: 'childhood', ageRange: [4, 6], once: true,
    trigger: { baseWeight: 4 },
    text: '深夜，你从噩梦中惊醒。窗外树影摇晃，像有人在盯着你。',
    choices: [
      {
        label: '钻进爸妈被窝',
        outcomes: [{
          weight: 100, condition: { all: [] },
          apply: (s) => { addScore(s, 'family', 5); },
          result: '爸爸的呼噜声成了世上最安心的白噪音。',
        }],
      },
      {
        label: '自己开灯，勇敢面对',
        outcomes: [{
          weight: 100, condition: { all: [] },
          apply: (s) => { addScore(s, 'freedom', 4); s.flags.add('choice_brave_kid'); },
          result: '原来只是衣架上的外套。你得意地笑了——你是勇敢的孩子。',
        }],
      },
      {
        label: '躲在被子里发抖到天亮',
        outcomes: [{
          weight: 100, condition: { all: [] },
          apply: (s) => { addDisease(s, 'insomnia'); },
          result: '天亮了，但你再也没敢关灯睡觉。',
        }],
      },
    ],
  },

  // 6. 流浪猫 — 家庭线 + 善心 flag
  {
    id: 'childhood_stray_cat',
    stage: 'childhood', ageRange: [5, 6], once: true,
    trigger: { baseWeight: 5 },
    text: '一只瘦骨嶙峋的橘猫蹲在单元门口，冲你"喵"了一声。',
    choices: [
      {
        label: '偷偷把它抱回家养',
        outcomes: [{
          weight: 100, condition: { allowanceGte: 100 },
          apply: (s) => { addScore(s, 'family', 8); s.flags.add('milestone_has_pet'); s.flags.add('choice_kind_heart'); },
          result: '橘猫从此成了你的童年伙伴，长得越来越圆。',
        },{
          weight: 100, condition: { allowanceLt: 100 },
          apply: (s) => { addScore(s, 'family', 3); s.flags.add('choice_kind_heart'); },
          result: '妈妈不让养，你含泪送走了它。但你记住了那种牵挂。',
        }],
      },
      {
        label: '蹲下来摸摸它，然后离开',
        outcomes: [{
          weight: 100, condition: { all: [] },
          apply: (s) => { addScore(s, 'family', 3); },
          result: '猫眯起眼睛蹭了蹭你的手心，然后头也不回地走了。',
        }],
      },
    ],
  },

  // 7. 留守儿童 — 影响后续霸凌/独立
  {
    id: 'childhood_left_behind',
    stage: 'childhood', ageRange: [4, 6], once: true,
    trigger: { baseWeight: 3, excludes: ['childhood_family_rich'] },
    text: '爸妈又要去外地打工了。火车站月台上，妈妈红着眼圈把一个旧书包塞进你怀里。',
    choices: [
      {
        label: '忍住眼泪，懂事地点头',
        outcomes: [{
          weight: 100, condition: { all: [] },
          apply: (s) => { addScore(s, 'career', 4); addScore(s, 'freedom', 3); s.flags.add('milestone_left_behind'); s.flags.add('choice_independent_early'); },
          result: '你跟着爷爷奶奶生活，过早地懂得了大人的不易。',
        }],
      },
      {
        label: '抱着妈妈腿大哭不让走',
        outcomes: [{
          weight: 100, condition: { all: [] },
          apply: (s) => { addDisease(s, 'insomnia'); s.flags.add('milestone_left_behind'); },
          result: '妈妈的眼泪比你的还多。火车还是开走了。',
        }],
      },
    ],
  },
];
