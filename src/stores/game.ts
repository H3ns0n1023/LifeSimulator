// src/stores/game.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { GameState } from '../engine/types';
import { STAGE_OF_AGE, BASE_LIFESPAN, LIFESPAN_VARIANCE, CARRYOVER_BONUS } from '../engine/constants';
import { loadGame, saveGame, clearSave, hasSave, type SaveData } from '../utils/save';
import { resolveChoice } from '../engine/outcome';
import { selectEventsForYear, applyYearlyTick, applyOutcomeToState, checkDeath, detectThresholdEvents } from '../engine/loop';
import { resolveEnding } from '../engine/ending';
import { mulberry32, randomInt } from '../engine/rng';
import { ALL_EVENTS, ALL_ENDINGS, findEvent } from '../content/_registry';
import type { Outcome, GameEvent } from '../engine/types';

type View = 'start' | 'game' | 'ending' | 'settings' | 'gallery';

export const useGameStore = defineStore('game', () => {
  const state = ref<GameState | null>(null);
  const view = ref<View>('start');
  const currentEventIds = ref<string[]>([]);
  const eventQueueIndex = ref(0);
  const currentEndingId = ref<string | null>(null);
  const unlockedEndings = ref<string[]>([]);
  const totalPlaythroughs = ref(0);
  const lastLog = ref<string[]>([]);
  const currentEvent = ref<GameEvent | null>(null);
  const lastOutcome = ref<Outcome | null>(null);
  const rng = ref<() => number>(() => Math.random());

  const hasOngoingGame = computed(() => state.value !== null && view.value === 'game');

  function newGame(seed: number, carryover?: GameState['meta']['carryover']) {
    // 起手状态：童年、在校、单身、健康、月薪 0、五线积分 0
    state.value = {
      age: 1,
      stage: 'childhood',
      salary: 0,
      health: 'healthy',
      diseases: new Set(),
      employment: 'student',
      marriage: 'single',
      scores: { career: 0, family: 0, freedom: 0, fame: 0, spirit: 0 },
      flags: new Set(),
      history: [],
      meta: { seed, playthrough: totalPlaythroughs.value + 1, carryover },
    };
    // 应用 NG+ 继承（四类语义：career/family/freedom 加对应线积分，memory 解锁隐藏选项）
    if (carryover === 'career' || carryover === 'family' || carryover === 'freedom') {
      const bonus = CARRYOVER_BONUS[carryover];
      state.value.scores[bonus.track] += bonus.score;
    }
    if (carryover === 'memory') {
      state.value.flags.add('ng_plus_memory');
    }
    view.value = 'game';
    currentEventIds.value = [];
    eventQueueIndex.value = 0;
    currentEndingId.value = null;
    currentEvent.value = null;
    lastOutcome.value = null;  // ← 清掉上一世的结局/事件描述，避免开局串戏
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
    // 清运行时显示状态，避免继续上局时看到上次结局描述
    currentEvent.value = null;
    lastOutcome.value = null;
    currentEventIds.value = [];
    eventQueueIndex.value = 0;
    currentEndingId.value = null;
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

  function startYear() {
    if (!state.value) return;
    rng.value = mulberry32(state.value.meta.seed + state.value.age * 7919);
    const ids = selectEventsForYear(ALL_EVENTS, state.value, rng.value);
    const thresholdIds = detectThresholdEvents(
      ALL_EVENTS.filter((e) => e.trigger.baseWeight === 0), state.value,
    );
    currentEventIds.value = [...ids, ...thresholdIds];
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
    // NG+ 前世记忆：罕见反转 weight +5%
    if (state.value.flags.has('ng_plus_memory')) {
      choice = {
        ...choice,
        outcomes: choice.outcomes.map((o) => ({ ...o, weight: o.weight * 1.05 })),
      };
    }
    const outcome = resolveChoice(choice, state.value, rng.value);
    if (!outcome) {
      lastOutcome.value = { weight: 0, condition: { all: [] }, apply: () => {}, result: '（似乎什么也没发生。）' };
      eventQueueIndex.value += 1;
      loadCurrentEvent();
      return;
    }
    applyOutcomeToState(state.value, outcome, currentEvent.value.id);
    lastOutcome.value = outcome;
    // 如果 outcome 指向结局，直接进入结局判定
    if (outcome.nextEvent?.startsWith('ending_')) {
      finalizeEnding();
      return;
    }
    // 先推进队列（跳过刚处理完的事件），再检测 apply 后可能新触发的阈值事件
    eventQueueIndex.value += 1;
    const moreThreshold = detectThresholdEvents(
      ALL_EVENTS.filter((e) => e.trigger.baseWeight === 0), state.value,
    );
    if (moreThreshold.length > 0) {
      currentEventIds.value = [...currentEventIds.value, ...moreThreshold];
    }
    loadCurrentEvent();
  }

  function advanceYear() {
    if (!state.value) return;
    // 用种子派生本年 rng（health 衰减也用它，保证可复现）
    const yearRng = mulberry32(state.value.meta.seed + state.value.age * 7919 + 1);
    applyYearlyTick(state.value, yearRng);
    // 寿命 = 基础寿命 ± 波动（种子派生，每局固定）
    const lifespan = BASE_LIFESPAN + randomInt(mulberry32(state.value.meta.seed + 999), -LIFESPAN_VARIANCE, LIFESPAN_VARIANCE);
    if (checkDeath(state.value, lifespan)) {
      finalizeEnding();
      return;
    }
    // 清掉去年的事件结果描述，避免新一年开头残留旧文字
    lastOutcome.value = null;
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

  return {
    state, view, currentEventIds, eventQueueIndex, currentEndingId,
    unlockedEndings, totalPlaythroughs, lastLog, currentEvent, lastOutcome,
    allEndings: ALL_ENDINGS,
    hasOngoingGame, newGame, persist, loadFromSave, checkHasSave, resetAll, setView,
    startYear, selectChoice, advanceYear,
  };
});
