import React, { useState, useEffect } from 'react';
import { Quest } from '../types';
import { MascotByte } from './MascotByte';
import { ConfettiCanvas } from './ConfettiCanvas';
import { validateSolution, ExecutionResult } from '../game/validator';
import {
  playSuccessChime,
  playButtonPop,
  playHintPing,
  playErrorBuzz,
} from '../utils/sound';
import {
  ArrowLeft,
  Play,
  RotateCcw,
  Lightbulb,
  CheckCircle2,
  AlertCircle,
  Terminal,
  Sparkles,
  ChevronRight,
  Code2,
} from 'lucide-react';

interface QuestInteractiveSandboxProps {
  quest: Quest;
  onBack: () => void;
  onCompleteQuest: (questId: string, xpEarned: number) => void;
  onNextQuest?: () => void;
  hasNextQuest: boolean;
  soundEnabled: boolean;
}

export const QuestInteractiveSandbox: React.FC<QuestInteractiveSandboxProps> = ({
  quest,
  onBack,
  onCompleteQuest,
  onNextQuest,
  hasNextQuest,
  soundEnabled,
}) => {
  const [code, setCode] = useState<string>(quest.starterCode);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [hasCelebrated, setHasCelebrated] = useState<boolean>(false);
  const [showConfetti, setShowConfetti] = useState<boolean>(false);

  // Sync state if quest changes
  useEffect(() => {
    setCode(quest.starterCode);
    setShowHint(false);
    setExecutionResult(null);
    setHasCelebrated(false);
    setShowConfetti(false);
  }, [quest.id]);

  // Handle keyboard shortcut: Cmd/Ctrl + Enter to run code
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        handleRunCode();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [code, quest]);

  const handleRunCode = () => {
    setIsRunning(true);
    playButtonPop(soundEnabled);

    // Short debounce for realistic tactile feedback
    setTimeout(() => {
      const result = validateSolution(code, quest.validationRules);
      setExecutionResult(result);
      setIsRunning(false);

      if (result.success) {
        if (!hasCelebrated) {
          playSuccessChime(soundEnabled);
          setShowConfetti(true);
          setHasCelebrated(true);
          onCompleteQuest(quest.id, quest.xpReward);
        }
      } else {
        playErrorBuzz(soundEnabled);
      }
    }, 200);
  };

  const handleResetCode = () => {
    playButtonPop(soundEnabled);
    setCode(quest.starterCode);
    setExecutionResult(null);
  };

  const handleInsertSnippet = (snippet: string) => {
    playButtonPop(soundEnabled);
    setCode((prev) => prev + (prev.endsWith('\n') || prev.length === 0 ? '' : ' ') + snippet);
  };

  // Determine mascot expression
  const mascotMood = hasCelebrated
    ? 'celebrating'
    : executionResult && !executionResult.success
    ? 'thinking'
    : showHint
    ? 'curious'
    : 'happy';

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex flex-col pb-12">
      <ConfettiCanvas active={showConfetti} onDone={() => setShowConfetti(false)} />

      {/* Top Bar for Quest */}
      <header className="sticky top-0 z-30 bg-[#0E1424]/95 backdrop-blur-md border-b border-[#1E293B] px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <button
            onClick={() => {
              playButtonPop(soundEnabled);
              onBack();
            }}
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors py-1 px-2 rounded-lg hover:bg-[#1A233A] focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
            aria-label="Back to dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-medium">Dashboard</span>
          </button>

          <div className="flex items-center gap-2 text-xs sm:text-sm">
            <span className="text-slate-400">World 1</span>
            <span className="text-slate-600">/</span>
            <span className="text-white font-semibold">Lesson {quest.number}: {quest.title}</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-amber-400 font-semibold px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 rounded-lg tabular-nums">
            <Sparkles className="w-3.5 h-3.5 fill-amber-400" />
            <span>+{quest.xpReward} XP</span>
          </div>
        </div>
      </header>

      {/* Main Quest Area: Two-Column Split */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Lesson Deck & Mascot (5 cols on lg) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Concept Card */}
          <div className="rounded-2xl bg-[#121826] border border-[#24304F] p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-violet-400">
              <Code2 className="w-4 h-4" />
              <span>THE TINY CONCEPT</span>
            </div>

            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              {quest.conceptHeadline}
            </h1>

            <p className="text-sm text-slate-300 leading-relaxed">
              {quest.conceptExplanation.summary}
            </p>

            <ul className="space-y-2 text-xs text-slate-300">
              {quest.conceptExplanation.bulletPoints.map((pt, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-violet-400 font-bold">·</span>
                  <span>{pt}</span>
                </li>
              ))}
            </ul>

            {/* Syntax snippet preview */}
            <div className="rounded-xl bg-[#090D16] border border-[#1C253D] p-3.5 text-xs font-mono text-sky-300">
              <div className="text-[10px] text-slate-500 font-sans uppercase mb-1">Syntax Blueprint</div>
              <pre className="overflow-x-auto">{quest.conceptExplanation.syntaxSnippet}</pre>
            </div>
          </div>

          {/* Mission Objective Card */}
          <div className="rounded-2xl bg-[#141E34] border border-[#273863] p-5 shadow-lg space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-sky-400 uppercase tracking-wider">
                Mission Objective
              </h2>
              {hasCelebrated && (
                <span className="flex items-center gap-1 text-xs text-emerald-400 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Achieved
                </span>
              )}
            </div>
            <p className="text-sm text-white font-medium">
              {quest.expectedOutcomeDescription}
            </p>
          </div>

          {/* Mascot Speech Bubble Card */}
          <div className="rounded-2xl bg-[#101728] border border-[#202B48] p-5 flex items-start gap-4">
            <MascotByte mood={mascotMood} size="md" />
            <div className="flex-1 text-xs sm:text-sm text-slate-200 leading-relaxed">
              <div className="text-[11px] font-bold text-violet-400 mb-1">Byte says:</div>
              <p>{quest.mascotTip}</p>
            </div>
          </div>

          {/* Friendly Hint Toggle */}
          <div className="rounded-2xl bg-[#0E1322] border border-[#1E293B] p-4">
            <button
              onClick={() => {
                if (!showHint) playHintPing(soundEnabled);
                setShowHint(!showHint);
              }}
              className="w-full flex items-center justify-between text-xs font-medium text-amber-300 hover:text-amber-200 transition-colors focus:outline-none"
              aria-expanded={showHint}
            >
              <span className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-400" />
                {showHint ? 'Hide Hint' : 'Need a gentle hint?'}
              </span>
              <span className="text-xs text-slate-400">{showHint ? '▲' : '▼'}</span>
            </button>
            {showHint && (
              <div className="mt-3 pt-3 border-t border-[#1C253D] text-xs text-slate-300 leading-relaxed bg-[#141B2E] p-3 rounded-lg">
                {quest.solutionHint}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Code Editor & Terminal (7 cols on lg) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Code Editor Container */}
          <div className="rounded-2xl bg-[#101726] border border-[#24304F] shadow-2xl overflow-hidden flex flex-col">
            {/* Editor Header */}
            <div className="bg-[#0C111C] border-b border-[#1E293B] px-4 py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 mr-2">
                  <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                </div>
                <span className="text-xs font-mono text-slate-400 font-medium">quest_solution.js</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleResetCode}
                  className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 px-2 py-1 rounded hover:bg-[#1A233A] transition-colors focus:outline-none"
                  title="Reset code to original starter"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              </div>
            </div>

            {/* Code Input Area with Line Numbers */}
            <div className="relative flex min-h-[220px] bg-[#0A0E17] font-mono text-sm leading-6">
              {/* Line Numbers Column */}
              <div
                className="select-none py-4 px-3 text-right text-slate-600 bg-[#090D15] border-r border-[#172033] font-mono text-xs tabular-nums"
                aria-hidden="true"
              >
                {code.split('\n').map((_, i) => (
                  <div key={i}>{i + 1}</div>
                ))}
              </div>

              {/* Textarea */}
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                spellCheck={false}
                autoCapitalize="off"
                autoComplete="off"
                autoCorrect="off"
                className="flex-1 w-full bg-transparent p-4 text-sky-200 outline-none resize-none font-mono text-sm focus:ring-0 leading-6 selection:bg-violet-600 selection:text-white"
                placeholder="// Type your JavaScript code here..."
                aria-label="JavaScript Code Editor"
              />
            </div>

            {/* Helper quick-chips for mobile/easy tap */}
            {quest.starterChips && quest.starterChips.length > 0 && (
              <div className="bg-[#0D121F] border-t border-[#1C253D] px-4 py-2 flex items-center gap-2 flex-wrap">
                <span className="text-[11px] text-slate-500 font-sans">Quick insert:</span>
                {quest.starterChips.map((chip, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleInsertSnippet(chip)}
                    className="font-mono text-xs px-2.5 py-1 rounded bg-[#162035] hover:bg-[#202D4A] border border-[#243354] text-slate-300 hover:text-sky-300 transition-colors focus:outline-none"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            )}

            {/* Editor Action Bar */}
            <div className="bg-[#0C111C] border-t border-[#1E293B] p-4 flex items-center justify-between gap-4">
              <span className="text-xs text-slate-400 hidden sm:inline">
                Press <kbd className="px-1.5 py-0.5 rounded bg-[#1A233A] text-slate-300 text-[11px] border border-[#2D3A5D]">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 rounded bg-[#1A233A] text-slate-300 text-[11px] border border-[#2D3A5D]">Enter</kbd> to run
              </span>

              <button
                onClick={handleRunCode}
                disabled={isRunning}
                className="ml-auto inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-sky-500 hover:from-violet-500 hover:via-indigo-500 hover:to-sky-400 text-white font-bold text-sm shadow-lg shadow-violet-950/50 transition-all duration-200 transform active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 disabled:opacity-50"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>{isRunning ? 'Running...' : 'Run Code'}</span>
              </button>
            </div>
          </div>

          {/* Interactive Console Terminal Output */}
          <div className="rounded-2xl bg-[#090D17] border border-[#1E293B] shadow-xl overflow-hidden">
            <div className="bg-[#070A12] border-b border-[#182236] px-4 py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-mono text-slate-400 font-medium">Console Output</span>
              </div>
              <span className="text-[11px] text-slate-400">stdout</span>
            </div>

            <div className="p-4 font-mono text-xs min-h-[90px] max-h-48 overflow-y-auto space-y-1">
              {executionResult ? (
                executionResult.logs.length > 0 ? (
                  executionResult.logs.map((log, index) => (
                    <div key={index} className="flex items-start gap-2 text-emerald-300">
                      <span className="text-slate-600 select-none">&gt;</span>
                      <span className="whitespace-pre-wrap">{log}</span>
                    </div>
                  ))
                ) : executionResult.error ? (
                  <div className="text-rose-400 flex items-start gap-2">
                    <span className="text-slate-600 select-none">&gt;</span>
                    <span>{executionResult.error}</span>
                  </div>
                ) : (
                  <div className="text-slate-500 italic">No output logged to console.</div>
                )
              ) : (
                <div className="text-slate-500 italic">
                  Press "Run Code" to execute and see console output here.
                </div>
              )}
            </div>
          </div>

          {/* Feedback & Result Alert */}
          {executionResult && (
            <div
              className={`rounded-2xl p-5 border transition-all ${
                executionResult.success
                  ? 'bg-gradient-to-br from-[#0F2922] via-[#0D221D] to-[#0A1A16] border-emerald-500/50 shadow-xl shadow-emerald-950/30'
                  : 'bg-gradient-to-br from-[#2D161B] to-[#1C0E12] border-rose-500/40'
              }`}
            >
              <div className="flex items-start gap-3">
                {executionResult.success ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                )}

                <div className="flex-1">
                  <h3 className={`text-sm font-bold ${executionResult.success ? 'text-emerald-300' : 'text-rose-300'}`}>
                    {executionResult.success ? 'Quest Accomplished! 🎉' : 'Almost there!'}
                  </h3>
                  <p className="text-xs text-slate-200 mt-1 leading-relaxed">
                    {executionResult.feedback}
                  </p>

                  {/* If win: Show Action to Proceed */}
                  {executionResult.success && (
                    <div className="mt-4 pt-3 border-t border-emerald-800/40 flex items-center justify-between flex-wrap gap-3">
                      <div className="flex items-center gap-1.5 text-xs text-amber-300 font-semibold tabular-nums">
                        <Sparkles className="w-4 h-4 text-amber-400 fill-amber-400" />
                        <span>+{quest.xpReward} XP Collected!</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {hasNextQuest ? (
                          <button
                            onClick={() => {
                              playButtonPop(soundEnabled);
                              if (onNextQuest) onNextQuest();
                            }}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition-all active:scale-95"
                          >
                            <span>Next Quest</span>
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              playButtonPop(soundEnabled);
                              onBack();
                            }}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-md transition-all active:scale-95"
                          >
                            <span>Return to Dashboard</span>
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
