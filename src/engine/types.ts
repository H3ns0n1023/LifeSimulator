// src/engine/types.ts

// ============ 生命阶段 ============
export type LifeStage = 'childhood' | 'school' | 'college' | 'career' | 'retirement';

// ============ 评级 ============
export type Rating = 'S' | 'A' | 'B' | 'C' | 'D';

// ============ 健康五档（替代旧"体质"数值）============
// healthy → subhealthy → mild → severe → critical
// critical 再恶化触发死亡结局
export type HealthStage = 'healthy' | 'subhealthy' | 'mild' | 'severe' | 'critical';

// ============ 就业状态机 ============
// student  = 在校（童年/中小学/大学）
// employed = 受雇上班
// unemployed = 失业（被裁/裸辞/辞职未就业）
// selfEmployed = 创业/自由职业
// retired  = 退休
// monk     = 出家（终局性）
// deceased = 已故（用于结局）
export type Employment =
  | 'student'
  | 'employed'
  | 'unemployed'
  | 'selfEmployed'
  | 'retired'
  | 'monk'
  | 'deceased';

// ============ 婚姻状态机 ============
export type Marriage = 'single' | 'dating' | 'married' | 'divorced' | 'widowed';

// ============ NG+ 继承类型（保留四类语义）============
export type CarryingKind = 'career' | 'family' | 'freedom' | 'memory';

// ============ 结局五线积分 ============
// 每个选择给某一线加分，决定结局走向
export type EndingTrack = 'career' | 'family' | 'freedom' | 'fame' | 'spirit' | 'study';

export interface Scores {
  career: number;   // 事业线（升职/创业/月薪暴涨）
  family: number;   // 家庭线（结婚/生子/亲情）
  freedom: number;  // 自由线（丁克/躺平/旅行/独身）
  fame: number;     // 名望线（网红/作家/公众人物）
  spirit: number;   // 精神线（出家/顿悟/哲学）
  study: number;    // 学业线（刷题/听课/补习/天赋 → 决定高考）
}

// ============ 学历与专业（高考后持久状态）============
export type EducationLevel = 'dazhuan' | 'erben' | 'yiben' | '211' | '985' | 'overseas';
export type Major = 'cs' | 'finance' | 'literature' | 'medicine' | 'education' | 'engineering' | 'art' | 'law';

// ============ 条件 DSL（声明式）============
// 保留：flag / notFlag / all / any
// 删除：attrGte/attrLt/skillGte/skillLt（旧属性体系已移除）
export type Condition =
  | { flag: string }
  | { notFlag: string }
  // —— 月薪（唯一核心数字指标）——
  | { salaryGte: number }
  | { salaryLt: number }
  // —— 存款（成年经济水平，一次性大额消费能力）——
  | { savingsGte: number }
  | { savingsLt: number }
  // —— 零花钱（学生期购买力）——
  | { allowanceGte: number }
  | { allowanceLt: number }
  // —— 健康档位判定 ——
  | { healthIn: HealthStage[] }
  | { healthGte: HealthStage }            // 严重程度 >= 某档（critical 最严重）
  | { disease: string }                   // 患有某具体病症
  | { notDisease: string }
  // —— 状态机判定（解决状态冲突）——
  | { employment: Employment }
  | { employmentIn: Employment[] }
  | { notEmployment: Employment }
  | { marriage: Marriage }
  | { marriageIn: Marriage[] }
  // —— 年龄判定（消除 loop.ts 硬编码 if）——
  | { ageGte: number }
  | { ageLt: number }
  // —— 结局积分判定 ——
  | { scoreGte: Partial<Record<EndingTrack, number>> }
  // —— 学历与专业判定 ——
  | { educationGte: EducationLevel }   // 学历层次 ≥ 某档
  | { majorIn: Major[] }               // 专业属于某集合
  // —— 组合 ——
  | { all: Condition[] }
  | { any: Condition[] };

// ============ 游戏状态 ============
export interface GameState {
  age: number;
  stage: LifeStage;
  // ★ 3 个核心可见指标
  salary: number;          // 月薪（成年在职/退休金，元）
  savings: number;         // 存款（成年后反映经济水平，元）
  allowance: number;       // 零花钱（学生期，元；由家庭条件决定）
  health: HealthStage;     // 健康五档
  // ★ 健康细节（病症标签）
  diseases: Set<string>;   // fatty_liver / hypertension / insomnia / depression / cancer ...
  // ★ 状态机字段（保证人生贯通一致性）
  employment: Employment;
  marriage: Marriage;
  // ★ 学历与专业（高考后设置，求职/晋升/结局挂钩）
  education?: EducationLevel;   // 'dazhuan'|'erben'|'yiben'|'211'|'985'|'overseas'
  major?: Major;                // 大学专业，决定求职岗位池
  // ★ 结局五线积分（每个选择加分，决定结局）
  scores: Scores;
  // 辅助状态（保留 flag 机制）
  flags: Set<string>;      // foreshadow_* / twist_* / achievement_* / choice_* / crisis_*
  history: string[];       // 事件 ID 去重列表
  nextEvent?: string;      // 招牌链强制下一年触发
  meta: {
    seed: number;
    playthrough: number;
    carryover?: CarryingKind;
    prevWealthTier?: 'rich' | 'mid' | 'poor';  // 上一世经济档位（跨周目传承家境）
  };
}

// ============ 事件 / 选项 / 结果 ============
// text/result/label 都支持函数形式，可根据玩家状态动态生成文案，
// 从而消灭"回老家还请假"这类事件与状态不符的逻辑 bug。
export interface Outcome {
  weight: number;
  condition: Condition;
  apply: (s: GameState) => void;
  result: string | ((s: GameState) => string);
  nextEvent?: string;
}

export interface Choice {
  label: string | ((s: GameState) => string);
  hint?: string;
  visibleWhen?: Condition;
  outcomes: Outcome[];
}

export interface GameEvent {
  id: string;
  stage: LifeStage | 'special';
  ageRange: [number, number];
  once?: boolean;
  trigger: {
    baseWeight: number;
    requires?: Condition[];
    excludes?: string[];
  };
  text: string | ((s: GameState) => string);
  choices: Choice[];
}

export interface Ending {
  id: string;
  priority: number;
  condition: (s: GameState) => boolean;
  title: string;
  desc: (s: GameState) => string;
  rating: (s: GameState) => Rating;
}
