import React from 'react';
import { Achievement } from '../types';
import { Trophy, CheckCircle, Lock } from 'lucide-react';

interface AchievementsSectionProps {
  achievements: Achievement[];
}

export const AchievementsSection: React.FC<AchievementsSectionProps> = ({ achievements }) => {
  const unlockedCount = achievements.filter((a) => a.isUnlocked).length;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-400" />
          <h2 className="text-xl font-bold text-white tracking-tight">
            Achievements
          </h2>
        </div>
        <div className="text-xs text-slate-400 tabular-nums">
          <span className="text-amber-400 font-semibold">{unlockedCount}</span> of {achievements.length} Unlocked
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {achievements.map((ach) => (
          <div
            key={ach.id}
            className={`p-4 rounded-xl border transition-all flex items-start gap-3.5 ${
              ach.isUnlocked
                ? 'bg-gradient-to-br from-[#151D30] to-[#101726] border-amber-500/30 shadow-md shadow-amber-950/20'
                : 'bg-[#0E1321]/60 border-[#1C253D] opacity-60'
            }`}
          >
            <div
              className={`w-11 h-11 rounded-lg flex items-center justify-center text-xl shrink-0 ${
                ach.isUnlocked
                  ? 'bg-gradient-to-tr from-amber-500/20 to-violet-500/20 border border-amber-500/40 text-amber-300'
                  : 'bg-[#151D30] border border-[#24304F] text-slate-500 grayscale'
              }`}
            >
              {ach.icon}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <h3 className={`text-sm font-bold truncate ${ach.isUnlocked ? 'text-white' : 'text-slate-400'}`}>
                  {ach.title}
                </h3>
                {ach.isUnlocked ? (
                  <CheckCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                ) : (
                  <Lock className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                )}
              </div>

              <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                {ach.description}
              </p>

              <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                <span className="text-amber-400 font-medium tabular-nums">+{ach.xpBonus} XP</span>
                {ach.isUnlocked && ach.unlockedAt && (
                  <span>Unlocked {ach.unlockedAt}</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
