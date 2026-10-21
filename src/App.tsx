/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { UserProgress, Quest, Achievement, DailyMission } from './types';
import { WORLDS } from './data/curriculum';
import { INITIAL_ACHIEVEMENTS } from './data/achievements';
import { calculateLevel, didLevelUp } from './game/scoring';
import { Navbar } from './components/Navbar';
import { GreetingBanner } from './components/GreetingBanner';
import { ContinueLearningCard } from './components/ContinueLearningCard';
import { DailyMissionCard } from './components/DailyMissionCard';
import { WorldMap } from './components/WorldMap';
import { AchievementsSection } from './components/AchievementsSection';
import { CodexView } from './components/CodexView';
import { QuestInteractiveSandbox } from './components/QuestInteractiveSandbox';
import { QuickRefresherModal } from './components/QuickRefresherModal';
import { playLevelUpFanfare, playSuccessChime } from './utils/sound';
import { Sparkles, X } from 'lucide-react';

const STORAGE_KEY = 'codequest_user_progress_v1';

const DEFAULT_MISSION: DailyMission = {
  id: 'daily-spark-1',
  title: 'Daily Spark: Complete 1 Challenge',
  description: 'Solve any challenge in World 1 to maintain your momentum.',
  targetCount: 1,
  currentCount: 0,
  xpReward: 25,
  isCompleted: false,
  claimed: false,
};

const DEFAULT_PROGRESS: UserProgress = {
  xp: 60,
  level: 1,
  streakDays: 1,
  lastActiveDate: new Date().toISOString().split('T')[0],
  completedQuestIds: ['w1-q1'],
  activeQuestId: 'w1-q2',
  dailyMission: DEFAULT_MISSION,
  soundEnabled: true,
  unlockedAchievementIds: ['first-spark', 'streak-pioneer'],
};

