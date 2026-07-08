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
