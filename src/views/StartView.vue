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
      <button @click="store.setView('gallery')">结局图鉴</button>
      <button @click="store.setView('settings')">设置</button>
    </div>
    <p v-if="store.allEndings.length > 0" class="progress-hint">
      已解锁 {{ store.unlockedEndings.length }} / {{ store.allEndings.length }} 个结局
    </p>
  </div>
</template>

<style scoped>
.start-view { text-align: center; padding: 4rem 1rem; }
.subtitle { color: #666; margin-bottom: 2rem; }
.actions { display: flex; flex-direction: column; gap: 0.75rem; max-width: 280px; margin: 0 auto; }
button { padding: 0.75rem 1.5rem; font-size: 1rem; cursor: pointer; }
button.primary { background: #2c3e50; color: white; border: none; }
.progress-hint { margin-top: 2rem; color: #999; font-size: 0.85rem; }
</style>
