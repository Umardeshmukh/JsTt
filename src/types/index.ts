export interface Quest {
  id: string;
  worldId: number;
  number: number;
  title: string;
  subtitle: string;
  conceptHeadline: string;
  xpReward: number;
  conceptExplanation: {
    summary: string;
    bulletPoints: string[];
    syntaxSnippet: string;
  };
  mascotTip: string;
  starterCode: string;
  solutionCode?: string;
  solutionHint: string;
  starterChips?: string[]; // Quick snippet insertion buttons
  expectedOutcomeDescription: string;
  validationRules: {
    type: 'console_output' | 'variable_and_output' | 'expression_result';
    expectedLogPatterns?: string[];
    forbiddenPatterns?: string[];
    requiredKeywords?: string[];
    expectedVariables?: Record<string, any>;
  };
  sourceName?: string;
  sourceUrl?: string;
  sourceAttribution?: string;
}

export interface World {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  isAvailable: boolean;
  themeColor: string;
  iconName: string;
  totalXp: number;
  quests: Quest[];
}

export interface DailyMission {
  id: string;
  title: string;
  description: string;
  targetCount: number;
  currentCount: number;
  xpReward: number;
  isCompleted: boolean;
  claimed: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  isUnlocked: boolean;
  xpBonus: number;
  unlockedAt?: string;
}

export interface UserProgress {
  xp: number;
  level: number;
  streakDays: number;
  lastActiveDate: string;
  completedQuestIds: string[];
  activeQuestId: string;
  dailyMission: DailyMission;
  soundEnabled: boolean;
  unlockedAchievementIds: string[];
}
