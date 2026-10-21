# CodeQuest — Visual & Functionality-First JavaScript Learning Platform

CodeQuest is a minimal, distraction-free JavaScript learning web application designed to help learners spend almost all their time writing code, exploring concepts through visual mind maps, answering questions, and understanding mistakes.

Built with **React 19**, **TypeScript**, **Vite**, **Express**, and **Tailwind CSS v4**, operating under a **$0 budget** architecture with offline resilience.

---

## 🌟 Key Features

### 1. 6-Step Concept Learning Format
Every JavaScript concept is presented in a strict, pedagogically optimized order:
1. **Interactive Graphical Mind Map:** Visual diagram displaying central concepts and 2–5 connected sub-concepts.
2. **Concise Definition:** Plain-English definition strictly capped at 25 words or fewer.
3. **JavaScript Code Example:** Clear syntax example with copyable snippets.
4. **Practical Analogy:** Intuitive real-world mental models (e.g., variables as labeled boxes, functions as recipes).
5. **Interactive Question:** Real code execution challenges or conceptual checks.
6. **Immediate Feedback:** Clear explanation of why the answer is correct or what went wrong, with authoritative XP.

### 2. Interactive SVG Concept Mind Maps
- Reusable `ConceptMindMap` component using pure inline SVG and semantic CSS.
- **Node Exploration:** Clicking any node reveals its sub-concept definition, badge, and an expandable code snippet without navigating away.
- **Accessibility Outline:** One-click toggle between graphical SVG diagram and semantic `<ol>` text outline for screen readers and text-first preferences.
- **Responsive:** Adapts from a connected tree on desktop to a touch-friendly flex grid on mobile.

### 3. Core JavaScript Curriculum
Structured, reusable concept records for 8 foundational JavaScript topics:
- **Variables** (`let`, `const`, assignment `=`, identifier rules)
- **Data Types** (`String`, `Number`, `Boolean`, `null & undefined`)
- **Operators** (Arithmetic, Comparison `===`, Logical `&&`/`||`, String Concatenation)
- **Conditionals** (`if`, `else`, `else if`, Truthy/Falsy evaluation)
- **Loops** (`for`, `while`, loop counter `i`, `break`/`continue`)
- **Functions** (Parameters, `return`, invocation `()`, arrow syntax `=>`)
- **Arrays** (Brackets `[]`, `.length`, `push`/`pop`, zero-based indexing)
- **Objects** (Key-value pairs, dot notation `.`, bracket notation `["key"]`, methods)

### 4. Hardened In-Browser JavaScript Sandbox
- **Infinite Loop Defense:** Static analysis halts infinite loops (`while(true)`, `for(;;)`, `while(1)`) before evaluation.
- **Global Shadowing:** Shields DOM and network globals (`window`, `document`, `fetch`, `localStorage`, `WebSocket`) inside evaluation scope.
- **Single-Pass Variable Extraction:** Batch variable extraction avoids redundant multi-pass re-evaluations.

### 5. Server-Authoritative Progression & XP Idempotency
- XP rewards are validated by backend server logic (`/api/user/progress/complete-quest` and `/api/validate-exercise`).
- Resubmitting previously completed exercises awards 0 duplicate XP, preventing reward exploitation.
- Supports both anonymous guest learners (persisted via `localStorage`) and optional passwordless magic link authentication.

### 6. Distraction-Free, Accessible Design System
- Neutral dark background (`#090D16`) with high-contrast slate text and indigo accent.
- Visible `:focus-visible` rings across all interactive controls.
- Keyboard navigation:
  - <kbd>Ctrl</kbd> / <kbd>Cmd</kbd> + <kbd>Enter</kbd> to Run Code / Check Answer
  - <kbd>1</kbd> – <kbd>4</kbd> keys to select multiple-choice options
  - <kbd>Enter</kbd> to proceed to next lesson
- Respects `@media (prefers-reduced-motion: reduce)`.
- Root `ErrorBoundary` prevents white-screen crashes and provides one-click recovery.

---

