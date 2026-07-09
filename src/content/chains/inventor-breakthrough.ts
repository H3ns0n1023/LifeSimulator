// src/content/chains/inventor-breakthrough.ts
// 招牌链：中年发明家突破 —— 呼应 foreshadow_inventor（school）
import type { GameEvent } from '../../engine/types';
import { addScore, adjustSavings, addDisease, removeDisease } from '../../engine/status';

export const inventorBreakthrough: GameEvent = {
  id: 'career_inventor_breakthrough',
  stage: 'career',
  ageRange: [30, 50],
  once: true,
  trigger: {
    baseWeight: 8,
    requires: [{ flag: 'foreshadow_inventor' }, { employment: 'employed' }],
  },
  text: '下班后你盯着自己搞了十年的"永动机模型"发呆。同事笑你是民科，妻子说你浪费家用。但今晚，某个零件忽然对上了……',
  choices: [
    {
      label: '梭哈积蓄，辞职全力搞发明',
      outcomes: [
        // 常规层：失败，被嘲笑
        {
          weight: 50,
          condition: { all: [] },
          apply: (s) => {
            adjustSavings(s, -15000);
            addScore(s, 'spirit', 8);
            addScore(s, 'career', -5);
            addDisease(s, 'insomnia');
          },
          result: '你的发明被专家一句"违反热力学定律"驳回。积蓄没了，但你不后悔。',
        },
        // 反转层：真搞出名堂（铺垫 + 编程技能）
        {
          weight: 30,
          condition: { all: [
            { flag: 'foreshadow_inventor' },
            { flag: 'skill_coding' },
          ]},
          apply: (s) => {
            s.flags.add('twist_folk_inventor');
            addScore(s, 'fame', 40);
            addScore(s, 'spirit', 15);
            adjustSavings(s, 50000);
          },
          nextEvent: 'ending_folk_inventor',
          result: '你的实用新型专利被一家大厂看中。当年笑你的人，现在排队想投资。',
        },
        // 罕见层：改变世界（再加 NG+ 记忆）
        {
          weight: 10,
          condition: { all: [
            { flag: 'foreshadow_inventor' },
            { flag: 'skill_coding' },
            { flag: 'ng_plus_memory' },
          ]},
          apply: (s) => {
            s.flags.add('twist_folk_inventor');
            addScore(s, 'fame', 70);
            addScore(s, 'spirit', 25);
            adjustSavings(s, 500000);
            removeDisease(s, 'insomnia');
          },
          nextEvent: 'ending_folk_inventor',
          result: '前世的失败让你避开了所有弯路。你的发明上了《自然》杂志封面。',
        },
      ],
    },
    {
      label: '当个爱好，业余时间慢慢搞',
      outcomes: [{
        weight: 100,
        condition: { all: [] },
        apply: (s) => { addScore(s, 'spirit', 10); addScore(s, 'freedom', 5); s.flags.add('choice_hobby_inventor'); },
        result: '你没辞职，发明成了退休后的念想。也许哪天能成，也许不能——但你享受这个过程。',
      }],
    },
    {
      label: '算了，认命当个普通人',
      outcomes: [{
        weight: 100,
        condition: { all: [] },
        apply: (s) => { addScore(s, 'spirit', -5); s.flags.add('choice_gave_up_invent'); },
        result: '你把模型塞进柜子最深处。从此再没打开过。',
      }],
    },
  ],
};
