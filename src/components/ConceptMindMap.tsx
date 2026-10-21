/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { MindMapNode } from '../types/concept';
import { Code2, ChevronDown, ChevronUp, Eye, List, Network } from 'lucide-react';

interface ConceptMindMapProps {
  centralLabel: string;
  nodes: MindMapNode[];
  onSelectNode?: (node: MindMapNode) => void;
  className?: string;
}

export const ConceptMindMap: React.FC<ConceptMindMapProps> = ({
  centralLabel,
  nodes,
  onSelectNode,
  className = '',
}) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string>(nodes[0]?.id || '');
  const [showCodeExample, setShowCodeExample] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'graphical' | 'outline'>('graphical');

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) || nodes[0];

  const handleSelect = (node: MindMapNode) => {
    setSelectedNodeId(node.id);
    if (onSelectNode) onSelectNode(node);
  };

  return (
    <div className={`rounded-lg bg-slate-900 border border-slate-800 p-4 space-y-4 ${className}`}>
      {/* Mind Map Header & Accessibility View Toggle */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-400">
            Concept Mind Map
          </span>
          <span className="text-slate-600">·</span>
          <span className="text-xs text-slate-400">Click a node to explore</span>
        </div>

        {/* Accessible fallback toggle */}
        <button
          type="button"
          onClick={() => setViewMode(viewMode === 'graphical' ? 'outline' : 'graphical')}
          className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 rounded px-1.5 py-0.5"
          aria-label={viewMode === 'graphical' ? 'Switch to text outline' : 'Switch to graphical mind map'}
        >
          {viewMode === 'graphical' ? (
            <>
              <List className="w-3 h-3 text-slate-400" />
              <span>Text Outline</span>
            </>
          ) : (
            <>
              <Network className="w-3 h-3 text-indigo-400" />
              <span>Graphical Map</span>
            </>
          )}
        </button>
      </div>

      {/* Mode A: Graphical Mind Map */}
      {viewMode === 'graphical' && (
        <div className="space-y-4">
          {/* Visual Canvas Diagram */}
          <div className="relative py-2 px-2 flex flex-col items-center">
            {/* 1. Central Prominent Concept Node */}
            <div
              className="z-10 px-5 py-2 rounded-full bg-indigo-600 text-white font-bold text-xs sm:text-sm tracking-wide shadow-md border-2 border-indigo-400/50 flex items-center gap-2"
              role="heading"
              aria-level={3}
            >
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              <span>{centralLabel}</span>
            </div>

            {/* Connecting Lines (Desktop/Tablet SVG layout) */}
            <div className="w-full max-w-lg h-7 hidden sm:flex items-center justify-center relative">
              <svg
                className="w-full h-full overflow-visible"
                viewBox="0 0 400 30"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                {/* Center trunk down to branch line */}
                <line x1="200" y1="0" x2="200" y2="15" stroke="#334155" strokeWidth="2" strokeDasharray="3 3" />
                {/* Horizontal branch span */}
                <line x1="40" y1="15" x2="360" y2="15" stroke="#334155" strokeWidth="2" />
                {/* Drops down to each child node position */}
                {nodes.map((_, i) => {
                  const step = nodes.length > 1 ? 320 / (nodes.length - 1) : 0;
                  const x = 40 + i * step;
                  return (
                    <g key={i}>
                      <line x1={x} y1="15" x2={x} y2="30" stroke="#475569" strokeWidth="2" />
                      <circle cx={x} cy="30" r="3" fill="#6366f1" />
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Mobile connector spacer */}
            <div className="sm:hidden w-0.5 h-3 bg-slate-700 my-1" aria-hidden="true" />

            {/* 2. Sub-concept Nodes Row/Grid */}
            <div
              className="w-full grid grid-cols-2 sm:flex sm:flex-wrap items-center justify-center gap-2 sm:gap-3 z-10"
              role="radiogroup"
              aria-label={`${centralLabel} sub-concepts`}
            >
              {nodes.map((node) => {
                const isSelected = selectedNode?.id === node.id;
                return (
                  <button
                    key={node.id}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => handleSelect(node)}
                    className={`px-3 py-2 rounded-lg border text-left text-xs transition-all focus-visible:ring-2 focus-visible:ring-indigo-500 flex flex-col justify-between ${
                      isSelected
                        ? 'bg-indigo-950/50 border-indigo-500 text-slate-100 shadow-sm ring-1 ring-indigo-500/50'
                        : 'bg-slate-950/80 hover:bg-slate-800 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1.5 w-full">
                      <span className="font-semibold font-mono truncate">{node.label}</span>
                      {node.badge && (
                        <span
                          className={`text-[9px] px-1 py-0.2 rounded font-sans font-medium shrink-0 ${
                            isSelected
                              ? 'bg-indigo-600/60 text-indigo-200'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {node.badge}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Detail Explanation Pane for Selected Sub-concept */}
          {selectedNode && (
            <div
              className="rounded-lg bg-slate-950/90 border border-slate-800 p-3.5 space-y-2.5 transition-all text-xs"
              role="region"
              aria-live="polite"
              aria-label={`${selectedNode.label} explanation`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-100 font-mono text-sm">
                    {selectedNode.label}
                  </span>
                  {selectedNode.badge && (
                    <span className="text-[10px] text-indigo-400 bg-indigo-950/60 border border-indigo-900/40 px-1.5 py-0.2 rounded">
                      {selectedNode.badge}
                    </span>
                  )}
                </div>

                {selectedNode.exampleSnippet && (
                  <button
                    type="button"
                    onClick={() => setShowCodeExample(!showCodeExample)}
                    className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    <Code2 className="w-3 h-3 text-indigo-400" />
                    <span>{showCodeExample ? 'Hide example' : 'Show example'}</span>
                  </button>
                )}
              </div>

              <p className="text-slate-300 leading-relaxed text-xs">
                {selectedNode.shortDesc}
              </p>

              {/* Optional Tiny Code Example */}
              {selectedNode.exampleSnippet && showCodeExample && (
                <div className="rounded bg-[#070b12] border border-slate-800/80 p-2.5 font-mono text-xs text-indigo-300 overflow-x-auto">
                  <pre>{selectedNode.exampleSnippet}</pre>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Mode B: Accessible Semantic Text-Based Outline (Fallback) */}
      {viewMode === 'outline' && (
        <div className="space-y-3 p-1">
          <div className="text-xs font-semibold text-slate-200">
            Outline: {centralLabel}
          </div>
          <ol className="space-y-2.5 list-decimal list-inside text-xs text-slate-300">
            {nodes.map((node) => (
              <li key={node.id} className="p-2 rounded bg-slate-950 border border-slate-800/80 space-y-1">
                <span className="font-mono font-bold text-slate-100">{node.label}</span>
                {node.badge && (
                  <span className="ml-2 text-[10px] text-indigo-400 bg-indigo-950/50 px-1.5 py-0.5 rounded">
                    {node.badge}
                  </span>
                )}
                <p className="text-slate-400 text-[11px] mt-0.5">{node.shortDesc}</p>
                {node.exampleSnippet && (
                  <pre className="mt-1 p-2 rounded bg-[#070b12] border border-slate-800 text-[11px] font-mono text-indigo-300 overflow-x-auto">
                    {node.exampleSnippet}
                  </pre>
                )}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
};
