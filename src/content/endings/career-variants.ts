// src/content/endings/career-variants.ts
// 事业线细分结局：在 careerMasterEnding(50) 之上拦截，按健康/婚姻/财富/寿命分流
import type { Ending } from '../../engine/types';
import { topTrack, healthAtLeast } from '../../engine/status';
import { WEALTH_TIER } from '../../engine/constants';
import { HEALTH_LABEL } from '../../engine/constants';

// 用命换钱：事业登顶却一身病
export const overworkRichEnding: Ending = {
  id: 'ending_overwork_rich',
  priority: 62,
  condition: (s) => s.scores.career >= 70 && topTrack(s) === 'career' && healthAtLeast(s, 'severe'),
  title: '用命换钱',
  desc: (s) => `你以事业分 ${s.scores.career} 站上顶峰，月薪 ${s.salary}，存款 ${s.savings}。可体检报告上的每一项都在亮红灯——${HEALTH_LABEL[s.health]}。病床前的奖杯冷冰冰的，你忽然分不清，这一辈子到底赢了什么。`,
  rating: () => 'A',
};

// 高处不胜寒：事业高但孤身一人
export const lonelyTopEnding: Ending = {
  id: 'ending_lonely_top',
  priority: 60,
  condition: (s) =>
    s.scores.career >= 70 &&
    topTrack(s) === 'career' &&
    (s.marriage === 'single' || s.marriage === 'divorced' || s.marriage === 'widowed'),
  title: '高处不胜寒',
  desc: (s) => `事业分 ${s.scores.career}，月薪 ${s.salary}。你住进了大房子，可推开门只有回声。除夕夜，手机里躺着一千个联系人，却没有一个能一起吃顿饭。成功的代价，原来是孤独。`,
  rating: () => 'A',
};

// 财务自由：事业高 + 财富足 + 健康尚可 = 真正赢家
export const financialFreedomEnding: Ending = {
  id: 'ending_financial_freedom',
  priority: 58,
  condition: (s) =>
    s.scores.career >= 70 &&
    topTrack(s) === 'career' &&
    s.savings >= WEALTH_TIER.rich &&
    !healthAtLeast(s, 'severe'),
  title: '财务自由',
  desc: (s) => `事业分 ${s.scores.career}，存款 ${s.savings} 元，健康尚可。你不需要再看任何人的脸色，也不必为账单失眠。这才是世俗意义上的终极答案——钱够花，身体还行，时间归自己。`,
  rating: () => 'S',
};

// 鞠躬尽瘁：事业登顶但中年早逝
export const suddenDeathRichEnding: Ending = {
  id: 'ending_sudden_death_rich',
  priority: 56,
  condition: (s) => s.scores.career >= 85 && topTrack(s) === 'career' && s.age < 55,
  title: '鞠躬尽瘁',
  desc: (s) => `你在 ${s.age} 岁倒在了工位上，事业分 ${s.scores.career}，留下的存款 ${s.savings} 元。讣告里写满了你的头衔，却没人提你最后一次陪家人吃饭是哪天。`,
  rating: () => 'C',
};
