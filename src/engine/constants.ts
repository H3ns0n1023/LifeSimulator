// src/engine/constants.ts
import type { LifeStage, HealthStage, Employment, Marriage, EndingTrack, EducationLevel, Major } from './types';

// ============ 生命阶段年龄边界 ============
export const STAGE_OF_AGE = (age: number): LifeStage => {
  if (age <= 6) return 'childhood';
  if (age <= 18) return 'school';
  if (age <= 22) return 'college';
  if (age <= 60) return 'career';
  return 'retirement';
};

// STAGE_BOUNDS 仅作文档参考（引擎不读，由 STAGE_OF_AGE 推导）
export const STAGE_BOUNDS: Record<LifeStage, [number, number]> = {
  childhood: [1, 6],
  school: [7, 18],
  college: [19, 22],
  career: [23, 60],
  retirement: [61, 85],
};

// ============ 健康五档序列 ============
// 序号越大越严重。healthGte 用 HEALTH_RANK 比较。
export const HEALTH_RANK: Record<HealthStage, number> = {
  healthy: 0,
  subhealthy: 1,
  mild: 2,
  severe: 3,
  critical: 4,
};

export const HEALTH_ORDER: HealthStage[] = ['healthy', 'subhealthy', 'mild', 'severe', 'critical'];

// 健康档位中文显示（UI 用）
export const HEALTH_LABEL: Record<HealthStage, string> = {
  healthy: '健康',
  subhealthy: '亚健康',
  mild: '小病',
  severe: '大病',
  critical: '濒危',
};

// ============ 就业/婚姻状态机合法转换表 ============
// transitionEmployment / transitionMarriage 会查这张表，非法转换抛错。
// 未列出的转换一律非法（必须显式声明，防止"失业→退休"这类冲突）。
export const EMPLOYMENT_TRANSITIONS: Record<Employment, Employment[]> = {
  student: ['employed', 'unemployed', 'selfEmployed'],        // 毕业后三种去向
  employed: ['employed', 'unemployed', 'selfEmployed', 'retired', 'monk'],
  unemployed: ['employed', 'unemployed', 'selfEmployed', 'retired', 'monk'],
  selfEmployed: ['employed', 'unemployed', 'selfEmployed', 'retired', 'monk'],
  retired: ['retired', 'monk', 'deceased'],                   // 退休后只能维持/出家/死亡
  monk: ['monk', 'deceased'],                                 // 出家为终局
  deceased: [],                                               // 死亡不可逆
};

export const MARRIAGE_TRANSITIONS: Record<Marriage, Marriage[]> = {
  single: ['single', 'dating', 'married'],                    // 可闪婚
  dating: ['single', 'dating', 'married'],                    // 分手回到 single
  married: ['married', 'divorced', 'widowed'],
  divorced: ['single', 'dating', 'married'],                  // 可再婚（先回 single/dating）
  widowed: ['single', 'dating', 'married'],                   // 丧偶可再婚
};

// ============ 退休/死亡相关 ============
export const RETIREMENT_AGE = 60;
export const HEALTH_DECAY_AGE = 40;        // 40 岁后每年有概率健康降一档
export const HEALTH_DECAY_PROBABILITY = 0.15;  // 每年 15% 概率 worsenHealth（40 岁后）

// ============ 年度薪资变动（applyYearlyTick 自动执行）============
// 在职雇员：每年大概率普调小幅涨薪，小概率晋升大涨，35 岁后涨速放缓
export const SALARY_RAISE = {
  // 普调：每年约 +5%（按当前月薪算），小概率不涨
  normalProb: 0.7,            // 70% 概率发生普调
  normalRate: 0.05,           // 涨幅 5%
  // 晋升：约 15% 概率，涨幅 15%
  promotionProb: 0.15,
  promotionRate: 0.15,
  // 35 岁后涨速衰减（年龄歧视）
  seniorAgeCutoff: 35,        // 35 岁起涨速打折
  seniorMultiplier: 0.5,      // 涨幅 *= 0.5
};

// 失业：每年消耗积蓄（salary 不变，用负数模拟存款流失，下限 0）
export const SALARY_UNEMPLOYED_DRAIN = 0.15;  // 每年 salary *= (1 - 0.15)，逼近 0

