// src/content/endings/monk.ts
import type { Ending } from '../../engine/types';

export const monkEnding: Ending = {
  id: 'ending_monk',
  priority: 70,
  condition: (s) => s.flags.has('choice_midlife_monk') || s.flags.has('choice_midlife_monk_early'),
  title: '顿悟出家',
  desc: () => '你看破了红尘，遁入空门。青灯古佛，倒也清净。',
  rating: () => 'B',
};
