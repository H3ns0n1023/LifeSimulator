<script setup lang="ts">
import type { GameEvent, Outcome, GameState } from '../engine/types';
import ChoiceButton from './ChoiceButton.vue';
import { evaluateCondition } from '../engine/condition';

const props = defineProps<{
  event: GameEvent | null;
  state: GameState;
  lastOutcome: Outcome | null;
}>();

const emit = defineEmits<{ choice: [GameEvent['choices'][number]] }>();
</script>

<template>
  <section class="event-card">
    <template v-if="event">
      <p class="event-text">{{ event.text }}</p>
      <div class="choices">
        <template v-for="c in event.choices" :key="c.label">
          <ChoiceButton
            v-if="!c.visibleWhen || evaluateCondition(c.visibleWhen, state)"
            :label="c.label"
            :hint="c.hint"
            @select="emit('choice', c)"
          />
        </template>
      </div>
    </template>
    <template v-else>
      <p class="event-text">这一年平静地过去了……</p>
    </template>

    <p v-if="lastOutcome" class="outcome-result">{{ lastOutcome.result }}</p>
  </section>
</template>

<style scoped>
.event-card { padding: 1.5rem; background: white; min-height: 300px; }
.event-text { font-size: 1.1rem; line-height: 1.6; margin-bottom: 1rem; }
.choices { display: flex; flex-direction: column; gap: 0.25rem; }
.outcome-result { margin-top: 1rem; padding: 0.75rem; background: #fffbeb; border-left: 3px solid #f59e0b; }
</style>
