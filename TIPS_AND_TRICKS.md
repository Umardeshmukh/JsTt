# CodeQuest — Tips & Tricks Guide

This guide covers essential JavaScript tips for learners, platform shortcuts within CodeQuest, and developer guidelines for extending the curriculum and mind maps.

---

## 💡 Part 1: Top 10 JavaScript Learner Gotchas & Tricks

### 1. Always Use Strict Equality (`===`), Never Loose (`==`)
- **The Pitfall:** Loose equality performs silent type coercion, leading to baffling bugs:
  ```javascript
  0 == ""        // true!
  0 == "0"       // true!
  false == "0"   // true!
  null == undefined // true!
  ```
- **The Trick:** Always use `===` and `!==`. Strict equality verifies both **value** and **type**:
  ```javascript
  0 === ""       // false (number vs string)
  0 === 0        // true
  ```

---

### 2. Default to `const`, Use `let` Only When Reassigning
- **The Pitfall:** Using `var` introduces function-scoping and hoisting bugs where variables leak outside of `if` blocks or `for` loops.
- **The Trick:**
  - Use `const` by default for 90% of your bindings. It guarantees the variable reference won't be accidentally reassigned.
  - Use `let` only for counters (e.g. `for (let i = 0; ...)`) or accumulator variables.
  - Never use `var` in modern JavaScript.

---

### 3. Watch Out for the `+` Operator with Numbers and Strings
- **The Pitfall:** When one operand is a string, `+` performs string concatenation instead of math:
  ```javascript
  let total = "50" + 10; // "5010" (String, not 60!)
  ```
- **The Trick:** Convert strings to numbers explicitly using `Number()` or unary `+`:
  ```javascript
  let total = Number("50") + 10; // 60 (Number)
  let quick = +"50" + 10;        // 60
  ```

---

### 4. Zero-Based Indexing & The Off-by-One Trap
- **The Pitfall:** Arrays start at index `0`. Trying to access the last element with `arr[arr.length]` returns `undefined`:
  ```javascript
  const heroes = ["Byte", "Alice", "Bob"];
  console.log(heroes[heroes.length]); // undefined!
  ```
- **The Trick:** The last item is always at `arr.length - 1` (or modern `arr.at(-1)`):
  ```javascript
  console.log(heroes[heroes.length - 1]); // "Bob"
  console.log(heroes.at(-1));             // "Bob"
  ```

---

### 5. Object Properties: Dot Notation vs Bracket Notation
- **The Pitfall:** Dot notation only works with valid, fixed identifier names:
  ```javascript
  const user = { "first-name": "Byte", age: 1 };
  // user.first-name -> Error: Unexpected token -
  ```
- **The Trick:**
  - Use **dot notation** (`user.age`) for standard property names.
  - Use **bracket notation with quotes** (`user["first-name"]`) for properties with spaces or dashes.
  - Use **bracket notation with a variable** (`user[dynamicKey]`) to read dynamic property keys.

---

### 6. Memorize the 6 Falsy Values
- **The Pitfall:** Assuming empty collections (`[]` or `{}`) evaluate to false.
- **The Trick:** In JavaScript, **every value is truthy except these 6**:
  1. `false`
  2. `0` (and `-0`)
  3. `""` (empty string)
  4. `null`
  5. `undefined`
  6. `NaN`

  *Note:* Both empty arrays `[]` and empty objects `{}` are **truthy**!
  ```javascript
  if ([]) {
    // This executes! Empty arrays are truthy objects.
  }
  ```

---

### 7. Forgetting `return` Inside Functions
- **The Pitfall:** Functions in JavaScript always return `undefined` if no `return` statement is reached:
  ```javascript
  function add(a, b) {
    let result = a + b; // Forgot return!
  }
  console.log(add(5, 3)); // undefined
  ```
- **The Trick:** Ensure your function explicitly calls `return <value>`, or use arrow function concise body syntax for one-liners:
  ```javascript
  const add = (a, b) => a + b; // Implicit return
  ```

---

### 8. Array Mutation vs Immutability
- **The Pitfall:** Methods like `push()`, `pop()`, `shift()`, `unshift()`, `sort()`, and `reverse()` modify the original array in place.
- **The Trick:** When you need to preserve original data, copy first with the spread operator `[...]` or use modern non-mutating methods (`toSorted()`, `toReversed()`):
  ```javascript
  const original = [3, 1, 2];
  const sorted = [...original].sort(); // Preserves original!
  ```

