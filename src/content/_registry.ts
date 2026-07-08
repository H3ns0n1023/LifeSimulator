// src/content/_registry.ts
import type { GameEvent, Ending } from '../engine/types';
import { dreamGaokao } from './college/dream-gaokao';
import { overworkCritical } from './chains/overwork-death';
import { slackerWriting } from './chains/slacker-author';
import { viralShortVideo } from './chains/viral-short-video';
import { rebornAsGaokaoEnding } from './endings/reborn-as-gaokao';
import { underworldHrEnding } from './endings/underworld-hr';
import { slackerAuthorEnding } from './endings/slacker-author';
import { monkEnding } from './endings/monk';
import { overseasEnding } from './endings/overseas';
import { deportedEnding } from './endings/deported';
import { burntOutEnding } from './endings/burnt-out';
import { topInfluencerEnding } from './endings/top-influencer';
import { canceledEnding } from './endings/canceled';
import { secretReading } from './school/secret-reading';
import { childhoodEvents } from './childhood/_index';
import { schoolEvents } from './school/_index';
import { collegeEvents } from './college/_index';
import { careerEvents } from './career/_index';
import { retirementEvents } from './retirement/_index';
import { crisisLowHappiness } from './thresholds/crisis-low-happiness';
import { crisisLowHealth } from './thresholds/crisis-low-health';
import { peakHighCombined } from './thresholds/peak-high-combined';
import { midlifeCrisis } from './thresholds/midlife-crisis';
import { topTrack, totalScore } from '../engine/status';

// 内联结局（基于五线积分判定，spec §6.1 要求，无需单独文件）

// 事业大成：事业线高分且为主修线
const careerMasterEnding: Ending = {
  id: 'ending_career_master',
  priority: 50,
  condition: (s) => s.scores.career >= 70 && topTrack(s) === 'career',
  title: '事业有成',
  desc: (s) => `你以月薪 ${s.salary} 元、事业分 ${s.scores.career} 走到人生终点。外人看来，你是世俗意义上的赢家。`,
  rating: (s) => (s.scores.career >= 85 ? 'S' : 'A'),
};

// 幸福家庭：家庭线高分 + 已婚/有家
const happyFamilyEnding: Ending = {
  id: 'ending_happy_family',
  priority: 50,
  condition: (s) => s.scores.family >= 60 && (s.marriage === 'married' || s.flags.has('milestone_family')),
  title: '幸福家庭',
  desc: () => '你有一个温暖的家，儿女孝顺，老伴相守。',
  rating: () => 'A',
};

// 人间清醒：自由线最高 + 摸鱼人生
const chillLifeEnding: Ending = {
  id: 'ending_chill_life',
  priority: 45,
  condition: (s) => s.scores.freedom >= 60 && topTrack(s) === 'freedom',
  title: '人间清醒',
  desc: () => '你没买房、没结婚、没内卷。但你也活得通透，看了一场又一场日落，读完了一柜子闲书。别人笑你没追求，你笑别人看不穿。',
  rating: () => 'B',
};

// 丁克伉俪：已婚但无子 + 自由线高
const dinkEnding: Ending = {
  id: 'ending_dink',
  priority: 48,
  condition: (s) => s.marriage === 'married' && !s.flags.has('milestone_family') && s.scores.freedom >= 30,
  title: '丁克伉俪',
  desc: () => '你和老伴环游了世界，养了两只猫。没有儿孙绕膝的喧闹，却有二人世界的清静。医院签字栏空着——但你们早就看开了。',
  rating: () => 'B',
};

// 精神导师：精神线最高
const spiritMasterEnding: Ending = {
  id: 'ending_spirit_master',
  priority: 46,
  condition: (s) => s.scores.spirit >= 60 && topTrack(s) === 'spirit' && s.employment !== 'monk',
  title: '智者',
  desc: () => '你没出家，但你看透了红尘。一生都在追问意义，最终活成了别人嘴里的「通透之人」。',
  rating: () => 'B',
};

// 早逝：50 岁前结束（健康恶化）
const earlyDeathEnding: Ending = {
  id: 'ending_early_death',
  priority: 40,
  condition: (s) => s.age < 50,
  title: '早逝',
  desc: (s) => `你在 ${s.age} 岁离世，留下太多遗憾。`,
  rating: () => 'D',
};

export const ALL_EVENTS: GameEvent[] = [
  // 铺垫
  dreamGaokao,
  secretReading,
  // 招牌链
  overworkCritical,
  slackerWriting,
  viralShortVideo,
  // 流程保底
  ...childhoodEvents,
  ...schoolEvents,
  ...collegeEvents,
  ...careerEvents,
  ...retirementEvents,
  // 阈值事件（baseWeight=0，由 detectThresholdEvents 检测）
  crisisLowHappiness,
  crisisLowHealth,
  peakHighCombined,
  midlifeCrisis,
];

export const ALL_ENDINGS: Ending[] = [
  // 招牌链结局（高优先级，基于 flag）
  underworldHrEnding,      // priority 100 — 冥界 HR
  topInfluencerEnding,     // priority 92 — 顶流网红
  rebornAsGaokaoEnding,    // priority 90 — 穿越重活
  slackerAuthorEnding,     // priority 90 — 摸鱼作家
  burntOutEnding,          // priority 88 — 伤仲永
  overseasEnding,          // priority 85 — 远渡重洋
  deportedEnding,          // priority 80 — 南柯一梦
  canceledEnding,          // priority 75 — 赛博社死
  monkEnding,              // priority 70 — 顿悟出家
  // 五线积分结局（中优先级）
  careerMasterEnding,      // priority 50 — 事业有成
  happyFamilyEnding,       // priority 50 — 幸福家庭
  dinkEnding,              // priority 48 — 丁克伉俪
  spiritMasterEnding,      // priority 46 — 智者
  chillLifeEnding,         // priority 45 — 人间清醒
  earlyDeathEnding,        // priority 40 — 早逝
  // 兜底
  {
    id: 'default_ordinary',
    priority: 0,
    condition: () => true,
    title: '平凡打工人',
    desc: () => '你过着平凡的一生，没什么大起大落。',
    rating: () => 'C',
  },
];

export const findEvent = (id: string): GameEvent | undefined =>
  ALL_EVENTS.find((e) => e.id === id);
export const findEnding = (id: string): Ending | undefined =>
  ALL_ENDINGS.find((e) => e.id === id);

// 保留导出以备他处使用（如评分展示）
export { topTrack, totalScore };
