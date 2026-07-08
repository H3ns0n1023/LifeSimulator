# Life Simulator MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a playable life-simulator MVP (1 岁 → 去世, ~30 events, 8 endings, 2 招牌链, NG+) as a pure-frontend Vue 3 web app, in 3-6 months part-time.

**Architecture:** Three-layer separation — Content (TS event objects) → Engine (pure functions for trigger/outcome/ending) → State (Pinia store + localStorage). Engine is fully unit-tested; UI and content get lighter testing.

**Tech Stack:** Vue 3 (`<script setup>`) + Vite + TypeScript + Pinia (setup store) + Vitest. No router (single-page, view-state in store). No backend.

## Global Constraints

- All属性 0-100 整数（地板防 doom loop，天花板防膨胀）
- 体质在 35 岁后每年 -1（唯一自动衰减）
- Flag 命名前缀：`foreshadow_*` / `twist_*` / `milestone_*` / `choice_*` / `achievement_*` / `crisis_*`
- 评分权重 60/15/15/10（attrAvg/lifespan/achievement/twist）—— **占位值，写常量但放便于调整的位置**
- 事件权重、阈值（如快乐<20 触发危机）—— **同样占位，集中放在 constants 文件**
- 内容格式：TS 原生对象（不引入 JSON DSL）
- 不做：后端、云存档、事件编辑器、像素美术、完整二周目
- 1 回合 = 1 年；玩家手动点击「下一年」推进

**Reference spec:** `docs/specs/2026-07-07-life-simulator-design.md` (V2, authoritative)

---

## File Structure (locked)

```
src/
├── content/
│   ├── childhood/
│   │   └── _index.ts
│   ├── school/
│   │   └── _index.ts
│   ├── college/
│   │   └── _index.ts
│   ├── career/
│   │   └── _index.ts
│   ├── retirement/
│   │   └── _index.ts
│   ├── chains/           ← 招牌链
│   ├── thresholds/       ← 阈值事件
│   └── endings/
├── engine/
│   ├── types.ts
│   ├── constants.ts
│   ├── rng.ts
│   ├── condition.ts
│   ├── trigger.ts
│   ├── outcome.ts
│   ├── ending.ts
│   ├── rating.ts
│   └── loop.ts
├── stores/
│   └── game.ts
├── utils/
│   └── save.ts
├── views/
│   ├── StartView.vue
│   ├── GameView.vue
│   ├── EndingView.vue
│   └── SettingsView.vue
├── components/
│   ├── AttrPanel.vue
│   ├── EventCard.vue
│   ├── ChoiceButton.vue
│   └── HistoryPanel.vue
├── App.vue
├── main.ts
└── style.css
tests/
└── engine/
    ├── condition.test.ts
    ├── trigger.test.ts
    ├── outcome.test.ts
    ├── ending.test.ts
    ├── rating.test.ts
    └── loop.test.ts
```

---

# Phase 1: Foundation (Tasks 1-3)

## Task 1: Project Scaffolding

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `tsconfig.node.json`, `index.html`, `src/main.ts`, `src/App.vue`, `src/style.css`, `vitest.config.ts`
- Create: `.gitignore` (already exists, verify)

**Interfaces:** None (this is config only).

- [ ] **Step 1: Create package.json**

```json
{
  "name": "life-simulator",
  "private": true,
  "version": "0.0.1",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc -b && vite build",
    " "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

(Note: remove the stray space in `" "preview"` — should be `"preview"`.)

- [ ] **Step 2: Install dependencies**

Run: `npm install vue@^3.5 pinia@^3 && npm install -D vite@^6 @vitejs/plugin-vue@^6 typescript@^5.5 vue-tsc@^2 vitest@^2 @vue/test-utils@^2`
Expected: package.json updated, node_modules/ created.

- [ ] **Step 3: Create vite.config.ts**

```typescript
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
});
```

- [ ] **Step 4: Create vitest.config.ts**

```typescript
import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
});
```

