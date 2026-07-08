// src/content/endings/deported.ts
import type { Ending } from '../../engine/types';

export const deportedEnding: Ending = {
  id: 'ending_deported',
  priority: 80,
  condition: (s) => s.flags.has('twist_deported'),
  title: '南柯一梦',
  desc: () => '你倾尽所有奔赴远方，却被中介骗光积蓄，灰头土脸地被遣返回国。机场出口，没有人在等你——除了你自己。',
  rating: () => 'D',
};
