import { Achievement } from '../types';

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-spark',
    title: 'First Spark',
    description: 'Executed your very first JavaScript code line.',
    icon: '✨',
    isUnlocked: true,
    xpBonus: 20,
    unlockedAt: 'Today',
  },
  {
    id: 'variable-master',
    title: 'Memory Master',
    description: 'Stored and retrieved values using the let keyword.',
    icon: '📦',
    isUnlocked: false,
    xpBonus: 30,
  },
  {
    id: 'math-wizard',
    title: 'Number Spark',
    description: 'Calculated expressions using math operators.',
    icon: '⚡',
    isUnlocked: false,
    xpBonus: 30,
  },
  {
    id: 'world-1-boss',
    title: 'World 1 Champion',
    description: 'Defeated the World 1 Boss and booted Byte\'s core!',
    icon: '👑',
    isUnlocked: false,
    xpBonus: 75,
  },
  {
    id: 'daily-dynamo',
    title: 'Daily Dynamo',
    description: 'Accomplished your daily mission.',
    icon: '🎯',
    isUnlocked: false,
    xpBonus: 25,
  },
  {
    id: 'streak-pioneer',
    title: 'Streak Pioneer',
    description: 'Started a learning streak on CodeQuest.',
    icon: '🔥',
    isUnlocked: true,
    xpBonus: 15,
    unlockedAt: 'Today',
  },
];
