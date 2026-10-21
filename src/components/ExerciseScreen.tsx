import React, { useState, useEffect, useRef } from 'react';
import { Quest } from '../types';
import { DynamicExercise } from '../types/exercise';
import {
  ArrowLeft,
  Play,
  RotateCcw,
  Lightbulb,
  CheckCircle2,
  AlertCircle,
  Terminal,
  ArrowRight,
  Code2,
} from 'lucide-react';
import { playButtonPop, playSuccessChime, playErrorBuzz, playHintPing } from '../utils/sound';
import { getConceptById, mapTopicToConceptId } from '../data/concepts';
import { ConceptOverview } from './ConceptOverview';

export type ExerciseItem =
  | { type: 'quest'; data: Quest }
  | { type: 'dynamic'; data: DynamicExercise };

interface ExerciseScreenProps {
  item: ExerciseItem;
  lessonTitle: string;
  learningObjective: string;
  isCompleted: boolean;
  onBack: () => void;
  onCheckQuest: (code: string) => Promise<{ success: boolean; logs: string[]; error?: string; feedback: string; awardedXp: number }>;
  onCheckDynamic: (userAnswer: string | string[]) => Promise<{ isCorrect: boolean; feedback: string; awardedXp: number }>;
  onContinue: () => void;
  hasNext: boolean;
  soundEnabled: boolean;
}

