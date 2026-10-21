import React from 'react';
import { Quest } from '../types';
import { Play, Sparkles, Clock, CheckCircle2 } from 'lucide-react';
import { playButtonPop } from '../utils/sound';

interface ContinueLearningCardProps {
  quest: Quest | null;
  worldTitle: string;
  isCompleted: boolean;
  onStartQuest: (quest: Quest) => void;
  soundEnabled: boolean;
}

export const ContinueLearningCard: React.FC<ContinueLearningCardProps> = ({
  quest,
  worldTitle,
  isCompleted,
  onStartQuest,
  soundEnabled,
}) => {
  if (!quest) {
    return (
      <div className="rounded-2xl bg-[#121826] border border-[#24304F] p-6 flex flex-col justify-between">
        <p className="text-slate-400">All current quests completed!</p>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#18233C] to-[#111728] border border-[#2D3C63] p-6 shadow-xl hover:border-violet-500/50 transition-all duration-300 group">
      {/* Subtle background glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-violet-600/15 rounded-full blur-2xl group-hover:bg-violet-600/25 transition-all duration-500 pointer-events-none" />

      <div className="relative z-10 flex flex-col justify-between h-full">
        <div>
          {/* Metadata line without pills */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-violet-300 font-medium mb-2.5">
            <span>{worldTitle}</span>
            <span aria-hidden="true" className="text-slate-500">·</span>
            <span>Lesson {quest.number} of 5</span>
            <span aria-hidden="true" className="text-slate-500">·</span>
            <span className="flex items-center gap-1 text-slate-400">
              <Clock className="w-3 h-3" />
              ~2 min
            </span>
          </div>

          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white group-hover:text-violet-200 transition-colors">
                {quest.title}
              </h2>
              <p className="text-sm text-slate-300 mt-1.5 leading-relaxed">
                {quest.subtitle}
              </p>
            </div>

            {isCompleted && (
              <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-medium shrink-0 bg-emerald-950/40 border border-emerald-800/50 px-2.5 py-1 rounded-md">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Done
              </span>
            )}
          </div>

          {/* Quick concept teaser box */}
          <div className="mt-4 p-3 rounded-xl bg-[#0C111D]/80 border border-[#202B48] flex items-center justify-between text-xs">
            <span className="text-slate-400">Core concept:</span>
            <span className="font-mono text-sky-300 font-medium">{quest.conceptHeadline}</span>
          </div>
        </div>

        {/* Action Row */}
        <div className="mt-6 pt-4 border-t border-[#202B48] flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 text-xs text-amber-400 font-semibold tabular-nums">
            <Sparkles className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span>+{quest.xpReward} XP Reward</span>
          </div>

          <button
            onClick={() => {
              playButtonPop(soundEnabled);
              onStartQuest(quest);
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-sky-500 hover:from-violet-500 hover:via-indigo-500 hover:to-sky-400 text-white font-semibold text-sm shadow-lg shadow-violet-900/30 transition-all duration-200 transform active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 whitespace-nowrap shrink-0"
            aria-label={`${isCompleted ? 'Replay' : 'Continue'} Quest: ${quest.title}`}
          >
            <Play className="w-4 h-4 fill-white" />
            <span>{isCompleted ? 'Replay Quest' : 'Continue Learning'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
