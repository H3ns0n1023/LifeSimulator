// src/content/endings/slacker-author.ts
import type { Ending } from '../../engine/types';

export const slackerAuthorEnding: Ending = {
  id: 'ending_slacker_author',
  priority: 90,
  condition: (s) => s.flags.has('twist_slacker_bestseller'),
  title: '摸鱼作家爆火',
  desc: () => '当年上课偷看小说被老师抓的那个孩子，如今成了畅销书作家。老板请你回公司演讲，主题是「时间管理」。',
  rating: () => 'S',
};
