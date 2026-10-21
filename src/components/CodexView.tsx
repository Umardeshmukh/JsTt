import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Code2,
  Sparkles,
  Globe,
  ExternalLink,
  RefreshCw,
  Cpu,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Check,
} from 'lucide-react';
import { LessonRecord, ApprovedSource } from '../types/lesson';

export const CodexView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'concepts' | 'architecture' | 'sources'>('concepts');
  const [sources, setSources] = useState<ApprovedSource[]>([]);
  const [lessons, setLessons] = useState<Record<string, LessonRecord>>({});
  const [selectedLesson, setSelectedLesson] = useState<LessonRecord | null>(null);
  const [ingestingKey, setIngestingKey] = useState<string | null>(null);
  const [ingestStatusMessage, setIngestStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Fetch sources and lessons from server
  useEffect(() => {
    fetchSources();
    fetchLessons();
  }, []);

  const fetchSources = async () => {
    try {
      const res = await fetch('/api/sources');
      const data = await res.json();
      if (data.success && data.sources) {
        setSources(data.sources);
      }
    } catch {
      // Offline fallback
    }
  };

  const fetchLessons = async () => {
    try {
      const res = await fetch('/api/lessons');
      const data = await res.json();
      if (data.success && data.lessons) {
        setLessons(data.lessons);
      }
    } catch {
      // Offline fallback
    }
  };

  const handleIngestSource = async (src: ApprovedSource) => {
    setIngestingKey(src.topicKey);
    setIngestStatusMessage(null);
    try {
      const res = await fetch('/api/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: src.url, topicKey: src.topicKey }),
      });
      const data = await res.json();
      if (data.success) {
        setIngestStatusMessage({
          type: 'success',
          text: `Successfully fetched and updated content from "${src.title.slice(0, 40)}..."!`,
        });
        if (data.lesson) {
          setLessons((prev) => ({ ...prev, [src.topicKey]: data.lesson }));
          setSelectedLesson(data.lesson);
        }
        await fetchSources();
      } else {
        setIngestStatusMessage({
          type: 'error',
          text: data.error || 'Failed to ingest documentation source.',
        });
      }
    } catch (err: any) {
      setIngestStatusMessage({
        type: 'error',
        text: `Network error during ingestion: ${err.message || String(err)}`,
      });
    } finally {
      setIngestingKey(null);
    }
  };

  const coreConcepts = [
    {
      title: 'Console Output & First Spell',
      code: 'console.log("Hello, World!");',
      explanation: 'Prints a message or computed value directly to the developer console. Text must always be enclosed in matching quotes (" or \').',
      tip: 'As Tpoint Tech teaches, this is the foundational first test that confirms your JavaScript runtime is alive.',
      source: 'Tpoint Tech & MDN',
    },
    {
      title: 'Variables with let',
      code: 'let hero = "Byte";\nlet energy = 100;',
      explanation: 'Creates a labeled memory box where you store data to reuse later. The equal sign (=) assigns the value into the box.',
      tip: 'Do not use quotes around the variable name when calling it!',
      source: 'MDN Grammar & Types',
    },
    {
      title: 'Dynamic Typing in Action',
      code: 'let power = 50;       // Holds a number\npower = "Overdrive"; // Changed to a string without error!',
      explanation: 'JavaScript features dynamic typing. Types are bound to values rather than variable containers, allowing values to change type at runtime.',
      tip: 'You can check any value\'s type at runtime using typeof (e.g., typeof power).',
      source: 'Tpoint Tech Tutorial',
    },
    {
      title: 'Numbers & Arithmetic',
      code: 'let sum = 50 + 50;\nlet power = 4 * 25;\nlet remaining = 100 - 15;',
      explanation: 'Numbers are written directly as digits without quotes. Standard operators include + (add), - (subtract), * (multiply), and / (divide).',
      tip: 'If you put quotes around a number like "42", JavaScript treats it as text, not math!',
      source: 'MDN Numbers Guide',
    },
    {
      title: 'String Concatenation (+)',
      code: 'let name = "Byte";\nlet welcome = "Online: " + name;\nconsole.log(welcome);',
      explanation: 'Using + between strings glues them together. Remember to leave spaces inside your quotes where needed.',
      tip: 'You can glue multiple words and variables together in a single sentence.',
      source: 'MDN Expressions & Operators',
    },
    {
      title: 'Template Literals (Backticks)',
      code: 'let bot = "Byte";\nlet xp = 150;\nconsole.log(`Hero ${bot} has ${xp} XP!`);',
      explanation: 'Wrapped in backticks (`), template literals allow inserting variables and expressions directly with ${variable} syntax.',
      tip: 'Template literals also naturally preserve multi-line text without escape characters.',
      source: 'MDN Template Strings',
    },
  ];

  const architecturalPillars = [
    {
      title: 'What is JavaScript?',
      badge: 'Lightweight & Interpreted',
      description:
        'JavaScript is a lightweight, object-oriented, and interpreted programming language. Code executes line-by-line via browser engines (like Chrome\'s V8 and Mozilla\'s SpiderMonkey) without an upfront compilation build step.',
      keyPoints: [
        'Minimal memory footprint designed for instant client-side execution.',
        'Single-threaded with an event loop for non-blocking asynchronous tasks.',
        'Interpreted & JIT-compiled for rapid interactive development.',
      ],
      attribution: 'Tpoint Tech JavaScript Tutorial (tpointtech.com/javascript-tutorial)',
    },
    {
      title: 'Dynamic Typing System',
      badge: 'Flexible Data Types',
      description:
        'JavaScript is dynamically typed: variable types are evaluated based on their stored values rather than explicit type declarations. A single variable can start with a numeric value and be reassigned to text.',
      keyPoints: [
        'No explicit type keywords (like int or String) required before variable names.',
        'typeof operator provides instant runtime type inspection.',
        'Allows rapid prototyping and adaptable data structures.',
      ],
      attribution: 'Tpoint Tech Features of JavaScript',
    },
    {
      title: 'Client-Side vs. Server-Side',
      badge: 'Full-Stack Execution',
      description:
        'JavaScript powers both ends of the modern web stack. On the client side, it manipulates the DOM and responds to clicks. On the server side, Node.js and Express handle databases and APIs.',
      keyPoints: [
        'Client-side: Native browser support, interactive animations, and DOM events.',
        'Server-side: High-throughput microservices and REST APIs via Node.js.',
        'Learn one universal language for frontend, backend, and web games.',
      ],
      attribution: 'Tpoint Tech Applications of JavaScript',
    },
    {
      title: 'Java vs. JavaScript: The Key Differences',
      badge: 'Clarifying the Myth',
      description:
        'Despite similar names, Java and JavaScript are completely distinct languages with different design philosophies, execution runtimes, and typing disciplines.',
      keyPoints: [
        'Java: Statically typed, compiled to bytecode, runs inside the Java Virtual Machine (JVM).',
        'JavaScript: Dynamically typed, interpreted/JIT, runs directly in browsers and Node.js.',
        'Name similarity is historical marketing; language syntax and paradigms are separate.',
      ],
      attribution: 'Tpoint Tech Differences & MCQ Analysis',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-[#1E293B] pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <BookOpen className="w-6 h-6 text-violet-400" />
              <h2 className="text-2xl font-black text-white tracking-tight">
                JavaScript Codex & Study Library
              </h2>
            </div>
            <p className="text-sm text-slate-400 mt-1">
              Your personal spellbook of fundamental concepts, grounded in Tpoint Tech & MDN documentation.
            </p>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-[#121826] border border-[#24304F] rounded-xl self-start sm:self-auto">
            <button
              onClick={() => setActiveTab('concepts')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'concepts'
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Bite-Sized Spells
            </button>
            <button
              onClick={() => setActiveTab('architecture')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'architecture'
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              JS Architecture (Tpoint Tech)
            </button>
            <button
              onClick={() => setActiveTab('sources')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'sources'
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Source Ingestion Hub
            </button>
          </div>
        </div>
      </div>

      {/* Ingestion Toast / Notification */}
      {ingestStatusMessage && (
        <div
          className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 text-xs ${
            ingestStatusMessage.type === 'success'
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
              : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {ingestStatusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{ingestStatusMessage.text}</span>
          </div>
          <button
            onClick={() => setIngestStatusMessage(null)}
            className="text-xs hover:underline shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Tab 1: Core Concepts */}
      {activeTab === 'concepts' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {coreConcepts.map((concept, idx) => (
            <div
              key={idx}
              className="rounded-xl bg-[#121826] border border-[#24304F] p-5 flex flex-col justify-between hover:border-violet-500/40 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-violet-400 mb-2">
                  <div className="flex items-center gap-1.5">
                    <Code2 className="w-3.5 h-3.5" />
                    <span>SPELL 0{idx + 1}</span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-normal">
                    {concept.source}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white mb-2">
                  {concept.title}
                </h3>

                <div className="rounded-lg bg-[#0A0E17] border border-[#1A233A] p-3 font-mono text-xs text-sky-300 overflow-x-auto my-3">
                  <pre>{concept.code}</pre>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed mb-3">
                  {concept.explanation}
                </p>
              </div>

              <div className="pt-3 border-t border-[#1C253D] flex items-start gap-2 text-xs text-amber-300/90">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <span>{concept.tip}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: JavaScript Architecture & Fundamentals (Grounded in Tpoint Tech) */}
      {activeTab === 'architecture' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-violet-950/20 border border-violet-500/30 flex items-start gap-3">
            <Cpu className="w-5 h-5 text-violet-400 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-300 leading-relaxed">
              <strong className="text-white">Content Grounding: </strong>
              The architecture rules below are curated from the official{' '}
              <a
                href="https://www.tpointtech.com/javascript-tutorial"
                target="_blank"
                rel="noopener noreferrer"
                className="text-violet-400 hover:text-violet-300 underline font-semibold inline-flex items-center gap-0.5"
              >
                <span>Tpoint Tech JavaScript Tutorial</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              , structured to help beginners understand how the JavaScript runtime actually executes behind the scenes.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {architecturalPillars.map((pillar, idx) => (
              <div
                key={idx}
                className="rounded-xl bg-[#121826] border border-[#24304F] p-5 flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-sky-400 uppercase tracking-wider bg-sky-950/50 px-2 py-0.5 rounded-full border border-sky-800/40">
                      {pillar.badge}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-2">
                    {pillar.title}
                  </h3>

                  <p className="text-xs text-slate-300 leading-relaxed mb-4">
                    {pillar.description}
                  </p>

                  <div className="space-y-1.5 pt-2 border-t border-[#1C253D]">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Core Mechanics:
                    </span>
                    <ul className="space-y-1 text-xs text-slate-300">
                      {pillar.keyPoints.map((kp, kIdx) => (
                        <li key={kIdx} className="flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 text-violet-400 shrink-0 mt-0.5" />
                          <span>{kp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#1C253D] flex items-center justify-between text-[11px] text-slate-400">
                  <span className="truncate">{pillar.attribution}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Source Ingestion Hub */}
      {activeTab === 'sources' && (
        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-[#121826] border border-[#24304F] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <Globe className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-white">
                  Source-Backed Documentation Pipeline
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  CodeQuest automatically parses approved documentation from Tpoint Tech and MDN, extracting key headings and code examples to synthesize verified beginner lessons.
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                const tpoint = sources.find((s) => s.topicKey === 'js-overview') || sources[sources.length - 1];
                if (tpoint) handleIngestSource(tpoint);
              }}
              disabled={ingestingKey !== null}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${ingestingKey ? 'animate-spin' : ''}`} />
              <span>{ingestingKey ? 'Ingesting...' : 'Ingest Tpoint Tech Tutorial'}</span>
            </button>
          </div>

          {/* Sources List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sources.map((src) => {
              const isTpoint = src.url.includes('tpointtech.com');
              const lesson = lessons[src.topicKey];

              return (
                <div
                  key={src.id}
                  className={`rounded-xl bg-[#121826] border p-4 flex flex-col justify-between space-y-3 transition-all ${
                    isTpoint
                      ? 'border-violet-500/60 bg-gradient-to-b from-[#161B30] to-[#121826]'
                      : 'border-[#24304F]'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[10px] font-bold text-violet-300 uppercase tracking-wider bg-violet-950/80 px-2 py-0.5 rounded border border-violet-800/40">
                        {src.topicKey}
                      </span>
                      <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-semibold">
                        <ShieldCheck className="w-3 h-3" />
                        <span>Approved</span>
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white line-clamp-2">
                      {src.title}
                    </h4>

                    <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {src.description}
                    </p>

                    <div className="mt-2.5 pt-2 border-t border-[#1C253D] text-[11px] text-slate-400 space-y-1">
                      <div className="flex items-center justify-between">
                        <span>License:</span>
                        <span className="text-slate-300 font-mono text-[10px]">{src.license}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Status:</span>
                        <span className="text-emerald-400 font-semibold">{src.status || 'ready'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#1C253D] flex items-center justify-between gap-2">
                    <a
                      href={src.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-slate-400 hover:text-white inline-flex items-center gap-1 transition-colors"
                    >
                      <span>Original Doc</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>

                    <div className="flex items-center gap-2">
                      {lesson && (
                        <button
                          onClick={() => setSelectedLesson(lesson)}
                          className="px-2.5 py-1 rounded-lg bg-[#1C253D] hover:bg-[#253252] text-violet-300 text-xs font-semibold transition-colors"
                        >
                          View Lesson
                        </button>
                      )}
                      <button
                        onClick={() => handleIngestSource(src)}
                        disabled={ingestingKey === src.topicKey}
                        className="p-1.5 rounded-lg bg-[#1C253D] hover:bg-[#253252] text-slate-300 hover:text-white transition-colors disabled:opacity-50"
                        title="Re-ingest and re-synthesize this documentation source"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${ingestingKey === src.topicKey ? 'animate-spin' : ''}`} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active Lesson Modal / Inspector */}
          {selectedLesson && (
            <div
              role="dialog"
              aria-modal="true"
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in"
            >
              <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-[#121826] border-2 border-violet-500/50 p-6 shadow-2xl space-y-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-xs font-bold text-violet-400 uppercase tracking-widest">
                      SYNTHESIZED LESSON RECORD · {selectedLesson.topicKey}
                    </span>
                    <h3 className="text-xl font-black text-white mt-1">
                      {selectedLesson.title}
                    </h3>
                  </div>
                  <button
                    onClick={() => setSelectedLesson(null)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
                  <div>
                    <h4 className="font-bold text-slate-200 uppercase tracking-wider mb-1">
                      Learning Objective
                    </h4>
                    <p className="p-3 rounded-lg bg-[#0A0E17] border border-[#1A233A] text-sky-300">
                      {selectedLesson.learningObjective}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-200 uppercase tracking-wider mb-1">
                      Original Explanation
                    </h4>
                    <p>{selectedLesson.explanation}</p>
                  </div>

                  {selectedLesson.examples && selectedLesson.examples.length > 0 && (
                    <div>
                      <h4 className="font-bold text-slate-200 uppercase tracking-wider mb-1.5">
                        Code Demonstration
                      </h4>
                      <div className="space-y-2">
                        {selectedLesson.examples.map((ex, i) => (
                          <div key={i} className="rounded-lg bg-[#0A0E17] border border-[#1A233A] p-3 font-mono text-xs text-sky-300">
                            <pre className="overflow-x-auto">{ex.code}</pre>
                            <p className="font-sans text-[11px] text-slate-400 mt-2 border-t border-[#1C253D] pt-1.5">
                              {ex.explanation}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedLesson.keyTakeaways && selectedLesson.keyTakeaways.length > 0 && (
                    <div>
                      <h4 className="font-bold text-slate-200 uppercase tracking-wider mb-1">
                        Key Takeaways
                      </h4>
                      <ul className="space-y-1">
                        {selectedLesson.keyTakeaways.map((kt, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                            <span>{kt}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selectedLesson.commonMisconceptions && selectedLesson.commonMisconceptions.length > 0 && (
                    <div>
                      <h4 className="font-bold text-slate-200 uppercase tracking-wider mb-1">
                        Common Misconceptions
                      </h4>
                      <div className="space-y-2">
                        {selectedLesson.commonMisconceptions.map((cm, i) => (
                          <div key={i} className="p-3 rounded-lg bg-rose-950/20 border border-rose-500/30 text-rose-200">
                            <div className="font-semibold flex items-center gap-1.5">
                              <HelpCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                              <span>Myth: {cm.misconception}</span>
                            </div>
                            <div className="text-slate-300 mt-1 pl-5">
                              <span className="text-emerald-400 font-bold">Correction: </span>
                              {cm.correction}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedLesson.sourceReferences && selectedLesson.sourceReferences.length > 0 && (
                    <div className="p-3 rounded-lg bg-[#0A0E17] border border-[#1C253D] text-[11px] text-slate-400 space-y-1">
                      <div className="font-bold text-slate-300">Source Attribution & Compliance:</div>
                      <div>{selectedLesson.sourceReferences[0].attribution}</div>
                      <div className="italic text-slate-500">{selectedLesson.sourceReferences[0].transformationSummary}</div>
                      <a
                        href={selectedLesson.sourceReferences[0].url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-violet-400 hover:underline inline-flex items-center gap-1 pt-1"
                      >
                        <span>Visit original source: {selectedLesson.sourceReferences[0].url}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-[#1C253D] flex justify-end">
                  <button
                    onClick={() => setSelectedLesson(null)}
                    className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition-colors"
                  >
                    Done Reading
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
