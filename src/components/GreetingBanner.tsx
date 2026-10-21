import React, { useState } from 'react';
import { MascotByte } from './MascotByte';
import { LevelInfo } from '../game/scoring';
import { Flame, Zap, Award, Sparkles, Calendar, ChevronRight, Info } from 'lucide-react';

interface GreetingBannerProps {
  levelInfo: LevelInfo;
  streakDays: number;
}

export const GreetingBanner: React.FC<GreetingBannerProps> = ({
  levelInfo,
  streakDays,
}) => {
  const [showStreakModal, setShowStreakModal] = useState(false);

  // Calculate 7-day rolling window
  // Days of week labels for display
  const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const todayIndex = (new Date().getDay() + 6) % 7; // 0 = Mon, ..., 6 = Sun

  // Motivational copy based on streak duration
  const getStreakMessage = (days: number) => {
    if (days <= 1) {
      return 'Spark ignited! Solve today\'s challenge to keep your momentum burning.';
    } else if (days < 3) {
      return '2-day streak! Consistency is compounding into real programming power.';
    } else if (days < 7) {
      return `${days}-day streak! Byte\'s neural circuits are firing at peak efficiency.`;
    } else {
      return `${days}-day streak! Legendary dedication—you have built a daily coding habit!`;
    }
  };

  // Next streak milestone
  const nextMilestone = streakDays < 3 ? 3 : streakDays < 7 ? 7 : streakDays < 14 ? 14 : streakDays + 7;
  const daysToMilestone = nextMilestone - streakDays;

  return (
    <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#161F38] via-[#121829] to-[#0D1220] border border-[#24304F] p-6 sm:p-8 shadow-xl">
      {/* Decorative ambient glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        {/* Left: Mascot & Greeting */}
        <div className="flex items-center gap-4 sm:gap-6 flex-1">
          <div className="relative shrink-0">
            <MascotByte
              mood={streakDays >= 3 ? 'celebrating' : 'happy'}
              size="lg"
              isFloating={true}
            />
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-12 h-2 bg-black/40 rounded-full blur-xs" />
          </div>

          <div className="space-y-1">
            {/* Clickable Streak Pill badge */}
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-1 text-xs">
              <button
                type="button"
                onClick={() => setShowStreakModal(true)}
                className="group inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/10 border border-amber-400/40 text-amber-300 font-semibold hover:border-amber-300 transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                title="View Streak Insights"
              >
                <Flame className={`w-3.5 h-3.5 text-amber-400 fill-amber-400 ${streakDays > 0 ? 'animate-bounce' : ''}`} />
                <span className="tabular-nums">{streakDays} Day Streak</span>
                <span className="text-[10px] text-amber-400/70 group-hover:text-amber-200 transition-colors">
                  · Insights ℹ️
                </span>
              </button>

              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="text-slate-400 whitespace-nowrap">Daily Spark Active</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Ready for a tiny coding win?
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              {getStreakMessage(streakDays)}
            </p>
          </div>
        </div>

        {/* Right Area: Streak Tracker + Level & XP Card */}
        <div className="w-full lg:w-auto flex flex-col sm:flex-row lg:flex-row gap-4 items-stretch">
          {/* Visual Streak Counter & Mini-Tracker */}
          <div className="bg-[#0B0F19]/80 border border-[#222E4D] rounded-xl p-4 shrink-0 backdrop-blur-xs flex flex-col justify-between sm:w-64">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span>Consistency Tracker</span>
              </span>
              <span className="text-[11px] text-amber-400 font-bold tabular-nums">
                {streakDays} {streakDays === 1 ? 'day' : 'days'}
              </span>
            </div>

            {/* 7-Day Visual Pill Track */}
            <div className="grid grid-cols-7 gap-1.5 py-1.5">
              {dayLabels.map((day, idx) => {
                // Completed day if within current streak window
                const isToday = idx === todayIndex;
                const isPastActive = idx <= todayIndex && (todayIndex - idx) < streakDays;

                return (
                  <div
                    key={idx}
                    className="flex flex-col items-center gap-1"
                    title={`${day}: ${isPastActive ? 'Completed' : isToday ? 'Today (Active)' : 'Upcoming'}`}
                  >
                    <span className="text-[10px] font-mono text-slate-400">
                      {day}
                    </span>
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all text-[10px] font-bold ${
                        isPastActive
                          ? 'bg-gradient-to-tr from-amber-500 to-orange-500 text-slate-950 shadow-xs shadow-amber-500/30'
                          : isToday
                          ? 'bg-amber-950/60 border border-amber-400/80 text-amber-300 animate-pulse'
                          : 'bg-[#141C2E] border border-[#1E293B] text-slate-600'
                      }`}
                    >
                      {isPastActive ? (
                        <Flame className="w-3.5 h-3.5 fill-slate-950" />
                      ) : (
                        <span>·</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 border-t border-[#1C253D] flex items-center justify-between text-[10px] text-slate-400">
              <span className="text-slate-400">Next milestone:</span>
              <span className="text-amber-300 font-semibold tabular-nums">
                {daysToMilestone > 0 ? `${daysToMilestone} days to Day ${nextMilestone}` : 'Milestone achieved!'}
              </span>
            </div>
          </div>

          {/* Level & XP Card */}
          <div className="bg-[#0B0F19]/80 border border-[#222E4D] rounded-xl p-4 shrink-0 backdrop-blur-xs flex flex-col justify-between sm:w-64">
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-slate-300 flex items-center gap-1.5 font-medium">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  Level {levelInfo.level} · {levelInfo.title}
                </span>
                <span className="text-amber-400 font-bold tabular-nums">
                  {levelInfo.progressPercent}%
                </span>
              </div>

              {/* Progress bar track */}
              <div className="h-2.5 w-full bg-[#182238] rounded-full overflow-hidden p-0.5 border border-[#24304F]">
                <div
                  className="h-full bg-gradient-to-r from-violet-500 via-indigo-500 to-sky-400 rounded-full transition-all duration-500 ease-out shadow-sm"
                  style={{ width: `${Math.max(6, levelInfo.progressPercent)}%` }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between mt-2.5 text-[11px] text-slate-400 tabular-nums">
              <span>{levelInfo.currentLevelXp} XP earned</span>
              <span>{levelInfo.neededForNext > 0 ? `${levelInfo.neededForNext} XP to Lv.${levelInfo.level + 1}` : 'Max Tier'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Streak Details / Habits Dialog */}
      {showStreakModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div className="relative w-full max-w-md rounded-2xl bg-gradient-to-b from-[#182038] to-[#0F1426] border-2 border-amber-400/50 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400">
                  <Flame className="w-5 h-5 fill-amber-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Daily Streak Engine</h3>
                  <p className="text-xs text-amber-400 font-semibold">{streakDays} Consecutive Days Active</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowStreakModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
              <p>
                Coding skills compound through daily micro-practice. Solving just one bite-sized challenge every 24 hours keeps your neural connections sharp and prevents knowledge decay.
              </p>

              <div className="p-3.5 rounded-xl bg-[#090D17] border border-[#1E293B] space-y-2">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Streak Rewards & Milestones</span>
                </div>
                <div className="space-y-1.5 pt-1 text-[11px]">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">🔥 Day 1: Spark Pioneer</span>
                    <span className="text-emerald-400 font-semibold">Active</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">⚡ Day 3: Bronze Streak Badge</span>
                    <span className="text-amber-400 font-semibold">+25 Bonus XP</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">🏆 Day 7: Week Master Badge</span>
                    <span className="text-amber-400 font-semibold">+100 Bonus XP</span>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-violet-950/30 border border-violet-500/30 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
                <span className="text-slate-300 text-[11px]">
                  Tip: Daily missions reset at midnight local time. Even completing a quick review counts toward your consistency!
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-[#1E293B] flex justify-end">
              <button
                type="button"
                onClick={() => setShowStreakModal(false)}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-colors"
              >
                Got It! Keep the Flame Burning
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
