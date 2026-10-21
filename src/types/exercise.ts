export type ExerciseType =
  | 'predict_output'
  | 'fill_blank'
  | 'find_fix_bug'
  | 'choose_expression'
  | 'explain_code'
  | 'arrange_order';

export type ExerciseDifficulty = 'easy' | 'medium' | 'challenging';

export interface ExerciseOption {
  id: string;
  text: string;
  explanation?: string;
}

export interface DynamicExercise {
  id: string;
  conceptId: string; // e.g. 'variables', 'strings', 'numbers', 'operators', 'template-literals'
  exerciseType: ExerciseType;
  difficulty: ExerciseDifficulty;
  title: string;
  question: string;
  codeSnippet?: string;
  options?: ExerciseOption[];
  correctAnswer: string | string[]; // Option ID, text answer, or array of line IDs for arrange_order
  acceptableAnswers?: string[]; // Alternative variations for freeform inputs
  explanations: Record<string, string>; // Explanations for options or overall solution
  hints: string[]; // Up to 3 progressive hints
  prerequisiteConcept?: string;
  sourceLessonId: string;
  sourceLessonTitle: string;
  sourceUrl?: string;
  createdAt: string;
  isAiGenerated?: boolean;
}

export interface ExerciseValidationRequest {
  exerciseId: string;
  userAnswer: string | string[];
}

export interface ExerciseValidationResponse {
  isCorrect: boolean;
  message: string;
  feedbackExplanation: string;
  xpAwarded: number;
}
