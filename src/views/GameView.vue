<script setup lang="ts">
import { onMounted } from 'vue';
import { useGameStore } from '../stores/game';
import AttrPanel from '../components/AttrPanel.vue';
import EventCard from '../components/EventCard.vue';
import HistoryPanel from '../components/HistoryPanel.vue';

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
      <HistoryPanel />
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
