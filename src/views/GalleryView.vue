<script setup lang="ts">
import { computed } from 'vue';
import { useGameStore } from '../stores/game';

const store = useGameStore();

// 按优先级排序展示（招牌结局在前，兜底在后）
const endings = computed(() =>
  [...store.allEndings].sort((a, b) => b.priority - a.priority),
);
const unlockedCount = computed(() => store.unlockedEndings.length);
const totalCount = computed(() => store.allEndings.length);

function isUnlocked(id: string): boolean {
  return store.unlockedEndings.includes(id);
}
// 图鉴展示用占位 state（结局的 desc/rating 多数不依赖具体数值）
const placeholderState = {
  age: 80,
  salary: 0,
  scores: { career: 0, family: 0, freedom: 0, fame: 0, spirit: 0 },
  flags: new Set<string>(),
  diseases: new Set<string>(),
} as any;
function ratingOf(e: any): string {
  try { return e.rating(placeholderState); } catch { return '?'; }
}
function descOf(e: any): string {
  try { return e.desc(placeholderState); } catch { return ''; }
}
</script>

<template>
  <div class="gallery-view">
    <header class="gallery-header">
      <h1>结局图鉴</h1>
      <p class="stats">已解锁 {{ unlockedCount }} / {{ totalCount }} 个结局</p>
    </header>

    <div class="ending-grid">
      <div
        v-for="e in endings"
        :key="e.id"
        class="ending-card"
        :class="{ locked: !isUnlocked(e.id) }"
      >
        <template v-if="isUnlocked(e.id)">
          <div class="card-rating" :data-r="ratingOf(e)">{{ ratingOf(e) }}</div>
          <h3 class="card-title">{{ e.title }}</h3>
          <p class="card-desc">{{ descOf(e) }}</p>
          <span class="card-tag">已达成</span>
        </template>
        <template v-else>
          <div class="card-rating locked-r">?</div>
          <h3 class="card-title">？？？</h3>
          <p class="card-desc locked-desc">尚未发现的结局，继续探索人生吧。</p>
          <span class="card-tag locked-tag">未解锁</span>
        </template>
      </div>
    </div>

    <div class="gallery-actions">
      <button class="back-btn" @click="store.setView('start')">返回主菜单</button>
    </div>
  </div>
</template>

<style scoped>
.gallery-view { max-width: 900px; margin: 0 auto; padding: 2rem 1rem 4rem; }
.gallery-header { text-align: center; margin-bottom: 2rem; }
.gallery-header h1 { margin: 0 0 0.25rem; }
.stats { color: #888; margin: 0; }

.ending-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
}
.ending-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1.25rem;
  position: relative;
  transition: transform 0.15s, box-shadow 0.15s;
}
.ending-card:not(.locked):hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
.ending-card.locked { background: #f9fafb; opacity: 0.75; }

.card-rating {
  display: inline-block;
  width: 2rem; height: 2rem; line-height: 2rem;
  text-align: center; border-radius: 50%;
  font-weight: bold; color: white;
  margin-bottom: 0.5rem;
}
.card-rating[data-r="S"] { background: #f59e0b; }
.card-rating[data-r="A"] { background: #10b981; }
.card-rating[data-r="B"] { background: #3b82f6; }
.card-rating[data-r="C"] { background: #6b7280; }
.card-rating[data-r="D"] { background: #9ca3af; }
.locked-r { background: #d1d5db !important; }

.card-title { margin: 0 0 0.5rem; font-size: 1.05rem; }
.card-desc { margin: 0; font-size: 0.85rem; line-height: 1.5; color: #555; }
.locked-desc { color: #aaa; font-style: italic; }

.card-tag {
  position: absolute; top: 0.75rem; right: 0.75rem;
  font-size: 0.7rem; padding: 0.15rem 0.5rem;
  border-radius: 10px; background: #ecfdf5; color: #047857;
}
.locked-tag { background: #f3f4f6; color: #9ca3af; }

.gallery-actions { text-align: center; margin-top: 2.5rem; }
.back-btn { padding: 0.6rem 1.5rem; background: #2c3e50; color: white; border: none; border-radius: 4px; cursor: pointer; }
.back-btn:hover { background: #1a2a3a; }
</style>
