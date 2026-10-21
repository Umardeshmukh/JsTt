import React, { useState, useEffect } from 'react';
import { Quest } from '../types';
import { MascotByte } from './MascotByte';
import { BookOpen, Copy, Check, Play, X, Sparkles, Code2 } from 'lucide-react';
import { playButtonPop } from '../utils/sound';

interface QuickRefresherModalProps {
  quest: Quest;
  onClose: () => void;
  onPracticeInSandbox: (quest: Quest) => void;
  soundEnabled: boolean;
}

export const QuickRefresherModal: React.FC<QuickRefresherModalProps> = ({
  quest,
  onClose,
  onPracticeInSandbox,
  soundEnabled,
}) => {
  const [copied, setCopied] = useState(false);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(quest.conceptExplanation.syntaxSnippet);
      setCopied(true);
      playButtonPop(soundEnabled);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard fallback
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="refresher-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-lg rounded-2xl bg-gradient-to-br from-[#161E33] via-[#121828] to-[#0D1220] border-2 border-violet-500/50 shadow-2xl p-6 sm:p-7 space-y-5">
        {/* Close Button */}
        <button
          onClick={() => {
            playButtonPop(soundEnabled);
            onClose();
          }}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1E293B] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
          aria-label="Close refresher modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Tag & Title */}
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-violet-400 mb-1.5">
            <BookOpen className="w-4 h-4 text-violet-400" />
            <span>QUICK REFRESHER · LESSON {quest.number}</span>
          </div>
          <h2 id="refresher-title" className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {quest.title}
          </h2>
          <p className="text-xs sm:text-sm font-medium text-sky-300 mt-1">
            {quest.conceptHeadline}
          </p>
        </div>

        {/* Mascot Advice Box */}
        <div className="p-3.5 rounded-xl bg-[#0F1626] border border-[#202B47] flex items-start gap-3.5">
          <MascotByte mood="happy" size="sm" />
          <div className="text-xs text-slate-200 leading-relaxed">
            <span className="font-bold text-violet-300">Byte's Cheat-Sheet Tip: </span>
            {quest.mascotTip}
          </div>
        </div>

        {/* Core Concept Breakdown */}
        <div className="space-y-2.5">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Core Takeaways</span>
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {quest.conceptExplanation.summary}
          </p>
          <ul className="space-y-1.5 text-xs text-slate-300 pt-1">
            {quest.conceptExplanation.bulletPoints.map((pt, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-violet-400 font-bold">·</span>
                <span>{pt}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Syntax Blueprint with Copy Action */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Code2 className="w-3.5 h-3.5 text-sky-400" />
              <span>Syntax Blueprint</span>
            </span>
            <button
              onClick={handleCopyCode}
              className="flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-white px-2 py-0.5 rounded bg-[#162035] hover:bg-[#1E2B47] transition-colors focus:outline-none"
              title="Copy snippet to clipboard"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-semibold">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          <div className="rounded-xl bg-[#090D17] border border-[#1F2C4C] p-3.5 font-mono text-xs text-sky-300 overflow-x-auto">
            <pre>{quest.conceptExplanation.syntaxSnippet}</pre>
          </div>
        </div>

        {/* Source Documentation & Attribution */}
        {quest.sourceUrl && (
          <div className="rounded-xl bg-[#0F1626]/80 border border-[#1D2742] p-3 flex items-center justify-between gap-3 text-xs">
            <div className="text-slate-400">
              <span className="font-semibold text-slate-300">Curriculum Source: </span>
              <span>{quest.sourceName || 'Approved Documentation'}</span>
            </div>
            <a
              href={quest.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-violet-400 hover:text-violet-300 underline font-medium inline-flex items-center gap-1 shrink-0"
            >
              <span>Read Source</span>
              <span aria-hidden="true">↗</span>
            </a>
          </div>
        )}

        {/* Footer Actions */}
        <div className="pt-3 border-t border-[#1E293B] flex items-center justify-between gap-3">
          <button
            onClick={() => {
              playButtonPop(soundEnabled);
              onClose();
            }}
            className="py-2.5 px-4 rounded-xl bg-[#161F33] hover:bg-[#1E2A45] text-slate-300 hover:text-white text-xs font-semibold transition-colors focus:outline-none"
          >
            Close
          </button>

          <button
            onClick={() => {
              playButtonPop(soundEnabled);
              onPracticeInSandbox(quest);
            }}
            className="inline-flex items-center gap-2 py-2.5 px-5 rounded-xl bg-gradient-to-r from-violet-600 to-sky-500 hover:from-violet-500 hover:to-sky-400 text-white text-xs font-bold shadow-md shadow-violet-950/40 transition-all active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Practice in Sandbox</span>
          </button>
        </div>
      </div>
    </div>
  );
};
