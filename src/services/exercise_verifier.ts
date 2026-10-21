import { executeCode } from '../game/validator.ts';

export type ExerciseDifficulty = 'easy' | 'medium' | 'challenging';
export type ExerciseType = 'predict_output' | 'fill_blank' | 'find_fix_bug' | 'choose_expression' | 'explain_code' | 'arrange_order';

export interface ExerciseOption {
  id: string;
  text: string;
  explanation?: string;
}

export interface DynamicExercise {
  id: string;
  conceptId: string;
  exerciseType: ExerciseType;
  difficulty: ExerciseDifficulty;
  title: string;
  question: string;
  codeSnippet?: string;
  options?: ExerciseOption[];
  correctAnswer: string | string[];
  acceptableAnswers?: string[];
  explanations: Record<string, string>;
  hints: string[];
  prerequisiteConcept?: string;
  sourceLessonId: string;
  sourceLessonTitle: string;
  sourceUrl?: string;
  createdAt: string;
  isAiGenerated?: boolean;
}

export const DIFFICULTY_XP_MAP: Record<ExerciseDifficulty, number> = {
  easy: 25,
  medium: 35,
  challenging: 50,
};

/**
 * Normalizes code or text for whitespace-tolerant, robust comparison
 */
export function normalizeAnswer(ans: string): string {
  if (!ans) return '';
  return ans
    .trim()
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/;\s*$/, ''); // normalize trailing semicolon
}

/**
 * Validates a user's answer against the exercise answer key in trusted application logic.
 */
export function validateExerciseAnswer(
  exercise: DynamicExercise,
  userAnswer: string | string[]
): { isCorrect: boolean; feedback: string; xp: number } {
  const xp = DIFFICULTY_XP_MAP[exercise.difficulty] || 25;

  if (exercise.exerciseType === 'arrange_order') {
    if (!Array.isArray(userAnswer) || !Array.isArray(exercise.correctAnswer)) {
      return { isCorrect: false, feedback: 'Please arrange all code blocks in order.', xp: 0 };
    }
    const isMatch =
      userAnswer.length === exercise.correctAnswer.length &&
      userAnswer.every((val, idx) => val === (exercise.correctAnswer as string[])[idx]);

    const feedback = isMatch
      ? exercise.explanations['correct'] || 'Spot on! The code execution order is flawless.'
      : 'Not quite in the right order yet. Pay close attention to variable declarations coming before their usage!';

    return { isCorrect: isMatch, feedback, xp: isMatch ? xp : 0 };
  }

  // Handle single string answers (multiple choice, predict output, fill in blank, etc.)
  const normalizedUser = typeof userAnswer === 'string' ? normalizeAnswer(userAnswer) : '';
  const expectedKey = typeof exercise.correctAnswer === 'string' ? exercise.correctAnswer : '';
  const normalizedExpected = normalizeAnswer(expectedKey);

  // 1. Direct match with primary answer
  let isCorrect = normalizedUser.toLowerCase() === normalizedExpected.toLowerCase();

  // 2. Check acceptable alternatives if defined
  if (!isCorrect && exercise.acceptableAnswers && exercise.acceptableAnswers.length > 0) {
    isCorrect = exercise.acceptableAnswers.some(
      (alt) => normalizeAnswer(alt).toLowerCase() === normalizedUser.toLowerCase()
    );
  }

  // 3. Check option ID matches (e.g. user selected option 'opt-b')
  if (!isCorrect && exercise.options) {
    const matchedOption = exercise.options.find(
      (o) => o.id === userAnswer || normalizeAnswer(o.text).toLowerCase() === normalizedUser.toLowerCase()
    );
    if (matchedOption && matchedOption.id === expectedKey) {
      isCorrect = true;
    }
  }

  // Determine feedback explanation
  let feedback = '';
  if (isCorrect) {
    feedback =
      exercise.explanations[expectedKey] ||
      exercise.explanations['correct'] ||
      'Excellent work! Your answer is 100% correct.';
  } else {
    feedback =
      (typeof userAnswer === 'string' && exercise.explanations[userAnswer]) ||
      exercise.explanations['incorrect'] ||
      'That\'s not quite right. Review the code or consult a hint!';
  }

  return {
    isCorrect,
    feedback,
    xp: isCorrect ? xp : 0,
  };
}

/**
 * Independently verifies a candidate exercise before it can be served to learners.
 * Returns true if valid, or false with diagnostic reason.
 */
export function verifyExerciseIntegrity(exercise: DynamicExercise): { isValid: boolean; reason?: string } {
  if (!exercise.id || !exercise.question || !exercise.conceptId) {
    return { isValid: false, reason: 'Missing mandatory fields (id, question, conceptId).' };
  }

  if (!exercise.hints || exercise.hints.length === 0) {
    return { isValid: false, reason: 'Exercise must contain at least 1 hint.' };
  }

  // Multiple choice validation
  if (
    exercise.exerciseType === 'choose_expression' ||
    exercise.exerciseType === 'explain_code' ||
    exercise.exerciseType === 'find_fix_bug'
  ) {
    if (!exercise.options || exercise.options.length < 2) {
      return { isValid: false, reason: 'Multiple choice exercises require at least 2 options.' };
    }
    const hasCorrectOption = exercise.options.some((o) => o.id === exercise.correctAnswer);
    if (!hasCorrectOption) {
      return { isValid: false, reason: `correctAnswer '${exercise.correctAnswer}' not found in options.` };
    }
  }

  // Predict output execution verification
  if (exercise.exerciseType === 'predict_output' && exercise.codeSnippet) {
    const exec = executeCode(exercise.codeSnippet);
    if (exec.error) {
      return { isValid: false, reason: `Predict output code has a syntax or runtime error: ${exec.error}` };
    }
    const actualLog = exec.logs.join(' ').trim();
    const expected = typeof exercise.correctAnswer === 'string' ? exercise.correctAnswer.trim() : '';

    // If options exist, check that one of the options matches the actual logged output
    if (exercise.options && exercise.options.length > 0) {
      const correctOpt = exercise.options.find((o) => o.id === exercise.correctAnswer);
      if (!correctOpt) {
        return { isValid: false, reason: 'Option ID does not match correctAnswer.' };
      }
      if (normalizeAnswer(correctOpt.text) !== normalizeAnswer(actualLog)) {
        return {
          isValid: false,
          reason: `Code actual log is "${actualLog}", but correctAnswer option is "${correctOpt.text}".`,
        };
      }
    } else {
      if (normalizeAnswer(expected) !== normalizeAnswer(actualLog)) {
        return {
          isValid: false,
          reason: `Code actual log is "${actualLog}", but expected answer is "${expected}".`,
        };
      }
    }
  }

  // Fill in blank verification
  if (exercise.exerciseType === 'fill_blank' && exercise.codeSnippet) {
    if (!exercise.codeSnippet.includes('___')) {
      return { isValid: false, reason: 'Fill in blank snippet must contain the blank placeholder "___".' };
    }
    const fillValue = typeof exercise.correctAnswer === 'string' ? exercise.correctAnswer : '';
    const completedCode = exercise.codeSnippet.replace('___', fillValue);
    const exec = executeCode(completedCode);
    if (exec.error) {
      return { isValid: false, reason: `Filled code produces syntax error: ${exec.error}` };
    }
  }

  return { isValid: true };
}
