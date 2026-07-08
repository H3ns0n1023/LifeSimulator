// src/content/chains/overwork-death.ts
import type { GameEvent } from '../../engine/types';

export const overworkCritical: GameEvent = {
  id: 'career_overwork_critical',
  stage: 'career',
  ageRange: [25, 45],
  once: true,
  trigger: {
    baseWeight: 10,
    requires: [{ flag: 'milestone_has_job' }],
  },
  text: '老板让你通宵赶项目。你已经连续加班三周了，心跳有点奇怪。',
  choices: [
    {
      label: '努力加班，证明自己',
      outcomes: [
        {
          weight: 50,
          condition: { attrGte: { 体质: 30 } },
          apply: (s) => {
            s.attrs.财富 += 20;
            s.skills.硬 += 5;
            s.attrs.体质 -= 5;
            s.flags.add('achievement_first_promotion');
          },
          result: '项目成功，你被提拔为组长。同事都说你是工作狂。',
        },
        {
          weight: 30,
          condition: { attrLt: { 体质: 30 } },
          apply: (s) => { s.flags.add('twist_sudden_death_reborn'); },
          nextEvent: 'ending_reborn_as_gaokao',
          result: '你眼前一黑……再睁眼，竟回到了高考考场，手里还握着笔。',
        },
        {
          weight: 10,
          condition: { all: [
            { attrLt: { 体质: 30 } },
            { flag: 'foreshadow_dream_gaokao' },
          ]},
          apply: (s) => { s.flags.add('twist_underworld_hr'); },
          nextEvent: 'ending_underworld_hr',
          result: '你猝死了。地府面试官翻看你的简历，缓缓点头：「PPT 做得不错」。',
        },
      ],
    },
    {
      label: '摸鱼，假装在加班',
      outcomes: [{
        weight: 100,
        condition: { all: [] },
        apply: (s) => {
          s.attrs.快乐 -= 5;
          s.skills.摸 += 3;
        },
        result: '你在工位上玩了一晚上手机。老板第二天没发现。',
      }],
    },
    {
      label: '据理力争，拒绝加班',
      outcomes: [
        {
          weight: 60,
          condition: { skillGte: { 软: 30 } },
          apply: (s) => {
            s.attrs.快乐 += 10;
            s.flags.add('choice_refused_overwork');
          },
          result: '你成功说服了老板，从此团队再也没人敢让你无偿加班。',
        },
        {
          weight: 40,
          condition: { skillLt: { 软: 30 } },
          apply: (s) => {
            s.attrs.快乐 -= 15;
            s.flags.add('milestone_fired');
            s.flags.delete('milestone_has_job');
          },
          result: '你被开除了。但奇怪的是，你感到久违的轻松。',
        },
      ],
    },
    {
      label: '（前世记忆）你想起这种情况通常……',
      hint: '需要 NG+ 前世记忆',
      visibleWhen: { flag: 'ng_plus_memory' },
      outcomes: [{
        weight: 100,
        condition: { flag: 'ng_plus_memory' },
        apply: (s) => {
          s.attrs.快乐 += 5;
          s.flags.add('choice_used_memory');
        },
        result: '你想起上辈子就是这里出的事，这次你巧妙避开。',
      }],
    },
  ],
};
