// src/content/endings/top-influencer.ts
import type { Ending } from '../../engine/types';

export const topInfluencerEnding: Ending = {
  id: 'ending_top_influencer',
  priority: 92,
  condition: (s) => s.flags.has('twist_top_influencer'),
  title: '顶流网红',
  desc: () => '从随手一条视频到九位数签约，你成了互联网时代的造物奇迹。记者问你成功的秘诀，你愣了三秒：「大概是，刚好被算法选中吧。」',
  rating: () => 'S',
};