- [ ] **Step 5: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "jsx": "preserve",
    "types": ["vitest/globals"],
    "skipLibCheck": true,
    "isolatedModules": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] }
  },
  "include": ["src/**/*", "tests/**/*"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

- [ ] **Step 6: Create tsconfig.node.json**

```json
{
  "compilerOptions": {
    "composite": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "skipLibCheck": true
  },
  "include": ["vite.config.ts", "vitest.config.ts"]
}
```

- [ ] **Step 7: Create index.html**

```html
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>人生模拟器</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

- [ ] **Step 8: Create src/main.ts**

```typescript
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import './style.css';

createApp(App).use(createPinia()).mount('#app');
```

- [ ] **Step 9: Create src/App.vue**

```vue
<script setup lang="ts"></script>

<template>
  <div class="app">
    <h1>人生模拟器</h1>
    <p>脚手架就绪</p>
  </div>
</template>
```

- [ ] **Step 10: Create src/style.css**

```css
* { box-sizing: border-box; }
body { margin: 0; font-family: -apple-system, "Microsoft YaHei", sans-serif; }
.app { padding: 2rem; max-width: 1200px; margin: 0 auto; }
```

- [ ] **Step 11: Verify dev server runs**

Run: `npm run dev`
Expected: Vite dev server starts at http://localhost:5173 showing "人生模拟器 / 脚手架就绪".

- [ ] **Step 12: Verify tests run (no tests yet)**

Run: `npm test`
Expected: "No test files found" or similar — Vitest runs without errors.

- [ ] **Step 13: Commit**

```bash
git add package.json package-lock.json vite.config.ts vitest.config.ts tsconfig.json tsconfig.node.json index.html src/
git commit -m "chore: scaffold Vue 3 + Vite + TS + Pinia + Vitest project"
```

---

## Task 2: Engine Types

**Files:**
- Create: `src/engine/types.ts`

**Interfaces:**
- Produces: `AttrKey`, `SkillKey`, `LifeStage`, `Condition`, `GameEvent`, `Choice`, `Outcome`, `GameState`, `Ending`, `Rating` — all type exports used by every later task.

- [ ] **Step 1: Create src/engine/types.ts with all core types**

```typescript
// src/engine/types.ts

export type AttrKey = '智力' | '魅力' | '体质' | '运气' | '财富' | '快乐';
export type SkillKey = '硬' | '软' | '摸';
export type LifeStage = 'childhood' | 'school' | 'college' | 'career' | 'retirement';
export type Rating = 'S' | 'A' | 'B' | 'C' | 'D';
export type CarryingKind = 'intelligence' | 'soft' | 'slacker' | 'memory';

export interface Attrs {
  智力: number;
  魅力: number;
  体质: number;
  运气: number;
  财富: number;
  快乐: number;
}

export interface Skills {
  硬: number;
  软: number;
  摸: number;
}

export type Condition =
  | { flag: string }
  | { notFlag: string }
  | { attrGte: Partial<Record<AttrKey, number>> }
  | { attrLt: Partial<Record<AttrKey, number>> }
  | { skillGte: Partial<Record<SkillKey, number>> }
  | { skillLt: Partial<Record<SkillKey, number>> }
  | { all: Condition[] }
  | { any: Condition[] };

export interface Outcome {
  weight: number;
  condition: Condition;
  apply: (s: GameState) => void;
  result: string;
  nextEvent?: string;
}

export interface Choice {
  label: string;
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
  text: string;
  choices: Choice[];
}

export interface GameState {
  age: number;
  stage: LifeStage;
  attrs: Attrs;
  skills: Skills;
  flags: Set<string>;
  history: string[];
  nextEvent?: string;
  meta: {
    seed: number;
    playthrough: number;
    carryover?: CarryingKind;
  };
}

export interface Ending {
  id: string;
  priority: number;
  condition: (s: GameState) => boolean;
  title: string;
  desc: (s: GameState) => string;
  rating: (s: GameState) => Rating;
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npx vue-tsc --noEmit`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/engine/types.ts
git commit -m "feat(engine): add core types (GameEvent/GameState/Ending/Condition)"
```

---

## Task 3: Engine Utilities + Constants + Fixtures

**Files:**
- Create: `src/engine/rng.ts`, `src/engine/constants.ts`, `tests/fixtures.ts`

**Interfaces:**
- Produces: `mulberry32()`, `pickWeighted()`, `initialState()`, `STAGE_BOUNDS`, `THRESHOLDS`, `RATING_WEIGHTS`, `sampleEvents`, `sampleState`.

- [ ] **Step 1: Create src/engine/rng.ts**

```typescript
// src/engine/rng.ts

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function pickWeighted<T>(items: ReadonlyArray<{ item: T; weight: number }>, rng: () => number): T | undefined {
  const total = items.reduce((sum, i) => sum + Math.max(0, i.weight), 0);
  if (total <= 0) return undefined;
  let r = rng() * total;
  for (const i of items) {
    r -= Math.max(0, i.weight);
    if (r <= 0) return i.item;
  }
  return items[items.length - 1]?.item;
}

export function randomInt(rng: () => number, min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}
```

- [ ] **Step 2: Create src/engine/constants.ts**

```typescript
// src/engine/constants.ts
import type { AttrKey, LifeStage } from './types';

export const STAGE_BOUNDS: Record<LifeStage, [number, number]> = {
  childhood: [1, 6],
  school: [7, 18],
  college: [19, 22],
  career: [23, 60],
  retirement: [61, 80],
};

export const STAGE_OF_AGE = (age: number): LifeStage => {
  if (age <= 6) return 'childhood';
  if (age <= 18) return 'school';
  if (age <= 22) return 'college';
  if (age <= 60) return 'career';
  return 'retirement';
};

// 阈值（占位，playtest 调）
export const THRESHOLDS = {
  lowHappiness: 20,
  lowConstitution: 15,
  peakCombined: 150, // 快乐 + 财富
  midlifeAgeRange: [40, 50] as [number, number],
};

// 评分权重（占位，playtest 调）
export const RATING_WEIGHTS = {
  attrAvg: 0.6,
  lifespan: 0.15,
  achievement: 0.15,
  twist: 0.1,
};

export const RATING_THRESHOLDS = {
  S: 85,
  A: 70,
  B: 55,
  C: 40,
};

export const BASE_LIFESPAN = 75;
export const LIFESPAN_VARIANCE = 15;
export const CONSTITUTION_DECAY_AGE = 35;
export const ATTR_FLOOR = 0;
export const ATTR_CEIL = 100;

export const clampAttr = (n: number): number =>
  Math.max(ATTR_FLOOR, Math.min(ATTR_CEIL, Math.round(n)));
```

- [ ] **Step 3: Create tests/fixtures.ts**

```typescript
// tests/fixtures.ts
import type { GameState, GameEvent } from '../src/engine/types';
import { mulberry32 } from '../src/engine/rng';

export function makeState(overrides: Partial<GameState> = {}): GameState {
  return {
    age: 25,
    stage: 'career',
    attrs: { 智力: 50, 魅力: 50, 体质: 50, 运气: 50, 财富: 50, 快乐: 50 },
    skills: { 硬: 30, 软: 30, 摸: 30 },
    flags: new Set<string>(),
    history: [],
    meta: { seed: 12345, playthrough: 1 },
    ...overrides,
  };
}

export const rngFor = (seed: number) => mulberry32(seed);

export const sampleEvent: GameEvent = {
  id: 'test_event',
  stage: 'career',
  ageRange: [25, 45],
  once: true,
  trigger: { baseWeight: 10 },
  text: '测试事件',
  choices: [
    {
      label: '选项 A',
      outcomes: [
        { weight: 50, condition: { attrGte: { 体质: 30 } }, apply: () => {}, result: 'A 常规' },
        { weight: 50, condition: { attrLt: { 体质: 30 } }, apply: () => {}, result: 'A 反转' },
      ],
    },
    { label: '选项 B', outcomes: [
      { weight: 100, condition: { all: [] }, apply: () => {}, result: 'B 兜底' },
    ]},
  ],
};
```

- [ ] **Step 4: Verify fixtures import cleanly**

Run: `npx vue-tsc --noEmit`
Expected: No errors.

- [ ] **Step 5: Commit**

```bash
git add src/engine/rng.ts src/engine/constants.ts tests/fixtures.ts
git commit -m "feat(engine): add RNG utilities, constants, and test fixtures"
```

---

# Phase 2: Engine Core (Tasks 4-7)

## Task 4: Condition Evaluator

**Files:**
- Create: `src/engine/condition.ts`, `tests/engine/condition.test.ts`

**Interfaces:**
- Consumes: `Condition`, `GameState` from `src/engine/types.ts`
- Produces: `evaluateCondition(condition: Condition, state: GameState): boolean`

- [ ] **Step 1: Write the failing test**

```typescript
// tests/engine/condition.test.ts
import { describe, it, expect } from 'vitest';
import { evaluateCondition } from '../../src/engine/condition';
import { makeState } from '../fixtures';

describe('evaluateCondition', () => {
  it('flag: returns true when flag present', () => {
    const s = makeState();
    s.flags.add('milestone_has_job');
    expect(evaluateCondition({ flag: 'milestone_has_job' }, s)).toBe(true);
  });

  it('flag: returns false when flag absent', () => {
    expect(evaluateCondition({ flag: 'milestone_has_job' }, makeState())).toBe(false);
  });

  it('notFlag: inverts flag check', () => {
    expect(evaluateCondition({ notFlag: 'milestone_has_job' }, makeState())).toBe(true);
  });

  it('attrGte: returns true when attr >= threshold', () => {
    expect(evaluateCondition({ attrGte: { 体质: 30 } }, makeState())).toBe(true);
  });

  it('attrGte: returns false when attr < threshold', () => {
    const s = makeState({ attrs: { 智力: 50, 魅力: 50, 体质: 20, 运气: 50, 财富: 50, 快乐: 50 } });
    expect(evaluateCondition({ attrGte: { 体质: 30 } }, s)).toBe(false);
  });

  it('attrLt: returns true when attr < threshold', () => {
    const s = makeState({ attrs: { 智力: 50, 魅力: 50, 体质: 20, 运气: 50, 财富: 50, 快乐: 50 } });
    expect(evaluateCondition({ attrLt: { 体质: 30 } }, s)).toBe(true);
  });

  it('skillGte: checks skill value', () => {
    expect(evaluateCondition({ skillGte: { 硬: 25 } }, makeState())).toBe(true);
  });

  it('all: returns true when all sub-conditions true', () => {
    expect(evaluateCondition({ all: [{ attrGte: { 体质: 30 } }, { attrLt: { 体质: 60 } }] }, makeState())).toBe(true);
  });

  it('all: returns false when any sub-condition false', () => {
    expect(evaluateCondition({ all: [{ attrGte: { 体质: 30 } }, { attrLt: { 体质: 40 } }] }, makeState())).toBe(false);
  });

  it('any: returns true when at least one sub-condition true', () => {
    expect(evaluateCondition({ any: [{ attrLt: { 体质: 30 } }, { attrGte: { 体质: 40 } }] }, makeState())).toBe(true);
  });

  it('all empty array returns true (always-pass sentinel)', () => {
    expect(evaluateCondition({ all: [] }, makeState())).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- condition`
Expected: FAIL with "Cannot find module '../../src/engine/condition'".

- [ ] **Step 3: Write minimal implementation**

```typescript
// src/engine/condition.ts
import type { Condition, GameState } from './types';

export function evaluateCondition(condition: Condition, state: GameState): boolean {
  if ('flag' in condition) return state.flags.has(condition.flag);
  if ('notFlag' in condition) return !state.flags.has(condition.notFlag);
  if ('attrGte' in condition) {
    return Object.entries(condition.attrGte).every(([k, v]) => state.attrs[k as keyof typeof state.attrs] >= v!);
  }
  if ('attrLt' in condition) {
    return Object.entries(condition.attrLt).every(([k, v]) => state.attrs[k as keyof typeof state.attrs] < v!);
  }
  if ('skillGte' in condition) {
    return Object.entries(condition.skillGte).every(([k, v]) => state.skills[k as keyof typeof state.skills] >= v!);
  }
  if ('skillLt' in condition) {
    return Object.entries(condition.skillLt).every(([k, v]) => state.skills[k as keyof typeof state.skills] < v!);
  }
  if ('all' in condition) return condition.all.every((c) => evaluateCondition(c, state));
  if ('any' in condition) return condition.any.some((c) => evaluateCondition(c, state));
  return false;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- condition`
Expected: PASS, 11 tests.

- [ ] **Step 5: Commit**

```bash
git add src/engine/condition.ts tests/engine/condition.test.ts
git commit -m "feat(engine): implement Condition evaluator with full coverage"
```

---

## Task 5: Event Eligibility Filter

**Files:**
- Create: `src/engine/trigger.ts`, `tests/engine/trigger.test.ts`

**Interfaces:**
- Consumes: `GameEvent`, `GameState`, `evaluateCondition`
- Produces: `filterEligible(events: ReadonlyArray<GameEvent>, state: GameState): GameEvent[]`

- [ ] **Step 1: Write the failing test**

```typescript
// tests/engine/trigger.test.ts
import { describe, it, expect } from 'vitest';
import { filterEligible } from '../../src/engine/trigger';
import { makeState, sampleEvent } from '../fixtures';
import type { GameEvent } from '../../src/engine/types';

const events: GameEvent[] = [
  sampleEvent, // career, 25-45, once
  {
    id: 'young_event', stage: 'school', ageRange: [10, 15], trigger: { baseWeight: 5 },
    text: '', choices: [],
  },
  {
    id: 'flagged_event', stage: 'career', ageRange: [25, 45],
    trigger: { baseWeight: 5, requires: [{ flag: 'milestone_has_job' }] },
    text: '', choices: [],
  },
  {
    id: 'already_fired', stage: 'career', ageRange: [25, 45], once: true, trigger: { baseWeight: 5 },
    text: '', choices: [],
  },
];

describe('filterEligible', () => {
  it('includes events matching age and stage', () => {
    const result = filterEligible(events, makeState());
    expect(result.some((e) => e.id === 'test_event')).toBe(true);
  });

  it('excludes events outside age range', () => {
    const result = filterEligible(events, makeState());
    expect(result.some((e) => e.id === 'young_event')).toBe(false);
  });

  it('excludes events whose requires condition fails', () => {
    const result = filterEligible(events, makeState());
    expect(result.some((e) => e.id === 'flagged_event')).toBe(false);
  });

  it('includes events whose requires condition passes', () => {
    const s = makeState();
    s.flags.add('milestone_has_job');
    const result = filterEligible(events, s);
    expect(result.some((e) => e.id === 'flagged_event')).toBe(true);
  });

  it('excludes once-events already in history', () => {
    const s = makeState({ history: ['already_fired'] });
    const result = filterEligible(events, s);
    expect(result.some((e) => e.id === 'already_fired')).toBe(false);
  });

  it('excludes events in trigger.excludes', () => {
    const s = makeState({ history: ['test_event'] });
    const ev: GameEvent = {
      id: 'mutual', stage: 'career', ageRange: [25, 45],
      trigger: { baseWeight: 5, excludes: ['test_event'] },
      text: '', choices: [],
    };
    expect(filterEligible([ev], s).length).toBe(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- trigger`
Expected: FAIL "Cannot find module '../../src/engine/trigger'".

- [ ] **Step 3: Write minimal implementation**

```typescript
// src/engine/trigger.ts
import type { GameEvent, GameState } from './types';
import { evaluateCondition } from './condition';

export function filterEligible(events: ReadonlyArray<GameEvent>, state: GameState): GameEvent[] {
  return events.filter((ev) => {
    if (ev.stage !== 'special' && ev.stage !== state.stage) return false;
    const [min, max] = ev.ageRange;
    if (state.age < min || state.age > max) return false;
    if (ev.once && state.history.includes(ev.id)) return false;
    if (ev.trigger.excludes?.some((id) => state.history.includes(id))) return false;
    if (ev.trigger.requires && !ev.trigger.requires.every((c) => evaluateCondition(c, state))) return false;
    return true;
  });
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- trigger`
Expected: PASS, 6 tests.

- [ ] **Step 5: Commit**

```bash
git add src/engine/trigger.ts tests/engine/trigger.test.ts
git commit -m "feat(engine): implement event eligibility filter"
```

---

## Task 6: Outcome Resolver

**Files:**
- Create: `src/engine/outcome.ts`, `tests/engine/outcome.test.ts`

**Interfaces:**
- Consumes: `Choice`, `GameState`, `evaluateCondition`, `pickWeighted`
- Produces: `resolveChoice(choice: Choice, state: GameState, rng: () => number): Outcome | undefined`

- [ ] **Step 1: Write the failing test**

```typescript
// tests/engine/outcome.test.ts
import { describe, it, expect } from 'vitest';
import { resolveChoice } from '../../src/engine/outcome';
import { makeState, rngFor } from '../fixtures';
import type { Choice } from '../../src/engine/types';

const choice: Choice = {
  label: 'test',
  outcomes: [
    { weight: 100, condition: { attrGte: { 体质: 30 } }, apply: () => {}, result: '常规' },
    { weight: 100, condition: { attrLt: { 体质: 30 } }, apply: () => {}, result: '反转' },
    { weight: 1, condition: { all: [{ attrLt: { 体质: 30 } }, { flag: 'foreshadow_x' }] }, apply: () => {}, result: '罕见' },
  ],
};

describe('resolveChoice', () => {
  it('returns only outcomes whose condition matches', () => {
    const s = makeState(); // 体质 50
    const result = resolveChoice(choice, s, rngFor(1));
    expect(result?.result).toBe('常规');
  });

  it('returns反转 when condition matches', () => {
    const s = makeState({ attrs: { 智力: 50, 魅力: 50, 体质: 20, 运气: 50, 财富: 50, 快乐: 50 } });
    const result = resolveChoice(choice, s, rngFor(1));
    expect(result?.result).toBe('反转');
  });

  it('rare outcome requires both attribute and flag', () => {
    const s = makeState({ attrs: { 智力: 50, 魅力: 50, 体质: 20, 运气: 50, 财富: 50, 快乐: 50 } });
    s.flags.add('foreshadow_x');
    // 加载罕见反转：需要 rng 落在罕见 weight 上。total=201，罕见 weight=1
    // 用 rng 永远返回 0 让 pickWeighted 选第一个；这里改写让罕见胜出
    const rareChoice: Choice = {
      label: 'x', outcomes: [
        { weight: 1, condition: { all: [{ attrLt: { 体质: 30 } }, { flag: 'foreshadow_x' }] }, apply: () => {}, result: '罕见' },
      ],
    };
    const result = resolveChoice(rareChoice, s, rngFor(1));
    expect(result?.result).toBe('罕见');
  });

  it('returns undefined when no outcome matches', () => {
    const choice2: Choice = {
      label: 'x', outcomes: [
        { weight: 100, condition: { attrGte: { 体质: 90 } }, apply: () => {}, result: 'x' },
      ],
    };
    const result = resolveChoice(choice2, makeState(), rngFor(1));
    expect(result).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- outcome`
Expected: FAIL "Cannot find module".

- [ ] **Step 3: Write minimal implementation**

```typescript
// src/engine/outcome.ts
import type { Choice, GameState, Outcome } from './types';
import { evaluateCondition } from './condition';
import { pickWeighted } from './rng';

export function resolveChoice(choice: Choice, state: GameState, rng: () => number): Outcome | undefined {
  const candidates = choice.outcomes.filter((o) => evaluateCondition(o.condition, state));
  if (candidates.length === 0) return undefined;
  return pickWeighted(
    candidates.map((o) => ({ item: o, weight: o.weight })),
    rng,
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- outcome`
Expected: PASS, 4 tests.

- [ ] **Step 5: Commit**

```bash
git add src/engine/outcome.ts tests/engine/outcome.test.ts
git commit -m "feat(engine): implement outcome resolver with weighted random"
```

---

## Task 7: Ending Resolver + Rating Calculator

**Files:**
- Create: `src/engine/ending.ts`, `src/engine/rating.ts`, `tests/engine/ending.test.ts`, `tests/engine/rating.test.ts`

**Interfaces:**
- Consumes: `Ending`, `GameState`, `RATING_WEIGHTS`, `RATING_THRESHOLDS`
- Produces: `resolveEnding(endings, state): Ending`, `calcRating(state): Rating`

- [ ] **Step 1: Write the failing test for ending**

```typescript
// tests/engine/ending.test.ts
import { describe, it, expect } from 'vitest';
import { resolveEnding } from '../../src/engine/ending';
import { makeState } from '../fixtures';
import type { Ending } from '../../src/engine/types';

const endings: Ending[] = [
  { id: 'default', priority: 0, condition: () => true, title: '平凡', desc: () => '', rating: () => 'C' },
  { id: 'rich', priority: 50, condition: (s) => s.attrs.财富 >= 85, title: '富豪', desc: () => '', rating: () => 'S' },
  { id: 'twist', priority: 100, condition: (s) => s.flags.has('twist_x'), title: '反转', desc: () => '', rating: () => 'B' },
];

describe('resolveEnding', () => {
  it('returns highest-priority matching ending', () => {
    const s = makeState();
    s.flags.add('twist_x');
    expect(resolveEnding(endings, s).id).toBe('twist');
  });

  it('falls back to lower priority when higher does not match', () => {
    const s = makeState({ attrs: { 智力: 50, 魅力: 50, 体质: 50, 运气: 50, 财富: 90, 快乐: 50 } });
    expect(resolveEnding(endings, s).id).toBe('rich');
  });

  it('falls back to default when nothing else matches', () => {
    expect(resolveEnding(endings, makeState()).id).toBe('default');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- ending`
Expected: FAIL.

- [ ] **Step 3: Write ending.ts**

```typescript
// src/engine/ending.ts
import type { Ending, GameState } from './types';

export function resolveEnding(endings: ReadonlyArray<Ending>, state: GameState): Ending {
  const sorted = [...endings].sort((a, b) => b.priority - a.priority);
  for (const ending of sorted) {
    if (ending.condition(state)) return ending;
  }
  // 不应该走到这里 —— 兜底结局必须 priority 0 condition () => true
  throw new Error('No matching ending; ensure a default ending with priority 0 exists');
}
```

- [ ] **Step 4: Run ending test**

Run: `npm test -- ending`
Expected: PASS, 3 tests.

- [ ] **Step 5: Write the failing test for rating**

```typescript
// tests/engine/rating.test.ts
import { describe, it, expect } from 'vitest';
import { calcRating } from '../../src/engine/rating';
import { makeState } from '../fixtures';

describe('calcRating', () => {
  it('returns S for high stats and long life', () => {
    const s = makeState({
      age: 80,
      attrs: { 智力: 90, 魅力: 90, 体质: 90, 运气: 90, 财富: 90, 快乐: 90 },
      skills: { 硬: 90, 软: 90, 摸: 90 },
    });
    s.flags.add('achievement_x'); s.flags.add('achievement_y');
    s.flags.add('twist_x');
    expect(calcRating(s)).toBe('S');
  });

  it('returns D for low everything', () => {
    const s = makeState({
      age: 30,
      attrs: { 智力: 20, 魅力: 20, 体质: 20, 运气: 20, 财富: 20, 快乐: 20 },
      skills: { 硬: 20, 软: 20, 摸: 20 },
    });
    expect(calcRating(s)).toBe('D');
  });

  it('returns mid-tier for average life', () => {
    const s = makeState({ age: 60 });
    expect(['B', 'C']).toContain(calcRating(s));
  });
});
```

- [ ] **Step 6: Run rating test to verify it fails**

Run: `npm test -- rating`
Expected: FAIL.

- [ ] **Step 7: Write rating.ts**

```typescript
// src/engine/rating.ts
import type { GameState, Rating } from './types';
import { RATING_WEIGHTS, RATING_THRESHOLDS } from './constants';

const countFlagsByPrefix = (flags: Set<string>, prefix: string): number =>
  [...flags].filter((f) => f.startsWith(prefix)).length;

export function calcRating(s: GameState): Rating {
  const allAttr = [...Object.values(s.attrs), ...Object.values(s.skills)];
  const attrAvg = allAttr.reduce((a, b) => a + b, 0) / allAttr.length;
  const lifespanScore = ((s.age - 1) / 80) * 100;
  const achievementBonus = countFlagsByPrefix(s.flags, 'achievement_') * 5;
  const chainBonus = countFlagsByPrefix(s.flags, 'twist_') * 10;

  const score =
    attrAvg * RATING_WEIGHTS.attrAvg +
    lifespanScore * RATING_WEIGHTS.lifespan +
    achievementBonus * RATING_WEIGHTS.achievement +
    chainBonus * RATING_WEIGHTS.twist;

  if (score >= RATING_THRESHOLDS.S) return 'S';
  if (score >= RATING_THRESHOLDS.A) return 'A';
  if (score >= RATING_THRESHOLDS.B) return 'B';
  if (score >= RATING_THRESHOLDS.C) return 'C';
  return 'D';
}
```

- [ ] **Step 8: Run rating test**

Run: `npm test -- rating`
Expected: PASS, 3 tests.

- [ ] **Step 9: Commit**

```bash
git add src/engine/ending.ts src/engine/rating.ts tests/engine/ending.test.ts tests/engine/rating.test.ts
git commit -m "feat(engine): implement ending resolver and rating calculator"
```

---

# Phase 3: State & Loop (Tasks 8-9)

## Task 8: Pinia Store + Save/Load

**Files:**
- Create: `src/stores/game.ts`, `src/utils/save.ts`, `tests/engine/save.test.ts` (we test the save util, not the store)

**Interfaces:**
- Produces: `useGameStore` (Pinia setup store), `loadGame()`, `saveGame()`, `clearSave()`, `hasSave()`.

- [ ] **Step 1: Create src/utils/save.ts**

```typescript
// src/utils/save.ts
import type { GameState } from '../engine/types';

const SAVE_KEY = 'life-sim-save-v1';

export interface SaveData {
  version: string;
  state: GameState;
  unlockedEndings: string[];
  totalPlaythroughs: number;
  lastCarryover?: string;
}

export function saveGame(data: SaveData): void {
  // Set 不能直接 JSON，转 array
  const serializable = {
    ...data,
    state: {
      ...data.state,
      flags: [...data.state.flags],
    },
  };
  localStorage.setItem(SAVE_KEY, JSON.stringify(serializable));
}

export function loadGame(): SaveData | null {
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return {
      ...parsed,
      state: {
        ...parsed.state,
        flags: new Set<string>(parsed.state.flags ?? []),
      },
    };
  } catch {
    return null;
  }
}

export function hasSave(): boolean {
  return localStorage.getItem(SAVE_KEY) !== null;
}

export function clearSave(): void {
  localStorage.removeItem(SAVE_KEY);
}
```

- [ ] **Step 2: Write failing test for save/load round-trip**

```typescript
// tests/engine/save.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { saveGame, loadGame, clearSave, hasSave } from '../../src/utils/save';
import { makeState } from '../fixtures';

describe('save/load', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('round-trips a save with Set flags', () => {
    const s = makeState();
    s.flags.add('twist_x');
    saveGame({
      version: '1', state: s, unlockedEndings: ['ending_a'], totalPlaythroughs: 2,
    });
    const loaded = loadGame();
    expect(loaded).not.toBeNull();
    expect(loaded!.state.flags.has('twist_x')).toBe(true);
    expect(loaded!.state.flags instanceof Set).toBe(true);
    expect(loaded!.unlockedEndings).toEqual(['ending_a']);
  });

  it('hasSave reflects state', () => {
    expect(hasSave()).toBe(false);
    saveGame({ version: '1', state: makeState(), unlockedEndings: [], totalPlaythroughs: 1 });
    expect(hasSave()).toBe(true);
    clearSave();
    expect(hasSave()).toBe(false);
  });

  it('returns null on corrupted save', () => {
    localStorage.setItem('life-sim-save-v1', 'not json');
    expect(loadGame()).toBeNull();
  });
});
```

- [ ] **Step 3: Configure jsdom for localStorage test**

Update `vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom', // 改为 jsdom 以获得 localStorage
    include: ['tests/**/*.test.ts'],
  },
});
```

Then: `npm install -D jsdom@^25`

- [ ] **Step 4: Run save test**

Run: `npm test -- save`
Expected: PASS, 3 tests.

- [ ] **Step 5: Create src/stores/game.ts**

```typescript
// src/stores/game.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { GameState } from '../engine/types';
import { STAGE_OF_AGE } from '../engine/constants';
import { loadGame, saveGame, clearSave, hasSave, type SaveData } from '../utils/save';

type View = 'start' | 'game' | 'ending' | 'settings';

export const useGameStore = defineStore('game', () => {
  const state = ref<GameState | null>(null);
  const view = ref<View>('start');
  const currentEventIds = ref<string[]>([]);
  const eventQueueIndex = ref(0);
  const currentEndingId = ref<string | null>(null);
  const unlockedEndings = ref<string[]>([]);
  const totalPlaythroughs = ref(0);
  const lastLog = ref<string[]>([]);

  const hasOngoingGame = computed(() => state.value !== null && view.value === 'game');

  function newGame(seed: number, carryover?: GameState['meta']['carryover']) {
    const attrs = {
      智力: 30 + Math.floor(seedRandom(seed, 1) * 21),
      魅力: 30 + Math.floor(seedRandom(seed, 2) * 21),
      体质: 30 + Math.floor(seedRandom(seed, 3) * 21),
      运气: 30 + Math.floor(seedRandom(seed, 4) * 21),
      财富: 30 + Math.floor(seedRandom(seed, 5) * 21),
      快乐: 30 + Math.floor(seedRandom(seed, 6) * 21),
    };
    state.value = {
      age: 1,
      stage: 'childhood',
      attrs,
      skills: { 硬: 0, 软: 0, 摸: 0 },
      flags: new Set(),
      history: [],
      meta: { seed, playthrough: totalPlaythroughs.value + 1, carryover },
    };
    // 应用 NG+ 继承
    if (carryover === 'intelligence') state.value.attrs.智力 += 15;
    if (carryover === 'soft') state.value.skills.软 += 15;
    if (carryover === 'slacker') state.value.skills.摸 += 15;
    if (carryover === 'memory') state.value.flags.add('ng_plus_memory');
    view.value = 'game';
    currentEventIds.value = [];
    eventQueueIndex.value = 0;
    currentEndingId.value = null;
  }

  function persist() {
    if (state.value) {
      saveGame({
        version: '1',
        state: state.value,
        unlockedEndings: unlockedEndings.value,
        totalPlaythroughs: totalPlaythroughs.value,
      });
    }
  }

  function loadFromSave() {
    const data = loadGame();
    if (!data) return false;
    state.value = data.state;
    unlockedEndings.value = data.unlockedEndings;
    totalPlaythroughs.value = data.totalPlaythroughs;
    view.value = 'game';
    return true;
  }

  function checkHasSave(): boolean {
    return hasSave();
  }

  function resetAll() {
    clearSave();
    state.value = null;
    view.value = 'start';
  }

  function setView(v: View) {
    view.value = v;
  }

  return {
    state, view, currentEventIds, eventQueueIndex, currentEndingId,
    unlockedEndings, totalPlaythroughs, lastLog,
    hasOngoingGame, newGame, persist, loadFromSave, checkHasSave, resetAll, setView,
  };
});

function seedRandom(seed: number, n: number): number {
  // 简单确定性 hash，给 newGame 起手属性用
  let x = seed + n * 2654435761;
  x = Math.imul(x ^ (x >>> 15), 2246822507);
  x = Math.imul(x ^ (x >>> 13), 3266489909);
  return ((x ^ (x >>> 16)) >>> 0) / 4294967296;
}
```

- [ ] **Step 6: Verify it compiles**

Run: `npx vue-tsc --noEmit`
Expected: No errors.

- [ ] **Step 7: Commit**

```bash
git add src/utils/save.ts src/stores/game.ts tests/engine/save.test.ts vitest.config.ts package.json package-lock.json
git commit -m "feat(state): add Pinia store and localStorage save/load"
```

---

## Task 9: Game Loop (advanceTurn)

**Files:**
- Create: `src/engine/loop.ts`, `tests/engine/loop.test.ts`

**Interfaces:**
- Consumes: `filterEligible`, `resolveChoice`, `mulberry32`, `STAGE_OF_AGE`, all events, all endings
- Produces: `selectEventsForYear(events, state, rng): string[]`, `applyYearlyTick(state): void`, `checkDeath(state): boolean`, `applyOutcomeToState(state, outcome): void`.

Note: The main UI interaction loop (player picks choice → resolve → display) lives in the store/UI layer, not here. This module provides the building blocks.

- [ ] **Step 1: Write the failing test**

```typescript
// tests/engine/loop.test.ts
import { describe, it, expect } from 'vitest';
import { selectEventsForYear, applyYearlyTick, checkDeath, applyOutcomeToState } from '../../src/engine/loop';
import { makeState, sampleEvent, rngFor } from '../fixtures';
import { THRESHOLDS, BASE_LIFESPAN } from '../../src/engine/constants';

describe('selectEventsForYear', () => {
  it('returns nextEvent id when state.nextEvent is set', () => {
    const s = makeState({ nextEvent: 'forced_next' });
    expect(selectEventsForYear([sampleEvent], s, rngFor(1))).toEqual(['forced_next']);
  });

  it('returns 0-3 events otherwise', () => {
    const s = makeState();
    const result = selectEventsForYear([sampleEvent], s, rngFor(1));
    expect(result.length).toBeLessThanOrEqual(3);
  });
});

describe('applyYearlyTick', () => {
  it('ages by 1 and updates stage', () => {
    const s = makeState({ age: 22, stage: 'college' });
    applyYearlyTick(s);
    expect(s.age).toBe(23);
    expect(s.stage).toBe('career');
  });

  it('reduces体质 by 1 each year after 35', () => {
    const s = makeState({ age: 40 });
    const before = s.attrs.体质;
    applyYearlyTick(s);
    expect(s.attrs.体质).toBe(before - 1);
  });

  it('does not reduce体质 before 35', () => {
    const s = makeState({ age: 30 });
    const before = s.attrs.体质;
    applyYearlyTick(s);
    expect(s.attrs.体质).toBe(before);
  });

  it('clamps attrs to 0-100', () => {
    const s = makeState({ age: 40, attrs: { 智力: 50, 魅力: 50, 体质: 0, 运气: 50, 财富: 50, 快乐: 50 } });
    applyYearlyTick(s);
    expect(s.attrs.体质).toBe(0); // 不下穿到 -1
  });
});

describe('checkDeath', () => {
  it('returns true when age exceeds lifespan', () => {
    const s = makeState({ age: 95 });
    expect(checkDeath(s, 80)).toBe(true);
  });

  it('returns true when体质 is 0', () => {
    const s = makeState({ attrs: { 智力: 50, 魅力: 50, 体质: 0, 运气: 50, 财富: 50, 快乐: 50 } });
    expect(checkDeath(s, 80)).toBe(true);
  });

  it('returns false otherwise', () => {
    expect(checkDeath(makeState({ age: 50 }), 80)).toBe(false);
  });
});

describe('applyOutcomeToState', () => {
  it('runs apply, pushes to history, sets nextEvent', () => {
    const s = makeState();
    let observed = 0;
    applyOutcomeToState(s, {
      weight: 1, condition: { all: [] },
      apply: () => { observed++; },
      result: 'test', nextEvent: 'next_x',
    }, 'event_xyz');
    expect(observed).toBe(1);
    expect(s.history).toContain('event_xyz');
    expect(s.nextEvent).toBe('next_x');
  });

  it('clears nextEvent when outcome has none', () => {
    const s = makeState({ nextEvent: 'old' });
    applyOutcomeToState(s, {
      weight: 1, condition: { all: [] },
      apply: () => {}, result: 'x',
    }, 'event_xyz');
    expect(s.nextEvent).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- loop`
Expected: FAIL.

- [ ] **Step 3: Write src/engine/loop.ts**

```typescript
// src/engine/loop.ts
import type { GameState, GameEvent, Outcome } from './types';
import { filterEligible } from './trigger';
import { mulberry32, pickWeighted, randomInt } from './rng';
import {
  STAGE_OF_AGE, CONSTITUTION_DECAY_AGE, ATTR_FLOOR, ATTR_CEIL, clampAttr,
} from './constants';

export function selectEventsForYear(
  events: ReadonlyArray<GameEvent>,
  state: GameState,
  rng: () => number,
): string[] {
  // 招牌链强制触发
  if (state.nextEvent) return [state.nextEvent];

  const eligible = filterEligible(events, state);
  if (eligible.length === 0) return [];

  // 多数年份 0-1 个事件，关键节点年份 2-3 个
  // 简化：每个 eligible 事件独立按 baseWeight 抽，最多 3 个
  const picked: string[] = [];
  for (const ev of eligible) {
    // 把 baseWeight 当作 1/10 概率（10 weight = 1.0 prob）
    const prob = Math.min(1, ev.trigger.baseWeight / 10);
    if (rng() < prob) picked.push(ev.id);
    if (picked.length >= 3) break;
  }
  return picked;
}

export function applyYearlyTick(state: GameState): void {
  state.age += 1;
  state.stage = STAGE_OF_AGE(state.age);
  if (state.age > CONSTITUTION_DECAY_AGE) {
    state.attrs.体质 = clampAttr(state.attrs.体质 - 1);
  }
  // 其他边界 clamp
  (Object.keys(state.attrs) as Array<keyof typeof state.attrs>).forEach((k) => {
    state.attrs[k] = clampAttr(state.attrs[k]);
  });
}

export function checkDeath(state: GameState, lifespan: number): boolean {
  if (state.age >= lifespan) return true;
  if (state.attrs.体质 <= 0) return true;
  if (state.nextEvent?.startsWith('ending_')) return true;
  return false;
}

export function applyOutcomeToState(state: GameState, outcome: Outcome, eventId: string): void {
  outcome.apply(state);
  if (!state.history.includes(eventId)) state.history.push(eventId);
  state.nextEvent = outcome.nextEvent;
  // clamp 应用了 apply 后的属性
  (Object.keys(state.attrs) as Array<keyof typeof state.attrs>).forEach((k) => {
    state.attrs[k] = clampAttr(state.attrs[k]);
  });
}
```

- [ ] **Step 4: Run loop test**

Run: `npm test -- loop`
Expected: PASS, all tests.

- [ ] **Step 5: Commit**

```bash
git add src/engine/loop.ts tests/engine/loop.test.ts
git commit -m "feat(engine): implement game loop primitives (event select, tick, death, apply)"
```

---

# Phase 4: UI Shell (Tasks 10-11)

> UI 不做自动化测试（spec §11）。每个任务用浏览器手动验证。

## Task 10: App Shell + Views

**Files:**
- Modify: `src/App.vue`
- Create: `src/views/StartView.vue`, `src/views/GameView.vue`, `src/views/EndingView.vue`, `src/views/SettingsView.vue`

**Interfaces:**
- Consumes: `useGameStore`

- [ ] **Step 1: Create src/views/StartView.vue**

```vue
<script setup lang="ts">
import { useGameStore } from '../stores/game';
const store = useGameStore();
function startNew() {
  const seed = Math.floor(Math.random() * 1e9);
  store.newGame(seed);
}
function continueGame() {
  store.loadFromSave();
}
</script>

<template>
  <div class="start-view">
    <h1>人生模拟器</h1>
    <p class="subtitle">每一次选择，都可能走向意想不到的未来。</p>
    <div class="actions">
      <button class="primary" @click="startNew">开始新人生</button>
      <button v-if="store.checkHasSave()" @click="continueGame">继续上局</button>
      <button @click="store.setView('settings')">设置</button>
    </div>
  </div>
</template>

<style scoped>
.start-view { text-align: center; padding: 4rem 1rem; }
.subtitle { color: #666; margin-bottom: 2rem; }
.actions { display: flex; flex-direction: column; gap: 0.75rem; max-width: 280px; margin: 0 auto; }
button { padding: 0.75rem 1.5rem; font-size: 1rem; cursor: pointer; }
button.primary { background: #2c3e50; color: white; border: none; }
</style>
```

- [ ] **Step 2: Create src/views/GameView.vue (placeholder)**

```vue
<script setup lang="ts">
import { useGameStore } from '../stores/game';
const store = useGameStore();
</script>

<template>
  <div class="game-view">
    <h2>{{ store.state?.age }}岁 · {{ store.state?.stage }}</h2>
    <p>游戏视图占位（Task 11 实现）</p>
  </div>
</template>
```

- [ ] **Step 3: Create src/views/EndingView.vue (placeholder)**

```vue
<script setup lang="ts">
import { useGameStore } from '../stores/game';
const store = useGameStore();
</script>

<template>
  <div class="ending-view">
    <h2>结局：{{ store.currentEndingId }}</h2>
    <button @click="store.setView('start')">返回首页</button>
  </div>
</template>
```

- [ ] **Step 4: Create src/views/SettingsView.vue**

```vue
<script setup lang="ts">
import { useGameStore } from '../stores/game';
const store = useGameStore();
</script>

<template>
  <div class="settings-view">
    <h2>设置</h2>
    <p>文字速度：即时（MVP 暂不提供选项）</p>
    <button @click="store.setView('start')">返回</button>
    <hr />
    <button v-if="store.checkHasSave()" @click="store.resetAll()">清除存档</button>
  </div>
</template>
```

- [ ] **Step 5: Rewrite src/App.vue as view router**

```vue
<script setup lang="ts">
import { useGameStore } from './stores/game';
import StartView from './views/StartView.vue';
import GameView from './views/GameView.vue';
import EndingView from './views/EndingView.vue';
import SettingsView from './views/SettingsView.vue';

const store = useGameStore();
</script>

<template>
  <StartView v-if="store.view === 'start'" />
  <GameView v-else-if="store.view === 'game'" />
  <EndingView v-else-if="store.view === 'ending'" />
  <SettingsView v-else-if="store.view === 'settings'" />
</template>
```

- [ ] **Step 6: Manual verification**

Run: `npm run dev`
Open browser, verify:
- Start view shows title + 3 buttons
- Clicking 开始新人生 → switches to game view showing age/stage
- Settings button works
- Back buttons work

- [ ] **Step 7: Commit**

```bash
git add src/App.vue src/views/
git commit -m "feat(ui): add view router and Start/Game/Ending/Settings views"
```

---

## Task 11: Game Components (Event Card + Attr Panel)

**Files:**
- Create: `src/components/AttrPanel.vue`, `src/components/EventCard.vue`, `src/components/ChoiceButton.vue`
- Modify: `src/views/GameView.vue`, `src/stores/game.ts` (add interaction helpers)
- Create: `src/content/_registry.ts` (event/ending registry scaffold)

**Interfaces:**
- Produces: `AttrPanel`, `EventCard`, `ChoiceButton` components; `useGameStore` exposes `currentEvent`, `selectChoice()`.

- [ ] **Step 1: Create src/content/_registry.ts (scaffold)**

```typescript
// src/content/_registry.ts
import type { GameEvent, Ending } from '../engine/types';

// 占位：后续 Task 12-15 会把真实 events/endings 加进来
export const ALL_EVENTS: GameEvent[] = [];
export const ALL_ENDINGS: Ending[] = [
  {
    id: 'default_ordinary',
    priority: 0,
    condition: () => true,
    title: '平凡打工人',
    desc: () => '你过着平凡的一生，没什么大起大落。',
    rating: () => 'C',
  },
];

export const findEvent = (id: string): GameEvent | undefined =>
  ALL_EVENTS.find((e) => e.id === id);
export const findEnding = (id: string): Ending | undefined =>
  ALL_ENDINGS.find((e) => e.id === id);
```

- [ ] **Step 2: Add interaction helpers to src/stores/game.ts**

Append inside the `defineStore` callback (before `return`):

```typescript
import { filterEligible } from '../engine/trigger';
import { resolveChoice } from '../engine/outcome';
import { selectEventsForYear, applyYearlyTick, applyOutcomeToState, checkDeath } from '../engine/loop';
import { resolveEnding } from '../engine/ending';
import { mulberry32 } from '../engine/rng';
import { BASE_LIFESPAN, LIFESPAN_VARIANCE } from '../engine/constants';
import { ALL_EVENTS, ALL_ENDINGS, findEvent, findEnding } from '../content/_registry';
import type { Outcome, GameEvent, Ending } from '../engine/types';

// 在 store 内部状态加上：
const currentEvent = ref<GameEvent | null>(null);
const lastOutcome = ref<Outcome | null>(null);
const rng = ref<() => number>(() => Math.random());

function startYear() {
  if (!state.value) return;
  rng.value = mulberry32(state.value.meta.seed + state.value.age * 7919);
  const ids = selectEventsForYear(ALL_EVENTS, state.value, rng.value);
  currentEventIds.value = ids;
  eventQueueIndex.value = 0;
  loadCurrentEvent();
}

function loadCurrentEvent() {
  if (!state.value) return;
  const id = currentEventIds.value[eventQueueIndex.value];
  currentEvent.value = id ? findEvent(id) ?? null : null;
  if (!currentEvent.value && currentEventIds.value.length === 0) {
    currentEvent.value = null; // 平静年
  }
}

function selectChoice(choice: GameEvent['choices'][number]) {
  if (!state.value || !currentEvent.value) return;
  const outcome = resolveChoice(choice, state.value, rng.value);
  if (!outcome) {
    lastOutcome.value = { weight: 0, condition: { all: [] }, apply: () => {}, result: '（无 outcome）' };
    return;
  }
  applyOutcomeToState(state.value, outcome, currentEvent.value.id);
  lastOutcome.value = outcome;
  // 如果 outcome 指向结局，直接进入结局判定
  if (outcome.nextEvent?.startsWith('ending_')) {
    finalizeEnding();
    return;
  }
  // 推进队列
  eventQueueIndex.value += 1;
  loadCurrentEvent();
}

function advanceYear() {
  if (!state.value) return;
  applyYearlyTick(state.value);
  const lifespan = BASE_LIFESPAN + (((state.value.meta.seed % 31) - 15) % LIFESPAN_VARIANCE);
  if (checkDeath(state.value, lifespan)) {
    finalizeEnding();
    return;
  }
  startYear();
  persist();
}

function finalizeEnding() {
  if (!state.value) return;
  const ending = resolveEnding(ALL_ENDINGS, state.value);
  currentEndingId.value = ending.id;
  if (!unlockedEndings.value.includes(ending.id)) unlockedEndings.value.push(ending.id);
  view.value = 'ending';
  persist();
}
```

Also update the return statement to expose new refs/functions:
```typescript
return {
  state, view, currentEventIds, eventQueueIndex, currentEndingId,
  unlockedEndings, totalPlaythroughs, lastLog, currentEvent, lastOutcome,
  hasOngoingGame, newGame, persist, loadFromSave, checkHasSave, resetAll, setView,
  startYear, selectChoice, advanceYear,
};
```

- [ ] **Step 3: Create src/components/AttrPanel.vue**

```vue
<script setup lang="ts">
import type { GameState } from '../engine/types';
defineProps<{ state: GameState }>();

function bar(v: number) {
  return { width: `${Math.max(0, Math.min(100, v))}%` };
}
</script>

<template>
  <aside class="attr-panel">
    <h3>属性</h3>
    <div v-for="(v, k) in state.attrs" :key="k" class="row">
      <span class="label">{{ k }}</span>
      <div class="bar-bg"><div class="bar-fg" :style="bar(v)"></div></div>
      <span class="num">{{ v }}</span>
    </div>
    <h3>技能</h3>
    <div v-for="(v, k) in state.skills" :key="k" class="row">
      <span class="label">{{ k }}</span>
      <div class="bar-bg"><div class="bar-fg skill" :style="bar(v)"></div></div>
      <span class="num">{{ v }}</span>
    </div>
  </aside>
</template>

<style scoped>
.attr-panel { padding: 1rem; background: #f5f5f5; min-width: 240px; }
.row { display: flex; align-items: center; gap: 0.5rem; margin: 0.25rem 0; }
.label { width: 3rem; }
.bar-bg { flex: 1; height: 8px; background: #ddd; }
.bar-fg { height: 100%; background: #2c3e50; }
.bar-fg.skill { background: #27ae60; }
.num { width: 2rem; text-align: right; font-variant-numeric: tabular-nums; }
</style>
```

- [ ] **Step 4: Create src/components/ChoiceButton.vue**

```vue
<script setup lang="ts">
defineProps<{ label: string; hint?: string }>();
defineEmits<{ select: [] }>();
</script>

<template>
  <button class="choice-btn" @click="$emit('select')">
    <span class="label">{{ label }}</span>
    <span v-if="hint" class="hint">{{ hint }}</span>
  </button>
</template>

<style scoped>
.choice-btn { display: flex; justify-content: space-between; align-items: center;
  width: 100%; padding: 0.75rem 1rem; margin: 0.4rem 0; cursor: pointer;
  border: 1px solid #ccc; background: white; }
.choice-btn:hover { background: #f0f0f0; }
.hint { color: #888; font-size: 0.85rem; }
</style>
```

- [ ] **Step 5: Create src/components/EventCard.vue**

```vue
<script setup lang="ts">
import type { GameEvent, Outcome, GameState } from '../engine/types';
import ChoiceButton from './ChoiceButton.vue';
import { evaluateCondition } from '../engine/condition';

const props = defineProps<{
  event: GameEvent | null;
  state: GameState;
  lastOutcome: Outcome | null;
}>();

const emit = defineEmits<{ choice: [GameEvent['choices'][number]] }>();
</script>

<template>
  <section class="event-card">
    <template v-if="event">
      <p class="event-text">{{ event.text }}</p>
      <div class="choices">
        <template v-for="c in event.choices" :key="c.label">
          <ChoiceButton
            v-if="!c.visibleWhen || evaluateCondition(c.visibleWhen, state)"
            :label="c.label"
            :hint="c.hint"
            @select="emit('choice', c)"
          />
        </template>
      </div>
    </template>
    <template v-else>
      <p class="event-text">这一年平静地过去了……</p>
    </template>

    <p v-if="lastOutcome" class="outcome-result">{{ lastOutcome.result }}</p>
  </section>
</template>

<style scoped>
.event-card { padding: 1.5rem; background: white; min-height: 300px; }
.event-text { font-size: 1.1rem; line-height: 1.6; margin-bottom: 1rem; }
.choices { display: flex; flex-direction: column; gap: 0.25rem; }
.outcome-result { margin-top: 1rem; padding: 0.75rem; background: #fffbeb; border-left: 3px solid #f59e0b; }
</style>
```

- [ ] **Step 6: Rewrite src/views/GameView.vue to use components**

```vue
<script setup lang="ts">
import { onMounted, watch } from 'vue';
import { useGameStore } from '../stores/game';
import AttrPanel from '../components/AttrPanel.vue';
import EventCard from '../components/EventCard.vue';

const store = useGameStore();

onMounted(() => {
  if (store.state && store.currentEvent === null && store.currentEventIds.length === 0) {
    store.startYear();
  }
});

function onChoice(c: any) {
  store.selectChoice(c);
}
function nextYear() {
  store.advanceYear();
}
</script>

<template>
  <div v-if="store.state" class="game-view">
    <header class="topbar">
      <span>{{ store.state.age }}岁 · {{ store.state.stage }}</span>
      <button @click="store.setView('settings')">菜单</button>
    </header>
    <div class="main">
      <AttrPanel :state="store.state" />
      <main class="content">
        <EventCard
          :event="store.currentEvent"
          :state="store.state"
          :last-outcome="store.lastOutcome"
          @choice="onChoice"
        />
      </main>
    </div>
    <footer class="bottombar">
      <button class="next-year" @click="nextYear" :disabled="!!store.currentEvent">
        下一年 →
      </button>
    </footer>
  </div>
</template>

<style scoped>
.game-view { display: flex; flex-direction: column; height: 100vh; }
.topbar { display: flex; justify-content: space-between; padding: 0.5rem 1rem;
  background: #2c3e50; color: white; }
.main { display: flex; flex: 1; overflow: hidden; }
.content { flex: 1; padding: 1rem; overflow-y: auto; }
.bottombar { padding: 0.75rem; border-top: 1px solid #ddd; text-align: right; }
.next-year { padding: 0.5rem 2rem; background: #2c3e50; color: white; border: none; cursor: pointer; }
.next-year:disabled { background: #aaa; cursor: not-allowed; }
</style>
```

- [ ] **Step 7: Manual verification**

Run: `npm run dev`
- Start new game → see age 1, 属性面板 with 6 attrs + 3 skills
- No events yet (registry empty) → shows "平静年" text
- Click 下一年 → age advances, stage transitions correctly
- Eventually reaches death age → ending view shows "平凡打工人"

- [ ] **Step 8: Commit**

```bash
git add src/components/ src/views/GameView.vue src/stores/game.ts src/content/_registry.ts
git commit -m "feat(ui): add AttrPanel/EventCard/ChoiceButton and game interaction loop"
```

---

# Phase 5: Content (Tasks 12-15)

## Task 12: 招牌链 1 — 加班猝死 → 穿越重活 / 冥界 HR

**Files:**
- Create: `src/content/chains/overwork-death.ts`, `src/content/college/dream-gaokao.ts`
- Create: `src/content/endings/reborn-as-gaokao.ts`, `src/content/endings/underworld-hr.ts`
- Modify: `src/content/_registry.ts` (register new events/endings)

**Interfaces:**
- Produces: 3 events (`foreshadow_dream_gaokao`, `career_overwork_critical`, 及触发联动) + 2 endings (`ending_reborn_as_gaokao`, `ending_underworld_hr`).
- Flag contract: `foreshadow_dream_gaokao` (铺垫), `twist_sudden_death_reborn` (反转触发), `twist_underworld_hr` (罕见反转触发).

- [ ] **Step 1: Create 铺垫 event src/content/college/dream-gaokao.ts**

```typescript
// src/content/college/dream-gaokao.ts
import type { GameEvent } from '../../engine/types';

export const dreamGaokao: GameEvent = {
  id: 'foreshadow_dream_gaokao',
  stage: 'college',
  ageRange: [19, 22],
  once: true,
  trigger: { baseWeight: 5 },
  text: '你做了一个梦，梦里又回到了高考考场，笔尖发抖，却奇怪地看懂了所有题……醒来只剩恍惚。',
  choices: [{
    label: '继续',
    outcomes: [{
      weight: 100,
      condition: { all: [] },
      apply: (s) => { s.flags.add('foreshadow_dream_gaokao'); },
      result: '梦境消散。',
    }],
  }],
};
```

- [ ] **Step 2: Create 触发 event src/content/chains/overwork-death.ts**

```typescript
// src/content/chains/overwork-death.ts
import type { GameEvent } from '../../engine/types';

export const overworkCritical: GameEvent = {
  id: 'career_overwork_critical',
  stage: 'career',
  ageRange: [25, 45],
  once: true,
  trigger: {
    baseWeight: 10,
    requires: [{ flag: 'milestone_has_job' }],
  },
  text: '老板让你通宵赶项目。你已经连续加班三周了，心跳有点奇怪。',
  choices: [
    {
      label: '努力加班，证明自己',
      outcomes: [
        {
          weight: 50,
          condition: { attrGte: { 体质: 30 } },
          apply: (s) => {
            s.attrs.财富 += 20;
            s.skills.硬 += 5;
            s.attrs.体质 -= 5;
            s.flags.add('achievement_first_promotion');
          },
          result: '项目成功，你被提拔为组长。同事都说你是工作狂。',
        },
        {
          weight: 30,
          condition: { attrLt: { 体质: 30 } },
          apply: (s) => { s.flags.add('twist_sudden_death_reborn'); },
          nextEvent: 'ending_reborn_as_gaokao',
          result: '你眼前一黑……再睁眼，竟回到了高考考场，手里还握着笔。',
        },
        {
          weight: 10,
          condition: { all: [
            { attrLt: { 体质: 30 } },
            { flag: 'foreshadow_dream_gaokao' },
          ]},
          apply: (s) => { s.flags.add('twist_underworld_hr'); },
          nextEvent: 'ending_underworld_hr',
          result: '你猝死了。地府面试官翻看你的简历，缓缓点头：「PPT 做得不错」。',
        },
      ],
    },
    {
      label: '摸鱼，假装在加班',
      outcomes: [{
        weight: 100,
        condition: { all: [] },
        apply: (s) => {
          s.attrs.快乐 -= 5;
          s.skills.摸 += 3;
        },
        result: '你在工位上玩了一晚上手机。老板第二天没发现。',
      }],
    },
    {
      label: '据理力争，拒绝加班',
      outcomes: [
        {
          weight: 60,
          condition: { skillGte: { 软: 30 } },
          apply: (s) => {
            s.attrs.快乐 += 10;
            s.flags.add('choice_refused_overwork');
          },
          result: '你成功说服了老板，从此团队再也没人敢让你无偿加班。',
        },
        {
          weight: 40,
          condition: { skillLt: { 软: 30 } },
          apply: (s) => {
            s.attrs.快乐 -= 15;
            s.flags.add('milestone_fired');
            s.flags.delete('milestone_has_job');
          },
          result: '你被开除了。但奇怪的是，你感到久违的轻松。',
        },
      ],
    },
  ],
};
```

- [ ] **Step 3: Create ending src/content/endings/reborn-as-gaokao.ts**

```typescript
// src/content/endings/reborn-as-gaokao.ts
import type { Ending } from '../../engine/types';

export const rebornAsGaokaoEnding: Ending = {
  id: 'ending_reborn_as_gaokao',
  priority: 90,
  condition: (s) => s.flags.has('twist_sudden_death_reborn'),
  title: '穿越重活',
  desc: (s) => `你在 ${s.age} 岁猝死，却带着记忆回到了高考考场。这一次，你会怎么选？`,
  rating: (s) => (s.age < 30 ? 'B' : 'C'),
};
```

- [ ] **Step 4: Create ending src/content/endings/underworld-hr.ts**

```typescript
// src/content/endings/underworld-hr.ts
import type { Ending } from '../../engine/types';

export const underworldHrEnding: Ending = {
  id: 'ending_underworld_hr',
  priority: 100,
  condition: (s) => s.flags.has('twist_underworld_hr'),
  title: '冥界 HR',
  desc: () => '你猝死了。但你生前积累的 PPT 技巧让地府面试官眼前一亮，你被录用为冥界 HR，专管阳间职场人的福报。',
  rating: () => 'A', // 罕见反转，评分给得高一些以奖励发现
};
```

- [ ] **Step 5: Register in src/content/_registry.ts**

Update the registry:

```typescript
// src/content/_registry.ts
import type { GameEvent, Ending } from '../engine/types';
import { dreamGaokao } from './college/dream-gaokao';
import { overworkCritical } from './chains/overwork-death';
import { rebornAsGaokaoEnding } from './endings/reborn-as-gaokao';
import { underworldHrEnding } from './endings/underworld-hr';

export const ALL_EVENTS: GameEvent[] = [
  dreamGaokao,
  overworkCritical,
];

export const ALL_ENDINGS: Ending[] = [
  underworldHrEnding,    // priority 100
  rebornAsGaokaoEnding,  // priority 90
  {
    id: 'default_ordinary',
    priority: 0,
    condition: () => true,
    title: '平凡打工人',
    desc: () => '你过着平凡的一生，没什么大起大落。',
    rating: () => 'C',
  },
];

export const findEvent = (id: string): GameEvent | undefined =>
  ALL_EVENTS.find((e) => e.id === id);
export const findEnding = (id: string): Ending | undefined =>
  ALL_ENDINGS.find((e) => e.id === id);
```

- [ ] **Step 6: Add a content sanity test**

```typescript
// tests/content/registry.test.ts
import { describe, it, expect } from 'vitest';
import { ALL_EVENTS, ALL_ENDINGS } from '../../src/content/_registry';

describe('content registry', () => {
  it('all event IDs are unique', () => {
    const ids = ALL_EVENTS.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all ending IDs are unique', () => {
    const ids = ALL_ENDINGS.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all nextEvent references point to existing events or endings', () => {
    const eventIds = new Set(ALL_EVENTS.map((e) => e.id));
    const endingIds = new Set(ALL_ENDINGS.map((e) => e.id));
    for (const ev of ALL_EVENTS) {
      for (const c of ev.choices) {
        for (const o of c.outcomes) {
          if (!o.nextEvent) continue;
          if (!eventIds.has(o.nextEvent) && !endingIds.has(o.nextEvent)) {
            throw new Error(`Event ${ev.id} references unknown nextEvent: ${o.nextEvent}`);
          }
        }
      }
    }
  });

  it('exactly one default ending (priority 0, condition true)', () => {
    const defaults = ALL_ENDINGS.filter((e) => e.priority === 0);
    expect(defaults.length).toBe(1);
  });
});
```

- [ ] **Step 7: Run sanity test**

Run: `npm test -- registry`
Expected: PASS, 4 tests.

- [ ] **Step 8: Manual playtest**

Run: `npm run dev`
- 新游戏，通过控制台/console 把 age 设到 22-25，给自己加 `milestone_has_job` flag 与低 `体质`，触发加班事件。
- 验证三个 outcome 分支都能触发。
- 验证梦境事件在大学习触发并设置 flag。

(开发者工具：在浏览器 console 中通过 Pinia devtools 修改 state。)

- [ ] **Step 9: Commit**

```bash
git add src/content/chains/ src/content/college/dream-gaokao.ts src/content/endings/ src/content/_registry.ts tests/content/registry.test.ts
git commit -m "feat(content): add招牌链 1 (加班猝死 → 穿越重活 / 冥界 HR)"
```

---

## Task 13: 招牌链 2 — 摸鱼写小说 → 爆火作家

**Files:**
- Create: `src/content/school/secret-reading.ts` (铺垫), `src/content/chains/slacker-author.ts` (触发)
- Create: `src/content/endings/slacker-author.ts`
- Modify: `src/content/_registry.ts`

**Flag contract:** `foreshadow_writer_dream`, `twist_slacker_author` (反转), `twist_slacker_bestseller` (罕见反转).

- [ ] **Step 1: Create 铺垫 event src/content/school/secret-reading.ts**

```typescript
// src/content/school/secret-reading.ts
import type { GameEvent } from '../../engine/types';

export const secretReading: GameEvent = {
  id: 'foreshadow_writer_dream',
  stage: 'school',
  ageRange: [12, 17],
  once: true,
  trigger: { baseWeight: 5 },
  text: '你躲在课桌下偷看小说，被老师抓个正着。老师叹了口气：「爱看书不是坏事，但别在上课时。」',
  choices: [
    {
      label: '心里默默记下这个梦想',
      outcomes: [{
        weight: 100,
        condition: { all: [] },
        apply: (s) => { s.flags.add('foreshadow_writer_dream'); s.attrs.智力 += 2; },
        result: '也许有一天，你也能写出让人入迷的故事。',
      }],
    },
    {
      label: '从此再也不敢看闲书',
      outcomes: [{
        weight: 100,
        condition: { all: [] },
        apply: (s) => { s.attrs.快乐 -= 3; },
        result: '你压抑了自己的爱好。',
      }],
    },
  ],
};
```

- [ ] **Step 2: Create 触发 event src/content/chains/slacker-author.ts**

```typescript
// src/content/chains/slacker-author.ts
import type { GameEvent } from '../../engine/types';

export const slackerWriting: GameEvent = {
  id: 'career_slacker_writing',
  stage: 'career',
  ageRange: [25, 50],
  once: true,
  trigger: {
    baseWeight: 6,
    requires: [{ flag: 'milestone_has_job' }],
  },
  text: '下午三点，你工位上的代码已经跑起来了。你打开了一个空白文档……',
  choices: [
    {
      label: '继续摸鱼刷手机',
      outcomes: [{
        weight: 70,
        condition: { all: [] },
        apply: (s) => { s.attrs.快乐 += 2; s.attrs.体质 -= 1; s.skills.摸 += 2; },
        result: '你刷了一下午短视频，毫无收获。',
      }],
    },
    {
      label: '偷偷写小说',
      outcomes: [
        {
          weight: 50,
          condition: { all: [] },
          apply: (s) => { s.attrs.快乐 += 5; s.skills.摸 += 5; },
          result: '你写了 2000 字，发到网上。无人问津，但你心情很好。',
        },
        {
          weight: 25,
          condition: { skillGte: { 摸: 40 } },
          apply: (s) => {
            s.attrs.财富 += 15;
            s.flags.add('twist_slacker_author');
          },
          result: '你的小说小爆了一下，每月多了一笔稳定副业收入。',
        },
        {
          weight: 8,
          condition: { all: [
            { skillGte: { 摸: 50 } },
            { flag: 'foreshadow_writer_dream' },
          ]},
          apply: (s) => {
            s.flags.add('twist_slacker_bestseller');
            s.attrs.财富 = 95;
          },
          nextEvent: 'ending_slacker_author',
          result: '你的小说成了年度 IP，影视版权卖出天价。你辞职全职写作。',
        },
      ],
    },
  ],
};
```

- [ ] **Step 3: Create ending src/content/endings/slacker-author.ts**

```typescript
// src/content/endings/slacker-author.ts
import type { Ending } from '../../engine/types';

export const slackerAuthorEnding: Ending = {
  id: 'ending_slacker_author',
  priority: 90,
  condition: (s) => s.flags.has('twist_slacker_bestseller'),
  title: '摸鱼作家爆火',
  desc: () => '当年上课偷看小说被老师抓的那个孩子，如今成了畅销书作家。老板请你回公司演讲，主题是「时间管理」。',
  rating: () => 'S',
};
```

- [ ] **Step 4: Register in src/content/_registry.ts**

Add the imports and append to `ALL_EVENTS` / `ALL_ENDINGS`:

```typescript
import { secretReading } from './school/secret-reading';
import { slackerWriting } from './chains/slacker-author';
import { slackerAuthorEnding } from './endings/slacker-author';

export const ALL_EVENTS: GameEvent[] = [
  dreamGaokao,
  overworkCritical,
  secretReading,
  slackerWriting,
];

export const ALL_ENDINGS: Ending[] = [
  underworldHrEnding,
  rebornAsGaokaoEnding,
  slackerAuthorEnding,    // priority 90
  // ...default
];
```

- [ ] **Step 5: Run sanity test**

Run: `npm test -- registry`
Expected: PASS, 4 tests (still valid).

- [ ] **Step 6: Manual playtest**

Verify chain triggers and three outcome branches.

- [ ] **Step 7: Commit**

```bash
git add src/content/school/secret-reading.ts src/content/chains/slacker-author.ts src/content/endings/slacker-author.ts src/content/_registry.ts
git commit -m "feat(content): add招牌链 2 (摸鱼写小说 → 爆火作家)"
```

---

## Task 14: 流程保底事件 (20 events across 5 stages)

**Files:**
- Create: `src/content/childhood/_index.ts`, `src/content/school/_index.ts`, `src/content/college/_index.ts`, `src/content/career/_index.ts`, `src/content/retirement/_index.ts`
- Each file exports an array of `GameEvent[]`
- Modify: `src/content/_registry.ts`

**Goal:** 20 minimum events that make the life flow feel populated. Follow the structure shown below — each event is compact (1-2 choices, mostly 1 outcome per choice, no twist layers). The point is **flow**, not depth.

- [ ] **Step 1: Create src/content/childhood/_index.ts (4 events)**

```typescript
// src/content/childhood/_index.ts
import type { GameEvent } from '../../engine/types';

export const childhoodEvents: GameEvent[] = [
  {
    id: 'childhood_family_rich',
    stage: 'childhood', ageRange: [1, 3], once: true,
    trigger: { baseWeight: 3 },
    text: '你出生在一个殷实的家庭。父母带你到处旅行。',
    choices: [{ label: '继续', outcomes: [{
      weight: 100, condition: { all: [] },
      apply: (s) => { s.attrs.财富 += 10; s.attrs.智力 += 5; s.flags.add('milestone_rich_family'); },
      result: '你见多识广，比同龄人成熟。',
    }]}],
  },
  {
    id: 'childhood_family_poor',
    stage: 'childhood', ageRange: [1, 3], once: true,
    trigger: { baseWeight: 3, excludes: ['childhood_family_rich'] },
    text: '你的家境普通，父母为生活奔波。',
    choices: [{ label: '继续', outcomes: [{
      weight: 100, condition: { all: [] },
      apply: (s) => { s.attrs.体质 -= 5; s.attrs.智力 += 3; s.flags.add('milestone_poor_family'); },
      result: '你早早学会了独立。',
    }]}],
  },
  {
    id: 'childhood_talent_music',
    stage: 'childhood', ageRange: [4, 6], once: true,
    trigger: { baseWeight: 4 },
    text: '你听到邻居弹钢琴，眼睛一亮。',
    choices: [
      { label: '央求父母学钢琴', outcomes: [{
        weight: 100, condition: { attrGte: { 财富: 30 } },
        apply: (s) => { s.attrs.魅力 += 8; s.attrs.财富 -= 5; },
        result: '你开始学钢琴，气质逐渐显现。',
      }]},
      { label: '算了', outcomes: [{
        weight: 100, condition: { all: [] },
        apply: () => {},
        result: '你只是听听就算了。',
      }]},
    ],
  },
  {
    id: 'childhood_first_friend',
    stage: 'childhood', ageRange: [5, 6], once: true,
    trigger: { baseWeight: 5 },
    text: '你在公园认识了第一个好朋友。',
    choices: [{ label: '继续', outcomes: [{
      weight: 100, condition: { all: [] },
      apply: (s) => { s.attrs.快乐 += 10; s.flags.add('milestone_first_friend'); },
      result: '童年有了伙伴。',
    }]}],
  },
];
```

- [ ] **Step 2: Create src/content/school/_index.ts (5 events)**

Each event follows the same pattern. Topics to author (each 1-2 choices, simple outcomes):
1. `school_first_crush` (10-13 岁, +魅力/+快乐)
2. `school_exam_pressure` (15-17 岁, 智力 check → 高考表现)
3. `school_sports_tryout` (12-14 岁, +体质)
4. `school_rebellion` (14-16 岁, choice: 叛逆 / 乖巧)
5. `school_gaokao` (18 岁, 关键节点：高考结果，影响大学阶段)

Author each event following `childhoodEvents` structure. Example for `school_gaokao`:

```typescript
{
  id: 'school_gaokao',
  stage: 'school', ageRange: [18, 18], once: true,
  trigger: { baseWeight: 10 },
  text: '高考来了。你走出考场，心情复杂。',
  choices: [{ label: '继续', outcomes: [
    {
      weight: 30,
      condition: { attrGte: { 智力: 70 } },
      apply: (s) => { s.flags.add('milestone_top_university'); s.attrs.快乐 += 10; },
      result: '你考上了顶尖大学。',
    },
    {
      weight: 50,
      condition: { all: [{ attrLt: { 智力: 70 } }, { attrGte: { 智力: 50 } }] },
      apply: (s) => { s.flags.add('milestone_average_university'); },
      result: '你考上了一所普通大学。',
    },
    {
      weight: 20,
      condition: { attrLt: { 智力: 50 } },
      apply: (s) => { s.attrs.快乐 -= 10; s.flags.add('milestone_failed_gaokao'); },
      result: '高考失利，你上了大专。',
    },
  ]}],
},
```

Author the other 4 school events following the same template. Save all 5 in `src/content/school/_index.ts` as `schoolEvents` array.

- [ ] **Step 3: Create src/content/college/_index.ts (4 events)**

Topics (author each following childhoodEvents pattern):
1. `college_first_job_hunt` (22 岁, 影响 `milestone_has_job`)
2. `college_club_join` (19-21 岁, 加技能)
3. `college_internship` (20-22 岁, 加财富+技能)
4. `college_first_love` (19-22 岁, +快乐+魅力)

Critical: `college_first_job_hunt` MUST set `milestone_has_job` flag (used by招牌链 trigger).

```typescript
{
  id: 'college_first_job_hunt',
  stage: 'college', ageRange: [22, 22], once: true,
  trigger: { baseWeight: 10 },
  text: '毕业季到了，你开始找工作。',
  choices: [
    {
      label: '去大厂卷',
      outcomes: [{
        weight: 100,
        condition: { attrGte: { 智力: 60 } },
        apply: (s) => {
          s.flags.add('milestone_has_job');
          s.flags.add('milestone_first_job_tech');
          s.attrs.财富 += 15;
          s.attrs.体质 -= 10;
          s.attrs.快乐 -= 5;
        },
        result: '你拿到了大厂 offer，入职第一天就开始 996。',
      }],
    },
    {
      label: '找份轻松的工作',
      outcomes: [{
        weight: 100,
        condition: { all: [] },
        apply: (s) => {
          s.flags.add('milestone_has_job');
          s.attrs.财富 += 5;
          s.attrs.快乐 += 5;
        },
        result: '你进了一家小公司，朝九晚五。',
      }],
    },
  ],
},
```

- [ ] **Step 4: Create src/content/career/_index.ts (5 events)**

Topics:
1. `career_first_promotion` (27-32 岁, 加财富/声望)
2. `career_job_hopping` (28-35 岁, 选择：跳槽 / 留下)
3. `career_marriage` (28-40 岁, 加快乐/设置 `milestone_family`)
4. `career_house_loan` (30-45 岁, 选择：买房 / 租房，影响财富)
5. `career_layoff` (35-50 岁, 随机事件，可能失业)

Author each following childhoodEvents pattern. Example `career_marriage`:

```typescript
{
  id: 'career_marriage',
  stage: 'career', ageRange: [28, 40], once: true,
  trigger: { baseWeight: 8, requires: [{ flag: 'milestone_has_job' }] },
  text: '你和恋人到了谈婚论嫁的时候。',
  choices: [
    {
      label: '结婚生子',
      outcomes: [{
        weight: 100,
        condition: { attrGte: { 财富: 40 } },
        apply: (s) => {
          s.attrs.快乐 += 15;
          s.attrs.财富 -= 20;
          s.flags.add('milestone_family');
          s.flags.add('milestone_married');
        },
        result: '你成家了。',
      }],
    },
    {
      label: '丁克',
      outcomes: [{
        weight: 100,
        condition: { all: [] },
        apply: (s) => { s.attrs.快乐 += 10; s.flags.add('milestone_married'); },
        result: '你们选择丁克，享受二人世界。',
      }],
    },
    {
      label: '不结婚',
      outcomes: [{
        weight: 100,
        condition: { all: [] },
        apply: (s) => { s.attrs.快乐 += 5; s.flags.add('choice_stay_single'); },
        result: '你享受单身生活。',
      }],
    },
  ],
},
```

- [ ] **Step 5: Create src/content/retirement/_index.ts (2 events)**

Topics:
1. `retirement_pension` (61 岁, 设置退休，加快乐)
2. `retirement_legacy` (70-80 岁, 回响事件，根据 `milestone_*` flags 给不同文案)

```typescript
{
  id: 'retirement_pension',
  stage: 'retirement', ageRange: [61, 62], once: true,
  trigger: { baseWeight: 10 },
  text: '你正式退休了。',
  choices: [{ label: '继续', outcomes: [{
    weight: 100,
    condition: { all: [] },
    apply: (s) => { s.attrs.快乐 += 10; s.flags.add('milestone_retired'); },
    result: '你开始享受退休生活。',
  }]}],
},
```

- [ ] **Step 6: Register all flow events in src/content/_registry.ts**

```typescript
import { childhoodEvents } from './childhood/_index';
import { schoolEvents } from './school/_index';
import { collegeEvents } from './college/_index';
import { careerEvents } from './career/_index';
import { retirementEvents } from './retirement/_index';

export const ALL_EVENTS: GameEvent[] = [
  // 铺垫
  dreamGaokao,
  secretReading,
  // 招牌链
  overworkCritical,
  slackerWriting,
  // 流程保底
  ...childhoodEvents,
  ...schoolEvents,
  ...collegeEvents,
  ...careerEvents,
  ...retirementEvents,
];
```

- [ ] **Step 7: Run sanity test**

Run: `npm test -- registry`
Expected: PASS — unique IDs, valid nextEvent refs, one default ending.

- [ ] **Step 8: Manual playtest**

Play a full life from 1 to death. Verify each stage has events firing.

- [ ] **Step 9: Commit**

```bash
git add src/content/childhood/_index.ts src/content/school/_index.ts src/content/college/_index.ts src/content/career/_index.ts src/content/retirement/_index.ts src/content/_registry.ts
git commit -m "feat(content): add 20 flow events across all 5 life stages"
```

---

## Task 15: 阈值分支事件 (crisis / peak / midlife)

**Files:**
- Create: `src/content/thresholds/crisis-low-happiness.ts`, `src/content/thresholds/crisis-low-constitution.ts`, `src/content/thresholds/peak-high-combined.ts`, `src/content/thresholds/midlife-crisis.ts`
- Create: 1 hidden ending: `src/content/endings/monk.ts` (出家线)
- Modify: `src/content/_registry.ts`

**Flag contract:** `crisis_low_happiness_fired`, `crisis_low_constitution_fired`, `peak_high_combined_fired`, `midlife_crisis_fired`, `choice_midlife_monk`.

**Design rule (spec §5):** Each threshold event has 3-4 choices with at least one "return to normal" and at least one "commit to extreme / pivot".

- [ ] **Step 1: Create src/content/thresholds/crisis-low-happiness.ts**

```typescript
// src/content/thresholds/crisis-low-happiness.ts
import type { GameEvent } from '../../engine/types';
import { THRESHOLDS } from '../../engine/constants';

export const crisisLowHappiness: GameEvent = {
  id: 'threshold_low_happiness',
  stage: 'career', // any non-childhood stage works; we filter via trigger.requires
  ageRange: [20, 75],
  once: true,
  trigger: {
    baseWeight: 0, // 不参与常规抽取 —— 由 loop 检测阈值触发
    requires: [
      { attrLt: { 快乐: THRESHOLDS.lowHappiness } }, // 20，constants 里
      { notFlag: 'crisis_low_happiness_fired' },
    ],
  },
  text: '你最近常常失眠，对什么都提不起兴趣。是时候做点什么了。',
  choices: [
    {
      label: '找朋友倾诉',
      outcomes: [{
        weight: 100,
        condition: { all: [] },
        apply: (s) => {
          s.attrs.快乐 += 15;
          s.attrs.财富 -= 5;
          s.flags.add('crisis_low_happiness_fired');
        },
        result: '朋友拉你出去喝酒吐槽，你好受多了。',
      }],
    },
    {
      label: '借酒消愁',
      outcomes: [{
        weight: 100,
        condition: { all: [] },
        apply: (s) => {
          s.attrs.快乐 -= 5;
          s.attrs.体质 -= 10;
          s.flags.add('crisis_low_happiness_fired');
        },
        result: '你越喝越颓废。',
      }],
    },
    {
      label: '化悲愤为动力，加班',
      outcomes: [{
        weight: 100,
        condition: { all: [] },
        apply: (s) => {
          s.attrs.快乐 -= 5;
          s.attrs.财富 += 15;
          s.flags.add('crisis_low_happiness_fired');
        },
        result: '你把痛苦转化为产出，老板很高兴。',
      }],
    },
    {
      label: '（需要智力 60）顿悟人生',
      hint: '需要 智力≥60',
      visibleWhen: { attrGte: { 智力: 60 } },
      outcomes: [{
        weight: 100,
        condition: { attrGte: { 智力: 60 } },
        apply: (s) => {
          s.flags.add('choice_midlife_monk_early');
          s.attrs.快乐 += 30;
          s.flags.add('crisis_low_happiness_fired');
        },
        nextEvent: 'ending_monk',
        result: '你突然看破了红尘。',
      }],
    },
  ],
};
```

- [ ] **Step 2: Create src/content/thresholds/crisis-low-constitution.ts**

```typescript
// src/content/thresholds/crisis-low-constitution.ts
import type { GameEvent } from '../../engine/types';
import { THRESHOLDS } from '../../engine/constants';

export const crisisLowConstitution: GameEvent = {
  id: 'threshold_low_constitution',
  stage: 'career',
  ageRange: [25, 75],
  once: true,
  trigger: {
    baseWeight: 0,
    requires: [
      { attrLt: { 体质: THRESHOLDS.lowConstitution } },
      { notFlag: 'crisis_low_constitution_fired' },
    ],
  },
  text: '你最近总是胸闷气短，体重也涨了不少。',
  choices: [
    {
      label: '住院体检',
      outcomes: [{
        weight: 100,
        condition: { attrGte: { 财富: 30 } },
        apply: (s) => {
          s.attrs.体质 += 20;
          s.attrs.财富 -= 20;
          s.flags.add('crisis_low_constitution_fired');
        },
        result: '医生警告你注意身体，你乖乖听话。',
      }],
    },
    {
      label: '开始健身',
      outcomes: [{
        weight: 100,
        condition: { all: [] },
        apply: (s) => {
          s.attrs.体质 += 10;
          s.attrs.快乐 += 5;
          s.flags.add('crisis_low_constitution_fired');
        },
        result: '你开始跑步，慢慢恢复。',
      }],
    },
    {
      label: '硬扛，没时间管这些',
      outcomes: [{
        weight: 100,
        condition: { all: [] },
        apply: (s) => {
          s.attrs.体质 -= 5; // 进一步恶化
          s.flags.add('crisis_low_constitution_fired');
        },
        result: '你继续硬撑。',
      }],
    },
  ],
};
```

- [ ] **Step 3: Create src/content/thresholds/peak-high-combined.ts**

```typescript
// src/content/thresholds/peak-high-combined.ts
import type { GameEvent } from '../../engine/types';
import { THRESHOLDS } from '../../engine/constants';

export const peakHighCombined: GameEvent = {
  id: 'threshold_peak_high',
  stage: 'career',
  ageRange: [30, 60],
  once: true,
  trigger: {
    baseWeight: 0,
    requires: [{ notFlag: 'peak_high_combined_fired' }],
    // 注：复合条件 happy+wealth>150 不能用单个 Condition 表达，需要 loop 主动检查
    // 这里 requires 只挡 flag，实际触发在 loop 里手动判断
  },
  text: '你的人生达到了前所未有的高度。财富和快乐同时爆表。',
  choices: [
    {
      label: '继续冲刺，野心不止',
      outcomes: [{
        weight: 100,
        condition: { all: [] },
        apply: (s) => {
          s.flags.add('peak_high_combined_fired');
          s.flags.add('choice_empire_arc');
        },
        result: '你踏上了商业帝国的征途。',
      }],
    },
    {
      label: '知足常乐，享受生活',
      outcomes: [{
        weight: 100,
        condition: { all: [] },
        apply: (s) => {
          s.flags.add('peak_high_combined_fired');
          s.flags.add('choice_content_life');
          s.attrs.快乐 += 10;
        },
        result: '你开始享受人生。',
      }],
    },
    {
      label: '突然感到空虚',
      outcomes: [{
        weight: 100,
        condition: { all: [] },
        apply: (s) => {
          s.flags.add('peak_high_combined_fired');
          s.attrs.快乐 -= 15;
        },
        result: '一切都有了，但你不知道自己想要什么。',
      }],
    },
  ],
};
```

- [ ] **Step 4: Create src/content/thresholds/midlife-crisis.ts**

```typescript
// src/content/thresholds/midlife-crisis.ts
import type { GameEvent } from '../../engine/types';

export const midlifeCrisis: GameEvent = {
  id: 'threshold_midlife_crisis',
  stage: 'career',
  ageRange: [40, 50],
  once: true,
  trigger: {
    baseWeight: 0,
    requires: [{ notFlag: 'midlife_crisis_fired' }],
  },
  text: '四十不惑？你觉得自己越活越迷糊。',
  choices: [
    {
      label: '事业巅峰，危机解除',
      outcomes: [{
        weight: 100,
        condition: { skillGte: { 软: 50 } },
        apply: (s) => {
          s.attrs.财富 += 20;
          s.attrs.快乐 += 5;
          s.flags.add('midlife_crisis_fired');
        },
        result: '你事业蒸蒸日上，中年危机不过是过眼云烟。',
      }],
    },
    {
      label: '辞职创业',
      outcomes: [{
        weight: 100,
        condition: { all: [] },
        apply: (s) => {
          s.attrs.财富 -= 20;
          s.flags.add('choice_startup');
          s.flags.add('midlife_crisis_fired');
        },
        result: '你赌上了全部身家。',
      }],
    },
    {
      label: '顿悟出家',
      outcomes: [{
        weight: 100,
        condition: { all: [] },
        apply: (s) => {
          s.flags.add('choice_midlife_monk');
          s.flags.add('midlife_crisis_fired');
        },
        nextEvent: 'ending_monk',
        result: '你剃度出家。',
      }],
    },
    {
      label: '摆烂到底',
      outcomes: [{
        weight: 100,
        condition: { all: [] },
        apply: (s) => {
          s.attrs.快乐 -= 20;
          s.flags.add('midlife_crisis_fired');
        },
        result: '你开始彻底躺平。',
      }],
    },
  ],
};
```

- [ ] **Step 5: Create hidden ending src/content/endings/monk.ts**

```typescript
// src/content/endings/monk.ts
import type { Ending } from '../../engine/types';

export const monkEnding: Ending = {
  id: 'ending_monk',
  priority: 70,
  condition: (s) => s.flags.has('choice_midlife_monk') || s.flags.has('choice_midlife_monk_early'),
  title: '顿悟出家',
  desc: () => '你看破了红尘，遁入空门。青灯古佛，倒也清净。',
  rating: () => 'B',
};
```

- [ ] **Step 6: Wire threshold detection into loop**

Modify `src/engine/loop.ts` to expose a function:

```typescript
// 添加到 src/engine/loop.ts
import { THRESHOLDS } from './constants';
import { evaluateCondition } from './condition';

export function detectThresholdEvents(
  thresholdEvents: ReadonlyArray<GameEvent>,
  state: GameState,
): string[] {
  const triggered: string[] = [];
  for (const ev of thresholdEvents) {
    if (ev.trigger.baseWeight > 0) continue; // 只看 baseWeight=0 的阈值事件
    if (state.history.includes(ev.id)) continue;
    if (!ev.trigger.requires?.every((c) => evaluateCondition(c, state))) continue;
    // 复合条件（如快乐+财富>150）在这里手动判断
    if (ev.id === 'threshold_peak_high') {
      if (state.attrs.快乐 + state.attrs.财富 <= THRESHOLDS.peakCombined) continue;
    }
    if (ev.id === 'threshold_midlife_crisis') {
      const [min, max] = THRESHOLDS.midlifeAgeRange;
      if (state.age < min || state.age > max) continue;
    }
    triggered.push(ev.id);
  }
  return triggered;
}
```

Modify `src/stores/game.ts` `selectChoice` and `advanceYear` to call `detectThresholdEvents` after each event/year, appending to `currentEventIds`.

Add to imports:
```typescript
import { detectThresholdEvents } from '../engine/loop';
```

In `startYear()`, after `selectEventsForYear(...)`:
```typescript
const thresholdIds = detectThresholdEvents(ALL_EVENTS.filter((e) => e.trigger.baseWeight === 0), state.value);
currentEventIds.value = [...ids, ...thresholdIds];
```

Same for `selectChoice()` after applying outcome:
```typescript
if (!outcome.nextEvent?.startsWith('ending_')) {
  const moreThreshold = detectThresholdEvents(ALL_EVENTS.filter((e) => e.trigger.baseWeight === 0), state.value);
  if (moreThreshold.length > 0) {
    currentEventIds.value = [...currentEventIds.value, ...moreThreshold];
    loadCurrentEvent();
    return;
  }
  eventQueueIndex.value += 1;
  loadCurrentEvent();
}
```

- [ ] **Step 7: Register threshold events + ending in src/content/_registry.ts**

```typescript
import { crisisLowHappiness } from './thresholds/crisis-low-happiness';
import { crisisLowConstitution } from './thresholds/crisis-low-constitution';
import { peakHighCombined } from './thresholds/peak-high-combined';
import { midlifeCrisis } from './thresholds/midlife-crisis';
import { monkEnding } from './endings/monk';

// Append to ALL_EVENTS:
// threshold events
crisisLowHappiness,
crisisLowConstitution,
peakHighCombined,
midlifeCrisis,

// Append to ALL_ENDINGS:
// monkEnding (priority 70)
```

Also add missing endings from spec §6.1 if not yet present (富豪, 幸福家庭, 早逝). Append before default:

```typescript
import type { Ending } from '../engine/types';

const richEnding: Ending = {
  id: 'ending_rich', priority: 50,
  condition: (s) => s.attrs.财富 >= 85 && s.skills.软 >= 60,
  title: '富豪',
  desc: (s) => `你以 ${s.attrs.财富} 的财富退休，儿女环绕。`,
  rating: () => 'S',
};

const happyFamilyEnding: Ending = {
  id: 'ending_happy_family', priority: 50,
  condition: (s) => s.attrs.快乐 >= 70 && s.flags.has('milestone_family'),
  title: '幸福家庭',
  desc: () => '你有一个温暖的家，儿女孝顺，老伴相守。',
  rating: () => 'A',
};

const earlyDeathEnding: Ending = {
  id: 'ending_early_death', priority: 40,
  condition: (s) => s.age < 50,
  title: '早逝',
  desc: (s) => `你在 ${s.age} 岁离世，留下太多遗憾。`,
  rating: () => 'D',
};

// 在 ALL_ENDINGS 中按 priority 降序插入
```

- [ ] **Step 8: Run sanity test**

Run: `npm test`
Expected: All tests PASS.

- [ ] **Step 9: Manual playtest**

Trigger each threshold event by manipulating state via devtools:
- Set 快乐 < 20 → crisis event
- Set 体质 < 15 → health crisis
- Set 快乐 + 财富 > 150 → peak event
- Reach age 40-50 → midlife crisis

- [ ] **Step 10: Commit**

```bash
git add src/content/thresholds/ src/content/endings/monk.ts src/content/_registry.ts src/engine/loop.ts src/stores/game.ts
git commit -m "feat(content): add threshold events (crisis/peak/midlife) + hidden ending"
```

---

# Phase 6: NG+ & Polish (Task 16)

## Task 16: NG+ Carryover + Ending Polish + History

**Files:**
- Modify: `src/views/EndingView.vue`, `src/stores/game.ts`, `src/components/HistoryPanel.vue`
- Create: `src/components/EndingShare.vue` (optional simple share card)

**Interfaces:** None new externally.

- [ ] **Step 1: Enhance EndingView with rating + ending display + NG+ offer**

```vue
<script setup lang="ts">
import { computed } from 'vue';
import { useGameStore } from '../stores/game';
import { findEnding } from '../content/_registry';
import { calcRating } from '../engine/rating';
import type { CarryingKind } from '../engine/types';

const store = useGameStore();

const ending = computed(() => store.currentEndingId ? findEnding(store.currentEndingId) : null);
const rating = computed(() => store.state ? calcRating(store.state) : 'D');

const carryoverOptions: Array<{ kind: CarryingKind; label: string; desc: string }> = [
  { kind: 'intelligence', label: '智力 +15', desc: '起手属性优势' },
  { kind: 'soft', label: '软技能 +15', desc: '起手属性优势' },
  { kind: 'slacker', label: '摸鱼 +15', desc: '起手属性优势' },
  { kind: 'memory', label: '前世记忆', desc: '解锁部分事件的额外选项，罕见反转概率 +5%' },
];

function startNGP(kind: CarryingKind) {
  const seed = Math.floor(Math.random() * 1e9);
  store.newGame(seed, kind);
}
function backToStart() {
  store.setView('start');
}
</script>

<template>
  <div v-if="ending && store.state" class="ending-view">
    <div class="rating" :class="rating">评级：{{ rating }}</div>
    <h1>{{ ending.title }}</h1>
    <p class="desc">{{ ending.desc(store.state) }}</p>
    <div class="meta">
      <span>享年 {{ store.state.age }}</span>
      <span>第 {{ store.state.meta.playthrough }} 周目</span>
    </div>

    <section class="ngp">
      <h2>开启二周目（任选一项继承）</h2>
      <div class="options">
        <button v-for="opt in carryoverOptions" :key="opt.kind" @click="startNGP(opt.kind)">
          <strong>{{ opt.label }}</strong>
          <small>{{ opt.desc }}</small>
        </button>
      </div>
      <button class="link" @click="backToStart">返回首页</button>
    </section>
  </div>
</template>

<style scoped>
.ending-view { padding: 2rem; max-width: 600px; margin: 0 auto; text-align: center; }
.rating { display: inline-block; padding: 0.25rem 1rem; font-size: 1.5rem; font-weight: bold;
  border-radius: 4px; margin-bottom: 1rem; }
.rating.S { background: gold; color: black; }
.rating.A { background: #c0c0c0; color: black; }
.rating.B { background: #cd7f32; color: white; }
.rating.C { background: #888; color: white; }
.rating.D { background: #444; color: white; }
.desc { line-height: 1.6; margin: 1rem 0; }
.meta { color: #666; display: flex; gap: 1rem; justify-content: center; }
.ngp { margin-top: 2rem; padding-top: 1rem; border-top: 1px solid #ddd; }
.options { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; margin: 1rem 0; }
.options button { display: flex; flex-direction: column; padding: 0.75rem; cursor: pointer; }
.options small { color: #666; }
.link { background: none; border: none; color: #666; cursor: pointer; }
</style>
```

- [ ] **Step 2: Apply NG+ memory bonus in outcome resolution**

Modify `src/stores/game.ts` `selectChoice` to apply memory bonus. Before `resolveChoice`:

```typescript
import { ALL_EVENTS } from '../content/_registry';
// 已有

// 在 selectChoice 里：
function selectChoice(choice: GameEvent['choices'][number]) {
  if (!state.value || !currentEvent.value) return;
  // NG+ 前世记忆：罕见反转 weight +5%
  if (state.value.flags.has('ng_plus_memory')) {
    choice = {
      ...choice,
      outcomes: choice.outcomes.map((o) => ({ ...o, weight: o.weight * 1.05 })),
    };
  }
  const outcome = resolveChoice(choice, state.value, rng.value);
  // ...
}
```

- [ ] **Step 3: Add 1-2 前世记忆 extra choices to招牌链 1 (proves the feature)**

Modify `src/content/chains/overwork-death.ts` to add an extra choice gated by `ng_plus_memory`:

```typescript
// 添加到 choices 数组（在最后）：
{
  label: '（前世记忆）你想起这种情况通常……',
  hint: '需要 NG+ 前世记忆',
  visibleWhen: { flag: 'ng_plus_memory' },
  outcomes: [{
    weight: 100,
    condition: { flag: 'ng_plus_memory' },
    apply: (s) => {
      s.attrs.快乐 += 5;
      s.flags.add('choice_used_memory');
    },
    result: '你想起上辈子就是这里出的事，这次你巧妙避开。',
  }],
},
```

- [ ] **Step 4: Create src/components/HistoryPanel.vue**

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { useGameStore } from '../stores/game';
const store = useGameStore();
const expanded = ref(false);
</script>

<template>
  <div class="history-panel">
    <button @click="expanded = !expanded">事件历史 ▼</button>
    <div v-if="expanded" class="list">
      <div v-for="id in [...store.state?.history ?? []].reverse()" :key="id" class="entry">
        {{ id }}
      </div>
      <div v-if="(store.state?.history?.length ?? 0) === 0" class="empty">暂无</div>
    </div>
  </div>
</template>

<style scoped>
.history-panel { position: relative; }
.list { position: absolute; bottom: 100%; left: 0; max-height: 200px; overflow-y: auto;
  background: white; border: 1px solid #ccc; padding: 0.5rem; min-width: 200px; }
.entry { padding: 0.25rem 0; font-family: monospace; font-size: 0.85rem; }
.empty { color: #999; }
</style>
```

- [ ] **Step 5: Add HistoryPanel to GameView**

Modify `src/views/GameView.vue` footer:

```vue
<footer class="bottombar">
  <HistoryPanel />
  <button class="next-year" @click="nextYear" :disabled="!!store.currentEvent">
    下一年 →
  </button>
</footer>
```

Add import:
```typescript
import HistoryPanel from '../components/HistoryPanel.vue';
```

- [ ] **Step 6: Manual playtest**

Play a full game → see ending screen with rating + NG+ offer
Click "前世记忆" → new game starts, verify extra choice appears in招牌链 1.

- [ ] **Step 7: Commit**

```bash
git add src/views/EndingView.vue src/stores/game.ts src/components/HistoryPanel.vue src/views/GameView.vue src/content/chains/overwork-death.ts
git commit -m "feat: NG+ carryover (4 options), ending polish with rating, history panel"
```

---

# Self-Review

## 1. Spec Coverage Check

| Spec Section | Covered by |
|---|---|
| §1.1 MVP scope (1-death, ~30 events, 8 endings, 2 招牌链, NG+, single-player web) | All phases |
| §2 Twist mechanism (3-layer outcomes, foreshadowing) | Task 6 (outcome resolver), Tasks 12-13 (招牌链 with 铺垫) |
| §3 Architecture (3-layer, TS native, types, condition DSL) | Tasks 2-3 (types), Task 4 (condition), Tasks 12-15 (TS content) |
| §4 Attribute model (9 dim + 2 derived) | Task 2 (types), Task 3 (fixtures); derived 属性 noted as TODO via flag-counting in Task 7 rating |
| §5 Threshold branching (crisis/peak/midlife) | Task 15 |
| §6 Endings & rating | Task 7, Tasks 12-15 |
| §7 NG+ simplified | Task 16 |
| §8 Experience curve (stage density, 1 turn = 1 year) | Task 9 (loop), Tasks 14 (flow events with stage distribution) |
| §9 Save system | Task 8 |
| §10 UI (横屏 layout) | Tasks 10-11 |
| §11 Tech stack (Vue 3 + Pinia + Vite + TS + Vitest) | Task 1 |
| §12 File structure | Mapped at top of plan |
| §13 招牌链 1 (加班猝死) | Task 12 |
| §13 招牌链 2 (摸鱼作家) | Task 13 |

**Gaps found & addressed:**
- **Derived attributes (人脉/声望)**: Spec §4.2 mentions these as derived from flags. Not implemented as separate values — events directly check flags instead (e.g., `flag: 'milestone_married'` instead of `networkGte: 30`). This is simpler and consistent with §4.2 ("不存为数值，需要时计算"). Acceptable for MVP.
- **Spec §14 open questions** (RNG algorithm, etc.): Resolved in plan (mulberry32 for RNG).

## 2. Placeholder Scan

- Task 14 has "Author each following X pattern" instructions for some events — this is task work (write content following established template), not a plan placeholder. The template is shown in full.
- No "TBD", "TODO", "fill in details" otherwise.

## 3. Type Consistency

- `Condition` shape: `{ flag }`, `{ attrGte }`, `{ all: [] }` for always-true — used consistently in tests and content.
- `GameEvent.trigger.baseWeight = 0` as sentinel for "threshold event, do not pick in normal selection" — used in Task 15 and Task 9's `selectEventsForYear`.
- Function signatures: `resolveChoice(choice, state, rng)`, `selectEventsForYear(events, state, rng)`, `evaluateCondition(condition, state)`, `applyOutcomeToState(state, outcome, eventId)`. All consistent across tasks.

---

# Execution Handoff

Plan complete and saved to `docs/plans/2026-07-07-life-simulator-mvp.md`. Two execution options:

**1. Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration.

**2. Inline Execution** — Execute tasks in this session using executing-plans, batch execution with checkpoints.

**Which approach?**
