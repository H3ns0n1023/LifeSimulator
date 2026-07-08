# HANDOFF.md — 人生模拟器项目交接文档

> 给下一个会话/AI 的快速上下文。读这一份就能接手开发，不用翻整个对话历史。
> **最后更新**: 2026-07-08

---

## 一、项目一句话

一个 Vue 3 + TypeScript 的人生模拟器文字游戏。玩家从 1 岁活到老死，每年做选择，选择通过"事件链 + 状态机 + 五线积分"驱动结局。**核心设计哲学：选择有长期后果，前后呼应。**

- **线上地址**: https://h3ns0n1023.github.io/LifeSimulator/
- **代码仓库**: https://github.com/H3ns0n1023/LifeSimulator （公开）
- **本地路径**: `E:\开发\模拟人生\LifeIsStrange`

---

## 二、技术栈 & 规模

| 项 | 值 |
|---|---|
| 框架 | Vue 3.4 + TypeScript 5.4 + Vite 5.2 |
| 状态 | Pinia |
| 测试 | Vitest（**109 个用例，9 个文件，全绿**） |
| 内容规模 | **69 个事件 + 16 个结局** |
| 源码文件 | 47 个 `.ts`/`.vue` |
| 部署 | GitHub Actions → GitHub Pages（push main 自动部署） |

---

## 三、核心数据模型（务必先理解）

游戏状态在 `src/engine/types.ts` 的 `GameState`。**没有旧的 6 属性体系了**（已重构掉），现在是：

```typescript
interface GameState {
  age: number;
  stage: LifeStage;            // childhood|school|college|career|retirement
  salary: number;              // ★ 月薪（唯一数字指标，元）
  health: HealthStage;         // ★ 健康五档枚举（非数字！）
  diseases: Set<string>;       // 病症标签（fatty_liver/hypertension/depression/cancer...）
  employment: Employment;      // ★ 就业状态机
  marriage: Marriage;          // ★ 婚姻状态机
  scores: Scores;              // ★ 五线结局积分
  flags: Set<string>;          // 辅助状态（foreshadow_*/twist_*/choice_*/achievement_*...）
  history: string[];           // 事件 ID 去重列表
  nextEvent?: string;          // 招牌链强制下一年触发
  meta: { seed, playthrough, carryover? };
}

type HealthStage = 'healthy' | 'subhealthy' | 'mild' | 'severe' | 'critical';
type Employment = 'student' | 'employed' | 'unemployed' | 'selfEmployed' | 'retired' | 'monk' | 'deceased';
type Marriage = 'single' | 'dating' | 'married' | 'divorced' | 'widowed';
type EndingTrack = 'career' | 'family' | 'freedom' | 'fame' | 'spirit';
```

### 动态文案（重要）
`Outcome.result` / `Choice.label` / `GameEvent.text` 都支持 **`string | ((s: GameState) => string)`**。写成函数时，显示会传入当前 state 求值——这样文案能"知道"玩家经历了什么，消灭"回老家还请假"这类逻辑矛盾。**新写事件时，凡涉及就业/婚姻/历史的文案，优先用函数形式。**

---

## 四、架构（三层分离，严格遵守）

```
src/
├── engine/          引擎层（纯函数，无业务数据，无 Vue 依赖）
│   ├── types.ts         所有类型定义
│   ├── constants.ts     健康档位/状态机转换表/薪资机制/评分权重
│   ├── status.ts        ★ 状态机受控函数（worsenHealth/transitionEmployment/applyYearlySalary...）
│   ├── condition.ts     Condition DSL 求值
│   ├── loop.ts          主循环（selectEventsForYear/applyYearlyTick/checkDeath/applyOutcomeToState）
│   ├── trigger.ts       事件过滤（filterEligible）
│   ├── outcome.ts       outcome 加权抽样（resolveChoice）
│   ├── ending.ts        结局判定（priority 降序 + 首个匹配）
│   ├── rating.ts        评分（calcRating）
│   └── rng.ts           种子随机（mulberry32）
├── content/         内容层（纯数据，无流程逻辑）
│   ├── _registry.ts     ★ 总注册表（ALL_EVENTS / ALL_ENDINGS / 内联结局）
│   ├── childhood/ school/ college/ career/ retirement/   各阶段 _index.ts
│   ├── chains/          招牌反转链（overwork-death/slacker-author/viral-short-video）
│   ├── thresholds/      阈值事件（baseWeight=0，由 detectThresholdEvents 检测）
│   └── endings/         结局文件（每个 Ending 一个文件）
├── stores/game.ts   Pinia store（编排：startYear/selectChoice/advanceYear/finalizeEnding）
├── components/      UI 组件（AttrPanel/EventCard/ChoiceButton/HistoryPanel）
├── views/           视图（Start/Game/Ending/Settings/Gallery）
└── utils/save.ts    存档（localStorage，flags+diseases 都是 Set 要转 array）
```

