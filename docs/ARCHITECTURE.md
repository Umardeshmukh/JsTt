# CodeQuest — Architecture & System Design Document

This document details the architectural decisions, component hierarchy, security isolation, and data flow of CodeQuest.

---

## 1. Architectural Principles

1. **Functionality-First:** The user interface prioritizes clarity, readability, and immediate feedback over ornamental animations and decorative clutter.
2. **Pedagogical Flow:** Every concept follows the 6-step progression: Mind Map → Definition (≤25 words) → Code Example → Analogy → Question → Immediate Feedback.
3. **Zero Operating Cost ($0 Budget):** Complete offline autonomy with local question banks, in-browser execution sandboxing, and passwordless authentication requiring zero paid third-party infrastructure.
4. **Authoritative Progression:** XP calculation and quest completion are validated by server-side logic (`/api/user/progress/complete-quest` and `/api/validate-exercise`) with duplicate submission idempotency.
5. **Universal Accessibility:** Inline SVG with fallback semantic outlines, high-contrast dark theme, full keyboard navigation, and reduced-motion compliance.

---

## 2. Component Hierarchy & Flow

```
[index.html]
    │
    ▼
[main.tsx] ──> wraps in <ErrorBoundary>
    │
    ▼
[App.tsx] (Root State & Routing)
    ├── <Navbar /> (Minimal 2-destination navigation: Learn & Progress + Settings popover)
    │
    ├── State: currentView === 'learn'
    │     └── <LearnView />
    │           ├── Active Lesson Spotlight ("Continue Lesson")
    │           ├── Concept Mind Map Explorer (<ConceptMindMap />)
    │           ├── World 1 Curriculum Sequence
    │           └── Question Bank Practice Cards
    │
    ├── State: currentView === 'progress'
    │     └── <ProgressView />
    │           ├── 4 Core Metrics (Current Lesson, Questions Done, XP/Level, Course %)
    │           ├── Detailed Curriculum Progression Table
    │           └── Data Management & Reset
    │
    └── State: activeExerciseItem !== null
          └── <ExerciseScreen /> (Dedicated Distraction-Free Learning Workspace)
                ├── <ConceptOverview />
                │     ├── Step 1: <ConceptMindMap /> (Interactive SVG/CSS tree)
                │     ├── Step 2: Plain-English Definition (≤ 25 words)
                │     ├── Step 3: JavaScript Code Snippet
                │     ├── Step 4: Practical Real-World Analogy
                │     └── Key Takeaway & Common Beginner Mistake
                │
                ├── Step 5: Interactive Question Input
                │     ├── Code Quest: Monospace editor with line numbers & live console
                │     └── Dynamic Question: Predict output / bug-fix / fill-blank
                │
                └── Step 6: Immediate Feedback & Authoritative XP Award
                      └── Next Lesson / Continue Button
```

---

## 3. Sandboxed Code Execution & Security

User JavaScript code execution occurs client-side using `new Function()`, wrapped in multi-layered safety guards:

1. **Pre-Execution Static Analysis:** Code is inspected for common infinite loop constructs (`while(true)`, `for(;;)`, `while(1)`) prior to evaluation.
2. **Global Shadowing:** Host environment APIs (`window`, `document`, `fetch`, `localStorage`, `WebSocket`) are shadowed to `undefined` within the evaluation scope.
3. **Single-Pass Variable Extraction:** Top-level variables (`let`, `const`, `var`) are inspected and extracted in a single pass to eliminate redundant side-effects.
4. **Sandboxed Console Recorder:** A custom console recorder captures `console.log`, `console.info`, and `console.error` for live output in the terminal panel.

---

## 4. Server-Side Progression & XP Idempotency

```
Client (Exercise Screen)
    │
    ├── Submits code or answer to /api/validate-exercise or /api/user/progress/complete-quest
    │
Server (server.ts)
    │
    ├── Authenticates session token (if present) via authenticateSession()
    │
    ├── Checks if questId/exerciseId has already been completed:
    │     ├── Already Completed: returns awardedXp: 0
    │     └── First Completion: executes recordUserXp(), awards full XP
    │
    └── Returns authoritative result: { success: true, isCorrect: true, awardedXp: X }
```

---

## 5. Accessibility (a11y) & Performance Standards

- **Semantic Elements:** Standard `<header>`, `<main>`, `<footer>`, `<section>`, `<nav>`, `<button>`, and `<h1>`–`<h4>` hierarchy.
- **Focus Rings:** Distinct `:focus-visible` outline indicators with 2px offset.
- **Keyboard Shortcuts:**
  - `Ctrl` / `Cmd` + `Enter`: Check answer / Run code
  - `1`, `2`, `3`, `4`: Select multiple-choice option
  - `Enter`: Advance to next lesson upon successful answer
- **Reduced Motion:** Automatic adaptation to system preference via CSS media queries.
- **SVG Mind Maps:** Responsive vector rendering with a dedicated toggle for semantic text outline fallback.
