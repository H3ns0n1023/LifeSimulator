<script setup lang="ts">
import { useGameStore } from './stores/game';
import StartView from './views/StartView.vue';
import GameView from './views/GameView.vue';
import EndingView from './views/EndingView.vue';
import SettingsView from './views/SettingsView.vue';
import GalleryView from './views/GalleryView.vue';

const store = useGameStore();
</script>

<template>
  <StartView v-if="store.view === 'start'" />
  <GameView v-else-if="store.view === 'game'" />
  <EndingView v-else-if="store.view === 'ending'" />
  <SettingsView v-else-if="store.view === 'settings'" />
  <GalleryView v-else-if="store.view === 'gallery'" />
</template>
