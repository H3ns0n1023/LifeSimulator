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