// 自由职业/创业：高方差，±20% 随机波动
export const SALARY_SELF_EMPLOYED = {
  volatility: 0.2,            // 波动幅度 ±20%
  trend: 0.03,                // 长期微涨 3%/年（活下来的会成长）
};

// 退休：退休金 = 退休前月薪的固定比例，之后随通胀微涨
export const SALARY_PENSION_RATE = 0.4;       // 退休金 = 退休时月薪 × 40%
export const SALARY_PENSION_GROWTH = 0.03;    // 退休金每年 +3%（抗通胀）

// 学生/出家：月薪维持 0
// 起薪基准（应届生入职参考）
export const STARTING_SALARY = 6000;

// ============ 零花钱（学生期，由家境决定）============
export const ALLOWANCE = {
  rich: 200,      // 殷实家庭：每月零花钱 200
  poor: 20,       // 普通家庭：每月零花钱 20
  base: 50,       // 默认/未触发家境事件
  // 零花钱年度入账 = 月额 × 12（applyYearlyTick 给 student 结算）
};

// ============ 成年存款机制 ============
export const SAVINGS = {
  starting: 0,            // 就业起手存款（毕业时清零转入）
  monthlySaveRate: 0.2,   // 每月把月薪的 20% 存入存款（年度 = salary * 12 * 0.2）
  interestRate: 0.02,     // 存款年利息 2%
};

// ============ 跨周目经济档位阈值 ============
// 净资产 = savings + salary * 12，用于判定上一世财富档位传承下世家境
export const WEALTH_TIER = {
  rich: 300000,   // > 30万 → 富
  poor: 30000,    // < 3万 → 穷
  // 中间为 mid
};

// ============ 商店商品清单 ============
export interface ShopItem {
  id: string;
  name: string;
  price: number;
  desc: string;
  // 学生期可用 allowance 购买，成年用 savings
  studentOnly?: boolean;
}

export const SHOP_ITEMS: ShopItem[] = [
  { id: 'medicine',   name: '买药',     price: 500,   desc: '治疗小病，健康好转一档' },
  { id: 'see_doctor', name: '看病',     price: 3000,  desc: '治疗大病，健康好转两档 + 治愈一种病症' },
  { id: 'lottery',    name: '买彩票',   price: 20,    desc: '每年底开奖，小概率暴富' },
  { id: 'gym_card',   name: '健身卡',   price: 2000,  desc: '健康好转一档' },
  { id: 'supplement', name: '营养品',   price: 800,   desc: '治愈营养不良，健康好转一档' },
];

// ============ 彩票开奖概率（年底统一开奖）============
export const LOTTERY = {
  jackpotProb: 0.001,    // 千分之一：50 万
  jackpotPrize: 500000,
  secondProb: 0.01,      // 百分之一：1 万
  secondPrize: 10000,
  thirdProb: 0.1,        // 十分之一：200
  thirdPrize: 200,
};

// 重病症：一旦确诊，自动把健康降到指定档
export const DISEASE_IMPACT: Record<string, HealthStage> = {
  insomnia: 'subhealthy',
  malnutrition: 'subhealthy',
  fatty_liver: 'mild',
  hypertension: 'mild',
  'overwork_syndrome': 'mild',
  stomach_ulcer: 'mild',
  myopia: 'mild',
  depression: 'severe',
  heart_disease: 'severe',
  cancer: 'critical',
  myocardial_infarction: 'critical',   // 心梗
  stroke: 'critical',                  // 中风
};

// ============ 寿命 ============
export const BASE_LIFESPAN = 78;
export const LIFESPAN_VARIANCE = 12;

// ============ 结局五线 ============
export const ENDING_TRACKS: EndingTrack[] = ['career', 'family', 'freedom', 'fame', 'spirit'];

export const TRACK_LABEL: Record<EndingTrack, string> = {
  career: '事业',
  family: '家庭',
  freedom: '自由',
  fame: '名望',
  spirit: '精神',
  study: '学业',
};

// 每线分数上限（用于评分归一化 + UI 进度条）
export const SCORE_MAX = 100;

// ============ 评分权重（占位值，playtest 调）============
// scoreAvg = 五线平均分；lifespan = 寿命分；achievement/twist = flag 加成
export const RATING_WEIGHTS = {
  scoreAvg: 0.6,
  lifespan: 0.2,
  achievement: 0.1,
  twist: 0.1,
};

