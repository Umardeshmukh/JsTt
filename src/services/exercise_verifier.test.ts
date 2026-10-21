import test from 'node:test';
import assert from 'node:assert/strict';
import { validateExerciseAnswer, verifyExerciseIntegrity, normalizeAnswer } from './exercise_verifier.ts';
import type { DynamicExercise } from './exercise_verifier.ts';

const sampleExercise: DynamicExercise = {
  id: 'test-1',
  conceptId: 'variables',
  exerciseType: 'predict_output',
  difficulty: 'easy',
  title: 'Test Predict Output',
  question: 'What is logged?',
  codeSnippet: 'let x = 42; console.log(x);',
  options: [
    { id: 'opt-a', text: '42' },
    { id: 'opt-b', text: '"x"' },
  ],
  correctAnswer: 'opt-a',
  explanations: { 'opt-a': 'Correct output.' },
  hints: ['Check variable x.'],
  sourceLessonId: 'lesson-variables',
  sourceLessonTitle: 'Variables',
  createdAt: '2026-10-20T00:00:00Z',
};

test('normalizeAnswer trims whitespace and trailing semicolons', () => {
  assert.equal(normalizeAnswer('  let x = 10;  '), 'let x = 10');
  assert.equal(normalizeAnswer('hello   world'), 'hello world');
});

test('validateExerciseAnswer approves correct option and calculates XP in trusted logic', () => {
  const result = validateExerciseAnswer(sampleExercise, 'opt-a');
  assert.equal(result.isCorrect, true);
  assert.equal(result.xp, 25); // easy = 25 XP
});

test('validateExerciseAnswer rejects incorrect option and awards 0 XP', () => {
  const result = validateExerciseAnswer(sampleExercise, 'opt-b');
  assert.equal(result.isCorrect, false);
  assert.equal(result.xp, 0);
});

test('validateExerciseAnswer handles arrange_order sequence validation', () => {
  const arrangeExercise: DynamicExercise = {
    ...sampleExercise,
    exerciseType: 'arrange_order',
    difficulty: 'medium',
    correctAnswer: ['line-1', 'line-2', 'line-3'],
  };

  const correctMatch = validateExerciseAnswer(arrangeExercise, ['line-1', 'line-2', 'line-3']);
  assert.equal(correctMatch.isCorrect, true);
  assert.equal(correctMatch.xp, 35); // medium = 35 XP

  const wrongMatch = validateExerciseAnswer(arrangeExercise, ['line-2', 'line-1', 'line-3']);
  assert.equal(wrongMatch.isCorrect, false);
  assert.equal(wrongMatch.xp, 0);
});

test('verifyExerciseIntegrity catches code snippets with mismatched predict_output answers', () => {
  const invalidExercise: DynamicExercise = {
    ...sampleExercise,
    codeSnippet: 'let x = 99; console.log(x);',
    options: [
      { id: 'opt-a', text: '42' }, // Does NOT match actual log 99
      { id: 'opt-b', text: '0' },
    ],
    correctAnswer: 'opt-a',
  };

  const check = verifyExerciseIntegrity(invalidExercise);
  assert.equal(check.isValid, false);
  assert.ok(check.reason?.includes('actual log'));
});

test('verifyExerciseIntegrity passes on well-formed exercises', () => {
  const check = verifyExerciseIntegrity(sampleExercise);
  assert.equal(check.isValid, true);
});
