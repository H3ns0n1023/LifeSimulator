// src/content/endings/canceled.ts
import type { Ending } from '../../engine/types';

export const canceledEnding: Ending = {
  id: 'ending_canceled',
  priority: 75,
  condition: (s) => s.flags.has('twist_canceled'),
  title: '赛博社死',
  desc: () => '一夜之间，你成了互联网的过街老鼠。账号注销、合作解约、邻居侧目。你这才明白，流量既能托举你，也能碾碎你。',
  rating: () => 'D',
};
