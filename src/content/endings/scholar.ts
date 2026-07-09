// src/content/endings/scholar.ts
// study 线结局：学术泰斗（学业线高分 + 高学历）
import type { Ending } from '../../engine/types';
import { topTrack } from '../../engine/status';
import { EDUCATION_LABEL } from '../../engine/constants';

export const scholarEnding: Ending = {
  id: 'ending_scholar',
  priority: 52,
  condition: (s) => s.scores.study >= 70 && topTrack(s) === 'study' && (s.education === '985' || s.education === '211' || s.education === 'overseas'),
  title: '学术泰斗',
  desc: (s) => `从 ${EDUCATION_LABEL[s.education ?? 'dazhuan']} 走到学术顶峰，你的论文被引用了上千次。当年月考排名的焦虑早已远去，实验室的灯却还亮着——那是你最爱的地方。学问这件事，你做了一辈子。`,
  rating: () => 'S',
};
