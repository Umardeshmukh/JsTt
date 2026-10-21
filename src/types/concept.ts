/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface MindMapNode {
  id: string;
  label: string;
  shortDesc: string;
  exampleSnippet?: string;
  badge?: string;
}

export interface ConceptRecord {
  id: string;
  title: string;
  shortDefinition: string; // Plain-English definition of <= 25 words
  analogy: string; // Practical real-world analogy
  codeExample: string; // Small, clean JavaScript example
  keyTakeaway: string; // Key takeaway sentence
  commonMistake: string; // Common beginner pitfall and correction
  mindMap: {
    centralLabel: string;
    nodes: MindMapNode[];
  };
  relatedConceptIds: string[];
  exerciseIds: string[]; // Linked quest or question bank IDs
}
