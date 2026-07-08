# 人生模拟器游戏 · MVP 设计文档 V2

> 本文档基于早期构想 V1（`2026-07-07-life-simulator-design-v1.md`）经过现实校准与机制深化，是开发前的最终设计基线。
> V1 中的"完整版愿景"作为长期路线图保留，本文档只锁定 MVP 范围。

- **文档日期**：2026-07-07
- **目标读者**：开发者（单人）+ 未来协作者
- **状态**：待最终评审 → 通过后进入实现计划阶段

---

## 0. 项目背景与现实约束

| 维度 | 现状 |
|---|---|
| 开发者规模 | 单人 |
| 投入模式 | 业余时间 |
| MVP 周期目标 | 3-6 个月 |
| 平台优先级 | PC 网页（横屏） |
| 技术能力 | 全栈自学，熟悉 TS/Vue 等 |

**这些约束直接决定了下面的所有取舍：内容深度 > 内容广度；核心机制可玩 > 功能数量；纯前端落地 > 后端运维。**

---

## 1. MVP 范围

### 1.1 范围内（In Scope）

| 模块 | MVP 实现 |
|---|---|
| 时间跨度 | 1 岁 → 去世，5 个人生阶段全覆盖 |
| 事件总量 | ~30 个（20 流程保底 + 10 招牌链事件） |
| 招牌事件链 | 2-3 条深度打磨（首发 2 条） |
| 结局 | 8 种（含招牌链结局） |
| 单局时长 | 25-35 分钟 |
| 存档 | localStorage 单槽 + 自动保存 |
| NG+ | 简化版（4 选 1 继承） |
| 美术 | emoji + 排版 + 极少量关键插图 |
| UI | 横屏单页应用，PC 优先 |

### 1.2 范围外（Out of Scope · 后续版本再考虑）

- 后端服务（Node/Express/MySQL）
- 用户系统、云存档、排行榜
- 商业化（广告、DLC、付费内容）
- 社交（好友对比、分享海报——保留最简版结局截图导出可选）
- 事件编辑器（自研 Web 工具）
- 完整像素美术 + 动画
- 二周目完整继承

> 这些不是"永远不做"，而是 MVP 阶段不做。先证明核心玩法好玩，再决定哪些回来加。

---

## 2. 核心机制：出乎意料（Twist System）

这是全游戏的灵魂。**游戏的所有内容创作都围绕这个机制展开。**

### 2.1 设计哲学

> **意料之外，情理之中。**

- 表面：选择 A → 应得 B
- 实际：选择 A → 反转 C
- C 在荒诞背后必须有**讽刺内核**（如"摸鱼写小说爆火"讽刺"内卷无用论"）
- C 必须有**铺垫回响**（哪怕玩家当时没注意，回头看至少有一条线索）

**反例（烂反转）**：玩家选"努力加班"，结果"被外星人绑架" —— 纯随机，玩家会觉得被坑。

### 2.2 三层结果机制

每个关键选择的 choice 下挂三种结果层：

| 层级 | 概率区间 | 触发方式 | 说明 |
|---|---|---|---|
| **常规层** | ~50-70% | 仅基础权重 | 符合直觉的预期结果 |
| **反转层** | ~20-30% | 当前属性门控 | 讽刺内核的反转 |
| **罕见反转层** | ~5-10% | 属性 + 铺垫标志双门控 | 脑洞结局，重玩奖励 |

> 概率为示例，**实际权重在 playtest 阶段调整**。

### 2.3 铺垫回响（Foreshadowing）

- 每条招牌反转链至少有 **1 个铺垫事件**挂在人生早期某处
- 铺垫事件成本极低（1-2 行文字 + 设置一个 flag）
- 细心玩家看到 → 触发反转时有"果然如此"的回响
- 粗心玩家没看到 → 触发反转时有"卧槽没想到"的惊喜
- **两种体验都公平**

### 2.4 模板示例：加班猝死穿越链

**铺垫事件**（大学期）：
```typescript
{
  id: 'foreshadow_dream_gaokao',
  stage: 'college', ageRange: [19, 22],
  trigger: { baseWeight: 5 },
  text: '你做了一个梦，梦里又回到了高考考场，笔尖发抖，却奇怪地看懂了所有题……醒来只剩恍惚。',
  choices: [{ label: '继续', outcomes: [{
    weight: 100,
    apply: (s) => s.flags.add('foreshadow_dream_gaokao'),
    result: '梦境消散。',
  }]}],
}
```

