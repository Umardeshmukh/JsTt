/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ConceptRecord } from '../types/concept';
import { ConceptMindMap } from './ConceptMindMap';
import { Code2, BookOpen, AlertCircle, Lightbulb, ChevronDown, ChevronUp, ArrowDown } from 'lucide-react';

interface ConceptOverviewProps {
  concept: ConceptRecord;
  onJumpToExercise?: () => void;
  defaultExpanded?: boolean;
}

export const ConceptOverview: React.FC<ConceptOverviewProps> = ({
  concept,
  onJumpToExercise,
  defaultExpanded = true,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(defaultExpanded);

  return (
    <div className="rounded-lg bg-slate-900 border border-slate-800 p-4 space-y-4">
      {/* Header with Collapse / Expand Toggle */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-indigo-400" />
          <h2 className="text-sm font-bold text-slate-100">
            {concept.title} Concept Overview
          </h2>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 rounded px-1.5 py-0.5"
          aria-expanded={isExpanded}
        >
          <span>{isExpanded ? 'Collapse' : 'Expand'}</span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {isExpanded && (
        <div className="space-y-4">
          {/* Step 1: Small Graphical Mind Map */}
          <ConceptMindMap
            centralLabel={concept.mindMap.centralLabel}
            nodes={concept.mindMap.nodes}
          />

          {/* Step 2: Plain-English Definition (<= 25 words) */}
          <div className="space-y-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Definition
            </span>
            <p className="text-sm font-medium text-slate-100 leading-relaxed">
              {concept.shortDefinition}
            </p>
          </div>

          {/* Step 3: Short JavaScript Code Example */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                Code Example
              </span>
              <span className="text-[10px] font-mono text-indigo-400">JavaScript</span>
            </div>
            <div className="rounded bg-slate-950 border border-slate-800/90 p-3 font-mono text-xs text-indigo-300 overflow-x-auto leading-relaxed">
              <pre>{concept.codeExample}</pre>
            </div>
          </div>

          {/* Step 4: Practical Real-World Analogy */}
          {concept.analogy && (
            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-950/70 border border-slate-800/70 text-xs">
              <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-semibold text-slate-200 block text-[11px]">Real-World Analogy:</span>
                <p className="text-slate-300 leading-relaxed">{concept.analogy}</p>
              </div>
            </div>
          )}

          {/* Key Takeaway & Common Beginner Mistake */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/70 text-xs space-y-1">
              <span className="font-semibold text-indigo-400 block text-[11px]">Key Takeaway</span>
              <p className="text-slate-300 leading-relaxed text-[11px]">{concept.keyTakeaway}</p>
            </div>

            {concept.commonMistake && (
              <div className="p-3 rounded-lg bg-rose-950/20 border border-rose-900/30 text-xs space-y-1">
                <div className="flex items-center gap-1.5 text-rose-400 text-[11px] font-semibold">
                  <AlertCircle className="w-3 h-3" />
                  <span>Common Beginner Mistake</span>
                </div>
                <p className="text-slate-300 leading-relaxed text-[11px]">{concept.commonMistake}</p>
              </div>
            )}
          </div>

          {/* Jump to Exercise Action (Section 5: "After exploring the map, the learner should be able to start the exercise immediately") */}
          {onJumpToExercise && (
            <div className="pt-1 flex justify-end">
              <button
                type="button"
                onClick={onJumpToExercise}
                className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 rounded p-1"
              >
                <span>Jump to Question</span>
                <ArrowDown className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
