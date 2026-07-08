// src/engine/constants.ts
import type { LifeStage, HealthStage, Employment, Marriage, EndingTrack } from './types';

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
