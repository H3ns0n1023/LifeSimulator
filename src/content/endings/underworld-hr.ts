// src/content/endings/underworld-hr.ts
import type { Ending } from '../../engine/types';

export const underworldHrEnding: Ending = {
  id: 'ending_underworld_hr',
  priority: 100,
  condition: (s) => s.flags.has('twist_underworld_hr'),
  title: '冥界 HR',
  desc: () => '你猝死了。但你生前积累的 PPT 技巧让地府面试官眼前一亮，你被录用为冥界 HR，专管阳间职场人的福报。',
  rating: () => 'A', // 罕见反转，评分给得高一些以奖励发现
};
