import { GoogleGenAI } from '@google/genai';
import { DynamicExercise, ExerciseType, ExerciseDifficulty } from '../types/exercise';
import { getLessonByTopic } from './ingestion';
import { SEED_LESSONS } from '../data/seed_lessons';
import { QUESTION_BANK } from '../data/question_bank';
import { verifyExerciseIntegrity } from './exercise_verifier';

const EXERCISE_TYPES: ExerciseType[] = [
  'predict_output',
  'fill_blank',
  'find_fix_bug',
  'choose_expression',
  'explain_code',
  'arrange_order',
];

export async function generateExerciseForTopic(
  topicKey: string,
  learnerLevel: number = 1,
  recentExerciseIds: string[] = []
): Promise<DynamicExercise> {
  const lesson = getLessonByTopic(topicKey) || SEED_LESSONS[topicKey] || SEED_LESSONS['variables'];

  // 1. Determine target difficulty based on learner level
  let difficulty: ExerciseDifficulty = 'easy';
  const randDiff = Math.random();
  if (learnerLevel <= 1) {
    difficulty = randDiff < 0.75 ? 'easy' : 'medium';
  } else if (learnerLevel === 2) {
    difficulty = randDiff < 0.35 ? 'easy' : randDiff < 0.85 ? 'medium' : 'challenging';
  } else {
    difficulty = randDiff < 0.2 ? 'easy' : randDiff < 0.6 ? 'medium' : 'challenging';
  }

  // 2. Select exercise type
  const exerciseType = EXERCISE_TYPES[Math.floor(Math.random() * EXERCISE_TYPES.length)];

  // 3. Try Gemini generation if API key is available
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
    try {
      const generated = await attemptGeminiGeneration(lesson, topicKey, exerciseType, difficulty);
      if (generated) {
        const verifyRes = verifyExerciseIntegrity(generated);
        if (verifyRes.isValid) {
          return generated;
        } else {
          console.warn(`[ExerciseVerifier] AI exercise failed verification: ${verifyRes.reason}. Falling back to question bank.`);
        }
      }
    } catch (err: any) {
      console.warn(`[ExerciseGenerator] Gemini error: ${err.message || String(err)}. Falling back to question bank.`);
    }
  }

  // 4. Fallback to reviewed local question bank (filtering recently seen if possible)
  return getBankFallback(topicKey, recentExerciseIds, difficulty);
}

async function attemptGeminiGeneration(
  lesson: any,
  topicKey: string,
  exerciseType: ExerciseType,
  difficulty: ExerciseDifficulty
): Promise<DynamicExercise | null> {
  const ai = new GoogleGenAI({});

  const prompt = `
You are an expert interactive coding pedagogy engine for CodeQuest.
Generate a fresh, original JavaScript practice exercise for complete beginners.

TOPIC: ${lesson.title} (${topicKey})
LEARNING OBJECTIVE: ${lesson.learningObjective}
PREREQUISITES: ${lesson.prerequisiteConcepts.join(', ')}
EXERCISE TYPE: ${exerciseType}
DIFFICULTY LEVEL: ${difficulty}

DOMAIN AESTHETIC / SCENARIOS:
Use engaging, friendly, whimsical tech scenarios (Byte the Robot companion, cyber energy crystals, spaceship thrusters, gadget battery levels, potion mixing, secret launch codes).

RULES:
1. Exercise Type Specifics:
   - "predict_output": Code snippet with console.log(...). Learner predicts exact console output.
   - "fill_blank": Code snippet containing "___" as the placeholder. Single missing keyword or short expression.
   - "find_fix_bug": Code snippet with 1 intentional beginner syntax bug (e.g. quotes around variable, missing closing quote, semicolon inside string, reserved keyword).
   - "choose_expression": Which expression produces a specific target value.
   - "explain_code": Conceptual question explaining what a short snippet does or why a behavior occurs.
   - "arrange_order": 3-4 code statements with options, where correctAnswer is an array of option IDs in correct execution order.
2. Provide 3-4 options (id: opt-a, opt-b, opt-c, opt-d).
3. Set correctAnswer to the correct option ID (or array of option IDs for arrange_order).
4. Provide up to 3 progressive hints:
   - Hint 1: General conceptual clue.
   - Hint 2: Specific syntax pointer.
   - Hint 3: Almost reveals the answer without spoiling it.
5. Provide explanations for each option.
6. Return ONLY valid JSON:
{
  "title": string,
  "question": string,
  "codeSnippet": string or null,
  "options": [
    { "id": "opt-a", "text": string, "explanation": string },
    { "id": "opt-b", "text": string, "explanation": string },
    { "id": "opt-c", "text": string, "explanation": string }
  ],
  "correctAnswer": "opt-a",
  "explanations": {
    "correct": string,
    "opt-a": string,
    "opt-b": string
  },
  "hints": [
    "Hint 1...",
    "Hint 2...",
    "Hint 3..."
  ]
}
`;

  const response = await ai.models.generateContent({
    model: 'gemini-3.8-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
    },
  });

  const parsed = JSON.parse(response.text || '{}');
  if (!parsed.question || !parsed.correctAnswer) return null;

  return {
    id: `ex-ai-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    conceptId: topicKey,
    exerciseType,
    difficulty,
    title: parsed.title || `${lesson.title}: Challenge`,
    question: parsed.question,
    codeSnippet: parsed.codeSnippet || undefined,
    options: parsed.options || undefined,
    correctAnswer: parsed.correctAnswer,
    explanations: parsed.explanations || { correct: 'Great job!' },
    hints: parsed.hints || ['Think carefully about the syntax.'],
    sourceLessonId: lesson.id,
    sourceLessonTitle: lesson.title,
    sourceUrl: lesson.sourceReferences?.[0]?.url,
    createdAt: new Date().toISOString(),
    isAiGenerated: true,
  };
}

function getBankFallback(
  topicKey: string,
  recentExerciseIds: string[] = [],
  desiredDifficulty?: ExerciseDifficulty
): DynamicExercise {
  // Find candidates for this topic
  let candidates = QUESTION_BANK.filter((q) => q.conceptId === topicKey);

  if (candidates.length === 0) {
    candidates = QUESTION_BANK;
  }

  // Filter out recently seen exercises
  const unseen = candidates.filter((q) => !recentExerciseIds.includes(q.id));
  const pool = unseen.length > 0 ? unseen : candidates;

  // Filter by difficulty if matches exist
  if (desiredDifficulty) {
    const matchedDiff = pool.filter((q) => q.difficulty === desiredDifficulty);
    if (matchedDiff.length > 0) {
      return matchedDiff[Math.floor(Math.random() * matchedDiff.length)];
    }
  }

  return pool[Math.floor(Math.random() * pool.length)];
}