**铁律**：引擎层不能 import content；content 不能写流程逻辑（不能调 advanceYear）。`stores/game.ts` 是唯一编排层。

---

## 五、关键机制速查

### 事件触发（loop.ts）
- `selectEventsForYear`：若 `state.nextEvent` 有值 → 只触发它（招牌链）；否则对每个合格事件按 `baseWeight/10` 独立掷骰，最多 3 个/年。
- `filterEligible`（trigger.ts）：stage 匹配 + ageRange + once 去重 + excludes 反向 + requires（AND）。
- `detectThresholdEvents`：baseWeight=0 的事件，靠 `trigger.requires`（纯 DSL，无硬编码 if）检测，会追加到当年队列。

### 状态机（status.ts，防状态冲突的核心）
- `transitionEmployment(s, target)` / `transitionMarriage(s, target)`：查 `EMPLOYMENT_TRANSITIONS`/`MARRIAGE_TRANSITIONS` 表，**非法转换抛错**。所有改 employment/marriage 的地方必须走这俩函数，不能直接赋值。
- 合法转换表在 `constants.ts`。例如 `student` 只能去 `employed/unemployed/selfEmployed`，不能直接变 `retired`。

### 薪资（status.ts 的 applyYearlySalary，由 applyYearlyTick 每年调）
- employed：70% 普调 +5%，15% 晋升 +15%，**35 岁后涨速减半**
- unemployed：积蓄每年 -15%
- selfEmployed：±20% 高方差波动 + 长期 +3%
- retired：退休金每年 +3%（退休瞬间月薪 ×40% 转退休金）
- 配置全在 `constants.ts` 的 `SALARY_*`

### 结局判定（ending.ts + _registry.ts）
- 按 `priority` 降序，首个 `condition(state)` 为真的胜出。必须有 `priority:0` 兜底。
- 招牌链结局 priority 75~100（基于 flag）；五线积分结局 40~50（基于 scores + topTrack）；兜底 0。

### Condition DSL（condition.ts，写事件 trigger.requires / outcome.condition 用）
支持：`flag`/`notFlag`/`salaryGte`/`salaryLt`/`healthIn`/`healthGte`/`disease`/`notDisease`/`employment`/`employmentIn`/`notEmployment`/`marriage`/`marriageIn`/`ageGte`/`ageLt`/`scoreGte`/`all`/`any`。`{all:[]}` 是 always-pass 哨兵。

---

## 六、写新事件的模板

```typescript
import type { GameEvent } from '../../engine/types';
import { addScore, adjustSalary, transitionEmployment, addDisease } from '../../engine/status';

export const myEvent: GameEvent = {
  id: 'career_my_event',                    // 命名: 阶段_主题
  stage: 'career', ageRange: [30, 40], once: true,
  trigger: {
    baseWeight: 5,                          // 0=阈值事件, 1-9=概率, 10=必触发
    requires: [{ employment: 'employed' }], // 前置条件（必须满足才可能触发）
    excludes: ['some_other_event'],         // 历史触发过这些就不再来
  },
  text: '事件描述',                          // 也可写成 (s) => '...' 动态文案
  choices: [
    {
      label: '选项 A',                       // 也可写成 (s) => '...'
      hint: '灰色提示（可选）',
      visibleWhen: { flag: 'xxx' },         // 满足才显示按钮（可选）
      outcomes: [
        // 多层 outcome：常规 / 反转 / 罕见反转，按 weight 加权抽
        {
          weight: 50,
          condition: { scoreGte: { career: 30 } },
          apply: (s) => { addScore(s, 'career', 10); adjustSalary(s, 3000); s.flags.add('choice_xxx'); },
          result: '结果描述',                // 也可写成 (s) => '...'
          nextEvent: 'ending_xxx',           // 跳转结局/下一事件（可选）
        },
        { weight: 50, condition: { all: [] }, apply: () => {}, result: '兜底结果' },
      ],
    },
  ],
};
```

### Flag 命名约定（必须遵守，影响评分）
- `foreshadow_*`：铺垫 flag（童年/学校埋下，后续事件 requires）
- `twist_*`：招牌反转 flag（每个 +10 评分，见 rating.ts）
- `achievement_*`：成就 flag（每个 +5 评分）
- `choice_*`：一次性选择标记（用于后续 visibleWhen/文案分支）
- `milestone_*`：人生里程碑（结婚/生子/买房/退休...）
- `skill_*`：习得技能（coding/debate/office_social...）
- `crisis_*_fired`：阈值事件去重标记

### 注册新事件
在 `src/content/_registry.ts` 的 `ALL_EVENTS` 数组里 import 并加入。新结局同理加到 `ALL_ENDINGS`。

---

## 七、常用命令

