// src/content/endings/overseas.ts
import type { Ending } from '../../engine/types';

export const overseasEnding: Ending = {
  id: 'ending_overseas',
  priority: 85,
  condition: (s) => s.flags.has('twist_overseas_success'),
  title: '远渡重洋',
  desc: () => '你终于拿到了那张绿卡。异国的冬天很冷，但自由的空气也清新。故乡成了视频那头模糊的笑颜。',
  rating: () => 'A',
};
