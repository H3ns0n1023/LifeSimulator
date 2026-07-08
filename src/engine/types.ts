// src/engine/types.ts

export type AttrKey = '智力' | '魅力' | '体质' | '运气' | '财富' | '快乐';
export type SkillKey = '硬' | '软' | '摸';
export type LifeStage = 'childhood' | 'school' | 'college' | 'career' | 'retirement';
export type Rating = 'S' | 'A' | 'B' | 'C' | 'D';
export type CarryingKind = 'intelligence' | 'soft' | 'slacker' | 'memory';

export interface Attrs {
  智力: number;
  魅力: number;
  体质: number;
  运气: number;
  财富: number;
  快乐: number;
}

export interface Skills {
  硬: number;
  软: number;
  摸: number;
}

export type Condition =
  | { flag: string }
  | { notFlag: string }
  | { attrGte: Partial<Record<AttrKey, number>> }
  | { attrLt: Partial<Record<AttrKey, number>> }
  | { skillGte: Partial<Record<SkillKey, number>> }
  | { skillLt: Partial<Record<SkillKey, number>> }
  | { all: Condition[] }
  | { any: Condition[] };

export interface Outcome {
  weight: number;
  condition: Condition;
  apply: (s: GameState) => void;
  result: string;
  nextEvent?: string;
}

export interface Choice {
  label: string;
  hint?: string;
  visibleWhen?: Condition;
  outcomes: Outcome[];
}

export interface GameEvent {
  id: string;
  stage: LifeStage | 'special';
  ageRange: [number, number];
  once?: boolean;
  trigger: {
    baseWeight: number;
    requires?: Condition[];
    excludes?: string[];
  };
  text: string;
  choices: Choice[];
}

export interface GameState {
  age: number;
  stage: LifeStage;
  attrs: Attrs;
  skills: Skills;
  flags: Set<string>;
  history: string[];
  nextEvent?: string;
  meta: {
    seed: number;
    playthrough: number;
    carryover?: CarryingKind;
  };
}

export interface Ending {
  id: string;
  priority: number;
  condition: (s: GameState) => boolean;
  title: string;
  desc: (s: GameState) => string;
  rating: (s: GameState) => Rating;
}
