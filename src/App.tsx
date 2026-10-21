/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { UserProgress, Quest } from './types';
import { DynamicExercise } from './types/exercise';
import { WORLDS } from './data/curriculum';
import { QUESTION_BANK } from './data/question_bank';
import { calculateLevel } from './game/scoring';
import { validateSolution } from './game/validator';
import { Navbar } from './components/Navbar';
import { LearnView } from './components/LearnView';
import { ProgressView } from './components/ProgressView';
import { ExerciseScreen, ExerciseItem } from './components/ExerciseScreen';
import { AuthUser } from './services/auth_service';
import { playButtonPop } from './utils/sound';

const STORAGE_KEY = 'codequest_user_progress_v1';
const AUTH_TOKEN_KEY = 'codequest_auth_session_token';

const DEFAULT_PROGRESS: UserProgress = {
  xp: 30,
  level: 1,
  streakDays: 1,
  lastActiveDate: new Date().toISOString().split('T')[0],
  completedQuestIds: ['w1-q1'],
  activeQuestId: 'w1-q2',
  dailyMission: {
    id: 'm1',
    title: 'Daily lesson',
    description: 'Complete 1 challenge',
    targetCount: 1,
    currentCount: 1,
    xpReward: 25,
    isCompleted: true,
    claimed: true,
  },
  soundEnabled: true,
  unlockedAchievementIds: [],
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

  const [currentView, setCurrentView] = useState<'learn' | 'progress'>('learn');
  const [activeExerciseItem, setActiveExerciseItem] = useState<ExerciseItem | null>(null);
  const [showResetModal, setShowResetModal] = useState<boolean>(false);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);

  // 1. Sync session token with server on startup
  useEffect(() => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (token) {
      fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.authenticated && data.user) {
            setAuthUser(data.user);
          }
        })
        .catch(() => {
          // offline
        });
    }

    // Check URL parameters for magic token verification
    const params = new URLSearchParams(window.location.search);
    const verifyToken = params.get('verifyToken');
    if (verifyToken) {
      fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: verifyToken }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.sessionToken && data.user) {
            localStorage.setItem(AUTH_TOKEN_KEY, data.sessionToken);
            setAuthUser(data.user);
            // Clean URL query
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        })
        .catch(() => {});
    }

    // Support ?autostart=1 query parameter to jump straight to active exercise
    if (params.get('autostart') === '1') {
      const world1 = WORLDS[0];
      const targetQuest =
        world1.quests.find((q) => q.id === progress.activeQuestId) ||
        world1.quests.find((q) => !progress.completedQuestIds.includes(q.id)) ||
        world1.quests[0];
      setActiveExerciseItem({ type: 'quest', data: targetQuest });
    }
  }, []);

  // 2. Persist progress in localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch {
      // Storage error
    }
  }, [progress]);

  const levelInfo = calculateLevel(progress.xp);

  // Identify current learning quest
  const world1 = WORLDS[0];
  const activeQuest =
    world1.quests.find((q) => q.id === progress.activeQuestId) ||
    world1.quests.find((q) => !progress.completedQuestIds.includes(q.id)) ||
    world1.quests[world1.quests.length - 1];

  // Auth: Send magic link
  const handleSendMagicLink = async (email: string) => {
    const res = await fetch('/api/auth/magic-link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    return res.json();
  };

  // Auth: Logout
  const handleLogout = async () => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (token) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch {}
      localStorage.removeItem(AUTH_TOKEN_KEY);
    }
    setAuthUser(null);
  };

  // Start a code quest
  const handleStartQuest = (quest: Quest) => {
    setActiveExerciseItem({ type: 'quest', data: quest });
  };

  // Start a dynamic exercise
  const handleStartDynamic = (exercise: DynamicExercise) => {
    setActiveExerciseItem({ type: 'dynamic', data: exercise });
  };

  // Check code quest solution with authoritative server XP
  const handleCheckQuest = async (code: string) => {
    if (!activeExerciseItem || activeExerciseItem.type !== 'quest') {
      return { success: false, logs: [], feedback: 'No active quest.', awardedXp: 0 };
    }

    const quest = activeExerciseItem.data;
    const clientValidation = validateSolution(code, quest.validationRules);

    let serverAwardedXp = 0;
    if (clientValidation.success) {
      try {
        const token = localStorage.getItem(AUTH_TOKEN_KEY);
        const res = await fetch('/api/user/progress/complete-quest', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            questId: quest.id,
            xpReward: quest.xpReward,
            completedQuestIds: progress.completedQuestIds,
          }),
        });
        const data = await res.json();
        serverAwardedXp = data.awardedXp !== undefined ? data.awardedXp : (progress.completedQuestIds.includes(quest.id) ? 0 : quest.xpReward);
      } catch {
        // Offline server fallback: award XP idempotently
        serverAwardedXp = progress.completedQuestIds.includes(quest.id) ? 0 : quest.xpReward;
      }

      // Update progress state with authoritative XP
      setProgress((prev) => {
        const alreadyDone = prev.completedQuestIds.includes(quest.id);
        const nextXp = prev.xp + serverAwardedXp;
        const newCompleted = alreadyDone ? prev.completedQuestIds : [...prev.completedQuestIds, quest.id];

        // Determine next active quest
        const currentIndex = world1.quests.findIndex((q) => q.id === quest.id);
        const nextQuest = world1.quests[currentIndex + 1];
        const nextActiveId = nextQuest ? nextQuest.id : quest.id;

        return {
          ...prev,
          xp: nextXp,
          level: calculateLevel(nextXp).level,
          completedQuestIds: newCompleted,
          activeQuestId: nextActiveId,
        };
      });
    }

    return {
      success: clientValidation.success,
      logs: clientValidation.logs,
      error: clientValidation.error || clientValidation.friendlyError,
      feedback: clientValidation.feedback,
      awardedXp: serverAwardedXp,
    };
  };

  // Check dynamic exercise with authoritative server verification
  const handleCheckDynamic = async (userAnswer: string | string[]) => {
    if (!activeExerciseItem || activeExerciseItem.type !== 'dynamic') {
      return { isCorrect: false, feedback: 'No active exercise.', awardedXp: 0 };
    }

    const exercise = activeExerciseItem.data;
    const token = localStorage.getItem(AUTH_TOKEN_KEY);

    const res = await fetch('/api/validate-exercise', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        exerciseId: exercise.id,
        userAnswer,
        topicKey: exercise.conceptId,
        completedExerciseIds: progress.completedQuestIds,
      }),
    });

    const data = await res.json();
    const isCorrect = !!data.isCorrect;
    const awardedXp = data.xpAwarded || 0;

    if (isCorrect) {
      setProgress((prev) => {
        const alreadyDone = prev.completedQuestIds.includes(exercise.id);
        const nextXp = prev.xp + awardedXp;
        const newCompleted = alreadyDone ? prev.completedQuestIds : [...prev.completedQuestIds, exercise.id];
        return {
          ...prev,
          xp: nextXp,
          level: calculateLevel(nextXp).level,
          completedQuestIds: newCompleted,
        };
      });
    }

    return {
      isCorrect,
      feedback: data.feedback || (isCorrect ? 'Well done! Answer is correct.' : 'Not quite. Check your answer and try again.'),
      awardedXp,
    };
  };

  // Continue to next lesson/exercise
  const handleContinueAfterExercise = () => {
    if (!activeExerciseItem) return;

    if (activeExerciseItem.type === 'quest') {
      const currentIndex = world1.quests.findIndex((q) => q.id === activeExerciseItem.data.id);
      const nextQuest = world1.quests[currentIndex + 1];
      if (nextQuest) {
        setActiveExerciseItem({ type: 'quest', data: nextQuest });
      } else {
        setActiveExerciseItem(null);
        setCurrentView('learn');
      }
    } else {
      // Advance to next question in bank or return to learn view
      const currentIndex = QUESTION_BANK.findIndex((q) => q.id === activeExerciseItem.data.id);
      const nextBank = QUESTION_BANK[currentIndex + 1];
      if (nextBank) {
        setActiveExerciseItem({ type: 'dynamic', data: nextBank });
      } else {
        setActiveExerciseItem(null);
        setCurrentView('learn');
      }
    }
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
    } catch {}
    setProgress(DEFAULT_PROGRESS);
    setShowResetModal(false);
    setActiveExerciseItem(null);
    setCurrentView('learn');
  };

  // Full-screen dedicated exercise mode if an exercise is active
  if (activeExerciseItem) {
    const isQuest = activeExerciseItem.type === 'quest';
    const hasNext = isQuest
      ? world1.quests.findIndex((q) => q.id === activeExerciseItem.data.id) < world1.quests.length - 1
      : QUESTION_BANK.findIndex((q) => q.id === activeExerciseItem.data.id) < QUESTION_BANK.length - 1;

    const lessonTitle = isQuest
      ? `Lesson ${activeExerciseItem.data.number}: ${activeExerciseItem.data.title}`
      : activeExerciseItem.data.title;

    const learningObjective = isQuest
      ? activeExerciseItem.data.conceptExplanation.summary
      : activeExerciseItem.data.question;

    const isCompleted = progress.completedQuestIds.includes(activeExerciseItem.data.id);

    return (
      <ExerciseScreen
        item={activeExerciseItem}
        lessonTitle={lessonTitle}
        learningObjective={learningObjective}
        isCompleted={isCompleted}
        onBack={() => setActiveExerciseItem(null)}
        onCheckQuest={handleCheckQuest}
        onCheckDynamic={handleCheckDynamic}
        onContinue={handleContinueAfterExercise}
        hasNext={hasNext}
        soundEnabled={progress.soundEnabled}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col">
      {/* 1. Minimal Navigation Bar */}
      <Navbar
        currentView={currentView}
        onNavigate={setCurrentView}
        levelInfo={levelInfo}
        soundEnabled={progress.soundEnabled}
        onToggleSound={handleToggleSound}
        onResetProgress={() => setShowResetModal(true)}
        authUser={authUser}
        onSendMagicLink={handleSendMagicLink}
        onLogout={handleLogout}
      />

      {/* 2. Main Work Area: Learn or Progress */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {currentView === 'learn' && (
          <LearnView
            currentQuest={activeQuest}
            completedQuestIds={progress.completedQuestIds}
            onStartQuest={handleStartQuest}
            onStartDynamic={handleStartDynamic}
            soundEnabled={progress.soundEnabled}
          />
        )}

        {currentView === 'progress' && (
          <ProgressView
            currentQuest={activeQuest}
            completedQuestIds={progress.completedQuestIds}
            levelInfo={levelInfo}
            totalXp={progress.xp}
            onContinueLesson={() => handleStartQuest(activeQuest)}
            onResetProgress={() => setShowResetModal(true)}
            soundEnabled={progress.soundEnabled}
          />
        )}
      </main>

      {/* 3. Minimal Footer */}
      <footer className="border-t border-slate-800/80 bg-[#070b12] py-4 px-4 sm:px-6 text-center text-xs text-slate-500">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>CodeQuest · JavaScript Learning Platform</p>
          <div className="flex items-center gap-3">
            <span>World 1: JavaScript Basics</span>
            <span>·</span>
            <button
              onClick={() => setShowResetModal(true)}
              className="text-slate-400 hover:text-slate-200 transition-colors focus:outline-none"
            >
              Reset Data
            </button>
          </div>
        </div>
      </footer>

      {/* 4. Reset Confirmation Modal */}
      {showResetModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="reset-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
        >
          <div className="relative w-full max-w-sm rounded-lg bg-slate-900 border border-slate-800 p-5 text-center shadow-xl space-y-3">
            <h3 id="reset-modal-title" className="text-base font-bold text-slate-100">
              Reset Learning Progress?
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              This will reset your completed lessons, exercises, and XP back to the default starting state.
            </p>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setShowResetModal(false)}
                className="flex-1 py-1.5 px-3 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                onClick={handleResetProgress}
                className="flex-1 py-1.5 px-3 rounded bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-rose-400"
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