**触发事件**（职场期）：
```typescript
{
  id: 'career_overwork_critical',
  stage: 'career', ageRange: [25, 45], once: true,
  trigger: { baseWeight: 10, requires: [{ flag: 'milestone_has_job' }] },
  text: '老板让你通宵赶项目。你已经连续加班三周了，心跳有点奇怪。',
  choices: [{
    label: '努力加班，证明自己',
    outcomes: [
      { // 常规
        weight: 50,
        condition: { attrGte: { 体质: 30 } },
        apply: (s) => { s.财富 += 5000; s.技能.硬 += 2; s.体质 -= 5; },
        result: '项目成功，你升为组长。',
      },
      { // 反转
        weight: 30,
        condition: { attrLt: { 体质: 30 } },
        apply: (s) => s.flags.add('twist_sudden_death_reborn'),
        nextEvent: 'ending_reborn_as_gaokao',
        result: '你眼前一黑……再睁眼，竟回到了高考考场，手里还握着笔。',
      },
      { // 罕见反转
        weight: 10,
        condition: { all: [
          { attrLt: { 体质: 30 } },
          { flag: 'foreshadow_dream_gaokao' },
        ]},
        apply: (s) => s.flags.add('twist_underworld_hr'),
        nextEvent: 'ending_underworld_hr',
        result: '你猝死了。地府面试官翻看你的简历，缓缓点头：「PPT 做得不错」。',
      },
    ],
  }/* 其他选项略 */],
}
```

---

## 3. 事件系统架构

### 3.1 分层设计

```
┌─────────────────┐   ┌──────────────┐   ┌─────────────────┐
│  内容层 Content  │ → │  引擎 Engine  │ → │  状态 State      │
│ (事件/结局/铺垫) │   │ (触发/判定/UI)│   │ (属性/标志/历史) │
└─────────────────┘   └──────────────┘   └─────────────────┘
       数据                  流程                数据
```

- **内容层**：只声明"我是什么、何时触发、如何改状态"
- **引擎层**：只负责调度与判定，不持有业务数据
- **状态层**：只记录，不含逻辑
- 三块通过明确接口通信，可独立测试与迭代

### 3.2 核心数据结构

#### 3.2.1 事件（GameEvent）

```typescript
interface GameEvent {
  id: string;                    // 全局唯一，命名按阶段_主题
  stage: 'childhood'|'school'|'college'|'career'|'retirement'|'special';
  ageRange: [number, number];    // 触发年龄区间
  once?: boolean;                // 是否只能触发一次（默认 false）

  trigger: {
    baseWeight: number;          // 基础权重
    requires?: Condition[];      // 硬前置（必须全满足）
    excludes?: string[];         // 已触发这些 ID 则不出现
  };

  text: string;                  // 事件文本（支持简单模板插值）

  choices: Choice[];
}

interface Choice {
  label: string;                 // 选项按钮文字
  hint?: string;                 // 选项提示（如"需要 智力≥60"）
  visibleWhen?: Condition;       // 选项可见条件（隐藏选项机制）
  outcomes: Outcome[];
}

interface Outcome {
  weight: number;                // 加权随机的权重
  condition: Condition;          // 必须满足才进入候选
  apply: (s: GameState) => void; // 状态变更
  result: string;                // 结果文本
  nextEvent?: string;            // 链式跳转：指向下个事件 ID，
                                  //   或 ending_* ID 直接进入结局判定
}

type Condition =
  | { flag: string }
  | { notFlag: string }
  | { attrGte: Partial<Record<AttrKey, number>> }
  | { attrLt: Partial<Record<AttrKey, number>> }
  | { all: Condition[] }
  | { any: Condition[] };
```

#### 3.2.2 状态（GameState）

```typescript
interface GameState {
  age: number;
  stage: LifeStage;

  attrs: Record<'智力'|'魅力'|'体质'|'运气'|'财富'|'快乐', number>;

  skills: Record<'硬'|'软'|'摸', number>;

  flags: Set<string>;            // 见下方命名规范
  history: string[];             // 已触发事件 ID
  nextEvent?: string;            // 强制下个事件（链式跳转）

  meta: {
    seed: number;
    playthrough: number;         // 第几周目
    carryover?: CarryingKind;    // NG+ 继承项
  };
}

type CarryingKind = 'intelligence'|'soft'|'slacker'|'memory';
```

