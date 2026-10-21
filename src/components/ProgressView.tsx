import React from 'react';
import { Quest } from '../types';
import { WORLDS } from '../data/curriculum';
import { QUESTION_BANK } from '../data/question_bank';
import { LevelInfo } from '../game/scoring';
import { CheckCircle2, RotateCcw, ArrowRight, BookOpen, Award, Target, BarChart2 } from 'lucide-react';
import { playButtonPop } from '../utils/sound';

interface ProgressViewProps {
  currentQuest: Quest | null;
  completedQuestIds: string[];
  levelInfo: LevelInfo;
  totalXp: number;
  onContinueLesson: () => void;
  onResetProgress: () => void;
  soundEnabled: boolean;
}

export const ProgressView: React.FC<ProgressViewProps> = ({
  currentQuest,
  completedQuestIds,
  levelInfo,
  totalXp,
  onContinueLesson,
  onResetProgress,
  soundEnabled,
}) => {
  const world1 = WORLDS[0];
  const allQuests = world1?.quests || [];
  const totalItems = allQuests.length + QUESTION_BANK.length;
  const completedCount = completedQuestIds.length;
  const coursePercent = Math.min(100, Math.round((completedCount / totalItems) * 100));

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* 1. Lightweight Stats Grid: Exactly the 4 required metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Metric 1: Current Lesson */}
        <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
            <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
            <span>Current Lesson</span>
          </div>
          <div className="text-sm font-bold text-slate-100 truncate">
            {currentQuest ? currentQuest.title : 'All Quests Completed'}
          </div>
          <div className="text-[11px] text-slate-400 truncate">
            {currentQuest ? `Lesson ${currentQuest.number} of ${allQuests.length}` : 'World 1 Finished'}
          </div>
        </div>

        {/* Metric 2: Questions Completed */}
        <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Questions Completed</span>
          </div>
          <div className="text-sm font-bold text-slate-100 font-mono">
            {completedCount} <span className="text-slate-500 font-normal text-xs">/ {totalItems}</span>
          </div>
          <div className="text-[11px] text-slate-400">
            {allQuests.filter((q) => completedQuestIds.includes(q.id)).length} lessons, {QUESTION_BANK.filter((q) => completedQuestIds.includes(q.id)).length} checks
          </div>
        </div>

        {/* Metric 3: XP & Current Level */}
        <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span>XP & Level</span>
          </div>
          <div className="text-sm font-bold text-slate-100 font-mono">
            Level {levelInfo.level}
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            {totalXp} XP total ({levelInfo.neededForNext} XP to next level)
          </div>
        </div>

        {/* Metric 4: Overall Course Progress */}
        <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
            <BarChart2 className="w-3.5 h-3.5 text-indigo-400" />
            <span>Course Progress</span>
          </div>
          <div className="text-sm font-bold text-slate-100 font-mono">
            {coursePercent}%
          </div>
          {/* Progress bar */}
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
            <div
              className="bg-indigo-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${coursePercent}%` }}
              role="progressbar"
              aria-valuenow={coursePercent}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        </div>
      </div>

      {/* 2. Direct Continue Action */}
      {currentQuest && (
        <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between gap-4">
          <div>
            <div className="text-xs text-slate-400">Ready to keep coding?</div>
            <div className="text-sm font-semibold text-slate-200">
              {currentQuest.title}: {currentQuest.conceptHeadline}
            </div>
          </div>
          <button
            onClick={() => {
              playButtonPop(soundEnabled);
              onContinueLesson();
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm transition-colors focus-visible:ring-2 focus-visible:ring-indigo-400 shrink-0"
          >
            <span>Continue Lesson</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 3. Detailed Curriculum Completion Status */}
      <section className="space-y-3">
        <h3 className="text-sm font-bold text-slate-200">Curriculum Progression</h3>

        <div className="rounded-lg border border-slate-800 bg-slate-900 divide-y divide-slate-800">
          {allQuests.map((quest) => {
            const isCompleted = completedQuestIds.includes(quest.id);
            return (
              <div key={quest.id} className="p-3 sm:p-4 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={`w-5 h-5 rounded flex items-center justify-center font-mono font-bold shrink-0 ${
                      isCompleted
                        ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/60'
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-3 h-3" /> : quest.number}
                  </span>
                  <div className="min-w-0">
                    <div className="font-semibold text-slate-200 truncate">{quest.title}</div>
                    <div className="text-slate-400 text-[11px] truncate">{quest.conceptHeadline}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 font-mono text-[11px]">
                  <span className={isCompleted ? 'text-emerald-400' : 'text-slate-500'}>
                    {isCompleted ? 'Completed' : 'Pending'}
                  </span>
                  <span className="text-slate-400">+{quest.xpReward} XP</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Data Management & Reset Action */}
      <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
        <span>Progress is saved automatically to your browser and synced with the server.</span>
        <button
          onClick={onResetProgress}
          className="flex items-center gap-1 text-slate-400 hover:text-rose-400 transition-colors focus:outline-none"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset Progress</span>
        </button>
      </div>
    </div>
  );
};
