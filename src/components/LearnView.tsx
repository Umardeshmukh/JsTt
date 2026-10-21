import React, { useState } from 'react';
import { Quest } from '../types';
import { DynamicExercise } from '../types/exercise';
import { WORLDS } from '../data/curriculum';
import { QUESTION_BANK } from '../data/question_bank';
import { CONCEPTS, getConceptById } from '../data/concepts';
import { ConceptMindMap } from './ConceptMindMap';
import { Play, CheckCircle2, ArrowRight, BookOpen, Lightbulb, Code2 } from 'lucide-react';
import { playButtonPop } from '../utils/sound';

interface LearnViewProps {
  currentQuest: Quest | null;
  completedQuestIds: string[];
  onStartQuest: (quest: Quest) => void;
  onStartDynamic: (exercise: DynamicExercise) => void;
  soundEnabled: boolean;
}

export const LearnView: React.FC<LearnViewProps> = ({
  currentQuest,
  completedQuestIds,
  onStartQuest,
  onStartDynamic,
  soundEnabled,
}) => {
  const world1 = WORLDS[0];
  const allQuests = world1?.quests || [];
  const completedCount = allQuests.filter((q) => completedQuestIds.includes(q.id)).length;
  const isCurrentCompleted = currentQuest ? completedQuestIds.includes(currentQuest.id) : false;

  const conceptKeys = Object.keys(CONCEPTS);
  const [selectedConceptKey, setSelectedConceptKey] = useState<string>('variables');
  const activeConcept = getConceptById(selectedConceptKey);

  const handleStartConceptExercise = (conceptKey: string) => {
    const concept = getConceptById(conceptKey);
    const exerciseId = concept.exerciseIds[0];
    if (exerciseId) {
      const questMatch = allQuests.find((q) => q.id === exerciseId);
      if (questMatch) {
        onStartQuest(questMatch);
        return;
      }
      const dynMatch = QUESTION_BANK.find((q) => q.id === exerciseId);
      if (dynMatch) {
        onStartDynamic(dynMatch);
        return;
      }
    }
    // Fallback: start current or first quest
    if (currentQuest) {
      onStartQuest(currentQuest);
    } else {
      onStartQuest(allQuests[0]);
    }
  };

  return (
    <div className="space-y-7 max-w-4xl mx-auto">
      {/* 1. Current Active Lesson Spotlight */}
      {currentQuest && (
        <section aria-label="Current Lesson" className="rounded-lg bg-slate-900 border border-slate-800 p-5 sm:p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-2 text-xs text-indigo-400 font-semibold tracking-wide">
                <span>JAVASCRIPT BASICS</span>
                <span className="text-slate-600">·</span>
                <span>LESSON {currentQuest.number} OF {allQuests.length}</span>
              </div>
              <h2 className="text-xl font-bold text-slate-100">
                {currentQuest.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
                {currentQuest.conceptExplanation.summary}
              </p>
              <div className="pt-1 text-xs text-slate-400 font-mono">
                XP Reward: <span className="text-indigo-400">+{currentQuest.xpReward} XP</span>
              </div>
            </div>

            <button
              onClick={() => {
                playButtonPop(soundEnabled);
                onStartQuest(currentQuest);
              }}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-colors focus-visible:ring-2 focus-visible:ring-indigo-400 shrink-0 self-start sm:self-center"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>{isCurrentCompleted ? 'Review Lesson' : 'Continue Lesson'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>
      )}

      {/* 2. Interactive Concept Mind Maps & Explanations */}
      <section aria-label="Concept Mind Maps" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-bold text-slate-200">Visual Mind Maps & Concepts</h3>
            </div>
            <p className="text-xs text-slate-400">
              Explore key JavaScript concepts visually, view concise definitions, and test understanding.
            </p>
          </div>
        </div>

        {/* Concept Selector Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          {conceptKeys.map((key) => {
            const c = CONCEPTS[key];
            const isSelected = selectedConceptKey === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setSelectedConceptKey(key);
                  playButtonPop(soundEnabled);
                }}
                className={`px-3 py-1.5 rounded-md font-semibold whitespace-nowrap transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                }`}
              >
                {c.title}
              </button>
            );
          })}
        </div>

        {/* Selected Concept Card */}
        <div className="rounded-lg bg-slate-900 border border-slate-800 p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-800 pb-3">
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-400">
                Concept · {activeConcept.title}
              </span>
              <h4 className="text-base font-bold text-slate-100">
                {activeConcept.title}
              </h4>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl font-medium">
                {activeConcept.shortDefinition}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                playButtonPop(soundEnabled);
                handleStartConceptExercise(selectedConceptKey);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors focus-visible:ring-2 focus-visible:ring-indigo-400 shrink-0 self-start sm:self-center"
            >
              <span>Practice {activeConcept.title}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Interactive Mind Map Component */}
          <ConceptMindMap
            centralLabel={activeConcept.mindMap.centralLabel}
            nodes={activeConcept.mindMap.nodes}
          />

          {/* Code Example & Analogy */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="space-y-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                Code Example
              </span>
              <div className="rounded bg-slate-950 border border-slate-800 p-3 font-mono text-xs text-indigo-300 overflow-x-auto">
                <pre>{activeConcept.codeExample}</pre>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                Practical Analogy
              </span>
              <div className="rounded bg-slate-950/70 border border-slate-800 p-3 text-xs text-slate-300 flex items-start gap-2">
                <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed">{activeConcept.analogy}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Structured Curriculum Sequence */}
      <section aria-label="Curriculum" className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-200">World 1: JavaScript Foundations</h3>
            <p className="text-xs text-slate-400">
              Interactive coding lessons with real JavaScript runtime execution.
            </p>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {completedCount} / {allQuests.length} completed
          </span>
        </div>

        <div className="divide-y divide-slate-800/80 rounded-lg border border-slate-800 bg-slate-900/50 overflow-hidden">
          {allQuests.map((quest) => {
            const isDone = completedQuestIds.includes(quest.id);
            const isCurrent = currentQuest?.id === quest.id;

            return (
              <div
                key={quest.id}
                className={`p-4 flex items-center justify-between gap-4 transition-colors ${
                  isCurrent ? 'bg-slate-800/40' : 'hover:bg-slate-900'
                }`}
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <span
                    className={`w-6 h-6 rounded flex items-center justify-center text-xs font-mono font-bold shrink-0 mt-0.5 ${
                      isDone
                        ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/50'
                        : isCurrent
                        ? 'bg-indigo-950/60 text-indigo-400 border border-indigo-800/50'
                        : 'bg-slate-800 text-slate-500 border border-slate-700'
                    }`}
                  >
                    {isDone ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : quest.number}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-slate-200 truncate">
                        {quest.title}
                      </h4>
                      {isCurrent && (
                        <span className="text-[10px] font-semibold text-indigo-400 bg-indigo-950/40 border border-indigo-900/50 px-1.5 py-0.5 rounded">
                          Current
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 truncate mt-0.5">
                      {quest.conceptHeadline}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs text-slate-400 font-mono hidden sm:inline">
                    +{quest.xpReward} XP
                  </span>
                  <button
                    onClick={() => {
                      playButtonPop(soundEnabled);
                      onStartQuest(quest);
                    }}
                    className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                      isDone
                        ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                    }`}
                  >
                    {isDone ? 'Review' : 'Start'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Concepts & Quick Check Questions Bank */}
      <section aria-label="Question Bank Exercises" className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-200">Concept Checks & Question Bank</h3>
            <p className="text-xs text-slate-400">
              Output prediction, syntax bug fixing, and knowledge reinforcement.
            </p>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {QUESTION_BANK.filter((q) => completedQuestIds.includes(q.id)).length} / {QUESTION_BANK.length} completed
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {QUESTION_BANK.map((item) => {
            const isDone = completedQuestIds.includes(item.id);

            return (
              <div
                key={item.id}
                className="p-3.5 rounded-lg border border-slate-800 bg-slate-900/60 flex flex-col justify-between gap-3 hover:border-slate-700 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 text-[11px] text-slate-500 mb-1">
                    <span className="uppercase font-mono tracking-wider">{item.conceptId}</span>
                    <span className="font-mono text-indigo-400">+25 XP</span>
                  </div>
                  <h4 className="text-xs font-semibold text-slate-200 line-clamp-1">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">
                    {item.question}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-800/60">
                  {isDone ? (
                    <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Completed
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-500">Unanswered</span>
                  )}

                  <button
                    onClick={() => {
                      playButtonPop(soundEnabled);
                      onStartDynamic(item);
                    }}
                    className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                      isDone
                        ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                    }`}
                  >
                    {isDone ? 'Practice Again' : 'Solve'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
