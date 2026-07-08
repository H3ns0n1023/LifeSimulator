// src/content/retirement/_index.ts
import type { GameEvent } from '../../engine/types';
import { addScore, transitionEmployment, transitionMarriage, adjustSalary, addDisease, worsenHealth, improveHealth, setSalary } from '../../engine/status';
import { SALARY_PENSION_RATE } from '../../engine/constants';

export const retirementEvents: GameEvent[] = [
  // 1. 退休（就业状态机：employed/unemployed/selfEmployed → retired）
  //     退休瞬间把月薪转为退休金（×40%），之后每年随通胀微涨
  {
    id: 'retirement_pension',
    stage: 'retirement', ageRange: [61, 62], once: true,
    trigger: {
      baseWeight: 10,
      requires: [{ employmentIn: ['employed', 'unemployed', 'selfEmployed'] }],
    },
    text: '你正式退休了。',
    choices: [{ label: '继续', outcomes: [{
      weight: 100,
      condition: { all: [] },
      apply: (s) => {
        const pension = Math.round(s.salary * SALARY_PENSION_RATE);
        transitionEmployment(s, 'retired');
        setSalary(s, pension);              // 月薪转为退休金（右侧属性面板可见）
        addScore(s, 'freedom', 10);
        s.flags.add('milestone_retired');
      },
      result: '你开始享受退休生活。月薪自动转为退休金（约原收入的 40%）。',
    }]}],
  },

  // 2. 广场舞争霸 — 62-68 岁
  {
    id: 'retirement_square_dance',
    stage: 'retirement', ageRange: [62, 68], once: true,
    trigger: { baseWeight: 5 },
    text: '小区广场舞队领队王阿姨拉住你：「老李退了，C 位空出来了，你来不来？」',
    choices: [
      {
        label: '加入！C 位必须拿下',
        outcomes: [{
          weight: 100, condition: { all: [] },
          apply: (s) => { addScore(s, 'freedom', 10); addScore(s, 'fame', 8); improveHealth(s); s.flags.add('achievement_dance_c'); },
          result: '三个月后，你成了广场舞队的灵魂人物。隔壁小区都来偷师。',
        }],
      },
      {
        label: '在旁边看看就好',
        outcomes: [{
          weight: 100, condition: { all: [] },
          apply: (s) => { addScore(s, 'freedom', 3); },
          result: '你端着保温杯坐了半个钟头，然后默默回家了。',
        }],
      },
      {
        label: '嫌吵，向物业投诉',
        outcomes: [{
          weight: 100, condition: { all: [] },
          apply: (s) => { addScore(s, 'family', -5); s.flags.add('choice_grumpy_old'); },
          result: '王阿姨从此见你翻白眼。小区里你成了「那个举报广场舞的」。',
        }],
      },
    ],
  },

  // 3. 含饴弄孙 — 63-70 岁
  {
    id: 'retirement_grandchild',
    stage: 'retirement', ageRange: [63, 70], once: true,
    trigger: {
      baseWeight: 6,
      requires: [{ flag: 'milestone_family' }],
    },
    text: '儿女工作忙，把小孙子送到你这带半年。小家伙抱着你的腿喊"爷爷奶奶~"。',
    choices: [
      {
        label: '欣然接受，享受天伦之乐',
        outcomes: [{
          weight: 100, condition: { all: [] },
          apply: (s) => { addScore(s, 'family', 15); worsenHealth(s); s.flags.add('achievement_grandchild_bond'); },
          result: '送他上幼儿园、教他下象棋、被他闹得腰酸背痛——但每个瞬间都值。',
        }],
      },
      {
        label: '委婉拒绝，让儿女自己想办法',
        outcomes: [{
          weight: 100, condition: { all: [] },
          apply: (s) => { addScore(s, 'family', -5); s.flags.add('choice_refuse_grandchild'); },
          result: '儿女嘴上说理解，但过年回家的次数明显少了。',
        }],
      },
    ],
  },

  // 4. 老年大学 — 64-72 岁
  {
    id: 'retirement_elderly_university',
    stage: 'retirement', ageRange: [64, 72], once: true,
    trigger: { baseWeight: 5 },
    text: '社区老年大学招生了：书法、摄影、智能手机、英语口语，应有尽有。',
    choices: [
      {
        label: '报名书法班',
        outcomes: [{
          weight: 100, condition: { all: [] },
          apply: (s) => { addScore(s, 'spirit', 8); addScore(s, 'fame', 3); s.flags.add('milestone_calligraphy'); },
          result: '你的毛笔字越写越好，过年给全家写春联。',
        }],
      },
      {
        label: '报名摄影班',
        outcomes: [{
          weight: 100, condition: { all: [] },
          apply: (s) => { addScore(s, 'freedom', 8); addScore(s, 'fame', 3); s.flags.add('milestone_photography'); },
          result: '你买了台单反，朋友圈照片质量飙升。从此出游多了一个理由。',
        }],
      },
      {
        label: '都这把年纪了，学啥呀',
        outcomes: [{
          weight: 100, condition: { all: [] },
          apply: (s) => { worsenHealth(s); },
          result: '你在家看了一天又一天的电视。日子像水流过指缝。',
        }],
      },
    ],
  },

  // 5. 夕阳红恋爱 — 65-75 岁（婚姻状态机：single → married）
  {
    id: 'retirement_late_romance',
    stage: 'retirement', ageRange: [65, 75], once: true,
    trigger: {
      baseWeight: 4,
      requires: [{ marriage: 'single' }],
    },
    text: '公园相亲角的红娘拦住你：「老爷子/老太太，您一个人？有位退休教师，气质可好了。」',
    choices: [
      {
        label: '见一面又不会少块肉',
        outcomes: [
          {
            weight: 100, condition: { any: [{ flag: 'choice_charm_practice' }, { flag: 'milestone_dance_c' }] },
            apply: (s) => { transitionMarriage(s, 'married'); addScore(s, 'family', 15); s.flags.add('milestone_late_love'); },
            result: '一见如故。原来人生后半程，还能有怦然心动。',
          },
          {
            weight: 100, condition: { all: [] },
            apply: (s) => { addScore(s, 'family', 3); },
            result: '对方礼貌地聊了半小时，说"再联系"。你心知肚明。',
          },
        ],
      },
      {
        label: '一个人也挺好',
        outcomes: [{
          weight: 100, condition: { all: [] },
          apply: (s) => { addScore(s, 'freedom', 5); },
          result: '你谢绝了红娘，回家给自己泡了壶好茶。',
        }],
      },
    ],
  },

  // 6. 大病一场 — 68-78 岁
  {
    id: 'retirement_serious_illness',
    stage: 'retirement', ageRange: [68, 78], once: true,
    trigger: { baseWeight: 6 },
    text: '体检报告上，那个词你看了三遍。医生摘下眼镜，缓缓开口：「情况不太乐观……」',
    choices: [
      {
        label: '积极治疗，与命运抗争',
        outcomes: [
          {
            weight: 100, condition: { healthIn: ['healthy', 'subhealthy', 'mild'] },
            apply: (s) => { adjustSalary(s, -3000); improveHealth(s); s.flags.add('choice_fight_illness'); },
            result: '化疗很苦，但你挺过来了。出院那天，阳光格外温暖。',
          },
          {
            weight: 100, condition: { healthIn: ['severe', 'critical'] },
            apply: (s) => { adjustSalary(s, -3000); worsenHealth(s); s.flags.add('crisis_serious_illness'); },
            result: '治疗让你元气大伤。你开始整理那些一直没整理的东西。',
          },
        ],
      },
      {
        label: '保守治疗，享受剩下的日子',
        outcomes: [{
          weight: 100, condition: { all: [] },
          apply: (s) => { addScore(s, 'spirit', 10); worsenHealth(s); s.flags.add('crisis_serious_illness'); s.flags.add('choice_accept_fate'); },
          result: '你拒绝了过度治疗。剩下的日子，你想做真正想做的事。',
        }],
      },
    ],
  },

  // 7. 环游世界 — 63-72 岁
  {
    id: 'retirement_travel_world',
    stage: 'retirement', ageRange: [63, 72], once: true,
    trigger: {
      baseWeight: 5,
      requires: [{ salaryGte: 8000 }],
    },
    text: '老伙计们约你：「趁着腿脚还利索，去趟新疆？或者更远点，欧洲十国游？」',
    choices: [
      {
        label: '出发！趁还走得动',
        outcomes: [{
          weight: 100, condition: { healthIn: ['healthy', 'subhealthy'] },
          apply: (s) => { addScore(s, 'freedom', 15); addScore(s, 'fame', 8); adjustSalary(s, -5000); s.flags.add('achievement_world_travel'); },
          result: '你在巴黎铁塔下比了剪刀手，在新疆草原上骑了马。一辈子值了。',
        }],
      },
      {
        label: '在家看电视旅行节目也挺好',
        outcomes: [{
          weight: 100, condition: { all: [] },
          apply: (s) => { addScore(s, 'freedom', 3); },
          result: '《舌尖上的中国》看了第八遍。',
        }],
      },
    ],
  },

  // 8. 回望一生（多分支回调）— 70-80 岁
  {
    id: 'retirement_legacy',
    stage: 'retirement', ageRange: [70, 80], once: true,
    trigger: { baseWeight: 7 },
    text: '一个阳光很好的下午，你坐在阳台上晒太阳，忽然想起很多事。',
    choices: [{ label: '回忆一生', outcomes: [
      { weight: 100, condition: { flag: 'milestone_top_university' },
        apply: (s) => { addScore(s, 'career', 5); s.flags.add('achievement_reflected'); },
        result: '你想起名校的录取通知书、图书馆的灯光。一切都有了回响。' },
      { weight: 100, condition: { flag: 'milestone_family' },
        apply: (s) => { addScore(s, 'family', 8); s.flags.add('achievement_reflected'); },
        result: '孙辈在客厅嬉闹，你眯着眼笑。吵是吵了点，但热闹。' },
      { weight: 100, condition: { flag: 'milestone_married' },
        apply: (s) => { addScore(s, 'family', 5); s.flags.add('achievement_reflected'); },
        result: '老伴递来一杯茶。这么多年，你们依然聊得来。' },
      { weight: 100, condition: { flag: 'milestone_fired' },
        apply: (s) => { addScore(s, 'freedom', 5); s.flags.add('achievement_reflected'); },
        result: '被裁那天你以为是终点，原来只是拐了个弯。' },
      { weight: 100, condition: { flag: 'twist_slacker_author' },
        apply: (s) => { addScore(s, 'fame', 8); s.flags.add('achievement_reflected'); },
        result: '你翻着自己写的那些书，心想：原来真的做到了。' },
      { weight: 100, condition: { flag: 'twist_overseas_success' },
        apply: (s) => { addScore(s, 'career', 5); s.flags.add('achievement_reflected'); },
        result: '异国的夕阳下，你想起故乡。两个家，都舍不得。' },
      { weight: 100, condition: { flag: 'milestone_exchange_abroad' },
        apply: (s) => { addScore(s, 'career', 3); s.flags.add('achievement_reflected'); },
        result: '你想起年轻时那次交换生经历，打开了你看世界的窗。' },
      { weight: 100, condition: { flag: 'achievement_dance_c' },
        apply: (s) => { addScore(s, 'freedom', 5); s.flags.add('achievement_reflected'); },
        result: '你哼着《最炫民族风》，身体不由自主地比划起来——肌肉记忆真好。' },
      // —— 以下为补全的孤儿 flag 回调 ——
      { weight: 100, condition: { flag: 'milestone_calligraphy' },
        apply: (s) => { addScore(s, 'spirit', 8); s.flags.add('achievement_reflected'); },
        result: '你铺开宣纸，给孙子写了个"福"字。墨香里，是一辈子的沉静。' },
      { weight: 100, condition: { flag: 'milestone_photography' },
        apply: (s) => { addScore(s, 'freedom', 5); addScore(s, 'fame', 3); s.flags.add('achievement_reflected'); },
        result: '你翻着几十本相册，每一张都是一段时光。原来你认真活过这么多日子。' },
      { weight: 100, condition: { flag: 'milestone_late_love' },
        apply: (s) => { addScore(s, 'family', 8); s.flags.add('achievement_reflected'); },
        result: '老伴（晚年重逢的那位）递来一杯茶。你们相遇得晚，却聊得最投机。' },
      { weight: 100, condition: { flag: 'achievement_world_travel' },
        apply: (s) => { addScore(s, 'freedom', 8); s.flags.add('achievement_reflected'); },
        result: '你想起巴黎的铁塔、新疆的草原。世界那么大，你看过了。' },
      { weight: 100, condition: { flag: 'milestone_first_love' },
        apply: (s) => { addScore(s, 'family', 3); s.flags.add('achievement_reflected'); },
        result: '你忽然想起大学图书馆窗边那个笑容。不知 ta 现在，过得好不好。' },
      { weight: 100, condition: { flag: 'skill_piano' },
        apply: (s) => { addScore(s, 'fame', 5); s.flags.add('achievement_reflected'); },
        result: '你坐回钢琴前，手指有点僵，但《致爱丽丝》的旋律还在。童年的琴没白学。' },
      // 兜底
      { weight: 100, condition: { all: [] },
        apply: (s) => { addScore(s, 'spirit', 3); s.flags.add('achievement_reflected'); },
        result: '一生说长不长，说短不短。你闭上眼，阳光很暖。' },
    ]}],
  },

  // 9. 立遗嘱 — 75-80 岁
  {
    id: 'retirement_will',
    stage: 'retirement', ageRange: [75, 80], once: true,
    trigger: { baseWeight: 5 },
    text: '律师坐在对面，钢笔在纸上轻轻敲击：「您想怎么分配这些……身后之物？」',
    choices: [
      {
        label: '全部留给儿女',
        outcomes: [{
          weight: 100, condition: { flag: 'milestone_family' },
          apply: (s) => { addScore(s, 'family', 5); s.flags.add('choice_will_family'); },
          result: '血脉相连，理所当然。儿女在电话里哭了起来。',
        }],
      },
      {
        label: '捐给希望工程',
        outcomes: [{
          weight: 100, condition: { scoreGte: { spirit: 20 } },
          apply: (s) => { addScore(s, 'fame', 15); s.flags.add('choice_will_charity'); s.flags.add('achievement_philanthropist'); },
          result: '你说：让那些读不起书的孩子，替我多看几眼这个世界。',
        }],
      },
      {
        label: (s) => s.flags.has('milestone_has_pet') ? '捐给流浪动物救助站' : '留给陪伴自己的人',
        outcomes: [{
          weight: 100, condition: { all: [] },
          apply: (s) => {
            addScore(s, 'family', 8);
            // 善良 flag（童年救过猫）额外加分，呼应"善良的回响"
            if (s.flags.has('choice_kind_heart')) addScore(s, 'spirit', 10);
            s.flags.add('choice_will_personal');
          },
          result: (s) => s.flags.has('milestone_has_pet')
            ? (s.flags.has('choice_kind_heart')
              ? '你想起童年那只橘猫，和它蹭你手心的温度。你把一切捐给了流浪动物救助站——这是五岁那年那个孩子的回响。'
              : '你把积蓄捐给了流浪动物救助站。律师愣了一下，随即微笑着记下。')
            : '你不按常理出牌，把东西留给了真正温暖过你的人。',
        }],
      },
    ],
  },
];
