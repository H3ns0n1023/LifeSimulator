// src/content/college/_index.ts
import type { GameEvent, Major } from '../../engine/types';
import { addScore, adjustSalary, adjustSavings, transitionEmployment, worsenHealth, setEducation, addDisease } from '../../engine/status';
import { JOB_DICTIONARY, EDUCATION_RANK, EDUCATION_LABEL } from '../../engine/constants';
import type { JobEntry } from '../../engine/constants';

export const collegeEvents: GameEvent[] = [
  // 0. 选专业 — 19 岁（入学后立刻选，决定求职岗位池）
  {
    id: 'college_choose_major',
    stage: 'college', ageRange: [19, 19], once: true,
    trigger: { baseWeight: 10 },
    text: (s) => `你拿着录取通知书走进${EDUCATION_LABEL[s.education ?? 'dazhuan']}的校园。迎新老师问：「同学，你想读什么专业？」`,
    choices: [
      // 计算机科学：211 及以上可选
      { label: '计算机科学', hint: '写代码，进大厂', visibleWhen: { educationGte: '211' },
        outcomes: [{ weight: 100, condition: { all: [] }, apply: (s) => { s.major = 'cs'; s.flags.add('major_cs'); }, result: '你选了计算机。学长说这行钱多，就是费头发。' }] },
      // 金融：211 及以上可选
      { label: '金融', hint: '投行/银行', visibleWhen: { educationGte: '211' },
        outcomes: [{ weight: 100, condition: { all: [] }, apply: (s) => { s.major = 'finance'; s.flags.add('major_finance'); }, result: '你选了金融。陆家嘴的灯火在向你招手。' }] },
      // 医学：985 及以上可选（培养周期长）
      { label: '临床医学', hint: '当医生，越老越吃香', visibleWhen: { educationGte: '985' },
        outcomes: [{ weight: 100, condition: { all: [] }, apply: (s) => { s.major = 'medicine'; s.flags.add('major_medicine'); }, result: '你选了临床医学。本硕博连读八年，你做好了准备。' }] },
      // 法学：211 及以上可选
      { label: '法学', hint: '律所/公检法', visibleWhen: { educationGte: '211' },
        outcomes: [{ weight: 100, condition: { all: [] }, apply: (s) => { s.major = 'law'; s.flags.add('major_law'); }, result: '你选了法学。法考通过率 10%，但你决定搏一把。' }] },
      // 工科：所有学历可选（大专也有数控/技术师傅路线）
      { label: '工科', hint: '工程师/技术师傅', visibleWhen: { all: [] },
        outcomes: [{ weight: 100, condition: { all: [] }, apply: (s) => { s.major = 'engineering'; s.flags.add('major_engineering'); }, result: '你选了工科。这门手艺，越老越值钱。' }] },
      // 中文：一本及以上可选
      { label: '中文系', hint: '当老师/搞文字', visibleWhen: { educationGte: 'yiben' },
        outcomes: [{ weight: 100, condition: { all: [] }, apply: (s) => { s.major = 'literature'; s.flags.add('major_literature'); }, result: '你选了中文系。从此与书为伴。' }] },
      // 师范：一本及以上可选（大专走小学老师）
      { label: '师范', hint: '当老师', visibleWhen: { educationGte: 'yiben' },
        outcomes: [{ weight: 100, condition: { all: [] }, apply: (s) => { s.major = 'education'; s.flags.add('major_education'); }, result: '你选了师范。未来的三尺讲台在等你。' }] },
      // 艺术：所有学历可选
      { label: '艺术设计', hint: '设计/创作', visibleWhen: { all: [] },
        outcomes: [{ weight: 100, condition: { all: [] }, apply: (s) => { s.major = 'art'; s.flags.add('major_art'); }, result: '你选了艺术。作品集就是你的简历。' }] },
    ],
  },
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
            apply: (s) => { adjustSavings(s, 3000); addScore(s, 'career', 5); s.flags.add('skill_intern'); },
            result: '实习三个月，你拿到了第一笔像样的工资。',
          },
          {
            weight: 40, condition: { all: [] },
            apply: (s) => { adjustSavings(s, 1000); },
            result: '实习主要是打杂，但你至少混了份简历。',
          },
        ],
      },
      {
        label: '水一个就好',
        outcomes: [{
          weight: 100, condition: { all: [] },
          apply: (s) => { addScore(s, 'freedom', 5); adjustSavings(s, 500); },
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
            // 中学有暗恋经验 + 童年有朋友 → 社交达人，高成功率
            weight: 80, condition: { any: [{ flag: 'choice_first_crush' }, { flag: 'milestone_first_friend' }, { flag: 'skill_debate' }, { flag: 'choice_charm_practice' }] },
            apply: (s) => { addScore(s, 'family', 10); s.flags.add('milestone_first_love'); },
            result: (s) => s.flags.has('choice_first_crush')
              ? '你想起中学那次没敢递出去的纸条——这次，你不会再错过了。你们在一起了。'
              : '你们开始一起上自习、一起吃食堂。大学有了甜味。',
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

  // 4. 求职 — 22 岁（按 学历×专业 从岗位词典匹配具体岗位）
  {
    id: 'college_first_job_hunt',
    stage: 'college', ageRange: [22, 22], once: true,
    trigger: { baseWeight: 10 },
    text: '毕业季到了，你开始投简历。',
    choices: [
      {
        label: '海投简历，找份工作',
        outcomes: [{
          weight: 100, condition: { all: [] },
          apply: (s) => {
            transitionEmployment(s, 'employed');
            // 从岗位词典匹配：学历达标 + 专业对口（studyBonus 门槛也满足）
            const edu = s.education ?? 'dazhuan';
            const eduRank = EDUCATION_RANK[edu];
            const candidates = JOB_DICTIONARY.filter((job) => {
              if (eduRank < EDUCATION_RANK[job.educationGte]) return false;
              if (job.majors.length > 0 && (!s.major || !job.majors.includes(s.major))) return false;
              if (job.studyBonus && s.scores.study < job.studyBonus) return false;
              return true;
            });
            // 取学历门槛最高（最对口）的一个作为"理想 offer"
            const job = candidates.sort((a, b) => EDUCATION_RANK[b.educationGte] - EDUCATION_RANK[a.educationGte])[0]
              ?? JOB_DICTIONARY.find((j) => j.id === 'job_clerk')!;  // 兜底文员
            // 实习/考研加薪
            const internBonus = s.flags.has('skill_intern') ? Math.round(job.salary * 0.15) : 0;
            const gradBonus = s.flags.has('milestone_grad_school') ? Math.round(job.salary * 0.2) : 0;
            adjustSalary(s, job.salary + internBonus + gradBonus);
            s.flags.add(job.id);                 // 记录具体岗位 flag（career_first_day 读它）
            s.flags.add('milestone_first_job');  // 通用求职里程碑
            if (job.id === 'job_cs_bigtech' || job.id === 'job_algo_bigtech' || job.id === 'job_cs_mid') {
              s.flags.add('milestone_first_job_tech');  // 兼容旧逻辑（IPO/行业寒冬读它）
            }
            if (job.careerDelta) addScore(s, 'career', job.careerDelta);
            if (job.freedomDelta) addScore(s, 'freedom', job.freedomDelta);
            if (job.familyDelta) addScore(s, 'family', job.familyDelta);
            if (job.harmHealth) worsenHealth(s);
            // 记录岗位名供 result 读取
            s.flags.add(`job_title|${job.title}`);
            s.flags.add(`job_company|${job.company}`);
          },
          result: (s) => {
            const title = [...s.flags].find((f) => f.startsWith('job_title|'))?.slice('job_title|'.length) ?? '职员';
            const company = [...s.flags].find((f) => f.startsWith('job_company|'))?.slice('job_company|'.length) ?? '某公司';
            const job = JOB_DICTIONARY.find((j) => s.flags.has(j.id));
            return job ? `${job.desc}（${company}·${title}，月薪 ${job.salary}）` : '你找到了一份工作。';
          },
        }],
      },
      {
        label: '考研，再苟三年',
        outcomes: [{
          weight: 100, condition: { scoreGte: { study: 15 } },
          apply: (s) => {
            addScore(s, 'career', 10); s.flags.add('milestone_grad_school');
            // 考研成功提升学历一档（上限 985）
            const cur = s.education ?? 'dazhuan';
            const rank = EDUCATION_RANK[cur];
            const up: Record<number, typeof cur> = { 0: 'erben', 1: 'yiben', 2: '211', 3: '985', 4: '985' };
            s.education = up[rank] ?? cur;
          },
          result: '你成功上岸，再读三年。学历也上了一档。',
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
          weight: 100, condition: { savingsGte: 2000 },
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

  // 9. 辍学创业念头 — 20-22 岁（career/freedom 分流）
  {
    id: 'college_dropout_thought',
    stage: 'college', ageRange: [20, 22], once: true,
    trigger: { baseWeight: 4, requires: [{ flag: 'skill_coding' }] },
    text: '你做了个 App，居然有了几万用户。投资人约你喝咖啡：「辍学来干吧，下一个独角兽。」',
    choices: [
      {
        label: '比尔·盖茨也是辍学的！',
        outcomes: [{
          weight: 100, condition: { all: [] },
          apply: (s) => { transitionEmployment(s, 'selfEmployed'); adjustSavings(s, -5000); addScore(s, 'career', 8); addScore(s, 'freedom', 8); s.flags.add('choice_dropout'); s.flags.add('milestone_left_college'); worsenHealth(s); },
          result: '你办了退学手续。头三个月工资发不出，你睡在工位的睡袋里。',
        }],
      },
      {
        label: '先把文凭拿到手再说',
        outcomes: [{
          weight: 100, condition: { all: [] },
          apply: (s) => { addScore(s, 'study', 5); addScore(s, 'career', 3); s.flags.add('choice_stay_in_school'); s.flags.add('foreshadow_indie_dev'); },
          result: '你把 App 当副业，按时毕业。后来它成了你简历上最亮的一笔。',
        }],
      },
    ],
  },

  // 10. 宿舍矛盾 — 19-21 岁（family/spirit）
  {
    id: 'college_roommate_conflict',
    stage: 'college', ageRange: [19, 21], once: true,
    trigger: { baseWeight: 5 },
    text: '凌晨两点，舍友还在外放打游戏。你已经忍了一个月，黑眼圈快掉到下巴。',
    choices: [
      {
        label: '当面摊牌，立规矩',
        outcomes: [{
          weight: 100, condition: { all: [] },
          apply: (s) => { addScore(s, 'family', 5); addScore(s, 'spirit', 4); s.flags.add('skill_debate'); s.flags.add('choice_roommate_speak'); },
          result: '一番激烈讨论后，宿舍制定了熄灯公约。你们成了最好的兄弟。',
        }],
      },
      {
        label: '忍着，默默换宿舍',
        outcomes: [{
          weight: 100, condition: { all: [] },
          apply: (s) => { addScore(s, 'spirit', 2); addDisease(s, 'insomnia'); s.flags.add('choice_roommate_avoid'); },
          result: '你搬到了另一个宿舍。失眠好转了，但也没交到铁哥们。',
        }],
      },
    ],
  },
];
