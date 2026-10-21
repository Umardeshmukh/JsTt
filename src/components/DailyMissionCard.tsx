import React from 'react';
import { DailyMission } from '../types';
import { Target, Sparkles, Check } from 'lucide-react';
import { playSuccessChime, playButtonPop } from '../utils/sound';

interface DailyMissionCardProps {
  mission: DailyMission;
  onClaimReward: () => void;
  soundEnabled: boolean;
}

export const DailyMissionCard: React.FC<DailyMissionCardProps> = ({
  mission,
  onClaimReward,
  soundEnabled,
}) => {
  const percent = Math.min(100, Math.floor((mission.currentCount / mission.targetCount) * 100));

  return (
    <div className="rounded-2xl bg-[#121826] border border-[#24304F] p-6 flex flex-col justify-between shadow-lg hover:border-[#33426B] transition-all">
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-sky-400">
            <Target className="w-4 h-4 text-sky-400" />
            <span>DAILY MISSION</span>
          </div>
          <span className="text-xs font-semibold text-amber-400 flex items-center gap-1 tabular-nums">
            <Sparkles className="w-3.5 h-3.5 fill-amber-400" />
            +{mission.xpReward} XP
          </span>
        </div>

        <h3 className="text-base font-bold text-white">
          {mission.title}
        </h3>
        <p className="text-xs text-slate-300 mt-1 leading-relaxed">
          {mission.description}
        </p>

        {/* Progress */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5 tabular-nums">
            <span>Progress</span>
            <span className="text-slate-200 font-medium">
              {mission.currentCount} / {mission.targetCount}
            </span>
          </div>
          <div className="h-2 w-full bg-[#1A233A] rounded-full overflow-hidden border border-[#2A375B]">
            <div
              className="h-full bg-gradient-to-r from-sky-500 to-indigo-500 rounded-full transition-all duration-300"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
      </div>

      <div className="mt-5 pt-3 border-t border-[#1C253D] flex items-center justify-between">
        <span className="text-[11px] text-slate-400">Resets daily at midnight</span>

        {mission.claimed ? (
          <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-medium bg-emerald-950/30 border border-emerald-800/40 px-3 py-1.5 rounded-lg">
            <Check className="w-3.5 h-3.5" />
            Claimed
          </span>
        ) : mission.isCompleted ? (
          <button
            onClick={() => {
              playSuccessChime(soundEnabled);
              onClaimReward();
            }}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-amber-500 hover:bg-amber-400 px-3.5 py-1.5 rounded-lg shadow-md shadow-amber-950/40 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Claim +{mission.xpReward} XP
          </button>
        ) : (
          <span className="text-xs text-slate-400 font-medium bg-[#161F33] px-3 py-1.5 rounded-lg border border-[#24304F]">
            In Progress
          </span>
        )}
      </div>
    </div>
  );
};
