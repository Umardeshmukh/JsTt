import test from 'node:test';
import assert from 'node:assert/strict';
import { CONCEPTS, getConceptById, mapTopicToConceptId } from '../data/concepts.ts';

const REQUIRED_CONCEPTS = [
  'variables',
  'data-types',
  'operators',
  'conditionals',
  'loops',
  'functions',
  'arrays',
  'objects',
];

test('Curriculum Concepts: All 8 required core concepts are registered', () => {
  for (const conceptId of REQUIRED_CONCEPTS) {
    assert.ok(CONCEPTS[conceptId], `Concept '${conceptId}' must exist in CONCEPTS registry`);
    assert.equal(CONCEPTS[conceptId].id, conceptId);
  }
});

test('Curriculum Concepts: Short definitions are plain-English and under 25 words', () => {
  for (const [id, concept] of Object.entries(CONCEPTS)) {
    assert.ok(concept.shortDefinition, `Concept '${id}' must have a shortDefinition`);
    const wordCount = concept.shortDefinition.trim().split(/\s+/).length;
    assert.ok(
      wordCount <= 25,
      `Concept '${id}' definition must be <= 25 words, got ${wordCount}: "${concept.shortDefinition}"`
    );
  }
});

test('Mind Map Structure: Each concept has 2 to 5 connected sub-nodes', () => {
  for (const [id, concept] of Object.entries(CONCEPTS)) {
    const nodes = concept.mindMap?.nodes;
    assert.ok(Array.isArray(nodes), `Concept '${id}' must have mindMap.nodes array`);
    assert.ok(
      nodes.length >= 2 && nodes.length <= 5,
      `Concept '${id}' must have between 2 and 5 sub-nodes, got ${nodes.length}`
    );

    for (const node of nodes) {
      assert.ok(node.id, `Node in '${id}' must have an id`);
      assert.ok(node.label, `Node in '${id}' must have a label`);
      assert.ok(node.shortDesc, `Node in '${id}' must have a shortDesc`);
    }
  }
});

test('Curriculum Content: Code examples, key takeaways, and analogies exist', () => {
  for (const [id, concept] of Object.entries(CONCEPTS)) {
    assert.ok(concept.codeExample.length > 0, `Concept '${id}' must have a codeExample`);
    assert.ok(concept.keyTakeaway.length > 0, `Concept '${id}' must have a keyTakeaway`);
    assert.ok(concept.analogy.length > 0, `Concept '${id}' must have a practical analogy`);
  }
});

test('Variables Concept: Complete verified example content', () => {
  const vars = CONCEPTS['variables'];
  assert.equal(vars.title, 'Variables');
  assert.ok(vars.shortDefinition.includes('store'));
  assert.ok(vars.analogy.includes('labeled storage box'));
  assert.ok(vars.codeExample.includes('let score'));
  assert.ok(vars.mindMap.nodes.some((n) => n.label === 'let'));
  assert.ok(vars.mindMap.nodes.some((n) => n.label === 'const'));
  assert.ok(vars.commonMistake.includes('SyntaxError'));
});

test('Concept Routing: mapTopicToConceptId accurately resolves topics', () => {
  assert.equal(mapTopicToConceptId('variables'), 'variables');
  assert.equal(mapTopicToConceptId('w1-q2'), 'variables');
  assert.equal(mapTopicToConceptId('w1-q1'), 'data-types');
  assert.equal(mapTopicToConceptId('strings'), 'data-types');
  assert.equal(mapTopicToConceptId('w1-q3'), 'data-types');
  assert.equal(mapTopicToConceptId('operators'), 'operators');
  assert.equal(mapTopicToConceptId('if_statements'), 'conditionals');
  assert.equal(mapTopicToConceptId('loops'), 'loops');
  assert.equal(mapTopicToConceptId('functions'), 'functions');
  assert.equal(mapTopicToConceptId('arrays'), 'arrays');
  assert.equal(mapTopicToConceptId('objects'), 'objects');
});

test('Concept Lookup: getConceptById falls back gracefully for unknown keys', () => {
  const known = getConceptById('arrays');
  assert.equal(known.title, 'Arrays');

  const unknown = getConceptById('unknown-concept-xyz');
  assert.equal(unknown.id, 'variables'); // safe fallback
});