#### 3.2.3 结局（Ending）

```typescript
interface Ending {
  id: string;
  priority: number;              // 数字大优先（首个匹配胜出）
  condition: (s: GameState) => boolean;
  title: string;
  desc: (s: GameState) => string; // 动态文案
  rating: (s: GameState) => 'S'|'A'|'B'|'C'|'D';
}
```

### 3.3 Flag 命名规范（防冲突）

| 前缀 | 用途 | 示例 |
|---|---|---|
| `foreshadow_*` | 铺垫事件标志 | `foreshadow_dream_gaokao` |
| `twist_*` | 反转已触发 | `twist_sudden_death_reborn` |
| `milestone_*` | 人生节点 | `milestone_has_job` / `milestone_married` |
| `choice_*` | 重要选择记录 | `choice_first_job_tech` |
| `achievement_*` | 成就（影响评分） | `achievement_first_promotion` |
| `crisis_*` | 阈值事件已触发（防重） | `crisis_low_happiness_fired` |

### 3.4 引擎主循环

```
每回合（= 1 年）：
1. age++；检查阶段切换
2. 决定本年事件数量：
   - 若 state.nextEvent 存在 → 强制触发该事件（招牌链模式，本年只此一件）
   - 否则：按 ageRange/stage 期望密度抽 0-3 个事件
     · 多数年份 0-1 个（"平静年"，显示一句过渡文案）
     · 关键节点年份 2-3 个
2'. 逐个执行事件：
   a. 渲染 text + choices（隐藏选项需 visibleWhen 求值）
   b. 玩家选一个 choice
   c. 筛出该 choice 下 condition 匹配的 outcomes
   d. 在匹配项中按 weight 加权随机
   e. 执行 apply（改状态）+ 显示 result
   f. 若 outcome.nextEvent 存在 → 写入 state.nextEvent
3. 阈值事件检测（见 §5）：
   - 扫描 state 是否有属性跨过阈值且对应 flag 未设
   - 若有，将其作为额外事件追加到本年事件队列末尾
   - 玩家在同年内依次处理完所有事件
4. 年度结算（财富 +/-、体质随年龄衰减等隐式变化）
5. 死亡检测（age≥终寿 / 体质≤0 / nextEvent 指向 ending_*）
6. 死亡 → 结局判定（§6）
7. 自动存档
```

### 3.5 内容格式：TypeScript 原生对象

**决策**：事件直接写为带类型的 TS 文件，`condition` / `apply` 用函数表达。

**理由**：
1. 单人程序员，TS 给的反馈循环最快（编译期抓错）
2. 函数式 condition/apply 表达力最强，写复杂反转毫无压力
3. MVP 砍掉事件编辑器，无理由提前为 DSL 付设计成本
4. 未来若做编辑器，可从 TS 反推 JSON schema——那是后话

**灵活性预留**：condition DSL 化（`{attrLt:{体质:30}}` 这种声明式）在 Outcome 层已经用了，函数式只在 apply。这意味着如果想把整个事件抽出为 JSON，只需替换 condition DSL 解释器和把 apply 改为 effect DSL——成本可控。

---

## 4. 属性模型

### 4.1 9 个核心数值

**6 基础属性**：

| 属性 | 影响 |
|---|---|
| 智力 | 学业、职场表现、特殊选项解锁 |
| 魅力 | 人际关系、恋爱 |
| 体质 | 健康、寿命、加班承受力 |
| 运气 | 随机事件质量 |
| 财富 | 消费、投资机会 |
| 快乐 | 心理健康，影响阈值事件触发 |

**3 技能维度**（原 5 维合并）：

| 技能 | 合并来源 | 含义 |
|---|---|---|
| 硬 | 编程 + PPT | 技术 / 专业 / 执行力 |
| 软 | 沟通 + 管理 | 人际 / 领导力 / 表达 |
| 摸 | 摸鱼 | 整活 / 副业 / 反向能力 |

### 4.2 2 派生属性（不存为数值，需要时计算）

| 派生 | 公式 | 用途 |
|---|---|---|
| 人脉 | 软技能 + 相关 flags 数 × 5 | 跳槽、创业判定 |
| 声望 | 成就 flags 数 × 10 + 阶段成就加成 | 行业事件解锁 |