export const RATING_THRESHOLDS = {
  S: 80,
  A: 65,
  B: 50,
  C: 35,
};

// ============ 阈值事件触发条件（占位，playtest 调）============
export const THRESHOLDS = {
  lowHealth: 'severe' as HealthStage,    // 健康降到 severe 触发健康危机事件
  peakScoreTotal: 200,                   // 五线总分 > 200 触发人生巅峰事件
  midlifeAgeRange: [40, 50] as [number, number],
};

// ============ NG+ 继承加成（carryover 四类语义）============
export const CARRYOVER_BONUS = {
  career: { track: 'career' as EndingTrack, score: 20 },     // 前世事业积累
  family: { track: 'family' as EndingTrack, score: 20 },     // 前世人脉积累
  freedom: { track: 'freedom' as EndingTrack, score: 20 },   // 前世自由心得
  // memory 不加分数，而是设 ng_plus_memory flag（解锁招牌链隐藏选项 + 罕见反转 weight *1.05）
};

// ============ 学历层次有序表（仿 HEALTH_RANK，用于 educationGte 比较）============
export const EDUCATION_RANK: Record<EducationLevel, number> = {
  dazhuan: 0,
  erben: 1,
  yiben: 2,
  '211': 3,
  '985': 4,
  overseas: 5,
};
export const EDUCATION_ORDER: EducationLevel[] = ['dazhuan', 'erben', 'yiben', '211', '985', 'overseas'];
export const EDUCATION_LABEL: Record<EducationLevel, string> = {
  dazhuan: '大专',
  erben: '二本',
  yiben: '一本',
  '211': '211',
  '985': '985',
  overseas: '海外名校',
};
export const MAJOR_LABEL: Record<Major, string> = {
  cs: '计算机',
  finance: '金融',
  literature: '中文',
  medicine: '医学',
  education: '师范',
  engineering: '工科',
  art: '艺术',
  law: '法学',
};

// ============ 高考分档阈值（按 scores.study 分判定 education）============
export const GAOKAO_THRESHOLDS = {
  '985': 40,        // study ≥ 40 → 985
  '211': 28,        // study ≥ 28 → 211
  yiben: 18,        // study ≥ 18 → 一本
  erben: 8,         // study ≥ 8  → 二本
  prodigy985: 45,   // study ≥ 45 且神童 → 顶尖少年班
};

// ============ 岗位词典（求职按 education×major 路由）============
// 每个岗位：需要的最低学历、适配专业、岗位名、公司描述、起薪、特点标签
export interface JobEntry {
  id: string;                       // 岗位 flag 前缀（job_xxx）
  educationGte: EducationLevel;     // 最低学历要求
  majors: Major[];                  // 适配专业（空数组=不限）
  title: string;                    // 岗位名（AttrPanel/文案用）
  company: string;                  // 公司/单位描述
  salary: number;                   // 起薪（元）
  studyBonus?: number;              // study 分门槛（如算法岗需 study≥35）
  careerDelta?: number;             // career 加分
  freedomDelta?: number;            // freedom 加分
  familyDelta?: number;             // family 加分
  harmHealth?: boolean;             // 是否伤身（996/高强度）
  desc: string;                     // 入职文案
}

