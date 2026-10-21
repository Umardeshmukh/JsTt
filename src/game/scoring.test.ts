import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateLevel, didLevelUp, LEVEL_TIERS } from './scoring.ts';

test('Level 1 calculation for beginner XP', () => {
  const result = calculateLevel(0);
  assert.equal(result.level, 1);
  assert.equal(result.title, 'Novice Coder');
  assert.equal(result.progressPercent, 0);
  assert.equal(result.neededForNext, 200);
});

test('Level 1 calculation with partial progress (120 XP)', () => {
  const result = calculateLevel(120);
  assert.equal(result.level, 1);
  assert.equal(result.progressPercent, 60);
  assert.equal(result.neededForNext, 80);
});

test('Level 2 progression at threshold (200 XP)', () => {
  const result = calculateLevel(200);
  assert.equal(result.level, 2);
  assert.equal(result.title, 'Script Apprentice');
  assert.equal(result.progressPercent, 0);
  assert.equal(result.neededForNext, 300);
});

test('didLevelUp detects level changes accurately', () => {
  assert.equal(didLevelUp(150, 190), false);
  assert.equal(didLevelUp(190, 220), true);
  assert.equal(didLevelUp(250, 499), false);
  assert.equal(didLevelUp(499, 510), true);
});

test('Tier boundaries are monotonic and non-overlapping', () => {
  for (let i = 0; i < LEVEL_TIERS.length - 1; i++) {
    assert.equal(LEVEL_TIERS[i].maxXp, LEVEL_TIERS[i + 1].minXp);
  }
});