### 4.3 数值边界

- 所有属性：**0 ~ 100**（地板防死亡螺旋，天花板防膨胀）
- 年度自然变化：体质在 35 岁后每年 -1，其他属性无自然衰减
- 初始值：全部 30~50 随机（按种子）

### 4.4 职业路径映射（验证 3 技能够用）

| 高属性 | 解锁路径 |
|---|---|
| 硬 | 技术专家 / 程序员大佬 |
| 软 | 管理 / 销售 / 公关 |
| 摸 | 自由职业 / 网红 / 作家（招牌链挂钩） |
| 全低 | 平凡打工人 |
| 全高 | 人生赢家 |

---

## 5. 阈值分支系统（替代死亡螺旋）

### 5.1 设计哲学

> **玩家在关键阈值处必须有选择权，游戏不替玩家做选择。**

不是"低谷救场"，也不是"高光奖励"——而是在每个关键节点提供分支，让玩家选。

### 5.2 触发规则

| 触发条件 | 事件类型 | 频率 |
|---|---|---|
| 任何属性 < 低端阈值（如快乐<20） | **危机事件** | 每种属性一次性（flag 防重） |
| 关键属性组合 > 高端阈值（如快乐+财富>150） | **巅峰事件** | 一次性 |
| 40-50 岁首次 | **中年危机** | 强制一次 |

### 5.3 设计模板

每个阈值事件必须满足：
- 提供 3-4 个选项
- 至少 1 个选项能"回到正常轨道"
- 至少 1 个选项能"走向另一极端"（继续恶化 / 持续辉煌 / 脑洞分支）
- 高智力 / 高财富等条件可解锁额外选项

**危机事件示例**（快乐 < 20）：
```
A. 找朋友倾诉     → 快乐+15，财富-500           [回归正常]
B. 借酒消愁       → 快乐-5，体质-10              [玩家自找的恶化]
C. 化悲愤为动力   → 快乐-5，财富+3000            [以痛换钱]
D.（智力≥60）顿悟 → 进入"出家线"                [脑洞分支]
```

**巅峰事件示例**（快乐+财富 > 150）：
```
A. 继续冲刺，野心不止 → 解锁"商业帝国"结局路径   [走向辉煌]
B. 知足常乐，享受生活 → 锁定"幸福结局"           [平稳落地]
C. 突然感到空虚     → 触发"早发中年危机"线       [高→低反转]
```

**中年危机**（40-50 强制）：
```
A. 事业巅峰，危机解除       [需要事业属性达标]
B. 辞职创业，重新出发       [高风险高回报]
C. 顿悟出家                 [脑洞结局]
D. 摆烂到底                 [滑向低谷结局]
```

### 5.4 反 doom loop 验证

| 场景 | 旧设计（自动 doom） | 新设计（分支） |
|---|---|---|
| 快乐跌到 15 | 自动触发抑郁，快乐每回合-5 | 触发一次危机事件，玩家选自救 / 恶化 / 分支 |
| 体质跌到 10 | 自动生病，体质继续衰减 | 触发一次健康警告事件，玩家选住院 / 硬扛 / 求助 |
| 失业 + 低快乐 | 自动摆烂线，每回合快乐-5 | 触发危机事件，玩家选求职 / 创业 / 出家 / 摆烂 |

---

## 6. 结局与评分系统

### 6.1 MVP 结局清单（8 个）

按优先级从高到低排列（**首个匹配胜出**）：

| # | 结局名 | 类型 | priority | 触发条件 |
|---|---|---|---|---|
| 1 | 冥界 HR | 招牌链罕见 | 100 | `flags.has('twist_underworld_hr')` |
| 2 | 穿越重活 | 招牌链 | 90 | `flags.has('twist_sudden_death_reborn')` |
| 3 | 摸鱼作家爆火 | 招牌链 | 90 | `flags.has('twist_slacker_author')` |
| 4 | 顿悟出家 | 隐藏 | 70 | `flags.has('choice_midlife_monk')` |
| 5 | 富豪 | 常规 | 50 | 财富≥85 ∧ 软技能≥60 |
| 6 | 幸福家庭 | 常规 | 50 | 快乐≥70 ∧ `flags.has('milestone_family')` |
| 7 | 早逝 | 常规 | 40 | 死亡年龄 < 50 |
| 8 | 平凡打工人 | 兜底 | 0 | 无条件 |

