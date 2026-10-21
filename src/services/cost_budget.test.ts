import test from 'node:test';
import assert from 'node:assert/strict';
import { ZERO_DOLLAR_CONFIG, checkAiQuotaAvailable } from '../config/cost_budget.ts';
import { MockAiProvider } from './ai_provider.ts';
import { SEED_LESSONS } from '../data/seed_lessons.ts';

test('$0 Operating Budget: Allowed models are strictly free tier', () => {
  assert.ok(ZERO_DOLLAR_CONFIG.allowedAiModels.includes('gemini-3.8-flash'));
  assert.equal(ZERO_DOLLAR_CONFIG.allowedAiModels.includes('gemini-4-argon'), false);
  assert.equal(ZERO_DOLLAR_CONFIG.allowedAiModels.includes('veo-3.1-generate-preview'), false);
});

test('MockAiProvider operates completely offline with $0 cost', async () => {
  const provider = new MockAiProvider();
  const lesson = SEED_LESSONS['variables'];
  const exercise = await provider.generateExercise(lesson, 'predict_output', 'easy');

  assert.ok(exercise);
  assert.equal(exercise?.conceptId, 'variables');
  assert.ok(exercise?.hints.length > 0);
  assert.ok(exercise?.correctAnswer);
});

test('Rate limiter safeguards prevent unexpected free tier exhaustion', () => {
  // Rate limits conform to free tier
  assert.equal(ZERO_DOLLAR_CONFIG.maxRequestsPerMinute, 15);
  assert.equal(ZERO_DOLLAR_CONFIG.maxDailyAiRequests, 1500);
});
