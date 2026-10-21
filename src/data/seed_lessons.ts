import type { LessonRecord } from '../types/lesson.ts';

export const SEED_LESSONS: Record<string, LessonRecord> = {
  variables: {
    id: 'lesson-variables',
    topicKey: 'variables',
    title: 'JavaScript Variables & Declarations',
    learningObjective: 'Learn how to declare labeled memory containers using let and const, and assign values to store data in memory.',
    prerequisiteConcepts: ['Code execution order', 'Values vs containers'],
    explanation:
      'In JavaScript, a variable is an identifier that references a value stored in memory. Think of a variable as a labeled container: you name the label (e.g. heroName), and place an item inside using the assignment operator (=). Modern JavaScript uses let when a value might change, and const when the reference should never be reassigned.',
    examples: [
      {
        code: 'let playerName = "Byte";\nplayerName = "Byte 2.0"; // Reassignment works with let',
        explanation: 'The let keyword creates a mutable binding that can receive new values later.',
      },
      {
        code: 'const MAX_BATTERY = 100;\n// MAX_BATTERY = 120; // ❌ TypeError: Assignment to constant variable',
        explanation: 'The const keyword creates an immutable binding that prevents accidental overwrites.',
      },
    ],
    keyTakeaways: [
      'let declares variables whose values can be updated or reassigned later.',
      'const declares a constant binding that cannot be reassigned once set.',
      'The single equal sign (=) assigns a value; it does not test mathematical equality.',
      'Variable names are case-sensitive and must not begin with a digit.',
    ],
    commonMisconceptions: [
      {
        misconception: 'Variable names must be wrapped in quotation marks like let "hero" = "Byte".',
        correction: 'Quotes create string values, not variable names. Variable identifiers are always written directly without quotes.',
      },
      {
        misconception: 'let and const are completely interchangeable with the older var keyword.',
        correction: 'var has function scope and undergoes hoisting quirks, while let and const provide safer block scoping.',
      },
    ],
    sourceReferences: [
      {
        title: 'Grammar and types - JavaScript | MDN',
        url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Grammar_and_types',
        license: 'CC-BY-SA 2.5',
        retrievedAt: '2026-10-20T00:00:00Z',
        attribution: 'Portions of this documentation are based on MDN Web Docs by Mozilla Contributors, licensed under CC-BY-SA 2.5.',
        transformationSummary: 'Extracted variable declaration concepts and type mechanics; transformed into beginner-friendly analogies and original interactive code challenges.',
      },
    ],
    difficulty: 'beginner',
    estimatedMinutes: 3,
    lastUpdated: '2026-10-20T00:00:00Z',
  },

  strings: {
    id: 'lesson-strings',
    topicKey: 'strings',
    title: 'Strings & Textual Data',
    learningObjective: 'Understand how text is represented using JavaScript string literals, quotes, and immutability.',
    prerequisiteConcepts: ['Variables', 'Data types'],
    explanation:
      'A string is a sequence of characters used to represent words, sentences, or any text. In JavaScript, string literals can be enclosed in single quotes (\'hello\'), double quotes ("hello"), or backticks (`hello`). Strings are immutable primitive values: once created, an individual character inside a string cannot be changed in place.',
    examples: [
      {
        code: 'let greeting = "Hello, World!";\nconsole.log(greeting);',
        explanation: 'Enclosing characters in matching quotation marks defines a valid string literal.',
      },
      {
        code: 'let message = "JavaScript";\nconsole.log(message.length); // Outputs 10',
        explanation: 'Every string has a built-in length property returning the character count.',
      },
    ],
    keyTakeaways: [
      'Strings represent textual data and require matching quotes (\' or ").',
      'JavaScript strings are zero-indexed and immutable primitive values.',
      'You can check the total number of characters using the .length property.',
      'Missing or mismatched quotes cause a SyntaxError.',
    ],
    commonMisconceptions: [
      {
        misconception: 'The value "42" is treated as a number by arithmetic operators.',
        correction: 'Any characters enclosed in quotation marks—even numbers—are strings, not numeric primitives.',
      },
      {
        misconception: 'You can mix quote styles, such as starting with " and ending with \'.',
        correction: 'Opening and closing quote delimiters must match exactly.',
      },
    ],
    sourceReferences: [
      {
        title: 'String - JavaScript | MDN',
        url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String',
        license: 'CC-BY-SA 2.5',
        retrievedAt: '2026-10-20T00:00:00Z',
        attribution: 'Portions of this documentation are based on MDN Web Docs by Mozilla Contributors, licensed under CC-BY-SA 2.5.',
        transformationSummary: 'Adapted primitive string characteristics and indexing properties into an intuitive introduction for first-time learners.',
      },
    ],
    difficulty: 'beginner',
    estimatedMinutes: 2,
    lastUpdated: '2026-10-20T00:00:00Z',
  },

  numbers: {
    id: 'lesson-numbers',
    topicKey: 'numbers',
    title: 'Numbers & Numeric Primitives',
    learningObjective: 'Master numeric data in JavaScript without quotes, and understand integers and decimals.',
    prerequisiteConcepts: ['Variables'],
    explanation:
      'Unlike text, numbers in JavaScript are written directly as digits without any quotation marks (e.g. 42 or 3.14). JavaScript uses double-precision 64-bit floating point format (IEEE 754) for standard numbers. Numbers allow instantaneous mathematical calculation using standard math operators.',
    examples: [
      {
        code: 'let battery = 100;\nlet ratio = 0.75;\nconsole.log(battery * ratio); // 75',
        explanation: 'Numbers are written as raw digits, allowing immediate mathematical computation.',
      },
      {
        code: 'let safeNumber = Number.isSafeInteger(9007199254740991); // true',
        explanation: 'JavaScript can safely represent integers up to 2^53 - 1 (Number.MAX_SAFE_INTEGER).',
      },
    ],
    keyTakeaways: [
      'Never put quotes around numbers you intend to compute with.',
      'Integers (42) and floating-point decimals (3.14) both belong to the Number type in JavaScript.',
      'Special number values include Infinity, -Infinity, and NaN ("Not a Number").',
    ],
    commonMisconceptions: [
      {
        misconception: 'JavaScript has separate integer (int) and float types like C++ or Java.',
        correction: 'In standard JavaScript, all standard numbers are IEEE 754 floating-point numbers under the single Number type.',
      },
      {
        misconception: 'NaN means a variable is undefined.',
        correction: 'NaN stands for "Not a Number", but its typeof is still "number"—it represents an invalid numeric operation like 0 / 0.',
      },
    ],
    sourceReferences: [
      {
        title: 'Number - JavaScript | MDN',
        url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number',
        license: 'CC-BY-SA 2.5',
        retrievedAt: '2026-10-20T00:00:00Z',
        attribution: 'Portions of this documentation are based on MDN Web Docs by Mozilla Contributors, licensed under CC-BY-SA 2.5.',
        transformationSummary: 'Extracted numeric format constraints and simplified IEEE 754 concepts into practical beginner guidelines.',
      },
    ],
    difficulty: 'beginner',
    estimatedMinutes: 3,
    lastUpdated: '2026-10-20T00:00:00Z',
  },

  operators: {
    id: 'lesson-operators',
    topicKey: 'operators',
    title: 'Expressions & Arithmetic Operators',
    learningObjective: 'Learn how math operators (+, -, *, /) and the concatenation operator evaluate expressions.',
    prerequisiteConcepts: ['Variables', 'Numbers', 'Strings'],
    explanation:
      'Operators perform operations on one or more values (operands) to produce a single result. JavaScript provides standard arithmetic operators: addition (+), subtraction (-), multiplication (*), division (/), and remainder (%). When applied between strings, the + operator acts as a concatenation operator, joining the strings together.',
    examples: [
      {
        code: 'let totalGems = 15 + 25;\nlet powerLevel = 4 * 10;\nconsole.log(totalGems); // 40',
        explanation: 'Math operators calculate the resulting value before storing it into the variable.',
      },
      {
        code: 'let bot = "Byte";\nlet status = "Online: " + bot;\nconsole.log(status); // "Online: Byte"',
        explanation: 'Using + with at least one string operand performs string concatenation.',
      },
    ],
    keyTakeaways: [
      '+ performs addition when both operands are numbers, but concatenation if either is a string.',
      'JavaScript follows standard mathematical operator precedence (PEMDAS / BODMAS).',
      'Use parentheses ( ) to group expressions and control evaluation order.',
    ],
    commonMisconceptions: [
      {
        misconception: '"5" + 5 equals 10.',
        correction: 'Because the left operand is a string, JavaScript converts the right number into "5" and concatenates to produce "55".',
      },
      {
        misconception: 'The ^ symbol performs exponentiation in JavaScript.',
        correction: 'In JavaScript, ^ is the bitwise XOR operator. Exponentiation is performed using ** or Math.pow().',
      },
    ],
    sourceReferences: [
      {
        title: 'Expressions and operators - JavaScript | MDN',
        url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Expressions_and_operators',
        license: 'CC-BY-SA 2.5',
        retrievedAt: '2026-10-20T00:00:00Z',
        attribution: 'Portions of this documentation are based on MDN Web Docs by Mozilla Contributors, licensed under CC-BY-SA 2.5.',
        transformationSummary: 'Synthesized operator precedence and type coercion rules into concrete, beginner-friendly challenge patterns.',
      },
    ],
    difficulty: 'beginner',
    estimatedMinutes: 3,
    lastUpdated: '2026-10-20T00:00:00Z',
  },

  'template-literals': {
    id: 'lesson-template-literals',
    topicKey: 'template-literals',
    title: 'Template Literals & String Interpolation',
    learningObjective: 'Master modern backtick string formatting and interpolate variables seamlessly with ${expression}.',
    prerequisiteConcepts: ['Strings', 'Variables', 'Operators'],
    explanation:
      'Template literals are string literals enclosed in backticks (`) instead of quotes. They permit embedded expressions using the ${expression} placeholder syntax. This is known as string interpolation, and it eliminates the awkward quote-and-plus signs required by traditional string concatenation.',
    examples: [
      {
        code: 'let hero = "Byte";\nlet score = 95;\nconsole.log(`Hero: ${hero} | Score: ${score}%`);',
        explanation: 'Expressions inside ${...} are evaluated and smoothly inserted into the final string.',
      },
      {
        code: 'let poem = `Line 1\nLine 2\nLine 3`; // Native multiline string support',
        explanation: 'Template literals preserve newlines naturally without requiring \\n escape characters.',
      },
    ],
    keyTakeaways: [
      'Template literals must be wrapped in backtick characters (`), usually located below Esc on keyboards.',
      'Insert variables and expressions directly using ${variableName}.',
      'Template literals support clean multi-line strings without escape sequences.',
      'Any valid JavaScript expression can be placed inside ${...}, including arithmetic (e.g. `${2 + 2}`).',
    ],
    commonMisconceptions: [
      {
        misconception: 'You can use ${variable} inside regular double quotes like "${hero}".',
        correction: 'Interpolation only works inside backticks (` `). In double quotes, ${hero} is printed literally as dollar sign and braces.',
      },
      {
        misconception: 'The backtick (`) is the same as a single quote (\').',
        correction: 'A backtick is a distinct key (tilde ~ key) with special syntactic meaning in ES6+.',
      },
    ],
    sourceReferences: [
      {
        title: 'Template literals (Template strings) - JavaScript | MDN',
        url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals',
        license: 'CC-BY-SA 2.5',
        retrievedAt: '2026-10-20T00:00:00Z',
        attribution: 'Portions of this documentation are based on MDN Web Docs by Mozilla Contributors, licensed under CC-BY-SA 2.5.',
        transformationSummary: 'Adapted ES6 template literal semantics, interpolation syntax, and multiline string behavior into practical examples.',
      },
    ],
    difficulty: 'beginner',
    estimatedMinutes: 3,
    lastUpdated: '2026-10-20T00:00:00Z',
  },

  'js-overview': {
    id: 'lesson-js-overview',
    topicKey: 'js-overview',
    title: 'What is JavaScript & Core Architecture',
    learningObjective: 'Understand the core features of JavaScript as a lightweight, interpreted, dynamically typed language and execute your first Hello World program.',
    prerequisiteConcepts: ['Basic web familiarity'],
    explanation:
      'JavaScript (JS) is a lightweight, object-oriented, and interpreted programming language engineered to bring interactivity, logic, and dynamic power to the web. Unlike compiled languages that require an upfront build phase, JavaScript code is interpreted line-by-line by browser engines (such as Chrome\'s V8 and Firefox\'s SpiderMonkey) and server environments (Node.js). JavaScript features dynamic typing, meaning variables hold data without static type restrictions, allowing seamless flexibility.',
    examples: [
      {
        code: 'console.log("Hello, World!");',
        explanation: 'The universally celebrated first program. console.log() commands the runtime engine to output a line of text directly to the developer console.',
      },
      {
        code: 'let powerLevel = 50;       // Holds a Number\npowerLevel = "Overdrive"; // Dynamic typing: effortlessly re-assigned to a String',
        explanation: 'Dynamic typing in action: variable types are bound to values rather than variable names, so variables can store different data types over time.',
      },
      {
        code: '// Full-Stack JavaScript Execution:\n// 1. Client-Side: DOM events, animations, UI states\n// 2. Server-Side: Node.js, Express APIs, microservices',
        explanation: 'JavaScript operates across the entire computing stack, from the user\'s local web browser to high-performance cloud servers.',
      },
    ],
    keyTakeaways: [
      'JavaScript is lightweight with minimal runtime overhead and is supported by every major web browser out of the box.',
      'Dynamic typing allows variables to change types based on assigned values without explicit type declarations.',
      'JavaScript is interpreted and JIT-compiled, executing line-by-line without requiring a separate compilation step.',
      'console.log() is the fundamental tool for inspecting values, debugging code, and tracking program execution.',
      'JavaScript uses prototype-based object orientation and single-threaded event-driven execution.',
    ],
    commonMisconceptions: [
      {
        misconception: 'Java and JavaScript are the same or derived from the same language.',
        correction: 'Java is a statically typed, compiled object-oriented language running on the JVM. JavaScript is a lightweight, dynamically typed scripting language designed for web and event-driven runtime environments.',
      },
      {
        misconception: 'JavaScript can only run inside a web browser.',
        correction: 'With modern runtimes like Node.js, JavaScript executes anywhere—including servers, databases, mobile devices, and IoT hardware.',
      },
    ],
    sourceReferences: [
      {
        title: 'JavaScript Tutorial - Learn JavaScript from Basics to Advanced Concepts - Tpoint Tech',
        url: 'https://www.tpointtech.com/javascript-tutorial',
        license: 'Educational Fair Attribution (© TpointTech.com)',
        retrievedAt: '2026-10-20T00:00:00Z',
        attribution: 'Synthesized from Tpoint Tech JavaScript Tutorial (tpointtech.com/javascript-tutorial). All rights reserved by Tpoint Tech.',
        transformationSummary: 'Extracted JavaScript runtime definition, lightweight architecture, dynamic typing principles, and client-versus-server applications; transformed into an interactive beginner lesson.',
      },
    ],
    difficulty: 'beginner',
    estimatedMinutes: 3,
    lastUpdated: '2026-10-20T00:00:00Z',
  },
};