> 后续版本扩充到 30+ 结局，结构不变。

### 6.2 结局判定算法

```typescript
function resolveEnding(state: GameState): Ending {
  const sorted = ENDINGS.slice().sort((a, b) => b.priority - a.priority);
  for (const ending of sorted) {
    if (ending.condition(state)) return ending;
  }
  return DEFAULT_ENDING;  // 平凡打工人
}
```

### 6.3 评分系统（与结局解耦）

**结局 ≠ 评分**：
- 结局 = 你最后变成了什么样的人（叙事）
- 评分 = 你这一生活得怎么样（数值）

例：触发「冥界 HR」结局的玩家可能因早逝评分只有 D，但结局本身很罕见很有趣——这才是反转的趣味。

```typescript
function calcRating(s: GameState): Rating {
  const attrAvg = (智力+魅力+体质+运气+财富+快乐+硬+软+摸) / 9;
  const lifespanScore = (s.age - 1) / 80 * 100;
  const achievementBonus = countFlags(s.flags, /^achievement_/) * 5;
  const chainBonus = countFlags(s.flags, /^twist_/) * 10;

  const score = attrAvg * 0.6
              + lifespanScore * 0.15
              + achievementBonus * 0.15
              + chainBonus * 0.1;

  if (score >= 85) return 'S';
  if (score >= 70) return 'A';
  if (score >= 55) return 'B';
  if (score >= 40) return 'C';
  return 'D';
}
```

> 权重为占位值，playtest 阶段调整。

---

## 7. 二周目（NG+）简化版

### 7.1 触发

通关结局页弹窗：「是否以 [继承项] 开始二周目？」

### 7.2 4 种继承选项（任选其一）

| 继承项 | 效果 |
|---|---|
| 智力 +15 | 起手属性优势 |
| 软技能 +15 | 起手属性优势 |
| 摸鱼 +15 | 起手属性优势 |
| **前世记忆** ⭐ | 解锁部分事件的"额外选项"（带「你隐约记得…」前缀），罕见反转触发概率 +5% |

### 7.3 实现方式

- 通关时把继承项存入 `localStorage` 的 `lastPlaythrough` 字段
- 新游戏开始时读取，应用到 `meta.carryover`
- 「前世记忆」通过 `state.flags.add('ng_plus_memory')` 实现
- MVP 阶段只在 **2-3 个关键事件**挂载记忆选项，工作量可控
- 罕见反转概率加成在引擎 outcome 加权时统一处理（`weight *= 1.05`）

---

## 8. 体验曲线

### 8.1 事件密度（按阶段）

| 阶段 | 年龄 | 年数 | 事件数 | 节奏 |
|---|---|---|---|---|
| 幼儿期 | 1-6 | 6 | 3-4 | 快速跳过，立人设（家庭/天赋种子） |
| 学龄期 | 7-18 | 12 | 5-6 | 中速，铺垫事件多发期 |
| 大学期 | 19-22 | 4 | 4-5 | 中密，关键选择 + 铺垫事件 |
| 职场期 | 23-60 | 38 | 12-15 | **核心**，招牌链集中 |
| 退休期 | 61-80 | 20 | 3-4 | 慢节奏，回响与彩蛋 |

### 8.2 回合结构

- **1 回合 = 1 年**（统一）
- 没有事件的年份 → 显示"这一年平静地过去了" + 属性自然微变
- 玩家**手动点击「下一年」**推进，不自动播放
- 不做快进/自动模式（MVP 不值工）

### 8.3 死亡条件

- 自然死亡：age ≥ 终寿（基础 75，受体质/运气影响 ±15）
- 非自然：体质 ≤ 0、招牌链直接跳转结局、特殊 flag 触发

---

## 9. 存档系统

- **单存档槽** + 自动保存到 localStorage
- 关键节点（每回合结束、结局触发）自动写入
- 提供「重置存档」按钮（开始新游戏）
- 不做：多存档、云存档、读档回滚

### 9.1 存档结构

```typescript
interface SaveData {
  version: string;               // 存档版本号，用于后续迁移
  state: GameState;
  unlockedEndings: string[];     // 已解锁结局 ID（成就用）
  totalPlaythroughs: number;
  lastCarryover?: CarryingKind;  // NG+ 继承项
}
```

---

