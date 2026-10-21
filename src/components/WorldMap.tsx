import React from 'react';
import { World, Quest } from '../types';
import { Lock, CheckCircle2, Play, ChevronRight, Sparkles, BookOpen } from 'lucide-react';
import { playButtonPop } from '../utils/sound';

interface WorldMapProps {
  worlds: World[];
  completedQuestIds: string[];
  activeQuestId: string;
  onSelectQuest: (quest: Quest) => void;
  onReviewQuest: (quest: Quest) => void;
  soundEnabled: boolean;
}

export const WorldMap: React.FC<WorldMapProps> = ({
  worlds,
  completedQuestIds,
  activeQuestId,
  onSelectQuest,
  onReviewQuest,
  soundEnabled,
}) => {
  return (
    <section className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-[#1E293B] pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Learning Worlds
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Traverse the JavaScript realm one bite-sized victory at a time.
          </p>
        </div>
        <div className="text-xs text-slate-400 flex items-center gap-2">
          <span>1 World Available</span>
          <span aria-hidden="true">·</span>
          <span>5 Worlds in Development</span>
        </div>
      </div>

      <div className="space-y-6">
        {worlds.map((world) => {
          const isWorld1 = world.id === 1;
          const completedCount = world.quests.filter((q) =>
            completedQuestIds.includes(q.id)
          ).length;
          const isWorldComplete = world.quests.length > 0 && completedCount === world.quests.length;

          if (isWorld1) {
            return (
              <div
                key={world.id}
                className="rounded-2xl bg-gradient-to-br from-[#151D30] via-[#111726] to-[#0D1220] border-2 border-violet-500/40 p-6 sm:p-8 shadow-2xl relative overflow-hidden"
              >
                {/* World 1 Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#222E4D]">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center shrink-0 shadow-lg shadow-violet-950/50">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 text-xs font-semibold text-violet-400">
                        <span>AVAILABLE WORLD</span>
                        <span aria-hidden="true">·</span>
                        <span className="text-amber-400 tabular-nums">+{world.totalXp} Total XP</span>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-bold text-white mt-0.5">
                        {world.title}
                      </h3>
                      <p className="text-sm text-slate-300 mt-1 max-w-2xl">
                        {world.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-start md:self-center shrink-0">
                    <div className="text-right">
                      <div className="text-xs text-slate-400">World Progress</div>
                      <div className="text-sm font-bold text-slate-200 tabular-nums">
                        {completedCount} / {world.quests.length} Quests
                      </div>
                    </div>
                    {isWorldComplete && (
                      <span className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-950/50 border border-emerald-800/60 px-3 py-1.5 rounded-lg font-medium">
                        <CheckCircle2 className="w-4 h-4" />
                        Mastered
                      </span>
                    )}
                  </div>
                </div>

                {/* Quests Path / Nodes */}
                <div className="mt-6">
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
                    World 1 Quests
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
                    {world.quests.map((quest, idx) => {
                      const isCompleted = completedQuestIds.includes(quest.id);
                      // Unlocked if previous quest is completed or if it is the first quest
                      const isUnlocked = idx === 0 || completedQuestIds.includes(world.quests[idx - 1].id);
                      const isCurrent = quest.id === activeQuestId && !isCompleted;

                      return (
                        <div
                          key={quest.id}
                          role="button"
                          tabIndex={isUnlocked ? 0 : -1}
                          aria-disabled={!isUnlocked}
                          onClick={() => {
                            if (isUnlocked) {
                              playButtonPop(soundEnabled);
                              onSelectQuest(quest);
                            }
                          }}
                          onKeyDown={(e) => {
                            if (isUnlocked && (e.key === 'Enter' || e.key === ' ')) {
                              e.preventDefault();
                              playButtonPop(soundEnabled);
                              onSelectQuest(quest);
                            }
                          }}
                          className={`text-left p-4 rounded-xl border transition-all flex flex-col justify-between h-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 ${
                            isCompleted
                              ? 'bg-[#121B2D] border-emerald-500/30 hover:border-emerald-400/60 cursor-pointer'
                              : isCurrent
                              ? 'bg-[#18233C] border-violet-500 shadow-md shadow-violet-950/40 ring-1 ring-violet-500/40 cursor-pointer'
                              : isUnlocked
                              ? 'bg-[#101726] border-[#24304F] hover:border-violet-500/50 hover:bg-[#141C30] cursor-pointer'
                              : 'bg-[#0B0F19]/60 border-[#1B2338] opacity-50 cursor-not-allowed'
                          }`}
                          aria-label={`Quest ${quest.number}: ${quest.title} (${
                            isCompleted ? 'Completed' : isUnlocked ? 'Available' : 'Locked'
                          })`}
                        >
                          <div>
                            <div className="flex items-center justify-between gap-1 mb-2">
                              <span className="text-xs font-bold text-slate-400 tabular-nums">
                                Q{quest.number}
                              </span>
                              {isCompleted ? (
                                <div className="flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      playButtonPop(soundEnabled);
                                      onReviewQuest(quest);
                                    }}
                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-violet-950/70 hover:bg-violet-900 border border-violet-600/50 text-[11px] font-semibold text-violet-300 hover:text-white transition-colors cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-violet-400"
                                    aria-label={`Review concept for ${quest.title}`}
                                    title="Open Quick Refresher cheat-sheet"
                                  >
                                    <BookOpen className="w-3 h-3" />
                                    <span>Review</span>
                                  </button>
                                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                                </div>
                              ) : isCurrent ? (
                                <span className="w-2 h-2 rounded-full bg-violet-400 animate-ping" />
                              ) : !isUnlocked ? (
                                <Lock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                              ) : (
                                <Play className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                              )}
                            </div>
                            <h5 className="text-sm font-bold text-white line-clamp-2 leading-snug">
                              {quest.title}
                            </h5>
                          </div>

                          <div className="pt-2 border-t border-[#1E293B] flex items-center justify-between text-[11px]">
                            <span className="text-amber-400 font-semibold tabular-nums">
                              +{quest.xpReward} XP
                            </span>
                            <span className="text-slate-400 truncate max-w-[80px]">
                              {quest.conceptHeadline}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          }

          // Locked Worlds (Worlds 2 to 6)
          return (
            <div
              key={world.id}
              className="rounded-2xl bg-[#0E1321] border border-[#1A2338] p-6 opacity-75 hover:opacity-90 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#141B2D] border border-[#202B48] flex items-center justify-center shrink-0 text-slate-500">
                  <Lock className="w-5 h-5 text-slate-500" />
                </div>
                <div>
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                    <span>LOCKED WORLD</span>
                    <span aria-hidden="true">·</span>
                    <span>Unlocks after World {world.id - 1}</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-300 mt-0.5">
                    {world.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
                    {world.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 self-start md:self-center">
                <span className="text-xs font-semibold text-slate-400 tabular-nums">
                  +{world.totalXp} XP
                </span>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#141B2D] border border-[#202B48] text-xs text-slate-400">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Locked</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
