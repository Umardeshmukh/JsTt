export interface LevelInfo {
  level: number;
  title: string;
  badge: string;
  minXp: number;
  maxXp: number;
  currentLevelXp: number;
  neededForNext: number;
  progressPercent: number;
}

export const LEVEL_TIERS = [
  { level: 1, title: 'Novice Coder', badge: '🌱', minXp: 0, maxXp: 200 },
  { level: 2, title: 'Script Apprentice', badge: '⚡', minXp: 200, maxXp: 500 },
  { level: 3, title: 'Logic Explorer', badge: '🔮', minXp: 500, maxXp: 900 },
  { level: 4, title: 'Algorithm Adept', badge: '🚀', minXp: 900, maxXp: 1400 },
  { level: 5, title: 'Code Architect', badge: '👑', minXp: 1400, maxXp: 2000 },
];

export function calculateLevel(xp: number): LevelInfo {
  const safeXp = Math.max(0, xp);

  for (let i = LEVEL_TIERS.length - 1; i >= 0; i--) {
    const tier = LEVEL_TIERS[i];
    if (safeXp >= tier.minXp) {
      const isMaxTier = i === LEVEL_TIERS.length - 1;
      const span = tier.maxXp - tier.minXp;
      const progressInTier = Math.min(safeXp - tier.minXp, span);
      const progressPercent = isMaxTier && safeXp >= tier.maxXp 
        ? 100 
        : Math.min(100, Math.floor((progressInTier / span) * 100));
      const neededForNext = Math.max(0, tier.maxXp - safeXp);

      return {
        level: tier.level,
        title: tier.title,
        badge: tier.badge,
        minXp: tier.minXp,
        maxXp: tier.maxXp,
        currentLevelXp: safeXp,
        neededForNext,
        progressPercent,
      };
    }
  }

  // Fallback to level 1
  return {
    level: 1,
    title: LEVEL_TIERS[0].title,
    badge: LEVEL_TIERS[0].badge,
    minXp: 0,
    maxXp: 200,
    currentLevelXp: safeXp,
    neededForNext: 200 - safeXp,
    progressPercent: Math.floor((safeXp / 200) * 100),
  };
}

export function didLevelUp(oldXp: number, newXp: number): boolean {
  const oldLevel = calculateLevel(oldXp).level;
  const newLevel = calculateLevel(newXp).level;
  return newLevel > oldLevel;
}
