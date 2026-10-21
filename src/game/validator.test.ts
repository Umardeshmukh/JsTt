import test from 'node:test';
import assert from 'node:assert/strict';
import { executeCode, validateSolution } from './validator.ts';

test('executeCode captures console.log output correctly', () => {
  const code = 'console.log("Hello, World!");';
  const result = executeCode(code);
  assert.equal(result.logs.length, 1);
  assert.equal(result.logs[0], 'Hello, World!');
  assert.equal(result.error, undefined);
});

test('executeCode captures syntax errors with friendly messages', () => {
  const badCode = 'console.log("Hello';
  const result = executeCode(badCode);
  assert.ok(result.error);
  assert.ok(result.friendlyError);
});

test('validateSolution passes when expected output matches', () => {
  const code = 'console.log("Hello, World!");';
  const result = validateSolution(code, {
    expectedLogPatterns: ['Hello, World!'],
    requiredKeywords: ['console.log'],
  });
  assert.equal(result.success, true);
});

test('validateSolution fails if required keyword is missing', () => {
  const code = '"Hello, World!";';
  const result = validateSolution(code, {
    expectedLogPatterns: ['Hello, World!'],
    requiredKeywords: ['console.log'],
  });
  assert.equal(result.success, false);
  assert.ok(result.feedback.includes('console.log'));
});

test('validateSolution captures variables correctly', () => {
  const code = 'let gems = 15; console.log(gems);';
  const result = validateSolution(code, {
    expectedVariables: { gems: 15 },
    expectedLogPatterns: ['15'],
  });
  assert.equal(result.success, true);
  assert.equal(result.variables.gems, 15);
});
