/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ConceptRecord } from '../types/concept';

export const CONCEPTS: Record<string, ConceptRecord> = {
  variables: {
    id: 'variables',
    title: 'Variables',
    shortDefinition: 'Named places in memory to store, retrieve, and update values in your program.',
    analogy: 'Think of a variable as a labeled storage box: the label is the variable name, and whatever you place inside is the value.',
    codeExample: 'let score = 10;\nscore = 15; // Reassigned\nconst maxLives = 3; // Permanent',
    keyTakeaway: 'Use const by default for values that never change, and let when you need to reassign values later.',
    commonMistake: 'Wrapping variable names in quotation marks (e.g. let "name" = "Byte"), which causes a SyntaxError because quotes designate strings, not identifiers.',
    mindMap: {
      centralLabel: 'Variables',
      nodes: [
        {
          id: 'let',
          label: 'let',
          shortDesc: 'Declares a mutable variable that can receive new values later.',
          exampleSnippet: 'let count = 1;\ncount = 2;',
          badge: 'Reassignable',
        },
        {
          id: 'const',
          label: 'const',
          shortDesc: 'Declares an immutable binding that cannot be reassigned once set.',
          exampleSnippet: 'const PI = 3.14159;',
          badge: 'Fixed',
        },
        {
          id: 'assignment',
          label: '= Operator',
          shortDesc: 'The single equal sign stores the value on the right into the container on the left.',
          exampleSnippet: 'let hero = "Byte";',
          badge: 'Stores Value',
        },
        {
          id: 'naming',
          label: 'Identifiers',
          shortDesc: 'Descriptive, case-sensitive names without quotes or leading digits.',
          exampleSnippet: 'let userAge = 25;',
          badge: 'Rules',
        },
      ],
    },
    relatedConceptIds: ['data-types', 'operators'],
    exerciseIds: ['w1-q2', 'qb-var-1', 'qb-var-2', 'qb-var-3', 'qb-var-4'],
  },

  'data-types': {
    id: 'data-types',
    title: 'Data Types',
    shortDefinition: 'The foundational categories of data values that JavaScript recognizes, stores, and evaluates.',
    analogy: 'Different data types are like different tools in a kit: numbers measure quantities, strings hold words, and booleans act as light switches.',
    codeExample: 'let text = "Hello";     // String\nlet count = 42;          // Number\nlet isActive = true;     // Boolean\nlet empty = null;        // Intentional empty',
    keyTakeaway: 'JavaScript variables have dynamic types: a variable holds whatever type of value you assign to it.',
    commonMistake: 'Writing numbers inside quotes (e.g. "42"), which turns them into text strings and causes unexpected concatenation instead of math.',
    mindMap: {
      centralLabel: 'Data Types',
      nodes: [
        {
          id: 'strings',
          label: 'String',
          shortDesc: 'Text wrapped in single quotes, double quotes, or backticks.',
          exampleSnippet: 'let greeting = "Hello World";',
          badge: 'Text',
        },
        {
          id: 'numbers',
          label: 'Number',
          shortDesc: 'Integers and decimals written directly as digits without quotes.',
          exampleSnippet: 'let price = 19.99;',
          badge: 'Math',
        },
        {
          id: 'booleans',
          label: 'Boolean',
          shortDesc: 'Represents binary logic with exactly two values: true or false.',
          exampleSnippet: 'let isOnline = true;',
          badge: 'true / false',
        },
        {
          id: 'null-undefined',
          label: 'null & undefined',
          shortDesc: 'undefined means unassigned; null represents an intentional absence of value.',
          exampleSnippet: 'let unassigned;\nlet empty = null;',
          badge: 'Absence',
        },
      ],
    },
    relatedConceptIds: ['variables', 'operators'],
    exerciseIds: ['w1-q1', 'w1-q3', 'w1-q4', 'qb-str-1', 'qb-num-1'],
  },

  operators: {
    id: 'operators',
    title: 'Operators',
    shortDefinition: 'Symbols that perform calculations, compare values, and assign data to variables.',
    analogy: 'Operators are mathematical and logical verbs that tell JavaScript how to combine or test your nouns (data).',
    codeExample: 'let total = 10 + 5 * 2;   // 20 (precedence)\nlet isAdult = age >= 18;  // true or false\nlet match = "10" === 10;  // false (strict)',
    keyTakeaway: 'Always use strict equality (===) to prevent unexpected type conversions during comparisons.',
    commonMistake: 'Using a single equal sign (=) to test equality instead of triple equals (===), accidentally reassigning the variable.',
    mindMap: {
      centralLabel: 'Operators',
      nodes: [
        {
          id: 'arithmetic',
          label: 'Arithmetic',
          shortDesc: 'Standard math: + (add), - (subtract), * (multiply), / (divide).',
          exampleSnippet: 'let energy = 50 + 50;',
          badge: '+ - * /',
        },
        {
          id: 'comparison',
          label: 'Comparison',
          shortDesc: 'Tests relationships and produces booleans: ===, !==, >, <, >=, <=.',
          exampleSnippet: 'let pass = score > 70;',
          badge: '=== !== > <',
        },
        {
          id: 'logical',
          label: 'Logical',
          shortDesc: 'Combines boolean conditions: && (AND), || (OR), ! (NOT).',
          exampleSnippet: 'let valid = hasKey && isOpen;',
          badge: '&& || !',
        },
        {
          id: 'concatenation',
          label: 'Concatenation',
          shortDesc: 'Using + with strings glues text together instead of doing math.',
          exampleSnippet: '"Hi " + "Byte" // "Hi Byte"',
          badge: 'String +',
        },
      ],
    },
    relatedConceptIds: ['data-types', 'conditionals'],
    exerciseIds: ['w1-q3', 'w1-q4', 'qb-num-2', 'qb-op-1'],
  },

  conditionals: {
    id: 'conditionals',
    title: 'Conditionals',
    shortDefinition: 'Code structures that make decisions by executing different instructions based on true or false conditions.',
    analogy: 'Conditionals are like a fork in a road: if the light is green, proceed; otherwise, stop.',
    codeExample: 'if (health > 50) {\n  console.log("Healthy");\n} else {\n  console.log("Need medical kit");\n}',
    keyTakeaway: 'Only the block corresponding to the first true condition will execute in an if/else chain.',
    commonMistake: 'Forgetting parentheses around the condition in an if statement, e.g. writing if score > 50 instead of if (score > 50).',
    mindMap: {
      centralLabel: 'Conditionals',
      nodes: [
        {
          id: 'if-branch',
          label: 'if',
          shortDesc: 'Executes its block only if the test condition evaluates to true.',
          exampleSnippet: 'if (score >= 100) {\n  win();\n}',
          badge: 'Primary Test',
        },
        {
          id: 'else-branch',
          label: 'else',
          shortDesc: 'Fallback block that runs when all preceding tests were false.',
          exampleSnippet: 'else {\n  keepTrying();\n}',
          badge: 'Fallback',
        },
        {
          id: 'else-if',
          label: 'else if',
          shortDesc: 'Tests additional conditions when the initial if evaluated to false.',
          exampleSnippet: 'else if (score >= 50) {\n  pass();\n}',
          badge: 'Secondary',
        },
        {
          id: 'truthy-falsy',
          label: 'Truthy / Falsy',
          shortDesc: 'Values automatically treated as false: 0, "", null, undefined, NaN.',
          exampleSnippet: 'if (userName) {\n  greet(userName);\n}',
          badge: 'Evaluation',
        },
      ],
    },
    relatedConceptIds: ['operators', 'loops'],
    exerciseIds: ['qb-op-1'],
  },

  loops: {
    id: 'loops',
    title: 'Loops',
    shortDefinition: 'Automated structures that repeat instructions until a specific stopping condition is met.',
    analogy: 'A loop is like running laps around a track: you count each lap and keep running until you reach your goal count.',
    codeExample: 'for (let i = 0; i < 3; i++) {\n  console.log("Lap " + i);\n}',
    keyTakeaway: 'Every loop must have a reliable stopping condition to avoid freezing your runtime in an infinite loop.',
    commonMistake: 'Forgetting to increment the loop counter inside a while loop, causing an infinite loop that crashes the tab.',
    mindMap: {
      centralLabel: 'Loops',
      nodes: [
        {
          id: 'for-loop',
          label: 'for Loop',
          shortDesc: 'Best when you know in advance how many times to repeat.',
          exampleSnippet: 'for (let i = 0; i < 5; i++) {\n  console.log(i);\n}',
          badge: 'Counted',
        },
        {
          id: 'while-loop',
          label: 'while Loop',
          shortDesc: 'Repeats as long as an external condition stays true.',
          exampleSnippet: 'while (fuel > 0) {\n  fuel--;\n}',
          badge: 'Conditional',
        },
        {
          id: 'loop-counter',
          label: 'Counter (i)',
          shortDesc: 'Tracks the current iteration index, starting typically at 0.',
          exampleSnippet: 'let i = 0; i < count; i++',
          badge: 'Index',
        },
        {
          id: 'break-continue',
          label: 'break / continue',
          shortDesc: 'break exits the loop immediately; continue skips to the next turn.',
          exampleSnippet: 'if (i === 3) break;',
          badge: 'Control',
        },
      ],
    },
    relatedConceptIds: ['conditionals', 'arrays'],
    exerciseIds: [],
  },

  functions: {
    id: 'functions',
    title: 'Functions',
    shortDefinition: 'Reusable blocks of organized code that take inputs, perform tasks, and return results.',
    analogy: 'A function is like a kitchen recipe: give it ingredients (parameters), follow steps, and receive a finished dish (return value).',
    codeExample: 'function add(a, b) {\n  return a + b;\n}\nlet sum = add(5, 3); // 8',
    keyTakeaway: 'The return statement immediately sends a value back to where the function was called and finishes execution.',
    commonMistake: 'Forgetting to write return inside a function, which causes the function call to evaluate to undefined.',
    mindMap: {
      centralLabel: 'Functions',
      nodes: [
        {
          id: 'parameters',
          label: 'Parameters',
          shortDesc: 'Placeholder variables in the definition that receive inputs.',
          exampleSnippet: 'function greet(name) { ... }',
          badge: 'Inputs',
        },
        {
          id: 'return-statement',
          label: 'return',
          shortDesc: 'Outputs a result value and ends the function execution.',
          exampleSnippet: 'return x * 2;',
          badge: 'Output',
        },
        {
          id: 'function-call',
          label: 'Invocation ()',
          shortDesc: 'Calling the function with parentheses executes its body.',
          exampleSnippet: 'greet("Byte");',
          badge: 'Execution',
        },
        {
          id: 'arrow-syntax',
          label: 'Arrow (=>)',
          shortDesc: 'Modern compact shorthand syntax for declaring functions.',
          exampleSnippet: 'const double = (n) => n * 2;',
          badge: 'Modern Syntax',
        },
      ],
    },
    relatedConceptIds: ['variables', 'objects'],
    exerciseIds: [],
  },

  arrays: {
    id: 'arrays',
    title: 'Arrays',
    shortDefinition: 'Ordered lists of values accessed by their numerical position starting at zero.',
    analogy: 'An array is like a numbered shelf of numbered boxes: the first box is at slot 0, the next is at slot 1, and so on.',
    codeExample: 'let fruits = ["apple", "banana", "cherry"];\nconsole.log(fruits[0]); // "apple"\nfruits.push("orange");  // Adds to end',
    keyTakeaway: 'JavaScript arrays use zero-based indexing: the first item is always at index 0, and the last item is at length - 1.',
    commonMistake: 'Trying to access the first element with array[1] instead of array[0], causing off-by-one errors.',
    mindMap: {
      centralLabel: 'Arrays',
      nodes: [
        {
          id: 'brackets',
          label: 'Brackets []',
          shortDesc: 'Square brackets define array literals and access specific index items.',
          exampleSnippet: 'let items = [10, 20, 30];\nlet first = items[0];',
          badge: 'Index Access',
        },
        {
          id: 'length',
          label: '.length',
          shortDesc: 'Property returning the total count of elements inside the array.',
          exampleSnippet: 'items.length // 3',
          badge: 'Count',
        },
        {
          id: 'push-pop',
          label: 'push & pop',
          shortDesc: 'push() adds an element to the end; pop() removes the last element.',
          exampleSnippet: 'items.push(40);\nitems.pop();',
          badge: 'Modify',
        },
        {
          id: 'zero-indexed',
          label: 'Zero-Indexed',
          shortDesc: 'Positions always start at 0, not 1.',
          exampleSnippet: 'let firstItem = list[0];',
          badge: '0, 1, 2...',
        },
      ],
    },
    relatedConceptIds: ['loops', 'objects'],
    exerciseIds: [],
  },

  objects: {
    id: 'objects',
    title: 'Objects',
    shortDefinition: 'Collections of related properties that store information using named key-value pairs.',
    analogy: 'An object is like a contact card in your phone: it has named fields for "name", "phone", and "email" all bundled together.',
    codeExample: 'let hero = {\n  name: "Byte",\n  level: 1,\n  isOnline: true\n};\nconsole.log(hero.name); // "Byte"',
    keyTakeaway: 'Use dot notation (object.key) when you know the property name, and bracket notation (object[key]) for dynamic names.',
    commonMistake: 'Using an unquoted string as a key in bracket notation (e.g. hero[name] instead of hero["name"]), which looks for a variable named name.',
    mindMap: {
      centralLabel: 'Objects',
      nodes: [
        {
          id: 'key-value',
          label: 'Key : Value',
          shortDesc: 'Pairs of identifier labels mapped to values, separated by a colon.',
          exampleSnippet: 'let bot = { name: "Byte" };',
          badge: 'Pairs',
        },
        {
          id: 'dot-notation',
          label: 'Dot . Notation',
          shortDesc: 'Directly reads or updates properties using a dot and property name.',
          exampleSnippet: 'bot.level = 2;',
          badge: 'Access',
        },
        {
          id: 'brackets-access',
          label: 'Bracket ["key"]',
          shortDesc: 'Accesses properties using variable keys or keys with special characters.',
          exampleSnippet: 'bot["name"] // "Byte"',
          badge: 'Dynamic',
        },
        {
          id: 'methods',
          label: 'Methods',
          shortDesc: 'Functions stored as properties inside an object to perform actions.',
          exampleSnippet: 'greet() { return "Hi!"; }',
          badge: 'Actions',
        },
      ],
    },
    relatedConceptIds: ['arrays', 'functions'],
    exerciseIds: ['w1-q5'],
  },
};

