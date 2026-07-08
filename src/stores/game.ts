// src/stores/game.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { GameState } from '../engine/types';
import { STAGE_OF_AGE } from '../engine/constants';
import { loadGame, saveGame, clearSave, hasSave, type SaveData } from '../utils/save';
import { resolveChoice } from '../engine/outcome';
import { selectEventsForYear, applyYearlyTick, applyOutcomeToState, checkDeath, detectThresholdEvents } from '../engine/loop';
import { resolveEnding } from '../engine/ending';
import { mulberry32 } from '../engine/rng';
import { BASE_LIFESPAN, LIFESPAN_VARIANCE } from '../engine/constants';
import { ALL_EVENTS, ALL_ENDINGS, findEvent } from '../content/_registry';
import type { Outcome, GameEvent } from '../engine/types';

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
  const currentEvent = ref<GameEvent | null>(null);
  const lastOutcome = ref<Outcome | null>(null);
  const rng = ref<() => number>(() => Math.random());

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

  return {
    state, view, currentEventIds, eventQueueIndex, currentEndingId,
    unlockedEndings, totalPlaythroughs, lastLog, currentEvent, lastOutcome,
    hasOngoingGame, newGame, persist, loadFromSave, checkHasSave, resetAll, setView,
    startYear, selectChoice, advanceYear,
  };
});

function seedRandom(seed: number, n: number): number {
  // 简单确定性 hash，给 newGame 起手属性用
  let x = seed + n * 2654435761;
  x = Math.imul(x ^ (x >>> 15), 2246822507);
  x = Math.imul(x ^ (x >>> 13), 3266489909);
  return ((x ^ (x >>> 16)) >>> 0) / 4294967296;
}