```bash
cd "E:/开发/模拟人生/LifeIsStrange"

npm test              # 跑全部 109 个测试（必须全绿才能推送）
npx vue-tsc --noEmit  # 类型检查（必须 0 错误）
npm run dev           # 本地开发服务器 http://localhost:5173/LifeSimulator/

# 部署（push 后 GitHub Actions 自动构建上线，约 1-2 分钟）
git add -A && git commit -m "说明" && git push
```

**验证标准**：推送前必须 `npm test` 全绿 + `vue-tsc` 0 错误。push 后去 https://github.com/H3ns0n1023/LifeSimulator/actions 看部署进度。

---

## 八、已实现的功能清单

### 核心机制
- ✅ 五档健康 + 病症标签（健康状态而非数字）
- ✅ 就业/婚姻状态机（非法转换抛错，防"失业又退休"冲突）
- ✅ 五线结局积分（career/family/freedom/fame/spirit，选择加分决定结局）
- ✅ 动态文案（result/text/label 支持函数，读状态生成文案）
- ✅ 年度薪资自动变动（普调/晋升/35岁打折/失业消耗/创业波动/退休金）
- ✅ Condition DSL（salaryGte/healthIn/employment/marriage/ageGte/scoreGte...）

### 内容
- ✅ 62 个流程事件（童年8/学校10/大学8/职场27/退休9）
- ✅ 3 条招牌反转链（神童伤仲永/留学移民/网红暴富）
- ✅ 4 个阈值事件（健康危机/抑郁/人生巅峰/中年危机）
- ✅ 16 个结局（招牌链9 + 五线积分6 + 兜底1）
- ✅ 跨阶段轨迹链（留守儿童/勇敢者/善良回响/独立早慧 等已激活）
- ✅ 孤儿 flag 已清理（每个选择都有后续呼应）

### UI
- ✅ 属性面板（月薪+健康+病症+就业/婚姻+五线进度条+薪资变动提示）
- ✅ 结局图鉴 GalleryView（已解锁/未解锁展示）
- ✅ NG+ 二周目（4 种继承：career/family/freedom/memory）
- ✅ 存档系统（localStorage，flags+diseases 序列化）

---

## 九、待优化 / 可深化方向（给新会话的灵感）

按优先级排序：

### 高价值
1. **开局出身选择** — StartView 加"选择天赋/家境"，让玩家能定制起手（如天赋异禀/家境优渥/平民子弟），影响后续。菜单感强。
2. **结局图鉴深化** — 加"解锁条件提示"（模糊暗示如何达成未解锁结局），鼓励多周目。
3. **职业路线分线** — 把职场做成互斥路线（大厂卷王/体制内/创业者/自由职业），每条有专属事件链。重玩性高。
4. **平衡性 playtest** — 五线积分阈值、薪资数值、健康转换概率都是占位值，需要实跑调整。当前 S 评级较难达成。

### 中价值
5. **结局人生轨迹图** — EndingView 加时间线/五线积分曲线可视化。
6. **更多招牌链** — 现有 3 条，可加"创业上市链""出家顿悟链""丁克晚年链"等。
7. **存档多槽位** — 当前单槽，可扩展多存档。
8. **音效/背景音乐** — 增强氛围。

### 低优先
9. **i18n 国际化** — 当前纯中文。
10. **移动端适配** — 现在桌面优先，手机能玩但未优化。
11. **成就系统** — 独立于结局的成就（如"活到 90 岁""五线全 ≥50"）。

---

## 十、已知的小问题（不影响玩，但可改）

1. **GitHub Actions 警告** — `deploy.yml` 用的 Node 20 已弃用，被强制用 Node 24 跑。功能正常但日志有警告。改 `actions/setup-node` 的 `node-version` 为 24 即可消除。
2. **`milestone_family` 命名歧义** — 它实际表示"有孩子"，但名字像"有家庭"。结婚设的是 `milestone_married`。重构时可改名 `milestone_has_child`。
3. **vite.config.ts 的 base** — 已改为 `/LifeSimulator/`，若以后改仓库名要同步改。
4. **history 只存事件 ID** — 不存结果文本。若想展示"选择历史"需扩展。

---

## 十一、约定 & 红线（不能破坏的契约）

- ✅ 三层分离：engine 不 import content；content 不写流程逻辑
- ✅ flags 必须是 Set（存档转 array）
- ✅ nextEvent 招牌链强制触发机制
- ✅ 结局 priority 降序 + priority:0 兜底
- ✅ Condition 的 `{all:[]}` 是 always-pass 哨兵
- ✅ 改 employment/marriage 必须走 transition 函数
- ✅ result/text/label 既支持 string 也支持函数（向后兼容）
- ✅ MVP 红线：无后端/云存档/JSON DSL/事件编辑器

---

## 十二、新会话开场建议

在新对话里，可以直接说：

> 这是人生模拟器项目，读一下 `E:\开发\模拟人生\LifeIsStrange\HANDOFF.md` 了解上下文。我想【你的需求】。

我会读完这份文档就进入状态，不用你重新解释。