/**
 * Helper to fetch a concept by ID with safe fallback
 */
export function getConceptById(id: string): ConceptRecord {
  return CONCEPTS[id] || CONCEPTS['variables'];
}

/**
 * Maps a quest topic or question bank conceptId to our structured concept record
 */
export function mapTopicToConceptId(topicOrId: string): string {
  const normalized = topicOrId.toLowerCase().trim();
  if (normalized.includes('var') || normalized === 'w1-q2') return 'variables';
  if (normalized.includes('string') || normalized.includes('text') || normalized === 'w1-q1' || normalized === 'w1-q4') return 'data-types';
  if (normalized.includes('number') || normalized.includes('math') || normalized === 'w1-q3') return 'data-types';
  if (normalized.includes('loop') || normalized.includes('while') || normalized.startsWith('for')) return 'loops';
  if (normalized.includes('cond') || normalized.includes('if')) return 'conditionals';
  if (normalized.includes('operator') || normalized === 'operators' || normalized.startsWith('op-') || normalized.startsWith('qb-op') || normalized.includes('calc')) return 'operators';
  if (normalized.includes('func')) return 'functions';
  if (normalized.includes('array') || normalized.includes('list')) return 'arrays';
  if (normalized.includes('obj') || normalized === 'w1-q5') return 'objects';
  return 'variables';
}
