// src/content/career/_index.ts
import type { GameEvent } from '../../engine/types';
import {
  addScore, adjustSalary, adjustSavings, transitionEmployment, transitionMarriage,
  addDisease, worsenHealth, improveHealth,
} from '../../engine/status';
import { JOB_DICTIONARY } from '../../engine/constants';

export const careerEvents: GameEvent[] = [
  // 1. 首次晋升 — 27-32 岁
  {
    id: 'career_first_promotion',
    stage: 'career', ageRange: [27, 32], once: true,
    trigger: {
      baseWeight: 7,
      requires: [{ employment: 'employed' }],
    },
    text: '领导把你叫到办公室，神秘一笑：「最近表现不错，有个升职的机会……」',
    choices: [
      {
        label: '接受晋升，迎接新挑战',
        outcomes: [
          {
            weight: 60, condition: { any: [{ flag: 'skill_coding' }, { scoreGte: { career: 30 } }] },
            apply: (s) => { adjustSalary(s, 3000); addScore(s, 'career', 10); s.flags.add('achievement_first_promotion'); },
            result: '你升了主管，薪水涨了一截，朋友圈晒了 offer letter。',
          },
          {
            weight: 40, condition: { all: [] },
            apply: (s) => { adjustSalary(s, 1000); worsenHealth(s); addScore(s, 'career', 3); },
            result: '升是升了，但新岗位压力山大，你常常加班到深夜。',
          },
        ],
      },
      {
        label: '婉拒，保持生活平衡',
        outcomes: [{
          weight: 100, condition: { all: [] },
          apply: (s) => { addScore(s, 'freedom', 8); addScore(s, 'family', 3); },
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
      requires: [{ employment: 'employed' }],
    },
    text: '猎头找上门了：「对面公司给你涨 30%，考虑一下？」你心动了一下。',
    choices: [
      {
        label: '跳！换地方继续卷',
        outcomes: [{
          weight: 100, condition: { all: [] },
          apply: (s) => { adjustSalary(s, 4000); addScore(s, 'career', 5); s.flags.add('choice_job_hop'); },
          result: '新公司零食柜很丰盛，你愉快地入职了。',
        }],
      },
      {
        label: '留下来，老东家更稳',
        outcomes: [{
          weight: 100, condition: { all: [] },
          apply: (s) => { addScore(s, 'freedom', 5); adjustSalary(s, 1000); },
          result: '老板看你没走，年底多发了点奖金。安稳也是一种选择。',
        }],
      },
    ],
  },

  // 3. 结婚 — 28-40 岁（婚姻状态机：single/dating → married）
  {
    id: 'career_marriage',
    stage: 'career', ageRange: [28, 40], once: true,
    trigger: {
      baseWeight: 8,
      requires: [{ marriageIn: ['single', 'dating'] }],
    },
    text: '你和恋人到了谈婚论嫁的时候。',
    choices: [
      {
        label: '结婚生子',
        outcomes: [
          {
            weight: 100, condition: { salaryGte: 8000 },
            apply: (s) => { transitionMarriage(s, 'married'); addScore(s, 'family', 15); adjustSavings(s, -3000); s.flags.add('milestone_family'); s.flags.add('milestone_married'); },
            result: '你成家了。',
          },
          {
            weight: 100, condition: { salaryLt: 8000 },
            apply: (s) => { transitionMarriage(s, 'married'); addScore(s, 'family', 5); adjustSavings(s, -2000); s.flags.add('milestone_married'); },
            result: '彩礼和房贷让你喘不过气，婚礼只好从简。',
          },
        ],
      },
      {
        label: '丁克',
        outcomes: [{
          weight: 100, condition: { all: [] },
          apply: (s) => { transitionMarriage(s, 'married'); addScore(s, 'freedom', 10); addScore(s, 'family', 5); s.flags.add('milestone_married'); s.flags.add('choice_dink'); },
          result: '你们选择丁克，享受二人世界。',
        }],
      },
      {
        label: '不结婚',
        outcomes: [{
          weight: 100, condition: { all: [] },
          apply: (s) => { addScore(s, 'freedom', 8); s.flags.add('choice_stay_single'); },
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
      requires: [{ employment: 'employed' }],
    },
    text: '中介带你看了一套房，落地窗、南向、地铁口……但价格也漂亮。你咬着笔杆算账。',
    choices: [
      {
        label: '咬牙买房，背三十年房贷',
        outcomes: [
          {
            weight: 100, condition: { savingsGte: 12000 },
            apply: (s) => { adjustSavings(s, -5000); addScore(s, 'family', 8); s.flags.add('milestone_house_owner'); s.flags.add('choice_buy_house'); },
            result: '你成了有房一族。每月还款心痛，但推开家门那一刻值了。',
          },
          {
            weight: 100, condition: { savingsLt: 12000 },
            apply: (s) => { adjustSavings(s, -4000); worsenHealth(s); s.flags.add('choice_buy_house'); },
            result: '你硬着头皮贷了三十年，每月工资大半还了房贷。',
          },
        ],
      },
      {
        label: '继续租房，保持自由',
        outcomes: [{
          weight: 100, condition: { all: [] },
          apply: (s) => { addScore(s, 'freedom', 8); s.flags.add('choice_keep_renting'); },
          result: '你把买房的钱拿去理财，继续做个轻盈的租客。',
        }],
      },
    ],
  },

  // 5. 裁员 — 35-50 岁（employment: employed → unemployed 状态机转换）
  {
    id: 'career_layoff',
    stage: 'career', ageRange: [35, 50], once: true,
    trigger: {
      baseWeight: 5,
      requires: [{ employment: 'employed' }],
    },
    text: '公司传闻要「优化」，HR 约你下周一对一谈话。你心里咯噔一下。',
    choices: [{ label: '继续', outcomes: [
      {
        weight: 50, condition: { scoreGte: { career: 30 } },
        apply: (s) => { adjustSalary(s, 2000); addScore(s, 'career', 5); },
        result: '危机解除——你是核心骨干，公司还得靠你扛。',
      },
      {
        weight: 30, condition: { any: [{ flag: 'skill_debate' }, { flag: 'choice_charm_practice' }] },
        apply: (s) => { addScore(s, 'career', 3); s.flags.add('choice_survived_layoff'); },
        result: '你被调岗降薪，但保住了饭碗。职场政治学了一课。',
      },
      {
        weight: 20, condition: { all: [] },
        apply: (s) => { transitionEmployment(s, 'unemployed'); adjustSalary(s, -10000); addScore(s, 'career', -5); s.flags.add('milestone_fired'); },
        result: '你被裁了，拿了 N+1 赔偿。回家路上既慌又有点松口气。',
      },
    ]}],
  },

  // 6. 体检报告 — 28-40 岁
  {
    id: 'career_health_checkup',
    stage: 'career', ageRange: [28, 40], once: true,
    trigger: {
      baseWeight: 5,
      requires: [{ employment: 'employed' }],
    },
    text: '公司年度体检报告出来了，医生用红笔圈出了七八项指标，建议"复查"。',
    choices: [
      {
        label: '去医院复查，认真对待',
        outcomes: [{
          weight: 100, condition: { all: [] },
          apply: (s) => { adjustSavings(s, -2000); addScore(s, 'freedom', 3); s.flags.add('choice_health_serious'); },
          result: '医生让你戒酒戒熬夜，你乖乖照做。',
        }],
      },
      {
        label: '年轻扛得住，下次再说',
        outcomes: [{
          // 校队出身（achievement_school_team）运动底子好，扛得住，不生病
          weight: 100, condition: { flag: 'achievement_school_team' },
          apply: (s) => { s.flags.add('choice_health_ignore'); },
          result: '你把报告塞进抽屉。当年校队的底子还在，烧烤啤酒照旧，居然还真没啥事。',
        },{
          weight: 100, condition: { all: [] },
          apply: (s) => { addDisease(s, 'fatty_liver'); addDisease(s, 'hypertension'); s.flags.add('choice_health_ignore'); },
          result: '你把报告塞进抽屉。烧烤啤酒照旧——但脂肪肝和高血压也跟着来了。',
        }],
      },
    ],
  },

  // 7. 副业诱惑 — 26-40 岁
  {
    id: 'career_side_hustle',
    stage: 'career', ageRange: [26, 40], once: true,
    trigger: {
      baseWeight: 5,
      requires: [{ employment: 'employed' }],
    },
    text: '朋友圈里老同学 A 卖面膜月入十万，同学 B 直播带货提了辆奔驰。你看着自己工资条陷入了沉思。',
    choices: [
      {
        label: '投入积蓄，搞副业',
        outcomes: [
          {
            weight: 30, condition: { flag: 'foreshadow_indie_dev' },
            apply: (s) => { adjustSavings(s, 5000); addScore(s, 'fame', 10); s.flags.add('achievement_side_hustle_win'); },
            result: '你以前想做的游戏居然火了，副业收入居然超过了主业。',
          },
          {
            weight: 50, condition: { all: [] },
            apply: (s) => { adjustSavings(s, -2000); addScore(s, 'freedom', -3); },
            result: '折腾半年，没亏也没赚。算是交了学费。',
          },
          {
            weight: 20, condition: { all: [] },
            apply: (s) => { adjustSavings(s, -8000); addScore(s, 'career', -5); s.flags.add('choice_side_hustle_burned'); },
            result: '你被「创业导师」割了韭菜，积蓄打水漂。',
          },
        ],
      },
      {
        label: '踏实上班，不信这些',
        outcomes: [{
          weight: 100, condition: { all: [] },
          apply: (s) => { addScore(s, 'career', 3); s.flags.add('choice_no_side_hustle'); },
          result: '你看清了：那些朋友圈都是幸存者偏差。',
        }],
      },
    ],
  },

  // 8. 婚姻危机 — 35-45 岁（婚姻状态机：married → divorced）
  {
    id: 'career_marriage_crisis',
    stage: 'career', ageRange: [35, 45], once: true,
    trigger: {
      baseWeight: 5,
      requires: [{ marriage: 'married' }],
    },
    text: '你和爱人已经三天没说话了。餐桌上只剩筷子碰碗的声音。',
    choices: [
      {
        label: '主动沟通，挽救婚姻',
        outcomes: [
          {
            weight: 100, condition: { flag: 'skill_debate' },
            apply: (s) => { addScore(s, 'family', 12); s.flags.add('choice_save_marriage'); },
            result: '一场痛哭的深谈后，你们决定一起去做婚姻咨询。',
          },
          {
            weight: 100, condition: { all: [] },
            apply: (s) => { addScore(s, 'family', -3); },
            result: '你想沟通却开不了口。冷战还在继续。',
          },
        ],
      },
      {
        label: '各过各的，凑合过',
        outcomes: [{
          weight: 100, condition: { all: [] },
          apply: (s) => { addScore(s, 'family', -8); s.flags.add('choice_cold_marriage'); },
          result: '你们成了同一个屋檐下的陌生人。',
        }],
      },
      {
        label: '离婚',
        outcomes: [{
          weight: 100, condition: { all: [] },
          apply: (s) => {
            transitionMarriage(s, 'divorced');
            addScore(s, 'freedom', 5);
            addScore(s, 'family', -10);
            adjustSavings(s, -5000);
            s.flags.add('milestone_divorced');
          },
          result: '一纸协议，半生缘分。搬家那天下着雨。',
        }],
      },
    ],
  },

  // 9. 35岁焦虑 — 34-37 岁
  {
    id: 'career_age_35_anxiety',
    stage: 'career', ageRange: [34, 37], once: true,
    trigger: {
      baseWeight: 6,
      requires: [{ employment: 'employed' }],
    },
    text: '生日蛋糕上插着 35 根蜡烛。你忽然想起那句行业名言：「35 岁还没做到管理层，就被淘汰」。',
    choices: [
      {
        label: '冲刺管理层',
        outcomes: [
          {
            weight: 50, condition: { scoreGte: { career: 40 } },
            apply: (s) => { adjustSalary(s, 5000); addScore(s, 'career', 15); s.flags.add('achievement_manager'); },
            result: '你如愿升上总监，手下管着十来号人。',
          },
          {
            weight: 50, condition: { all: [] },
            apply: (s) => { worsenHealth(s); addScore(s, 'career', -3); s.flags.add('choice_manager_failed'); },
            result: '面试屡屡碰壁。HR 看着你的年龄皱眉，你看着 HR 也皱眉。',
          },
        ],
      },
      {
        label: '转行，开启第二曲线',
        outcomes: [{
          weight: 100, condition: { flag: 'foreshadow_indie_dev' },
          apply: (s) => { addScore(s, 'career', 8); adjustSavings(s, -3000); s.flags.add('choice_career_pivot'); },
          result: '你去学了新东西。35 岁重新做新人，居然有点兴奋。',
        }],
      },
      {
        label: '躺平，做一辈子螺丝钉',
        outcomes: [{
          weight: 100, condition: { all: [] },
          apply: (s) => { addScore(s, 'freedom', 10); s.flags.add('choice_corporate_lie_flat'); },
          result: '你想通了：升职发财都不如准点下班。',
        }],
      },
    ],
  },

  // ★10. 留学移民招牌链 — 触发（呼应大学铺垫）
  {
    id: 'career_overseas_chance',
    stage: 'career', ageRange: [28, 38], once: true,
    trigger: {
      baseWeight: 7,
      requires: [{ flag: 'foreshadow_overseas_dream' }],
    },
    text: '公司有个外派海外的名额，三年合约，绿卡前景。HR 看着你：「英语怎么样？」',
    choices: [
      {
        label: '抓住机会，破釜沉舟',
        outcomes: [
          {
            weight: 50, condition: { all: [{ flag: 'milestone_exchange_abroad' }, { scoreGte: { career: 30 } }] },
            apply: (s) => {
              addScore(s, 'career', 15);
              addScore(s, 'fame', 8);
              adjustSalary(s, 8000);
              s.flags.add('twist_overseas_success');
            },
            nextEvent: 'ending_overseas',
            result: '你通过了所有筛选。登机那天，妈妈在安检外哭成泪人。',
          },
          {
            weight: 35, condition: { all: [] },
            apply: (s) => { addScore(s, 'career', 3); s.flags.add('choice_overseas_failed'); },
            result: '面试官一句"describe your project in English"就把你问住了。',
          },
          {
            weight: 15, condition: { flag: 'foreshadow_overseas_dream' },
            apply: (s) => {
              s.flags.add('twist_deported');
              adjustSavings(s, -10000);
              addScore(s, 'career', -10);
            },
            nextEvent: 'ending_deported',
            result: '你出去了，却被中介骗光积蓄，灰溜溜地被遣返。',
          },
        ],
      },
      {
        label: '放弃，国内也挺好',
        outcomes: [{
          weight: 100, condition: { all: [] },
          apply: (s) => { addScore(s, 'freedom', 5); s.flags.add('choice_stay_home'); },
          result: '你把机会让给了同事。他三年后回来跟你讲纽约的雪，你听着像听故事。',
        }],
      },
    ],
  },

  // 11. 父母养老 — 38-50 岁
  //    动态文案：根据是否已回老家 / 就业状态，调整"请假回家"的措辞，避免矛盾
  {
    id: 'career_parents_aging',
    stage: 'career', ageRange: [38, 50], once: true,
    trigger: { baseWeight: 5 },
    text: (s) => s.flags.has('choice_back_hometown')
      ? '老妈突然晕倒住了院。好在你就在身边，几步路就到了医院。老爸在走廊叹气：「要是你不在家……」'
      : '电话那头，老爸的声音有点沙哑：「没事没事，就是……你妈住院了，小毛病。」',
    choices: [
      {
        // 动态 label：已回老家→"日夜陪护"；在职→"请假回家"；失业/创业→"放下手头事赶回"
        label: (s) => s.flags.has('choice_back_hometown')
          ? '日夜守在病床前'
          : (s.employment === 'employed' ? '立刻请假回家陪护' : '放下手头的事赶回老家'),
        outcomes: [{
          weight: 100, condition: { all: [] },
          apply: (s) => {
            addScore(s, 'family', 12);
            // 已回老家不扣"路费/误工"；异地才扣
            if (!s.flags.has('choice_back_hometown')) adjustSavings(s, -3000);
            s.flags.add('choice_filial_child');
          },
          result: (s) => s.flags.has('choice_back_hometown')
            ? '你守了妈妈七天七夜。邻床病友都夸：「这孩子真孝顺，一直守着。」你心想：当年回老家，值了。'
            : '你在病床前守了七天七夜。妈妈出院那天，握着你的手不松开。',
        }],
      },
      {
        label: '汇钱回去，请护工照顾',
        outcomes: [{
          weight: 100, condition: { salaryGte: 15000 },
          apply: (s) => { adjustSavings(s, -5000); addScore(s, 'family', 3); s.flags.add('choice_money_over_presence'); },
          result: '钱到位了，但视频里妈妈总说「我们都好，你别惦记」——你知道她在骗你。',
        }],
      },
      {
        // 动态 label：已回老家不会显示"太远了"；用 visibleWhen 隐藏
        label: '太远了，过段时间再说',
        visibleWhen: { notFlag: 'choice_back_hometown' },
        outcomes: [{
          weight: 100, condition: { all: [] },
          apply: (s) => { addScore(s, 'family', -10); addDisease(s, 'depression'); s.flags.add('choice_absent_child'); },
          result: '你想着"忙完这阵就回去"。可"这阵"一忙，就是一辈子。',
        }],
      },
    ],
  },

  // ============ 新人期（23-27 岁，补空白段）============

  // 12. 第一天上班 — 23-24 岁
  {
    id: 'career_first_day',
    stage: 'career', ageRange: [23, 24], once: true,
    trigger: {
      baseWeight: 8,
      requires: [{ employment: 'employed' }, { notFlag: 'milestone_first_day' }],
    },
    text: (s) => {
      // 从岗位词典读具体公司/岗位，替换"某某公司"占位符
      const job = JOB_DICTIONARY.find((j) => s.flags.has(j.id));
      if (job) return `入职第一天，HR 给你发了工牌。你戴着它在卫生间镜子前照了半天——「${job.company}，${job.title}」。`;
      return '入职第一天，HR 给你发了工牌。你戴着它在卫生间镜子前照了半天。';
    },
    choices: [
      {
        label: '主动认识每个人，建立人脉',
        outcomes: [{
          // 学生干部出身（milestone_class_monitor）天生会社交，加分翻倍
          weight: 100, condition: { flag: 'milestone_class_monitor' },
          apply: (s) => { addScore(s, 'career', 8); addScore(s, 'family', 5); s.flags.add('skill_office_social'); s.flags.add('milestone_first_day'); },
          result: '当年当班长练就的本事全用上了。一周后全组都喊你"X 哥/X 姐"，你成了气氛组。',
        },{
          weight: 100, condition: { all: [] },
          apply: (s) => { addScore(s, 'career', 5); addScore(s, 'family', 3); s.flags.add('skill_office_social'); s.flags.add('milestone_first_day'); },
          result: '你记住了全组 20 个人的名字和喜好。月底聚餐你成了气氛组。',
        }],
      },
      {
        label: '埋头干活，少说话多做事',
        outcomes: [{
          weight: 100, condition: { all: [] },
          apply: (s) => { addScore(s, 'career', 8); s.flags.add('milestone_first_day'); },
          result: '你一周写完了三个需求，组长在群里 @ 你表扬。但你还是叫不出邻座的名字。',
        }],
      },
      {
        label: '摸清楚谁是真的老板',
        outcomes: [{
          weight: 100, condition: { all: [] },
          apply: (s) => { addScore(s, 'career', 3); s.flags.add('skill_read_room'); s.flags.add('milestone_first_day'); },
          result: '你发现真正拍板的不是组长，是隔壁工位那个不说话的老王。',
        }],
      },
    ],
  },

  // 13. 第一次犯错 — 23-26 岁
  {
    id: 'career_first_mistake',
    stage: 'career', ageRange: [23, 26], once: true,
    trigger: {
      baseWeight: 6,
      requires: [{ employment: 'employed' }],
    },
    text: '凌晨三点，你部署的代码把线上数据库锁死了。报警短信响了一屏幕，组长电话打过来：「你来公司。」',
    choices: [
      {
        label: '通宵修复，写万字复盘报告',
        outcomes: [{
          weight: 100, condition: { all: [] },
          apply: (s) => { addScore(s, 'career', 8); addDisease(s, 'insomnia'); s.flags.add('choice_own_up_mistake'); },
          result: '事故复盘会上你主动认领责任。组长黑着脸，但散会后拍了拍你的肩：「下次小心。」',
        }],
      },
      {
        label: '甩锅给实习生',
        outcomes: [{
          weight: 100, condition: { all: [] },
          apply: (s) => { addScore(s, 'career', -5); s.flags.add('choice_blame_others'); },
          result: '实习生背了锅离职了。你保住了 KPI，但全组看你的眼神变了。',
        }],
      },
      {
        label: '装作不知道',
        outcomes: [{
          weight: 100, condition: { all: [] },
          apply: (s) => { addScore(s, 'career', -3); adjustSalary(s, -1000); },
          result: '组长查 log 查到了你。季度绩效 C，晋升推迟半年。',
        }],
      },
    ],
  },

  // 14. 师傅带新人 — 24-27 岁（呼应"办公室真正的老板"铺垫）
  {
    id: 'career_mentor',
    stage: 'career', ageRange: [24, 27], once: true,
    trigger: {
      baseWeight: 5,
      requires: [{ employment: 'employed' }],
    },
    text: '组里那个从不加班却没人敢惹的老员工，忽然把你叫去抽烟：「小子，我看你顺眼。带你几招？」',
    choices: [
      {
        label: '拜师，跟着老江湖学',
        outcomes: [{
          weight: 100, condition: { all: [] },
          apply: (s) => { addScore(s, 'career', 10); s.flags.add('skill_office_politics'); s.flags.add('milestone_mentored'); },
          result: '老王教你：怎么抢功劳、怎么甩锅、怎么让领导离不开你。三年后你也成了"不加班却没人敢惹"的人。',
        }],
      },
      {
        label: '不用，我自己摸索',
        outcomes: [{
          weight: 100, condition: { all: [] },
          apply: (s) => { addScore(s, 'career', 3); },
          result: '老王吐了口烟圈：「行，有志气。」然后继续不教你。你走了两年弯路。',
        }],
      },
    ],
  },

  // ============ 上升期（26-33 岁）============

  // 15. 办公室恋情 — 25-32 岁
  {
    id: 'career_office_romance',
    stage: 'career', ageRange: [25, 32], once: true,
    trigger: {
      baseWeight: 5,
      requires: [{ employment: 'employed' }, { marriageIn: ['single', 'divorced'] }],
    },
    text: '加班到深夜，只剩你和隔壁组的 ta。ta 递来一杯热咖啡：「歇会儿吧。」',
    choices: [
      {
        label: '勇敢追，办公室恋情怎么了',
        outcomes: [
          {
            weight: 60, condition: { any: [{ flag: 'skill_office_social' }, { flag: 'choice_charm_practice' }] },
            apply: (s) => { transitionMarriage(s, 'dating'); addScore(s, 'family', 12); s.flags.add('milestone_office_love'); },
            result: '你们偷偷在一起了。半年后，全公司都知道——但你们不在乎。',
          },
          {
            weight: 40, condition: { all: [] },
            apply: (s) => { addScore(s, 'family', 3); addDisease(s, 'insomnia'); },
            result: 'ta 礼貌地笑了笑，第二天申请调去了别的组。你尴尬了一整年。',
          },
        ],
      },
      {
        label: '克制，同事还是同事',
        outcomes: [{
          weight: 100, condition: { all: [] },
          apply: (s) => { addScore(s, 'career', 3); addScore(s, 'family', -3); },
          result: '你把心动压在心底。多年后想起，说不清是遗憾还是庆幸。',
        }],
      },
    ],
  },

  // 16. 加薪谈判 — 26-30 岁
  {
    id: 'career_raise_negotiation',
    stage: 'career', ageRange: [26, 30], once: true,
    trigger: {
      baseWeight: 6,
      requires: [{ employment: 'employed' }],
    },
    text: '年度面谈，领导问：「今年有什么想法？」你攥着准备了一周的加薪 PPT，手心冒汗。',
    choices: [
      {
        label: '主动开口，把 PPT 放出来',
        outcomes: [
          {
            weight: 50, condition: { any: [{ flag: 'skill_office_politics' }, { flag: 'milestone_mentored' }] },
            apply: (s) => { adjustSalary(s, 3000); addScore(s, 'career', 8); s.flags.add('achievement_negotiated_raise'); },
            result: '领导听完点头：「有理有据，我批。」下个月工资条多了三千。',
          },
          {
            weight: 50, condition: { all: [] },
            apply: (s) => { addScore(s, 'career', 3); s.flags.add('choice_raise_failed'); },
            result: '领导说「公司今年困难」。你知道他在打太极，但没辙。',
          },
        ],
      },
      {
        label: '等着领导主动给',
        outcomes: [{
          weight: 100, condition: { all: [] },
          apply: (s) => { adjustSalary(s, 500); },
          result: '领导果然"想到"了你，给了 5% 普调。你默默叹气。',
        }],
      },
      {
        label: '准备简历，用 offer 倒逼',
        outcomes: [{
          weight: 100, condition: { scoreGte: { career: 25 } },
          apply: (s) => { adjustSalary(s, 4000); addScore(s, 'career', 5); s.flags.add('choice_counter_offer'); },
          result: '你拿了竞品的 offer 甩在桌上。领导脸色一变，当场匹配了薪资。',
        }],
      },
    ],
  },

  // 17. 大项目上线 — 27-33 岁
  {
    id: 'career_big_launch',
    stage: 'career', ageRange: [27, 33], once: true,
    trigger: {
      baseWeight: 6,
      requires: [{ employment: 'employed' }, { scoreGte: { career: 20 } }],
    },
    text: '公司今年最重要的项目，由你牵头。上线倒计时 7 天，QA 还在提 P0 bug。',
    choices: [
      {
        label: '压榨团队，按时上线',
        outcomes: [{
          weight: 100, condition: { flag: 'skill_office_politics' },
          apply: (s) => { adjustSalary(s, 5000); addScore(s, 'career', 15); addScore(s, 'family', -8); addDisease(s, 'insomnia'); s.flags.add('achievement_big_launch'); },
          result: (s) => `项目如期上线，你成了部门红人。但团队走了三个人，${s.marriage === 'married' ? '老伴跟你冷战一周' : '一个人回家的你，连个说话的人都没有'}。`,
        },{
          weight: 100, condition: { notFlag: 'skill_office_politics' },
          apply: (s) => { addScore(s, 'career', 8); addDisease(s, 'insomnia'); worsenHealth(s); },
          result: '你不会用人，自己扛了 90% 的活。上线了，但你在庆功宴上累到失声。',
        }],
      },
      {
        label: '申请延期，保证质量',
        outcomes: [{
          weight: 100, condition: { all: [] },
          apply: (s) => { addScore(s, 'career', 5); addScore(s, 'family', 3); s.flags.add('choice_quality_first'); },
          result: '老板不悦但接受了。延期两周上线后，零事故。你保住了口碑和团队。',
        }],
      },
    ],
  },

  // ============ 稳定期（30-40 岁）============

  // 18. 生育产假 — 30-38 岁（呼应已婚状态）
  {
    id: 'career_parenthood',
    stage: 'career', ageRange: [30, 38], once: true,
    trigger: {
      baseWeight: 6,
      requires: [{ marriage: 'married' }, { notFlag: 'milestone_family' }],
    },
    text: '验孕棒两条杠。你和伴侣对着那两条红杠愣了五分钟，然后同时笑了。',
    choices: [
      {
        label: '生孩子，休产假/陪产假',
        outcomes: [{
          weight: 100, condition: { all: [] },
          apply: (s) => { addScore(s, 'family', 20); adjustSalary(s, -2000); worsenHealth(s); s.flags.add('milestone_family'); s.flags.add('choice_had_child'); },
          result: '小生命降临。半年没睡过整觉，但第一次听到"爸爸/妈妈"时全值了。',
        }],
      },
      {
        label: '丁克到底，先把事业稳住',
        outcomes: [{
          weight: 100, condition: { all: [] },
          apply: (s) => { addScore(s, 'career', 5); addScore(s, 'freedom', 8); s.flags.add('choice_dink_confirmed'); },
          result: '你决定再等等。这一等，可能就是一辈子。',
        }],
      },
    ],
  },

  // 19. 在职 MBA — 30-38 岁
  {
    id: 'career_mba',
    stage: 'career', ageRange: [30, 38], once: true,
    trigger: {
      baseWeight: 4,
      requires: [{ employment: 'employed' }, { salaryGte: 10000 }],
    },
    text: '朋友圈有人在晒 MBA 录取通知。你想：是不是该给自己镀个金？学费 30 万。',
    choices: [
      {
        label: '咬牙读，拓展人脉',
        outcomes: [{
          weight: 100, condition: { all: [] },
          apply: (s) => { adjustSavings(s, -5000); addScore(s, 'career', 12); addScore(s, 'fame', 8); s.flags.add('milestone_mba'); worsenHealth(s); },
          result: '两年周末全泡在课堂和 case study。毕业时人脉圈换了一茬，简历也厚了。',
        }],
      },
      {
        label: '30 万不如去投资',
        outcomes: [{
          weight: 100, condition: { all: [] },
          apply: (s) => { addScore(s, 'freedom', 5); },
          result: '你把钱投了基金。三年后跌了一半——MBA 同学却都升了总监。',
        }],
      },
    ],
  },

  // 20. 期权上市梦 — 30-40 岁
  {
    id: 'career_ipo_dream',
    stage: 'career', ageRange: [30, 40], once: true,
    trigger: {
      baseWeight: 5,
      requires: [{ employment: 'employed' }, { flag: 'milestone_first_job_tech' }],
    },
    text: '公司传要上市。你工位抽屉里那叠期权纸，忽然变得沉甸甸。同事都在算自己能套现多少。',
    choices: [
      {
        label: '赌一把，继续留下等上市',
        outcomes: [
          {
            weight: 40, condition: { flag: 'foreshadow_indie_dev' },
            apply: (s) => { adjustSavings(s, 30000); addScore(s, 'career', 25); addScore(s, 'freedom', 15); s.flags.add('achievement_ipo_win'); },
            result: '敲钟那天你在现场。期权解禁，你财务自由了——至少账面上。',
          },
          {
            weight: 60, condition: { all: [] },
            apply: (s) => { addScore(s, 'career', 3); s.flags.add('choice_ipo_missed'); },
            result: '上市推迟、估值缩水、锁定期延长……期权成了废纸。你白等了三年。',
          },
        ],
      },
      {
        label: '及时行权，落袋为安',
        outcomes: [{
          weight: 100, condition: { all: [] },
          apply: (s) => { adjustSavings(s, 5000); addScore(s, 'freedom', 5); s.flags.add('choice_take_money'); },
          result: '你提前离职行权，小赚一笔。后来公司真上市了——但你不后悔，落袋为安。',
        }],
      },
    ],
  },

  // 21. 职业倦怠 — 33-42 岁
  {
    id: 'career_burnout',
    stage: 'career', ageRange: [33, 42], once: true,
    trigger: {
      baseWeight: 6,
      requires: [{ employment: 'employed' }],
    },
    text: (s) => s.flags.has('choice_independent_early')
      ? '周一早晨，你盯着天花板不想起床。你从小就知道"懂事"——爸妈不在身边，自己扛。可这次，你扛不动了。'
      : '周一早晨，你盯着天花板不想起床。不是累，是麻木。打开电脑想吐，看到工作群消息想逃。',
    choices: [
      {
        label: '请长假，去山里待一个月',
        outcomes: [{
          weight: 100, condition: { salaryGte: 12000 },
          apply: (s) => { improveHealth(s); addScore(s, 'freedom', 12); addScore(s, 'spirit', 8); adjustSavings(s, -3000); s.flags.add('choice_sabbatical'); },
          result: '大理的客栈里你睡足了 14 个小时。回来时，世界没塌，你却轻了。',
        }],
      },
      {
        label: '看心理医生',
        outcomes: [{
          weight: 100, condition: { all: [] },
          apply: (s) => { s.diseases.delete('depression'); improveHealth(s); adjustSavings(s, -2000); s.flags.add('choice_therapy'); },
          result: (s) => s.flags.has('choice_independent_early')
            ? '医生说：「你不是不会扛，是扛太久了。」你第一次在陌生人面前哭了出来。'
            : '医生说你这是职业倦怠叠加轻度抑郁。半年咨询后，你学会了拒绝。',
        }],
      },
      {
        label: '硬扛，大家都这样',
        outcomes: [{
          weight: 100, condition: { all: [] },
          apply: (s) => { addDisease(s, 'depression'); worsenHealth(s); addScore(s, 'career', 3); },
          result: (s) => s.flags.has('choice_independent_early')
            ? '「我从小就这么过来的。」你灌着咖啡继续卷。直到某天在工位晕倒——你终于承认，自己不是铁打的。'
            : '你灌着咖啡继续卷。直到某天在工位晕倒被救护车拉走。',
        }],
      },
    ],
  },

  // ============ 中年转折（35-45 岁）============

  // 22. 被裁求职难 — 35-45 岁（呼应裁员事件）
  {
    id: 'career_job_hunt_hard',
    stage: 'career', ageRange: [35, 45], once: true,
    trigger: {
      baseWeight: 7,
      requires: [{ employment: 'unemployed' }],
    },
    text: '失业第三个月。简历投了 200 份，面试 5 个，全挂。HR 看着你的年龄叹气：「我们这个岗位偏向年轻人。」',
    choices: [
      {
        label: '降低预期，先就业再择业',
        outcomes: [{
          weight: 100, condition: { all: [] },
          apply: (s) => { transitionEmployment(s, 'employed'); adjustSalary(s, 4000); addScore(s, 'career', -5); addScore(s, 'freedom', 3); s.flags.add('choice_swallow_pride'); },
          result: '你接受了降薪一半的 offer。重新上班那天，地铁里你哭了。',
        }],
      },
      {
        label: '自己干，开个小店/工作室',
        outcomes: [{
          weight: 100, condition: { scoreGte: { career: 30 } },
          apply: (s) => { transitionEmployment(s, 'selfEmployed'); adjustSalary(s, 2000); addScore(s, 'career', 10); addScore(s, 'freedom', 10); s.flags.add('choice_start_small_biz'); },
          result: '你开了家小面馆/工作室。头一年亏，第二年回本，第三年居然成了网红店。',
        }],
      },
      {
        label: '回老家，换个活法',
        outcomes: [{
          weight: 100, condition: { all: [] },
          apply: (s) => { transitionEmployment(s, 'selfEmployed'); addScore(s, 'family', 8); addScore(s, 'freedom', 12); adjustSalary(s, -3000); s.flags.add('choice_back_hometown'); },
          result: '你回了三线城市的老家，开了个小卖部。工资少了，但每天能陪爸妈吃饭。',
        }],
      },
    ],
  },

  // 23. 职场 PUA — 28-40 岁
  {
    id: 'career_pua',
    stage: 'career', ageRange: [28, 40], once: true,
    trigger: {
      baseWeight: 4,
      requires: [{ employment: 'employed' }],
    },
    text: '新来的领导总在公开场合贬低你：「你这水平，出去谁要？」转头又私下说：「我骂你是为你好，别人我都不说。」',
    choices: [
      {
        label: '相信他，拼命证明自己',
        outcomes: [{
          weight: 100, condition: { all: [] },
          apply: (s) => { addScore(s, 'career', 3); addDisease(s, 'depression'); worsenHealth(s); s.flags.add('choice_pua_trapped'); },
          result: '你加班到凌晨，写报告到崩溃。可无论怎么做，他都能挑出毛病。你开始怀疑自己。',
        }],
      },
      {
        label: '收集证据，越级举报',
        outcomes: [{
          // 勇敢 flag（童年敢开灯）+ office_politics → 高成功率高权重
          weight: 150, condition: { all: [{ flag: 'choice_brave_kid' }, { flag: 'skill_office_politics' }] },
          apply: (s) => { addScore(s, 'career', 12); addScore(s, 'fame', 10); s.flags.add('choice_fight_pua'); },
          result: (s) => `你录了音、留了聊天记录，毫不犹豫地敲开了总监的门。HR 调查后调走了他。${s.flags.has('choice_brave_kid') ? '你想起五岁那年敢一个人开灯面对黑夜——有些勇敢，是一辈子的事。' : '你成了组里"敢说真话"的人。'}`,
        },{
          weight: 100, condition: { flag: 'skill_office_politics' },
          apply: (s) => { addScore(s, 'career', 8); addScore(s, 'fame', 5); s.flags.add('choice_fight_pua'); },
          result: '你录了音、留了聊天记录。HR 调查后调走了他。你成了组里"敢说真话"的人。',
        },{
          weight: 100, condition: { notFlag: 'skill_office_politics' },
          apply: (s) => { transitionEmployment(s, 'unemployed'); addScore(s, 'career', -5); s.flags.add('milestone_fired'); },
          result: '举报信石沉大海，你反被穿小鞋。最终你"主动离职"了。',
        }],
      },
      {
        label: '裸辞，老子不干了',
        outcomes: [{
          weight: 100, condition: { all: [] },
          apply: (s) => { transitionEmployment(s, 'unemployed'); addScore(s, 'freedom', 12); improveHealth(s); s.flags.add('choice_quit_pua'); },
          result: '你把工牌拍在桌上走人。出公司门那一刻，阳光特别亮。',
        }],
      },
    ],
  },

  // ============ 晚期职场（45-60 岁，补 15 年真空）============

  // 24. 被年轻人取代危机 — 45-52 岁
  {
    id: 'career_young_threat',
    stage: 'career', ageRange: [45, 52], once: true,
    trigger: {
      baseWeight: 6,
      requires: [{ employment: 'employed' }],
    },
    text: '新来的 95 后小伙，一周学会你三个月的活，工资还只有你一半。组长最近总找他单独开会。',
    choices: [
      {
        label: '转型管理岗，靠经验吃饭',
        outcomes: [{
          weight: 100, condition: { any: [{ flag: 'achievement_manager' }, { flag: 'milestone_mba' }] },
          apply: (s) => { adjustSalary(s, 3000); addScore(s, 'career', 12); s.flags.add('milestone_pivot_management'); },
          result: '你成功转管理，手下管着包括那个 95 后的团队。年轻人能干，但决策还得你来。',
        },{
          weight: 100, condition: { all: [] },
          apply: (s) => { addScore(s, 'career', 3); s.flags.add('choice_management_failed_late'); },
          result: '你试了转管理，但没带过团队，处处碰壁。董事会上你成了"资历最老绩效最差"。',
        }],
      },
      {
        label: '成为不可替代的技术专家',
        outcomes: [{
          weight: 100, condition: { flag: 'skill_coding' },
          apply: (s) => { addScore(s, 'career', 15); addScore(s, 'fame', 8); adjustSalary(s, 2000); s.flags.add('milestone_domain_expert'); },
          result: '你啃下了公司最古老的祖传系统——全公司只有你能改。年轻人得叫你"老师傅"。',
        }],
      },
      {
        label: '接受边缘化，准时下班',
        outcomes: [{
          weight: 100, condition: { all: [] },
          apply: (s) => { addScore(s, 'freedom', 12); addScore(s, 'career', -3); s.flags.add('choice_accept_irrelevance'); },
          result: '你被调去"顾问"岗，没事干但工资照发。你开始准点下班，第一次有空接孩子放学。',
        }],
      },
    ],
  },

  // 25. 带徒弟传承 — 45-55 岁（呼应新人期被师傅带）
  {
    id: 'career_mentor_others',
    stage: 'career', ageRange: [45, 55], once: true,
    trigger: {
      baseWeight: 5,
      requires: [{ employment: 'employed' }, { scoreGte: { career: 40 } }],
    },
    text: '组里新来个毛头小子，眼神像极了二十年前的你。他想拜你为师。',
    choices: [
      {
        label: '认真带，把毕生所学传下去',
        outcomes: [{
          weight: 100, condition: { all: [] },
          apply: (s) => { addScore(s, 'fame', 12); addScore(s, 'spirit', 10); addScore(s, 'family', 5); s.flags.add('achievement_mentor_others'); },
          result: '三年后他成了你的左膀右臂。他结婚请你坐主桌，孩子满月酒第一个通知你。',
        }],
      },
      {
        label: '教会徒弟饿死师傅，留一手',
        outcomes: [{
          weight: 100, condition: { all: [] },
          apply: (s) => { addScore(s, 'career', 3); s.flags.add('choice_keep_secrets'); },
          result: '你只教皮毛。小伙子很快另谋高就，走时说："您老的绝活，我以后慢慢悟吧。"',
        }],
      },
    ],
  },

  // 26. 临近退休迷茫 — 55-60 岁
  {
    id: 'career_pre_retirement',
    stage: 'career', ageRange: [55, 60], once: true,
    trigger: {
      baseWeight: 6,
      requires: [{ employment: 'employed' }],
    },
    text: '退休倒计时 5 年。工位上摆着你的绿植，养了 20 年。你忽然想：退休后，我要做什么？',
    choices: [
      {
        label: '提前规划，发展第二兴趣',
        outcomes: [{
          weight: 100, condition: { all: [] },
          apply: (s) => { addScore(s, 'freedom', 10); addScore(s, 'spirit', 8); s.flags.add('choice_plan_retirement'); },
          result: '你开始学书法、摄影、写回忆录。退休那天，你不是"结束"，而是"开始"。',
        }],
      },
      {
        label: '发挥余热，返聘留任',
        outcomes: [{
          weight: 100, condition: { flag: 'milestone_domain_expert' },
          apply: (s) => { addScore(s, 'career', 8); adjustSalary(s, 1000); s.flags.add('choice_rehired'); },
          result: '退休当天公司返聘你做顾问，工资减半但不用打卡。老专家的待遇。',
        }],
      },
      {
        label: '彻底躺平，倒数日子',
        outcomes: [{
          weight: 100, condition: { all: [] },
          apply: (s) => { addScore(s, 'freedom', 5); worsenHealth(s); },
          result: '你上班开始摸鱼到极致。同事们心照不宣，没人给你派活。日子像温水。',
        }],
      },
    ],
  },

  // 27. 行业寒冬 — 40-55 岁（中年危机 + 行业周期）
  {
    id: 'career_industry_winter',
    stage: 'career', ageRange: [40, 55], once: true,
    trigger: {
      baseWeight: 5,
      requires: [{ employment: 'employed' }, { flag: 'milestone_first_job_tech' }],
    },
    text: '整个行业突然进入寒冬。同行公司批量倒闭，朋友的朋友被裁后跳了楼。你看着新闻，后背发凉。',
    choices: [
      {
        label: '囤现金，过冬准备',
        outcomes: [{
          weight: 100, condition: { all: [] },
          apply: (s) => { adjustSavings(s, 2000); addScore(s, 'freedom', 8); s.flags.add('choice_prepare_winter'); },
          result: '你砍掉一切非必要开支，存够 18 个月生活费。冬天真来了时，你不慌。',
        }],
      },
      {
        label: 'all in 副业，对冲风险',
        outcomes: [{
          weight: 100, condition: { flag: 'foreshadow_indie_dev' },
          apply: (s) => { addScore(s, 'career', 8); addScore(s, 'fame', 5); s.flags.add('choice_hedge_with_side'); },
          result: '你白天上班晚上做产品。寒冬来时，副业居然成了主业——你早有准备。',
        }],
      },
      {
        label: '相信"周期总会过去"',
        outcomes: [{
          weight: 100, condition: { all: [] },
          apply: (s) => { worsenHealth(s); addScore(s, 'career', -3); s.flags.add('choice_ignore_winter'); },
          result: '你没做准备。三个月后公司"优化"名单上有你，期权全废，房贷还在。',
        }],
      },
    ],
  },

  // 28. 副业失败负债 — 30-45 岁（延伸 side_hustle 的失败分支）
  {
    id: 'career_side_business_fail',
    stage: 'career', ageRange: [30, 45], once: true,
    trigger: { baseWeight: 4, requires: [{ flag: 'choice_side_hustle_burned' }] },
    text: '上次副业被割的韭菜，你又想再赌一把。这次你借了网贷搞直播带货，结果血本无归。',
    choices: [
      {
        label: '老实打工还债，三年不吃肉',
        outcomes: [{
          weight: 100, condition: { all: [] },
          apply: (s) => { adjustSavings(s, -15000); addDisease(s, 'insomnia'); worsenHealth(s); addScore(s, 'spirit', 8); s.flags.add('choice_pay_debt'); },
          result: '三年你还清了债。学会了：天上不会掉馅饼，掉的通常是铁饼。',
        }],
      },
      {
        label: '瞒着家人，以贷养贷',
        outcomes: [{
          weight: 100, condition: { all: [] },
          apply: (s) => { adjustSavings(s, -30000); addDisease(s, 'depression'); worsenHealth(s); worsenHealth(s); addScore(s, 'family', -10); s.flags.add('choice_hide_debt'); },
          result: '雪球越滚越大。妻子发现存折空了那天，提出了离婚。',
        }],
      },
    ],
  },

  // 29. 中年出轨诱惑 — 38-48 岁（呼应 marriage_crisis）
  {
    id: 'career_midlife_affair',
    stage: 'career', ageRange: [38, 48], once: true,
    trigger: { baseWeight: 4, requires: [{ marriage: 'married' }, { notFlag: 'milestone_affair_fired' }] },
    text: '公司新来的实习生总找你帮忙，眼神亮晶晶的。某天加班到深夜，ta 说「要不要一起吃个夜宵？」',
    choices: [
      {
        label: '守住底线，回家',
        outcomes: [{
          weight: 100, condition: { all: [] },
          apply: (s) => { addScore(s, 'family', 8); addScore(s, 'spirit', 5); s.flags.add('choice_stay_faithful'); },
          result: '你找借口离开了。那晚回家，妻子已经热好了饭。你忽然觉得她很好。',
        }],
      },
      {
        label: '一时冲动……',
        outcomes: [{
          weight: 100, condition: { all: [] },
          apply: (s) => {
            transitionMarriage(s, 'divorced');
            addScore(s, 'family', -20); addScore(s, 'freedom', 5);
            adjustSavings(s, -10000);
            s.flags.add('milestone_divorced'); s.flags.add('choice_affair'); s.flags.add('milestone_affair_fired');
          },
          result: '纸包不住火。妻子发现后坚决离婚，你净身出户。孩子跟了她。',
        }],
      },
    ],
  },
];
