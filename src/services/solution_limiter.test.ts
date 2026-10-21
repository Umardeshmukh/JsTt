import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getSolutionStatus,
  requestRevealSolution,
  HOURLY_SOLUTION_LIMIT,
  SOLUTION_STORAGE_KEY,
} from './solution_limiter.ts';

// Setup mock localStorage for Node testing environment
class MockLocalStorage {
  private store: Record<string, string> = {};
  getItem(key: string) {
    return this.store[key] ?? null;
  }
  setItem(key: string, value: string) {
    this.store[key] = String(value);
  }
  removeItem(key: string) {
    delete this.store[key];
  }
  clear() {
    this.store = {};
  }
}

// @ts-ignore
globalThis.window = {
  localStorage: new MockLocalStorage(),
} as any;
// @ts-ignore
globalThis.localStorage = globalThis.window.localStorage;

test('Solution Limiter: Blocks viewing if user has not attempted first', () => {
  localStorage.clear();
  const status = getSolutionStatus('ex-1', false);
  assert.equal(status.canView, false);
  assert.equal(status.blockedReason, 'not_attempted');

  const reveal = requestRevealSolution('ex-1', false);
  assert.equal(reveal.success, false);
  assert.ok(reveal.error?.includes('Please make at least one attempt'));
});

test('Solution Limiter: Allows viewing after user attempts', () => {
  localStorage.clear();
  const status = getSolutionStatus('ex-1', true);
  assert.equal(status.canView, true);
  assert.equal(status.remainingViews, 3);

  const reveal = requestRevealSolution('ex-1', true);
  assert.equal(reveal.success, true);
  assert.equal(reveal.status.remainingViews, 2);
  assert.equal(reveal.status.isAlreadyRevealed, true);
});

test('Solution Limiter: Enforces maximum 3 views in 1 hour', () => {
  localStorage.clear();
  const baseTime = Date.now();

  // 1st view
  const r1 = requestRevealSolution('ex-1', true, baseTime);
  assert.equal(r1.success, true);
  assert.equal(r1.status.remainingViews, 2);

  // 2nd view
  const r2 = requestRevealSolution('ex-2', true, baseTime + 1000);
  assert.equal(r2.success, true);
  assert.equal(r2.status.remainingViews, 1);

  // 3rd view
  const r3 = requestRevealSolution('ex-3', true, baseTime + 2000);
  assert.equal(r3.success, true);
  assert.equal(r3.status.remainingViews, 0);

  // 4th view attempt in the same hour -> blocked!
  const r4 = requestRevealSolution('ex-4', true, baseTime + 3000);
  assert.equal(r4.success, false);
  assert.equal(r4.status.canView, false);
  assert.equal(r4.status.blockedReason, 'hourly_limit_reached');
  assert.ok(r4.error?.includes('Hourly limit reached'));
});

test('Solution Limiter: Does not double charge for already revealed exercise in same hour', () => {
  localStorage.clear();
  const baseTime = Date.now();

  // Reveal ex-1
  requestRevealSolution('ex-1', true, baseTime);

  // Re-check ex-1
  const status = getSolutionStatus('ex-1', true, baseTime + 5000);
  assert.equal(status.canView, true);
  assert.equal(status.isAlreadyRevealed, true);
  assert.equal(status.remainingViews, 2); // Still 2 remaining!
});

test('Solution Limiter: Expired views (>1 hour) reset quota automatically', () => {
  localStorage.clear();
  const baseTime = 1000000;
  const sixtyOneMinutesLater = baseTime + 61 * 60 * 1000;

  // Use 3 views at baseTime
  requestRevealSolution('ex-1', true, baseTime);
  requestRevealSolution('ex-2', true, baseTime);
  requestRevealSolution('ex-3', true, baseTime);

  // Check 61 minutes later
  const status = getSolutionStatus('ex-4', true, sixtyOneMinutesLater);
  assert.equal(status.canView, true);
  assert.equal(status.remainingViews, 3); // Reset back to 3!
});