## 10. UI 与交互

### 10.1 主界面布局（横屏）

```
┌─────────────────────────────────────────────────┐
│  25岁 · 职场期                  [菜单] [设置]    │  顶栏
├──────────────┬──────────────────────────────────┤
│              │                                  │
│  [属性面板]   │   事件文本区域                    │
│              │                                  │
│  智力 ██████  │   "老板让你通宵赶项目……"          │
│  魅力 ████    │                                  │
│  体质 ██      │   [选项1]                        │
│  ...         │   [选项2]                        │
│              │   [选项3]                        │
│  快乐 ▓▓▓▓   │                                  │
│              │                                  │
├──────────────┴──────────────────────────────────┤
│  [事件历史 ▼]              [下一年 →]            │  底栏
└─────────────────────────────────────────────────┘
```

- 左：属性面板（9 个核心数值，派生属性可折叠）
- 中：事件文本 + 选项卡片
- 底：「下一年」主按钮 + 历史回看

### 10.2 美术风格

- **主风格**：emoji + 文字排版为主，关键节点（招牌链触发、结局）加 1 张插图
- **配色**：职场冷色调（灰、蓝）+ 脑洞事件暖色调（红、黄）
- **动画**：CSS transition 即可，关键节点（如升职撒金币、猝死屏幕碎裂）用 emoji + CSS 动画低成本实现
- **字体**：等宽中文字体，保证阅读舒适

### 10.3 关键界面清单

| 界面 | 说明 |
|---|---|
| 主游戏界面 | 上图 |
| 开始界面 | 「开始新人生」/「继续」/「二周目」 |
| 结局界面 | 结局名 + 文案 + 评分 + 解锁的结局列表 |
| 设置界面 | 音效开关、文字速度（MVP 可选） |
| 历史回看 | 浏览过往事件文本（折叠面板） |

---

## 11. 技术栈

| 层 | 选型 | 理由 |
|---|---|---|
| 框架 | Vue 3 + Vite | 响应式天然适合状态展示，生态成熟 |
| 语言 | TypeScript | 单人开发的反馈循环保障 |
| 状态管理 | Pinia | Vue 官方推荐，轻量 |
| 样式 | 原生 CSS 或 UnoCSS | 按开发者偏好 |
| 路由 | 不需要 | 单页应用 |
| 测试 | Vitest | 引擎层做单元测试，UI 不做 |
| 部署 | 静态资源 CDN（Vercel/Netlify） | 一键部署，免费额度够 |

---

## 12. 文件结构

```
src/
├── content/                    ← 内容层（事件/结局/铺垫）
│   ├── childhood/
│   │   ├── _index.ts           ← 该阶段所有事件导出
│   │   └── *.ts                ← 每个事件一个文件
│   ├── school/
│   ├── college/
│   │   └── dream-gaokao.ts     ← 铺垫事件
│   ├── career/
│   │   └── overwork-critical.ts
│   ├── retirement/
│   ├── chains/                 ← 招牌链（跨阶段）
│   │   ├── reborn-as-gaokao.ts
│   │   └── slacker-author.ts
│   ├── thresholds/             ← 阈值分支事件
│   │   ├── crisis-low-happiness.ts
│   │   ├── peak-high-wealth.ts
│   │   └── midlife-crisis.ts
│   └── endings/
│       └── *.ts
├── engine/                     ← 引擎层（写一次基本不动）
│   ├── types.ts                ← GameEvent/GameState/Ending 类型
│   ├── trigger.ts              ← 事件筛选与抽取
│   ├── outcome.ts              ← condition 求值 + outcome 加权
│   ├── state.ts                ← 状态机/存档
│   ├── ending.ts               ← 结局判定
│   └── rating.ts               ← 评分计算
├── ui/                         ← 界面层
│   ├── App.vue
│   ├── views/
│   │   ├── GameView.vue
│   │   ├── StartView.vue
│   │   ├── EndingView.vue
│   │   └── SettingsView.vue
│   └── components/
│       ├── AttrPanel.vue
│       ├── EventCard.vue
│       └── ChoiceButton.vue
├── stores/
│   └── game.ts                 ← Pinia store
├── utils/
│   ├── random.ts               ← 种子随机数（保证可复现）
│   └── save.ts                 ← localStorage 封装
└── main.ts
```

---

## 13. 招牌事件链（首发 2 条）

