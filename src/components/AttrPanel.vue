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