export const JOB_DICTIONARY: JobEntry[] = [
  // —— 互联网/技术线 ——
  { id: 'job_algo_bigtech', educationGte: '985', majors: ['cs'], title: '算法工程师',
    company: '字节跳动 / 商汤科技', salary: 32000, studyBonus: 38, careerDelta: 15, harmHealth: true,
    desc: '你拿到了算法岗 SSP offer，年薪五十万起步。团队里全是清北复交的卷王。' },
  { id: 'job_cs_bigtech', educationGte: '211', majors: ['cs'], title: '后台开发工程师',
    company: '腾讯 CSIG / 美团到家', salary: 22000, careerDelta: 12, harmHealth: true,
    desc: '你进了大厂，工牌挂在脖子上，996 从入职第一天开始。' },
  { id: 'job_cs_mid', educationGte: 'yiben', majors: ['cs'], title: '后端工程师',
    company: '某互联网中厂', salary: 13000, careerDelta: 8, harmHealth: true,
    desc: '你去了家发展中的互联网公司，技术栈还行，加班也不少。' },
  { id: 'job_cs_small', educationGte: 'erben', majors: ['cs'], title: '开发工程师',
    company: '某创业公司', salary: 8000, careerDelta: 5,
    desc: '小公司什么都得干，从前端到运维。老板画饼的技术一流。' },

  // —— 金融线 ——
  { id: 'job_finance_ib', educationGte: '985', majors: ['finance'], title: '投行分析师',
    company: '中金公司 / 中信证券', salary: 26000, careerDelta: 14, harmHealth: true,
    desc: '你进了投行，每周工作 80 小时。凌晨三点的陆家嘴，你比谁都熟。' },
  { id: 'job_finance_bank', educationGte: 'yiben', majors: ['finance'], title: '银行客户经理',
    company: '某国有大行', salary: 9000, careerDelta: 5, familyDelta: 3,
    desc: '你进了银行，朝九晚五，旺季有营销压力。亲戚都觉得这是铁饭碗。' },

  // —— 教育/师范线 ——
  { id: 'job_teacher_key', educationGte: '211', majors: ['education', 'literature'], title: '重点中学老师',
    company: '广州二中 / 深圳中学', salary: 8500, familyDelta: 5, freedomDelta: 5,
    desc: '你考上了重点中学的编制，带重点班。学生敬你，家长捧你。' },
  { id: 'job_teacher_normal', educationGte: 'yiben', majors: ['education', 'literature'], title: '中学老师',
    company: '某市重点中学', salary: 7000, familyDelta: 5, freedomDelta: 6,
    desc: '你成了一名中学老师，有寒暑假，日子安稳。' },
  { id: 'job_teacher_primary', educationGte: 'dazhuan', majors: ['education', 'literature'], title: '小学老师',
    company: '某区中心小学', salary: 5500, familyDelta: 4, freedomDelta: 6,
    desc: '你当了小学老师，每天和孩子们在一起，操心但单纯。' },

  // —— 医学线 ——
  { id: 'job_doctor', educationGte: '985', majors: ['medicine'], title: '三甲医院住院医师',
    company: '某三甲医院', salary: 12000, careerDelta: 8, harmHealth: true,
    desc: '你进了三甲医院，开始规培。白班夜班连轴转，值班的灯永远亮着。' },
  { id: 'job_doctor_local', educationGte: 'yiben', majors: ['medicine'], title: '医院医生',
    company: '某市级医院', salary: 9000, familyDelta: 4,
    desc: '你在市级医院当医生，收入稳定，受人尊敬。' },

  // —— 工科/实业线 ——
  { id: 'job_engineer_master', educationGte: 'dazhuan', majors: ['engineering'], title: '数控大师傅',
    company: '中远海特数字化部', salary: 6500, careerDelta: 6,
    desc: '你跟着老师傅学数控，从学徒干起。这门手艺越老越吃香。' },
  { id: 'job_engineer_state', educationGte: 'yiben', majors: ['engineering'], title: '国企工程师',
    company: '某央企设计院', salary: 10000, careerDelta: 6, familyDelta: 4,
    desc: '你进了国企设计院，项目稳定，福利齐全，旱涝保收。' },

  // —— 法律线 ——
  { id: 'job_lawyer', educationGte: '211', majors: ['law'], title: '律所律师',
    company: '某红圈所', salary: 15000, careerDelta: 10, harmHealth: true,
    desc: '你进了律所，从实习生熬起。案卷堆成山，billable hours 压得人喘不过气。' },

  // —— 艺术线 ——
  { id: 'job_designer', educationGte: 'erben', majors: ['art'], title: '设计师',
    company: '某广告/互联网公司', salary: 8000, careerDelta: 4, freedomDelta: 3,
    desc: '你做了设计师，作品集是你的简历。甲方改稿改到你怀疑人生。' },

  // —— 兜底 ——
  { id: 'job_clerk', educationGte: 'dazhuan', majors: [], title: '公司文员',
    company: '某中小企业', salary: 5500, freedomDelta: 4,
    desc: '你找了份文员工作，朝九晚六，打打杂，工资不高但也不累。' },
];
