// src/content/school/inventor-dream.ts
// 招牌链铺垫：少年发明家 —— 设 flag foreshadow_inventor，供中年发明突破读取
import type { GameEvent } from '../../engine/types';
import { addScore, addDisease } from '../../engine/status';

export const inventorDream: GameEvent = {
  id: 'foreshadow_inventor',
  stage: 'school',
  ageRange: [12, 16],
  once: true,
  trigger: { baseWeight: 4 },
  text: '你拆了家里唯一的收音机，想看看里面有没有"小人"。被爸爸揍了一顿，但你也确实看清了电路板——原来声音是被这样变出来的。',
  choices: [
    {
      label: '着迷了，偷偷继续捣鼓',
      outcomes: [{
        weight: 100,
        condition: { all: [] },
        apply: (s) => { s.flags.add('foreshadow_inventor'); addScore(s, 'fame', 3); addScore(s, 'spirit', 2); },
        result: '你开始攒零花钱买零件。没人理解，但你有自己的小宇宙。',
      }],
    },
    {
      label: '被揍怕了，再也不碰',
      outcomes: [{
        weight: 100,
        condition: { all: [] },
        apply: (s) => { addScore(s, 'spirit', -2); addDisease(s, 'myopia'); },
        result: '你老老实实读书。但偶尔看见螺丝刀，心里还是会动一下。',
      }],
    },
  ],
};
