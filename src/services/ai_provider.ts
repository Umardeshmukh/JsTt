import { GoogleGenAI } from '@google/genai';
import type { DynamicExercise, ExerciseType, ExerciseDifficulty } from './exercise_verifier.ts';
import type { LessonRecord } from '../types/lesson.ts';
import { checkAiQuotaAvailable, ZERO_DOLLAR_CONFIG } from '../config/cost_budget.ts';
import { QUESTION_BANK } from '../data/question_bank.ts';
import { verifyExerciseIntegrity } from './exercise_verifier.ts';

export interface IAiProvider {
  name: string;
  generateExercise(
    lesson: LessonRecord,
    exerciseType: ExerciseType,
    difficulty: ExerciseDifficulty
  ): Promise<DynamicExercise | null>;
}

export class GeminiAiProvider implements IAiProvider {
  name = 'GeminiAiProvider (Free Tier)';
  private client: GoogleGenAI | null = null;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
      this.client = new GoogleGenAI({});
    }
  }

  async generateExercise(
    lesson: LessonRecord,
    exerciseType: ExerciseType,
    difficulty: ExerciseDifficulty
  ): Promise<DynamicExercise | null> {
    const quotaCheck = checkAiQuotaAvailable();
    if (!quotaCheck.allowed || !this.client) {
      return null;
    }

    // Strictly enforce free tier model alias
    const modelName = 'gemini-3.8-flash';
    if (!ZERO_DOLLAR_CONFIG.allowedAiModels.includes(modelName)) {
      throw new Error(`Model ${modelName} is not permitted under the $0 budget policy.`);
    }

    try {
      const prompt = `
You are a curriculum engine for CodeQuest ($0 operating budget mode).
Generate a single beginner JavaScript challenge.
TOPIC: ${lesson.title} (${lesson.topicKey})
OBJECTIVE: ${lesson.learningObjective}
EXERCISE TYPE: ${exerciseType}
DIFFICULTY: ${difficulty}

RULES:
- Provide 3-4 options (opt-a, opt-b, opt-c, opt-d).
- Provide up to 3 progressive hints.
- Output strictly JSON:
{
  "title": string,
  "question": string,
  "codeSnippet": string or null,
  "options": [
    { "id": "opt-a", "text": string, "explanation": string },
    { "id": "opt-b", "text": string, "explanation": string }
  ],
  "correctAnswer": "opt-a",
  "explanations": {
    "correct": string,
    "opt-a": string,
    "opt-b": string
  },
  "hints": ["Hint 1", "Hint 2"]
}
`;

      const response = await this.client.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      if (!parsed.question || !parsed.correctAnswer) return null;

      const exercise: DynamicExercise = {
        id: `ai-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        conceptId: lesson.topicKey,
        exerciseType,
        difficulty,
        title: parsed.title || `${lesson.title}: Practice Challenge`,
        question: parsed.question,
        codeSnippet: parsed.codeSnippet || undefined,
        options: parsed.options || undefined,
        correctAnswer: parsed.correctAnswer,
        explanations: parsed.explanations || { correct: 'Great work!' },
        hints: parsed.hints || ['Think about the syntax fundamentals.'],
        sourceLessonId: lesson.id,
        sourceLessonTitle: lesson.title,
        sourceUrl: lesson.sourceReferences?.[0]?.url,
        createdAt: new Date().toISOString(),
        isAiGenerated: true,
      };

      const verification = verifyExerciseIntegrity(exercise);
      if (!verification.isValid) {
        return null;
      }

      return exercise;
    } catch {
      return null;
    }
  }
}

export class MockAiProvider implements IAiProvider {
  name = 'MockAiProvider (Local Offline Bank)';

  async generateExercise(
    lesson: LessonRecord,
    exerciseType: ExerciseType,
    difficulty: ExerciseDifficulty
  ): Promise<DynamicExercise | null> {
    const matched = QUESTION_BANK.filter(
      (q) => q.conceptId === lesson.topicKey && (q.exerciseType === exerciseType || q.difficulty === difficulty)
    );
    if (matched.length > 0) {
      return matched[Math.floor(Math.random() * matched.length)];
    }
    const topicPool = QUESTION_BANK.filter((q) => q.conceptId === lesson.topicKey);
    if (topicPool.length > 0) {
      return topicPool[Math.floor(Math.random() * topicPool.length)];
    }
    return QUESTION_BANK[Math.floor(Math.random() * QUESTION_BANK.length)];
  }
}

// Factory returning the appropriate provider adhering to $0 budget
export function getAiProvider(): IAiProvider {
  if (ZERO_DOLLAR_CONFIG.aiEnabled) {
    return new GeminiAiProvider();
  }
  return new MockAiProvider();
}
