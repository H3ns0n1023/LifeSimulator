// src/content/endings/burnt-out.ts
import type { Ending } from '../../engine/types';

// 神童招牌链的"伤仲永"结局
export const burntOutEnding: Ending = {
  id: 'ending_burnt_out',
  priority: 88,
  condition: (s) => s.flags.has('twist_burnt_out'),
  title: '伤仲永',
  desc: () => '当年那个三岁背唐诗的神童，最终泯然众人。父母提起你总叹气，而你只想逃离所有"应该"和"本可以"。',
  rating: () => 'C',
};
