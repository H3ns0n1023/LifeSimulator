// src/content/endings/reborn-as-gaokao.ts
import type { Ending } from '../../engine/types';

export const rebornAsGaokaoEnding: Ending = {
  id: 'ending_reborn_as_gaokao',
  priority: 90,
  condition: (s) => s.flags.has('twist_sudden_death_reborn'),
  title: '穿越重活',
  desc: (s) => `你在 ${s.age} 岁猝死，却带着记忆回到了高考考场。这一次，你会怎么选？`,
  rating: (s) => (s.age < 30 ? 'B' : 'C'),
};
