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