export const ExerciseScreen: React.FC<ExerciseScreenProps> = ({
  item,
  lessonTitle,
  learningObjective,
  isCompleted,
  onBack,
  onCheckQuest,
  onCheckDynamic,
  onContinue,
  hasNext,
  soundEnabled,
}) => {
  const isQuest = item.type === 'quest';
  const quest = isQuest ? (item.data as Quest) : null;
  const dynamic = !isQuest ? (item.data as DynamicExercise) : null;

  // Quest State
  const [code, setCode] = useState<string>(quest?.starterCode || '');
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);
  const [consoleError, setConsoleError] = useState<string | null>(null);

  // Dynamic Exercise State
  const [selectedOptionId, setSelectedOptionId] = useState<string>('');
  const [textAnswer, setTextAnswer] = useState<string>('');
  const [arrangedLines, setArrangedLines] = useState<string[]>([]);

  // Common UI State
  const [showHint, setShowHint] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [result, setResult] = useState<{
    checked: boolean;
    isCorrect: boolean;
    feedback: string;
    awardedXp: number;
  }>({
    checked: false,
    isCorrect: false,
    feedback: '',
    awardedXp: 0,
  });

  const continueButtonRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset/Initialize state when item changes
  useEffect(() => {
    setShowHint(false);
    setIsChecking(false);
    setResult({
      checked: false,
      isCorrect: false,
      feedback: '',
      awardedXp: 0,
    });

    if (isQuest && quest) {
      setCode(quest.starterCode);
      setConsoleLogs([]);
      setConsoleError(null);
    } else if (dynamic) {
      setSelectedOptionId('');
      setTextAnswer('');
      if (dynamic.exerciseType === 'arrange_order' && Array.isArray(dynamic.correctAnswer)) {
        // Scramble or set initial options
        const initial = dynamic.options ? dynamic.options.map((o) => o.id) : [...dynamic.correctAnswer].reverse();
        setArrangedLines(initial);
      }
    }
  }, [item, isQuest, quest, dynamic]);

  // Focus continue button when exercise is solved
  useEffect(() => {
    if (result.checked && result.isCorrect) {
      continueButtonRef.current?.focus();
    }
  }, [result]);

  // Global Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + Enter to Check / Run
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        if (result.checked && result.isCorrect) {
          handleContinue();
        } else if (!isChecking) {
          handleCheckAnswer();
        }
        return;
      }

      // Enter key to continue when solved
      if (e.key === 'Enter' && result.checked && result.isCorrect) {
        e.preventDefault();
        handleContinue();
        return;
      }

      // 1-4 keys to select multiple-choice option (if not focused on an input/textarea)
      if (
        dynamic &&
        dynamic.options &&
        dynamic.options.length > 0 &&
        !['TEXTAREA', 'INPUT'].includes((e.target as HTMLElement)?.tagName)
      ) {
        const num = parseInt(e.key, 10);
        if (num >= 1 && num <= dynamic.options.length) {
          e.preventDefault();
          const targetOpt = dynamic.options[num - 1];
          if (targetOpt) {
            setSelectedOptionId(targetOpt.id);
            playButtonPop(soundEnabled);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [code, selectedOptionId, textAnswer, arrangedLines, isChecking, result, dynamic, soundEnabled]);

  const handleCheckAnswer = async () => {
    if (isChecking) return;
    setIsChecking(true);
    playButtonPop(soundEnabled);

    try {
      if (isQuest && quest) {
        const res = await onCheckQuest(code);
        setConsoleLogs(res.logs || []);
        setConsoleError(res.error || null);
        setResult({
          checked: true,
          isCorrect: res.success,
          feedback: res.feedback,
          awardedXp: res.awardedXp,
        });

        if (res.success) {
          playSuccessChime(soundEnabled);
        } else {
          playErrorBuzz(soundEnabled);
        }
      } else if (dynamic) {
        let answerToSend: string | string[] = selectedOptionId;
        if (dynamic.exerciseType === 'fill_blank') {
          answerToSend = textAnswer;
        } else if (dynamic.exerciseType === 'arrange_order') {
          answerToSend = arrangedLines;
        }

        const res = await onCheckDynamic(answerToSend);
        setResult({
          checked: true,
          isCorrect: res.isCorrect,
          feedback: res.feedback,
          awardedXp: res.awardedXp,
        });

        if (res.isCorrect) {
          playSuccessChime(soundEnabled);
        } else {
          playErrorBuzz(soundEnabled);
        }
      }
    } catch {
      setResult({
        checked: true,
        isCorrect: false,
        feedback: 'Unable to evaluate answer right now. Please check your syntax and try again.',
        awardedXp: 0,
      });
      playErrorBuzz(soundEnabled);
    } finally {
      setIsChecking(false);
    }
  };

  const handleResetCode = () => {
    playButtonPop(soundEnabled);
    if (quest) {
      setCode(quest.starterCode);
      setConsoleLogs([]);
      setConsoleError(null);
    }
    setResult({
      checked: false,
      isCorrect: false,
      feedback: '',
      awardedXp: 0,
    });
  };

  const handleContinue = () => {
    playButtonPop(soundEnabled);
    onContinue();
  };

  const hintText = quest?.solutionHint || (dynamic?.hints && dynamic.hints[0]) || 'Review the syntax and expected output carefully.';

  // Can submit check?
  const canCheck = isQuest
    ? code.trim().length > 0
    : dynamic?.exerciseType === 'fill_blank'
    ? textAnswer.trim().length > 0
    : dynamic?.exerciseType === 'arrange_order'
    ? arrangedLines.length > 0
    : !!selectedOptionId;

  const questionSectionRef = useRef<HTMLDivElement>(null);

  const conceptId = isQuest
    ? mapTopicToConceptId(quest?.id || quest?.title || '')
    : mapTopicToConceptId(dynamic?.conceptId || dynamic?.id || '');
  const currentConcept = getConceptById(conceptId);

  const handleJumpToQuestion = () => {
    questionSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col">
      {/* 1. Header Bar: Distraction-free navigation */}
      <header className="sticky top-0 z-30 bg-[#090d16]/95 backdrop-blur border-b border-slate-800 px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        <button
          onClick={() => {
            playButtonPop(soundEnabled);
            onBack();
          }}
          className="min-h-[38px] flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-white py-1.5 px-2.5 rounded-md hover:bg-slate-800 transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 touch-manipulation shrink-0"
          aria-label="Back to lessons"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Back to Lessons</span>
          <span className="sm:hidden">Back</span>
        </button>

        <div className="text-xs text-slate-400 truncate max-w-[130px] sm:max-w-md text-center">
          <span className="font-semibold text-slate-200 truncate">{lessonTitle}</span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isCompleted && (
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded">
              <CheckCircle2 className="w-3 h-3" />
              Completed
            </span>
          )}
          <span className="text-xs font-mono text-indigo-400 bg-indigo-950/30 border border-indigo-900/40 px-2 py-0.5 rounded">
            +{quest?.xpReward || (dynamic ? 25 : 30)} XP
          </span>
        </div>
      </header>

      {/* 2. Main Exercise Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 flex flex-col gap-6">
        {/* Lesson Objective Banner */}
        <div className="border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 mb-1">
            <Code2 className="w-3.5 h-3.5" />
            <span>LEARNING OBJECTIVE</span>
          </div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-100 tracking-tight">
            {quest?.conceptHeadline || dynamic?.title || lessonTitle}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
            {learningObjective || quest?.conceptExplanation.summary || dynamic?.question}
          </p>
        </div>

        {/* Learning Format Steps 1-4: Concept Mind Map, Short Explanation, Code Example, Analogy */}
        <ConceptOverview
          concept={currentConcept}
          onJumpToExercise={handleJumpToQuestion}
          defaultExpanded={true}
        />

        {/* Learning Format Step 5: Interactive Question */}
        <div ref={questionSectionRef} className="scroll-mt-16">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
            <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center font-mono text-[11px]">5</span>
            <span>Interactive Question</span>
          </div>
        </div>
        {isQuest && quest && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Left: Code Challenge & Requirements (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="rounded-lg bg-slate-900 border border-slate-800 p-4 space-y-3">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Instructions
                </h2>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {quest.expectedOutcomeDescription}
                </p>

                {quest.conceptExplanation?.syntaxSnippet && (
                  <div className="rounded bg-slate-950 border border-slate-800/80 p-2.5">
                    <span className="text-[10px] text-slate-500 font-mono block mb-1">SYNTAX EXAMPLE</span>
                    <pre className="text-xs font-mono text-indigo-300 overflow-x-auto">
                      {quest.conceptExplanation.syntaxSnippet}
                    </pre>
                  </div>
                )}
              </div>

              {/* Progressive Hint Toggle */}
              <div className="rounded-lg bg-slate-900 border border-slate-800 p-3">
                <button
                  type="button"
                  onClick={() => {
                    if (!showHint) playHintPing(soundEnabled);
                    setShowHint(!showHint);
                  }}
                  className="w-full flex items-center justify-between text-xs text-slate-400 hover:text-slate-200 transition-colors focus:outline-none"
                  aria-expanded={showHint}
                >
                  <span className="flex items-center gap-1.5 font-medium">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                    <span>{showHint ? 'Hide Hint' : 'Need a hint?'}</span>
                  </span>
                  <span className="text-[11px] text-slate-500">{showHint ? '▲' : '▼'}</span>
                </button>
                {showHint && (
                  <div className="mt-2.5 pt-2.5 border-t border-slate-800 text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-2.5 rounded">
                    {hintText}
                  </div>
                )}
              </div>
            </div>

            {/* Right: Code Editor & Terminal (7 cols) */}
            <div className="lg:col-span-7 space-y-3">
              <div className="rounded-lg bg-slate-900 border border-slate-800 overflow-hidden flex flex-col shadow-sm">
                {/* Editor Header */}
                <div className="bg-slate-950 border-b border-slate-800 px-3 py-2 flex items-center justify-between text-xs">
                  <span className="font-mono text-slate-400 font-medium">solution.js</span>
                  <button
                    onClick={handleResetCode}
                    className="flex items-center gap-1 text-slate-400 hover:text-slate-200 px-1.5 py-0.5 rounded transition-colors"
                    title="Reset to starter code"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset</span>
                  </button>
                </div>

                {/* Textarea with Line Numbers */}
                <div className="relative flex min-h-[170px] bg-[#070b12] font-mono text-xs sm:text-sm leading-6">
                  <div
                    className="select-none py-3 px-2 text-right text-slate-600 bg-[#06090f] border-r border-slate-800/80 font-mono text-xs tabular-nums"
                    aria-hidden="true"
                  >
                    {code.split('\n').map((_, i) => (
                      <div key={i}>{i + 1}</div>
                    ))}
                  </div>
                  <textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    spellCheck={false}
                    autoCapitalize="off"
                    autoComplete="off"
                    autoCorrect="off"
                    className="flex-1 w-full bg-transparent p-3 text-slate-100 outline-none resize-none font-mono text-xs sm:text-sm focus:ring-0 leading-6"
                    placeholder="// Write your JavaScript code here..."
                    aria-label="JavaScript Code Editor"
                  />
                </div>

                {/* Quick insert chips */}
                {quest.starterChips && quest.starterChips.length > 0 && (
                  <div className="bg-slate-950/70 border-t border-slate-800/80 px-3 py-2 flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] text-slate-500 font-medium">Quick insert:</span>
                    {quest.starterChips.map((chip, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          playButtonPop(soundEnabled);
                          setCode((prev) => prev + (prev.endsWith('\n') || prev.length === 0 ? '' : ' ') + chip);
                        }}
                        className="font-mono text-xs px-2.5 py-1 min-h-[32px] rounded bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-slate-200 transition-colors touch-manipulation"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Console Output (Terminal) */}
              <div className="rounded-lg bg-slate-950 border border-slate-800 overflow-hidden">
                <div className="bg-slate-900 border-b border-slate-800 px-3 py-1.5 flex items-center justify-between text-[11px] text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Terminal className="w-3 h-3 text-slate-400" />
                    <span>Console Output</span>
                  </div>
                  <span>stdout</span>
                </div>
                <div className="p-3 font-mono text-xs min-h-[60px] max-h-36 overflow-y-auto space-y-1">
                  {consoleLogs.length > 0 ? (
                    consoleLogs.map((log, i) => (
                      <div key={i} className="text-emerald-400 flex items-start gap-1.5">
                        <span className="text-slate-600 select-none">&gt;</span>
                        <span className="whitespace-pre-wrap">{log}</span>
                      </div>
                    ))
                  ) : consoleError ? (
                    <div className="text-rose-400 flex items-start gap-1.5">
                      <span className="text-slate-600 select-none">&gt;</span>
                      <span>{consoleError}</span>
                    </div>
                  ) : (
                    <div className="text-slate-600 italic">No output. Press "Run Code" to execute.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Dynamic / Conceptual Questions */}
        {!isQuest && dynamic && (
          <div className="space-y-4 max-w-3xl">
            {/* Question Text & Code Snippet */}
            <div className="rounded-lg bg-slate-900 border border-slate-800 p-4 space-y-3">
              <h2 className="text-sm sm:text-base font-semibold text-slate-100 leading-snug">
                {dynamic.question}
              </h2>

              {dynamic.codeSnippet && (
                <div className="rounded bg-slate-950 border border-slate-800 p-3">
                  <pre className="text-xs sm:text-sm font-mono text-indigo-300 overflow-x-auto whitespace-pre-wrap">
                    {dynamic.codeSnippet}
                  </pre>
                </div>
              )}
            </div>

            {/* Answer Controls tailored to exercise type */}
            {dynamic.options && dynamic.options.length > 0 && (
              <div className="space-y-2" role="radiogroup" aria-label="Answer options">
                {dynamic.options.map((opt, idx) => {
                  const isSelected = selectedOptionId === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => {
                        setSelectedOptionId(opt.id);
                        playButtonPop(soundEnabled);
                      }}
                      className={`w-full flex items-start gap-3 p-3.5 min-h-[48px] rounded-lg border text-left text-xs sm:text-sm touch-manipulation transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                        isSelected
                          ? 'bg-indigo-950/50 border-indigo-500 text-slate-100 ring-1 ring-indigo-500/50'
                          : 'bg-slate-900 hover:bg-slate-850 active:bg-slate-800 border-slate-800 text-slate-300'
                      }`}
                    >
                      <span
                        className={`w-5 h-5 rounded flex items-center justify-center text-xs font-mono shrink-0 font-bold mt-0.5 ${
                          isSelected
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <span className="flex-1 leading-relaxed font-mono">{opt.text}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Fill-in-the-blank input */}
            {dynamic.exerciseType === 'fill_blank' && (
              <div className="space-y-2">
                <label htmlFor="fill-blank-input" className="block text-xs font-medium text-slate-400">
                  Type your answer:
                </label>
                <input
                  id="fill-blank-input"
                  ref={inputRef}
                  type="text"
                  value={textAnswer}
                  onChange={(e) => setTextAnswer(e.target.value)}
                  placeholder="e.g. let, const, typeof..."
                  className="w-full max-w-md px-3.5 py-2.5 min-h-[44px] rounded-lg bg-slate-950 border border-slate-800 text-slate-100 font-mono text-base sm:text-sm outline-none focus:border-indigo-500"
                  autoFocus
                />
              </div>
            )}

            {/* Progressive Hint */}
            <div className="rounded-lg bg-slate-900 border border-slate-800 p-3">
              <button
                type="button"
                onClick={() => {
                  if (!showHint) playHintPing(soundEnabled);
                  setShowHint(!showHint);
                }}
                className="w-full flex items-center justify-between text-xs text-slate-400 hover:text-slate-200 transition-colors focus:outline-none min-h-[36px]"
                aria-expanded={showHint}
              >
                <span className="flex items-center gap-1.5 font-medium">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                  <span>{showHint ? 'Hide Hint' : 'Need a hint?'}</span>
                </span>
                <span className="text-[11px] text-slate-500">{showHint ? '▲' : '▼'}</span>
              </button>
              {showHint && (
                <div className="mt-2.5 pt-2.5 border-t border-slate-800 text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-2.5 rounded">
                  {hintText}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 4. Feedback Result Banner */}
        {result.checked && (
          <div
            role="status"
            className={`rounded-lg p-3.5 border transition-all ${
              result.isCorrect
                ? 'bg-emerald-950/30 border-emerald-800/80 text-emerald-300'
                : 'bg-rose-950/30 border-rose-800/80 text-rose-300'
            }`}
          >
            <div className="flex items-start gap-2.5">
              {result.isCorrect ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              )}
              <div className="flex-1 text-xs leading-relaxed">
                <div className="font-semibold mb-0.5">
                  {result.isCorrect ? 'Correct!' : 'Incorrect — Try again'}
                </div>
                <p className="text-slate-300">{result.feedback}</p>
                {result.isCorrect && result.awardedXp > 0 && (
                  <p className="text-emerald-400 font-mono mt-1 font-semibold">
                    +{result.awardedXp} XP Awarded
                  </p>
                )}
                {result.isCorrect && result.awardedXp === 0 && (
                  <p className="text-slate-400 font-mono mt-1">
                    Already completed · 0 new XP
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 5. Bottom Action Controls (Sticky on mobile for effortless thumb reach) */}
        <div className="sticky bottom-0 z-20 bg-[#090d16]/95 backdrop-blur-md border-t border-slate-800/90 py-3 px-4 -mx-4 sm:mx-0 sm:px-0 sm:py-4 sm:static flex items-center justify-between gap-3 mt-auto">
          <span className="text-xs text-slate-500 hidden sm:inline font-mono">
            Shortcut: <kbd className="px-1.5 py-0.5 bg-slate-900 border border-slate-800 rounded text-slate-400">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 bg-slate-900 border border-slate-800 rounded text-slate-400">Enter</kbd>
          </span>

          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto sm:ml-auto justify-end">
            {result.checked && result.isCorrect ? (
              <button
                ref={continueButtonRef}
                onClick={handleContinue}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 min-h-[44px] rounded-md bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-semibold text-xs sm:text-sm transition-colors focus-visible:ring-2 focus-visible:ring-emerald-400 touch-manipulation shadow-sm"
              >
                <span>{hasNext ? 'Continue to Next Lesson' : 'Return to Curriculum'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleCheckAnswer}
                disabled={isChecking || !canCheck}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 min-h-[44px] rounded-md bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-xs sm:text-sm transition-colors focus-visible:ring-2 focus-visible:ring-indigo-400 touch-manipulation shadow-sm"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>{isChecking ? 'Checking...' : isQuest ? 'Run Code' : 'Check Answer'}</span>
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
