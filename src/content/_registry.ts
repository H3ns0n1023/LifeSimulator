// src/content/_registry.ts
import type { GameEvent, Ending } from '../engine/types';
import { dreamGaokao } from './college/dream-gaokao';
import { overworkCritical } from './chains/overwork-death';
import { rebornAsGaokaoEnding } from './endings/reborn-as-gaokao';
import { underworldHrEnding } from './endings/underworld-hr';
import { secretReading } from './school/secret-reading';
import { slackerWriting } from './chains/slacker-author';
import { slackerAuthorEnding } from './endings/slacker-author';
import { childhoodEvents } from './childhood/_index';
import { schoolEvents } from './school/_index';
import { collegeEvents } from './college/_index';
import { careerEvents } from './career/_index';
import { retirementEvents } from './retirement/_index';
import { crisisLowHappiness } from './thresholds/crisis-low-happiness';
import { crisisLowConstitution } from './thresholds/crisis-low-constitution';
import { peakHighCombined } from './thresholds/peak-high-combined';
import { midlifeCrisis } from './thresholds/midlife-crisis';
import { monkEnding } from './endings/monk';

// 内联结局（spec §6.1 要求，无需单独文件）
const richEnding: Ending = {
  id: 'ending_rich',
  priority: 50,
  condition: (s) => s.attrs.财富 >= 85 && s.skills.软 >= 60,
  title: '富豪',
  desc: (s) => `你以 ${s.attrs.财富} 的财富退休，儿女环绕。`,
  rating: () => 'S',
};

const happyFamilyEnding: Ending = {
  id: 'ending_happy_family',
  priority: 50,
  condition: (s) => s.attrs.快乐 >= 70 && s.flags.has('milestone_family'),
  title: '幸福家庭',
  desc: () => '你有一个温暖的家，儿女孝顺，老伴相守。',
  rating: () => 'A',
};

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
  // 流程保底
  ...childhoodEvents,
  ...schoolEvents,
  ...collegeEvents,
  ...careerEvents,
  ...retirementEvents,
  // 阈值事件（baseWeight=0，由 detectThresholdEvents 检测）
  crisisLowHappiness,
  crisisLowConstitution,
  peakHighCombined,
  midlifeCrisis,
];

export const ALL_ENDINGS: Ending[] = [
  underworldHrEnding,    // priority 100
  rebornAsGaokaoEnding,  // priority 90
  slackerAuthorEnding,   // priority 90
  monkEnding,            // priority 70
  richEnding,            // priority 50
  happyFamilyEnding,     // priority 50
  earlyDeathEnding,      // priority 40
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
