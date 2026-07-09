// src/content/endings/influencer-forgotten.ts
import type { Ending } from '../../engine/types';

export const influencerForgottenEnding: Ending = {
  id: 'ending_influencer_forgotten',
  priority: 62,
  condition: (s) => s.flags.has('twist_cancel_hard'),
  title: '过气网红',
  desc: (s) => `你曾是顶流，话题度破亿。如今你试图搜索自己的名字，算法已经推荐不出你。存款 ${s.savings} 元是你最后的余温——流量这东西，来得快，去得也快。`,
  rating: () => 'D',
};