---

### 9. Use Template Literals Instead of String Clutter
- **The Pitfall:** Combining strings with quotes and `+` easily creates missing space bugs:
  ```javascript
  "Welcome, " + name + "! You have " + score + " points."
  ```
- **The Trick:** Use backticks (`` ` ``) and `${}` interpolation:
  ```javascript
  `Welcome, ${name}! You have ${score} points.`
  ```

---

### 10. Avoid Accidental Infinite Loops
- **The Pitfall:** A `while` loop whose condition never changes to `false` will freeze the browser tab:
  ```javascript
  let count = 0;
  while (count < 5) {
    console.log(count);
    // Forgot count++ -> infinite loop!
  }
  ```
- **The Trick:** Prefer `for (let i = 0; i < N; i++)` whenever you know the iteration count. CodeQuest automatically intercepts and blocks common infinite loop patterns before execution.

---

## ⚡ Part 2: CodeQuest Platform Shortcuts

| Shortcut / Action | What it does |
| :--- | :--- |
| <kbd>Ctrl</kbd> / <kbd>Cmd</kbd> + <kbd>Enter</kbd> | Runs code or submits the answer immediately |
| <kbd>1</kbd>, <kbd>2</kbd>, <kbd>3</kbd>, <kbd>4</kbd> | Instantly selects multiple-choice options (when outside of text inputs) |
| <kbd>Enter</kbd> | Advances to the next lesson once current exercise is marked correct |
| **"Jump to Question"** | Smoothly scrolls from the Mind Map straight to the interactive exercise |
| **"Text Outline" Toggle** | Switches the Mind Map to a clean semantic list for accessibility |
| **Reset Data** | Available in the top-right Settings menu to restore clean starter state |

---

## 🛠️ Part 3: Developer & Contributor Guide

### Adding a New Concept & Mind Map
All concepts are defined as structured records in [`src/data/concepts.ts`](file:///Users/umerdeshmukh/Documents/JsTt/src/data/concepts.ts):

```typescript
export const CONCEPTS: Record<string, ConceptRecord> = {
  myConcept: {
    id: 'my-concept',
    title: 'My Concept',
    shortDefinition: 'Plain English definition of 25 words or fewer.',
    analogy: 'Real-world mental model for beginners.',
    codeExample: 'const x = 10;',
    keyTakeaway: 'The single most important rule to remember.',
    commonMistake: 'The common beginner trap and why it occurs.',
    mindMap: {
      centralLabel: 'My Concept',
      nodes: [
        { id: 'sub-1', label: 'Sub Concept', shortDesc: 'What it does', badge: 'Category' },
        { id: 'sub-2', label: 'Another Sub', shortDesc: 'What it does' },
      ],
    },
    relatedConceptIds: ['variables'],
    exerciseIds: ['w1-q1'],
  },
};
```

### Running Tests Locally
CodeQuest uses Node's native test runner via `tsx` (no heavy Jest or Babel setup required):
```bash
# Run all tests
npm test

# Run a specific test file
npx tsx --test src/game/concepts.test.ts
```

### Zero-Dollar Operating Mode
CodeQuest operates at $0 cost by default:
- Uses the embedded question bank in [`src/data/question_bank.ts`](file:///Users/umerdeshmukh/Documents/JsTt/src/data/question_bank.ts) if Google GenAI is offline or no API key is provided.
- Passwordless magic links are verified in-memory or via local tokens without needing paid transactional email services.

---

### Mobile & Small Screen Optimization
- **Minimum 44px Touch Targets:** All interactive buttons and inputs meet WCAG touch target recommendations (`min-h-[44px]` or `min-h-[38px]` with `touch-manipulation`).
- **iOS Safari Auto-Zoom Prevention:** Form inputs use `font-size: 16px` on viewports under 640px to eliminate unwanted browser zoom.
- **Sticky Exercise Action Bar:** On mobile devices, the Check Answer / Run Code bar sticks cleanly to the bottom (`sticky bottom-0`) with safe-area inset support (`env(safe-area-inset-bottom)`).
- **Horizontal Smooth Scrolling:** Concept selection tabs and code blocks feature touch-scrolling without awkward wrapping.
- **320px Viewport Safety:** Dropdown menus and modals use `max-w-[calc(100vw-1.5rem)]` to prevent horizontal clipping on narrow phones (e.g., iPhone SE).
