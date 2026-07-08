<script setup lang="ts">
import { computed } from 'vue';
import type { GameState, EndingTrack } from '../engine/types';
import { HEALTH_LABEL, TRACK_LABEL, SCORE_MAX } from '../engine/constants';

const props = defineProps<{ state: GameState }>();

const EMPLOYMENT_LABEL: Record<string, string> = {
  student: '在校', employed: '在职', unemployed: '失业',
  selfEmployed: '创业/自由职业', retired: '退休', monk: '出家', deceased: '已故',
};
const MARRIAGE_LABEL: Record<string, string> = {
  single: '单身', dating: '恋爱中', married: '已婚', divorced: '离异', widowed: '丧偶',
};

const tracks: EndingTrack[] = ['career', 'family', 'freedom', 'fame', 'spirit'];

function bar(v: number) {
  return { width: `${Math.max(0, Math.min(100, (v / SCORE_MAX) * 100))}%` };
}

// 月薪格式化（元 → 万）
function fmtSalary(yuan: number): string {
  if (yuan >= 10000) return `${(yuan / 10000).toFixed(1)} 万`;
  return `${yuan} 元`;
}

// 病症翻译（简单映射，未列出的直接显示原名）
const DISEASE_LABEL: Record<string, string> = {
  insomnia: '失眠', fatty_liver: '脂肪肝', hypertension: '高血压',
  overwork_syndrome: '过劳综合征', stomach_ulcer: '胃溃疡',
  depression: '抑郁症', heart_disease: '心脏病',
  cancer: '癌症', myocardial_infarction: '心梗', stroke: '中风',
};
function diseaseName(d: string): string {
  return DISEASE_LABEL[d] ?? d;
}

// 从 flags 提取本年薪资变动提示（applyYearlyTick 写入的 last_salary_note|xxx）
const salaryNote = computed(() => {
  for (const f of props.state.flags) {
    if (f.startsWith('last_salary_note|')) return f.slice('last_salary_note|'.length);
  }
  return '';
});
// 涨薪绿色 / 降薪红色 / 中性灰色
const salaryNoteTone = computed(() => {
  if (!salaryNote.value) return '';
  if (salaryNote.value.includes('+') || salaryNote.value.includes('晋升') || salaryNote.value.includes('普调')) return 'up';
  if (salaryNote.value.includes('-') || salaryNote.value.includes('失业') || salaryNote.value.includes('波动 -')) return 'down';
  return 'flat';
});
</script>

<template>
  <aside class="attr-panel">
    <!-- 核心指标 -->
    <h3>核心</h3>
    <div class="row">
      <span class="label">月薪</span>
      <span class="value" :class="{ zero: props.state.salary === 0 }">{{ fmtSalary(props.state.salary) }}</span>
    </div>
    <div v-if="salaryNote" class="row salary-note" :class="salaryNoteTone">
      <span class="label"></span>
      <span class="note-text">↳ {{ salaryNote }}</span>
    </div>
    <div class="row">
      <span class="label">健康</span>
      <span class="value" :class="props.state.health">{{ HEALTH_LABEL[props.state.health] }}</span>
    </div>
    <div v-if="props.state.diseases.size > 0" class="diseases">
      <span class="disease-tag" v-for="d in props.state.diseases" :key="d">{{ diseaseName(d) }}</span>
    </div>

    <!-- 状态机 -->
    <h3>状态</h3>
    <div class="row"><span class="label">职业</span><span class="value">{{ EMPLOYMENT_LABEL[props.state.employment] }}</span></div>
    <div class="row"><span class="label">婚姻</span><span class="value">{{ MARRIAGE_LABEL[props.state.marriage] }}</span></div>

    <!-- 五线积分 -->
    <h3>人生走向</h3>
    <div v-for="t in tracks" :key="t" class="row">
      <span class="label">{{ TRACK_LABEL[t] }}</span>
      <div class="bar-bg"><div class="bar-fg" :style="bar(props.state.scores[t])"></div></div>
      <span class="num">{{ props.state.scores[t] }}</span>
    </div>
  </aside>
</template>

<style scoped>
.attr-panel { padding: 1rem; background: #f5f5f5; min-width: 240px; }
h3 { margin: 0.75rem 0 0.25rem; font-size: 0.85rem; color: #888; }
.row { display: flex; align-items: center; gap: 0.5rem; margin: 0.2rem 0; }
.label { width: 3rem; color: #555; }
.value { font-weight: bold; }
.value.zero { color: #aaa; }
/* 健康档位配色 */
.value.healthy { color: #27ae60; }
.value.subhealthy { color: #f39c12; }
.value.mild { color: #e67e22; }
.value.severe { color: #e74c3c; }
.value.critical { color: #c0392b; }
.diseases { display: flex; flex-wrap: wrap; gap: 0.25rem; margin: 0.25rem 0 0.25rem 3rem; }
.disease-tag { background: #fdecea; color: #c0392b; font-size: 0.7rem; padding: 0.1rem 0.4rem; border-radius: 3px; }
.bar-bg { flex: 1; height: 8px; background: #ddd; }
.bar-fg { height: 100%; background: #2c3e50; }
.num { width: 2rem; text-align: right; font-variant-numeric: tabular-nums; font-size: 0.85rem; }
/* 薪资变动提示 */
.salary-note { margin: 0 0 0.4rem 0; }
.salary-note .note-text { font-size: 0.75rem; font-style: italic; }
.salary-note.up .note-text { color: #27ae60; }     /* 涨薪绿 */
.salary-note.down .note-text { color: #e74c3c; }   /* 降薪红 */
.salary-note.flat .note-text { color: #888; }      /* 中性灰 */
</style>
