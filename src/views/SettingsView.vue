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
