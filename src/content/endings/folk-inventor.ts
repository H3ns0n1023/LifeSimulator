// src/content/endings/folk-inventor.ts
import type { Ending } from '../../engine/types';

export const folkInventorEnding: Ending = {
  id: 'ending_folk_inventor',
  priority: 73,
  condition: (s) => s.flags.has('twist_folk_inventor'),
  title: '民间爱迪生',
  desc: (s) => `从拆收音机的少年，到被载入专利局档案的发明家，你用一生证明：民间也有科学家。你的专利卖了 ${s.savings} 元，但比起钱，更让你骄傲的是那个改变了某些人生活的发明。`,
  rating: () => 'S',
};
