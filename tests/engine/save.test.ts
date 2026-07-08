// tests/engine/save.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { saveGame, loadGame, clearSave, hasSave } from '../../src/utils/save';
import { makeState } from '../fixtures';

describe('save/load', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('round-trips a save with Set flags and diseases', () => {
    const s = makeState();
    s.flags.add('twist_x');
    s.diseases.add('hypertension');
    saveGame({
      version: '1', state: s, unlockedEndings: ['ending_a'], totalPlaythroughs: 2,
    });
    const loaded = loadGame();
    expect(loaded).not.toBeNull();
    expect(loaded!.state.flags.has('twist_x')).toBe(true);
    expect(loaded!.state.flags instanceof Set).toBe(true);
    expect(loaded!.state.diseases.has('hypertension')).toBe(true);
    expect(loaded!.state.diseases instanceof Set).toBe(true);
    expect(loaded!.unlockedEndings).toEqual(['ending_a']);
  });

  it('hasSave reflects state', () => {
    expect(hasSave()).toBe(false);
    saveGame({ version: '1', state: makeState(), unlockedEndings: [], totalPlaythroughs: 1 });
    expect(hasSave()).toBe(true);
    clearSave();
    expect(hasSave()).toBe(false);
  });

  it('returns null on corrupted save', () => {
    localStorage.setItem('life-sim-save-v1', 'not json');
    expect(loadGame()).toBeNull();
  });
});