export default function App() {
  const [progress, setProgress] = useState<UserProgress>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // LocalStorage access fallback
    }
    return DEFAULT_PROGRESS;
  });

  const [currentView, setCurrentView] = useState<'dashboard' | 'map' | 'achievements' | 'codex'>('dashboard');
  const [activePlayingQuest, setActivePlayingQuest] = useState<Quest | null>(null);
  const [reviewingQuest, setReviewingQuest] = useState<Quest | null>(null);
  const [showLevelUpModal, setShowLevelUpModal] = useState<boolean>(false);
  const [showResetModal, setShowResetModal] = useState<boolean>(false);

  // Save to localStorage on progress changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch {
      // Storage error
    }
  }, [progress]);

  // Support ?autostart=1 query parameter to jump straight to active quest (ultra mode testability)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('autostart') === '1') {
      const world1 = WORLDS[0];
      const targetQuest = world1.quests.find((q) => q.id === progress.activeQuestId) || world1.quests[0];
      setActivePlayingQuest(targetQuest);
    }
  }, []);

  // Track consecutive active days for daily streak counter
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setProgress((prev) => {
      if (!prev.lastActiveDate) {
        return { ...prev, lastActiveDate: today, streakDays: 1 };
      }
      if (prev.lastActiveDate === today) {
        return prev;
      }
      const last = new Date(prev.lastActiveDate);
      const curr = new Date(today);
      const diffTime = curr.getTime() - last.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        return {
          ...prev,
          lastActiveDate: today,
          streakDays: prev.streakDays + 1,
        };
      } else if (diffDays > 1) {
        return {
          ...prev,
          lastActiveDate: today,
          streakDays: 1,
        };
      }
      return prev;
    });
  }, []);

  const levelInfo = calculateLevel(progress.xp);

  // Build current achievements list with dynamic unlock state
  const achievements: Achievement[] = INITIAL_ACHIEVEMENTS.map((ach) => ({
    ...ach,
    isUnlocked: progress.unlockedAchievementIds.includes(ach.id),
  }));

  // Identify continue learning quest
  const world1 = WORLDS[0];
  const activeQuest = world1.quests.find((q) => q.id === progress.activeQuestId) 
    || world1.quests.find((q) => !progress.completedQuestIds.includes(q.id))
    || world1.quests[world1.quests.length - 1];

  const isCurrentQuestCompleted = progress.completedQuestIds.includes(activeQuest?.id || '');

  const handleStartQuest = (quest: Quest) => {
    setActivePlayingQuest(quest);
  };

  const handleCompleteQuest = (questId: string, xpReward: number) => {
    setProgress((prev) => {
      const alreadyCompleted = prev.completedQuestIds.includes(questId);
      const newXp = alreadyCompleted ? prev.xp : prev.xp + xpReward;
      const leveledUp = didLevelUp(prev.xp, newXp);

      const newCompletedQuestIds = alreadyCompleted
        ? prev.completedQuestIds
        : [...prev.completedQuestIds, questId];

      // Determine next active quest in world 1
      const currentIndex = world1.quests.findIndex((q) => q.id === questId);
      const nextQuest = world1.quests[currentIndex + 1];
      const nextActiveId = nextQuest ? nextQuest.id : questId;

      // Update daily mission
      const updatedMission: DailyMission = {
        ...prev.dailyMission,
        currentCount: Math.min(prev.dailyMission.targetCount, prev.dailyMission.currentCount + 1),
        isCompleted: true,
      };

      // Check achievement unlocks
      const newAchievements = [...prev.unlockedAchievementIds];
      if (questId === 'w1-q1' && !newAchievements.includes('first-spark')) {
        newAchievements.push('first-spark');
      }
      if (questId === 'w1-q2' && !newAchievements.includes('variable-master')) {
        newAchievements.push('variable-master');
      }
      if (questId === 'w1-q3' && !newAchievements.includes('math-wizard')) {
        newAchievements.push('math-wizard');
      }
      if (
        world1.quests.every((q) => newCompletedQuestIds.includes(q.id)) &&
        !newAchievements.includes('world-1-boss')
      ) {
        newAchievements.push('world-1-boss');
      }

      if (leveledUp) {
        setTimeout(() => {
          playLevelUpFanfare(prev.soundEnabled);
          setShowLevelUpModal(true);
        }, 600);
      }

      return {
        ...prev,
        xp: newXp,
        level: calculateLevel(newXp).level,
        completedQuestIds: newCompletedQuestIds,
        activeQuestId: nextActiveId,
        dailyMission: updatedMission,
        unlockedAchievementIds: newAchievements,
      };
    });
  };

  const handleNextQuest = () => {
    if (!activePlayingQuest) return;
    const currentIndex = world1.quests.findIndex((q) => q.id === activePlayingQuest.id);
    const nextQuest = world1.quests[currentIndex + 1];
    if (nextQuest) {
      setActivePlayingQuest(nextQuest);
    } else {
      setActivePlayingQuest(null);
      setCurrentView('dashboard');
    }
  };

  const handleClaimDailyMission = () => {
    if (!progress.dailyMission.isCompleted || progress.dailyMission.claimed) return;

    setProgress((prev) => {
      const newXp = prev.xp + prev.dailyMission.xpReward;
      const leveledUp = didLevelUp(prev.xp, newXp);

      const newAchievements = [...prev.unlockedAchievementIds];
      if (!newAchievements.includes('daily-dynamo')) {
        newAchievements.push('daily-dynamo');
      }

      if (leveledUp) {
        setTimeout(() => {
          playLevelUpFanfare(prev.soundEnabled);
          setShowLevelUpModal(true);
        }, 400);
      }

      return {
        ...prev,
        xp: newXp,
        level: calculateLevel(newXp).level,
        dailyMission: {
          ...prev.dailyMission,
          claimed: true,
        },
        unlockedAchievementIds: newAchievements,
      };
    });
  };

  const handleToggleSound = () => {
    setProgress((prev) => ({
      ...prev,
      soundEnabled: !prev.soundEnabled,
    }));
  };

  const handleResetProgress = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Storage error
    }
    setProgress(DEFAULT_PROGRESS);
    setShowResetModal(false);
    setActivePlayingQuest(null);
    setCurrentView('dashboard');
  };

  // If user is playing an interactive quest, render the Sandbox full view
  if (activePlayingQuest) {
    const currentIndex = world1.quests.findIndex((q) => q.id === activePlayingQuest.id);
    const hasNextQuest = currentIndex < world1.quests.length - 1;

    return (
      <QuestInteractiveSandbox
        quest={activePlayingQuest}
        onBack={() => setActivePlayingQuest(null)}
        onCompleteQuest={handleCompleteQuest}
        onNextQuest={handleNextQuest}
        hasNextQuest={hasNextQuest}
        soundEnabled={progress.soundEnabled}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F19] bg-game-grid text-slate-100 flex flex-col selection:bg-violet-600 selection:text-white">
      {/* Top Bar Contract compliant navigation */}
      <Navbar
        currentView={currentView}
        onNavigate={setCurrentView}
        levelInfo={levelInfo}
        soundEnabled={progress.soundEnabled}
        onToggleSound={handleToggleSound}
        onResetProgress={() => setShowResetModal(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {currentView === 'dashboard' && (
          <>
            {/* 1. Greeting Banner with Mascot Byte & XP status */}
            <GreetingBanner levelInfo={levelInfo} streakDays={progress.streakDays} />

            {/* 2. Primary Action Row: Continue Learning Card + Daily Mission Card */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              <div className="lg:col-span-8 flex flex-col">
                <ContinueLearningCard
                  quest={activeQuest}
                  worldTitle="World 1: JavaScript Basics"
                  isCompleted={isCurrentQuestCompleted}
                  onStartQuest={handleStartQuest}
                  soundEnabled={progress.soundEnabled}
                />
              </div>
              <div className="lg:col-span-4 flex flex-col">
                <DailyMissionCard
                  mission={progress.dailyMission}
                  onClaimReward={handleClaimDailyMission}
                  soundEnabled={progress.soundEnabled}
                />
              </div>
            </div>

            {/* 3. Visual Map of Learning Worlds */}
            <WorldMap
              worlds={WORLDS}
              completedQuestIds={progress.completedQuestIds}
              activeQuestId={progress.activeQuestId}
              onSelectQuest={handleStartQuest}
              onReviewQuest={setReviewingQuest}
              soundEnabled={progress.soundEnabled}
            />

            {/* 4. Compact Achievements Section */}
            <AchievementsSection achievements={achievements} />
          </>
        )}

        {currentView === 'map' && (
          <WorldMap
            worlds={WORLDS}
            completedQuestIds={progress.completedQuestIds}
            activeQuestId={progress.activeQuestId}
            onSelectQuest={handleStartQuest}
            onReviewQuest={setReviewingQuest}
            soundEnabled={progress.soundEnabled}
          />
        )}

        {currentView === 'codex' && <CodexView />}

        {currentView === 'achievements' && (
          <AchievementsSection achievements={achievements} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1E293B] bg-[#090D17] py-6 px-4 sm:px-6 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>CodeQuest · One concept, one tiny lesson, one satisfying win.</p>
          <div className="flex items-center gap-4 text-slate-400">
            <span>JavaScript Basics</span>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => setShowResetModal(true)}
              className="hover:text-slate-300 transition-colors focus:outline-none"
            >
              Reset Progress
            </button>
          </div>
        </div>
      </footer>

      {/* Quick Refresher Cheat-Sheet Modal */}
      {reviewingQuest && (
        <QuickRefresherModal
          quest={reviewingQuest}
          onClose={() => setReviewingQuest(null)}
          onPracticeInSandbox={(q) => {
            setReviewingQuest(null);
            handleStartQuest(q);
          }}
          soundEnabled={progress.soundEnabled}
        />
      )}

      {/* Level Up Fanfare Modal */}
      {showLevelUpModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="levelup-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        >
          <div className="relative w-full max-w-sm rounded-2xl bg-gradient-to-br from-[#1C233C] via-[#151C30] to-[#0F1424] border-2 border-amber-400/60 p-6 text-center shadow-2xl space-y-4">
            <button
              onClick={() => setShowLevelUpModal(false)}
              className="absolute top-3 right-3 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Close level up dialog"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-3xl shadow-lg shadow-amber-950/50">
              {levelInfo.badge}
            </div>

            <div>
              <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
                LEVEL UP REACHED!
              </span>
              <h3 id="levelup-title" className="text-2xl font-black text-white mt-1">
                Level {levelInfo.level}
              </h3>
              <p className="text-sm font-semibold text-violet-300">
                {levelInfo.title}
              </p>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Your coding prowess expands! Keep mastering challenges to unlock more power.
              </p>
            </div>

            <button
              onClick={() => setShowLevelUpModal(false)}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold text-sm shadow-md transition-all active:scale-95"
            >
              Claim Victory
            </button>
          </div>
        </div>
      )}

      {/* Reset Progress Confirmation Dialog */}
      {showResetModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="reset-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        >
          <div className="relative w-full max-w-sm rounded-2xl bg-[#121826] border border-[#2B395E] p-6 text-center shadow-2xl space-y-4">
            <h3 id="reset-title" className="text-lg font-bold text-white">
              Reset Quest Progress?
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              This will return your quest history, XP, and daily missions back to the starting state.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShowResetModal(false)}
                className="flex-1 py-2 px-4 rounded-xl bg-[#1C253D] hover:bg-[#253252] text-slate-300 text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleResetProgress}
                className="flex-1 py-2 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition-colors"
              >
                Reset Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
