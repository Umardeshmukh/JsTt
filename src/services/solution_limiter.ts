/**
 * Solution Limiter Service
 * Enforces:
 * 1. User must make at least one attempt before viewing the solution.
 * 2. Rate limited to at most 3 solution reveals per 1 rolling hour.
 * 3. Does not charge duplicate quota for already-revealed solutions in the current window.
 */

export const SOLUTION_STORAGE_KEY = 'codequest_solution_views_v1';
export const HOURLY_SOLUTION_LIMIT = 3;
export const SOLUTION_WINDOW_MS = 60 * 60 * 1000; // 1 hour

export interface SolutionViewRecord {
  exerciseId: string;
  timestamp: number;
}

export interface SolutionStatus {
  hasAttempted: boolean;
  canView: boolean;
  isAlreadyRevealed: boolean;
  remainingViews: number;
  maxViews: number;
  minutesUntilReset: number;
  blockedReason?: 'not_attempted' | 'hourly_limit_reached';
}

export function getStoredViews(customNow?: number): SolutionViewRecord[] {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(SOLUTION_STORAGE_KEY) : null;
    if (!raw) return [];
    const list: SolutionViewRecord[] = JSON.parse(raw);
    const now = customNow ?? Date.now();
    // Filter out records older than 1 hour
    return Array.isArray(list) ? list.filter((r) => now - r.timestamp < SOLUTION_WINDOW_MS) : [];
  } catch {
    return [];
  }
}

export function saveViews(views: SolutionViewRecord[]): void {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(SOLUTION_STORAGE_KEY, JSON.stringify(views));
    }
  } catch {}
}

export function getSolutionStatus(
  exerciseId: string,
  hasAttempted: boolean,
  customNow?: number
): SolutionStatus {
  const now = customNow ?? Date.now();
  const activeViews = getStoredViews(now);
  const isAlreadyRevealed = activeViews.some((v) => v.exerciseId === exerciseId);

  // Count unique exercises viewed in the current window
  const uniqueExerciseIds = new Set(activeViews.map((v) => v.exerciseId));
  const viewsUsed = uniqueExerciseIds.size;
  const remainingViews = Math.max(0, HOURLY_SOLUTION_LIMIT - viewsUsed);

  // Calculate minutes until the earliest view expires
  let minutesUntilReset = 0;
  if (activeViews.length > 0) {
    const oldest = Math.min(...activeViews.map((v) => v.timestamp));
    minutesUntilReset = Math.max(1, Math.ceil((oldest + SOLUTION_WINDOW_MS - now) / 60000));
  }

  // If already revealed previously in this window, learner can view freely without deducting quota
  if (isAlreadyRevealed) {
    return {
      hasAttempted,
      canView: true,
      isAlreadyRevealed: true,
      remainingViews,
      maxViews: HOURLY_SOLUTION_LIMIT,
      minutesUntilReset,
    };
  }

  // Learner must attempt first
  if (!hasAttempted) {
    return {
      hasAttempted: false,
      canView: false,
      isAlreadyRevealed: false,
      remainingViews,
      maxViews: HOURLY_SOLUTION_LIMIT,
      minutesUntilReset,
      blockedReason: 'not_attempted',
    };
  }

  // Check hourly quota
  if (remainingViews <= 0) {
    return {
      hasAttempted: true,
      canView: false,
      isAlreadyRevealed: false,
      remainingViews: 0,
      maxViews: HOURLY_SOLUTION_LIMIT,
      minutesUntilReset,
      blockedReason: 'hourly_limit_reached',
    };
  }

  return {
    hasAttempted: true,
    canView: true,
    isAlreadyRevealed: false,
    remainingViews,
    maxViews: HOURLY_SOLUTION_LIMIT,
    minutesUntilReset,
  };
}

export function requestRevealSolution(
  exerciseId: string,
  hasAttempted: boolean,
  customNow?: number
): {
  success: boolean;
  status: SolutionStatus;
  error?: string;
} {
  const now = customNow ?? Date.now();
  const currentStatus = getSolutionStatus(exerciseId, hasAttempted, now);

  if (!currentStatus.canView) {
    if (currentStatus.blockedReason === 'not_attempted') {
      return {
        success: false,
        status: currentStatus,
        error: 'Please make at least one attempt by running your code or submitting an answer before viewing the solution.',
      };
    }
    return {
      success: false,
      status: currentStatus,
      error: `Hourly limit reached: You can view at most ${HOURLY_SOLUTION_LIMIT} solutions per hour. You can view another in ${currentStatus.minutesUntilReset} minute(s). Keep trying on your own!`,
    };
  }

  // Record view if not already recorded
  if (!currentStatus.isAlreadyRevealed) {
    const activeViews = getStoredViews(now);
    activeViews.push({ exerciseId, timestamp: now });
    saveViews(activeViews);
  }

  return {
    success: true,
    status: getSolutionStatus(exerciseId, hasAttempted, now),
  };
}