## 🛠️ Tech Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS v4, Lucide React, Inline SVG
- **Backend Server:** Express 4 (Node.js ESM)
- **Build & Dev:** Vite 8, `tsx`
- **Testing:** Node.js native test runner (`node:test`)
- **Database / Schema:** Prisma schema ready (`prisma/schema.prisma`) with zero-cost memory fallback

---

## 🚀 Getting Started

### Prerequisites
- **Node.js:** v20.x or v22.x+
- **npm:** v10.x+

### Installation
```bash
# Clone repository
git clone git@github.com:Umardeshmukh/JsTt.git
cd JsTt

# Install dependencies cleanly
npm install
```

### Running Locally
```bash
# Start development server (runs Express + Vite middleware)
npm run dev
```
Open your browser at `http://localhost:3000`.

---

## 🧪 Testing & Quality Gates

```bash
# Run automated test suite (44 unit & integration tests)
npm test

# Run TypeScript type-checker
npm run lint

# Run security vulnerability audit
npm audit

# Build production bundle
npm run build
```

---

## 📂 Project Structure

```
├── prisma/
│   └── schema.prisma        # Database schema definition
├── src/
│   ├── components/
│   │   ├── ConceptMindMap.tsx   # Reusable SVG/CSS interactive mind map
│   │   ├── ConceptOverview.tsx  # 6-step concept presentation wrapper
│   │   ├── ErrorBoundary.tsx    # React error boundary recovery screen
│   │   ├── ExerciseScreen.tsx   # Distraction-free question & coding workspace
│   │   ├── LearnView.tsx        # Curriculum spotlight & concept explorer
│   │   ├── Navbar.tsx           # Minimal 2-tab navigation (Learn & Progress)
│   │   └── ProgressView.tsx     # Lightweight progress metrics & review
│   ├── data/
│   │   ├── concepts.ts          # Structured 8 core concepts & mind maps
│   │   ├── curriculum.ts        # World 1 coding quests & starter code
│   │   ├── question_bank.ts     # Offline verified concept exercises
│   │   └── seed_lessons.ts      # Grounded documentation reference lessons
│   ├── game/
│   │   ├── concepts.test.ts     # Mind map & concept validation tests
│   │   ├── scoring.ts           # Authoritative XP & level threshold calculations
│   │   ├── validator.ts         # Hardened JS code execution sandbox
│   │   └── validator.test.ts    # Sandbox security & loop blocking tests
│   ├── services/
│   │   ├── ai_provider.ts       # $0 free-tier Google GenAI provider & fallback
│   │   ├── auth_service.ts      # Zero-cost passwordless magic link sessions
│   │   └── exercise_verifier.ts # Authoritative answer verification logic
│   ├── types/
│   │   ├── concept.ts           # MindMapNode & ConceptRecord types
│   │   ├── exercise.ts          # DynamicExercise & validation interfaces
│   │   └── index.ts             # UserProgress & Quest types
│   ├── App.tsx                  # Root state orchestration & routing
│   ├── index.css                # Minimal design system & reduced motion
│   └── main.tsx                 # Root mount with ErrorBoundary
├── server.ts                    # Express backend & API endpoints
├── package.json                 # Dependency manifests & scripts
├── vite.config.ts               # ESM Vite bundler configuration
└── TIPS_AND_TRICKS.md           # Developer & learner reference guide
```

---

## 🔒 Security & Sandboxing Features

1. **Strict Content Isolation:** In-browser execution of user solutions is shielded from sensitive host environment properties (`window`, `document`, `fetch`, `localStorage`).
2. **Infinite Loop Protection:** Normalizes and parses AST tokens for runaway `while(true)` or `for(;;)` loops before evaluation.
3. **Payload Capping:** HTTP POST body parser enforces a strict `1mb` limit.
4. **API Route 404 Shielding:** Unrecognized `/api/*` endpoints return structured JSON 404s without leaking internal SPA index files.
5. **Session Revocation:** Magic link tokens are one-time use with 15-minute expirations and cryptographic token generation.

---

## 📄 License

Apache-2.0.
