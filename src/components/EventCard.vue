<script setup lang="ts">
import { computed } from 'vue';
import type { GameEvent, Outcome, GameState } from '../engine/types';
import ChoiceButton from './ChoiceButton.vue';
import { evaluateCondition } from '../engine/condition';

const props = defineProps<{
  event: GameEvent | null;
  state: GameState;
  lastOutcome: Outcome | null;
}>();

const emit = defineEmits<{ choice: [GameEvent['choices'][number]] }>();

// 动态文案求值：text/label/result 可能是函数，传入 state 求值
const eventText = computed(() => {
  if (!props.event) return '';
  return typeof props.event.text === 'function' ? props.event.text(props.state) : props.event.text;
});
const resultText = computed(() => {
  if (!props.lastOutcome) return '';
  return typeof props.lastOutcome.result === 'function'
    ? props.lastOutcome.result(props.state) : props.lastOutcome.result;
});
function labelOf(c: GameEvent['choices'][number]): string {
  return typeof c.label === 'function' ? c.label(props.state) : c.label;
}
</script>

<template>
  <section class="event-card">
    <template v-if="event">
      <p class="event-text">{{ eventText }}</p>
      <div class="choices">
        <template v-for="c in event.choices" :key="labelOf(c)">
          <ChoiceButton
            v-if="!c.visibleWhen || evaluateCondition(c.visibleWhen, state)"
            :label="labelOf(c)"
            :hint="c.hint"
            @select="emit('choice', c)"
          />
        </template>
      </div>
    </template>
    <template v-else>
      <p class="event-text">这一年平静地过去了……</p>
    </template>

    <p v-if="lastOutcome" class="outcome-result">{{ resultText }}</p>
  </section>
</template>

<style scoped>
.event-card { padding: 1.5rem; background: white; min-height: 300px; }
.event-text { font-size: 1.1rem; line-height: 1.6; margin-bottom: 1rem; }
.choices { display: flex; flex-direction: column; gap: 0.25rem; }
.outcome-result { margin-top: 1rem; padding: 0.75rem; background: #fffbeb; border-left: 3px solid #f59e0b; }
</style>