### 13.1 加班猝死 → 穿越回高考 / 冥界 HR

- **铺垫**：大学期"高考梦"事件 → flag `foreshadow_dream_gaokao`
- **触发**：职场期"通宵加班"关键节点（ageRange 25-45）
- **三层结果**：
  - 常规：升职加薪（体质尚可）
  - 反转：猝死 → 触发"穿越重活"结局（nextEvent 指向结局，叙事描述"你带着记忆回到了高考考场……"）
  - 罕见反转：猝死 → 触发"冥界 HR"结局（体质<30 + 有铺垫）
- **配套结局**：穿越重活 / 冥界 HR
- **MVP 不实现**：真正的"重活一遍"玩法段落（即穿越后重新玩 18-30 岁）。MVP 用结局文案带过；未来版本可考虑实现真正的"穿越 mini 线"作为高价值特性。

### 13.2 摸鱼写小说 → 爆火作家

- **铺垫**：学龄期"偷看闲书"事件 → flag `foreshadow_writer_dream`
- **触发**：职场期"摸鱼时间"随机事件
- **三层结果**：
  - 常规：摸鱼被批评，声望-5
  - 反转：摸鱼写的小说小爆，副业月入 2k
  - 罕见反转：小说成 IP，全职作家，财富+80
- **配套结局**：摸鱼作家爆火

> 第 3 条招牌链在 MVP 后期视工时增加，候选：
> - 投资加密货币暴富/破产
> - 被外星人绑架成星际 HR
> - 团建漂流荒岛发现石油

---

## 14. 开放问题（设计阶段不需解决，但开发时要注意）

| 问题 | 备注 |
|---|---|
| 平衡性数值（事件权重、属性初始值、阈值） | 留到 playtest 调 |
| 种子随机数实现（哪种算法） | 实现 engine/random.ts 时定 |
| 罕见反转概率是否对玩家可见 | UI 设计时定，建议不显示（保留神秘感） |
| 历史回看的呈现形式 | UI 设计阶段定 |
| 文字模板插值语法（`{player.name}` 等） | 实现内容加载时定 |

---

## 15. 后续版本路线（不在 MVP 内）

按优先级排序，MVP 上线后根据反馈决定：

1. **内容扩充**：事件数从 30 → 100+，结局从 8 → 30+
2. **第 3-5 条招牌链**
3. **结局分享海报**（静态图片导出，1 天工作量）
4. **完整二周目**（多继承项）
5. **后端 + 排行榜**
6. **事件编辑器**
7. **像素美术升级**
8. **商业化（去广告付费 / DLC）**

---

## 附录 A：与 V1 的差异说明

| V1 设想 | V2 调整 | 理由 |
|---|---|---|
| 后端 + MySQL | 砍，纯前端 + localStorage | 单人业余无运维必要 |
| 100+ 结局 | MVP 8 个 | 内容是单人业余最大成本 |
| 200+ 事件 | MVP ~30 个 | 同上 |
| 完整像素美术 + 动画 | emoji + 排版 | 美术是最大坑 |
| 事件编辑器 | 直接写 TS | 编辑器是给非程序员的，自己就是程序员 |
| 自研反转系统（含蝴蝶效应） | 保留并机制化（§2） | 核心卖点 |
| 13 个属性维度 | 9 维 + 2 派生 | 减负，便于平衡 |
| 死亡螺旋（低快乐触发抑郁） | 阈值分支事件（§5） | 防 doom loop，提升玩家 agency |
| 完整二周目 | 简化版 4 选 1 | MVP 工时不够 |

---

## 附录 B：术语表

| 术语 | 定义 |
|---|---|
| 招牌链 | 深度打磨的事件链，是游戏卖点，2-3 条/版本 |
| 铺垫事件 | 早期设置的 1-2 行小事件，给罕见反转埋伏笔 |
| 阈值事件 | 属性跨过阈值时触发的分支事件（危机/巅峰/中年危机） |
| Flag | GameState 中的字符串标记，用于记录发生过的事件 |
| Outcome | 玩家选择后的具体结果（一个 choice 下有多个 outcome 加权随机） |
| Condition | 声明式条件，用于 outcome 是否进入候选池 |
| NG+ / 二周目 | 通关后继承部分内容开始新游戏 |

---

**文档结束。请审阅后给出反馈，确认进入实现计划阶段。**
