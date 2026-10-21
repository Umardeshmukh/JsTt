import React from 'react';
import { Volume2, VolumeX, RotateCcw, BookOpen, Trophy, Compass, Sparkles } from 'lucide-react';
import { LevelInfo } from '../game/scoring';
import { playButtonPop } from '../utils/sound';

interface NavbarProps {
  currentView: 'dashboard' | 'map' | 'achievements' | 'codex';
  onNavigate: (view: 'dashboard' | 'map' | 'achievements' | 'codex') => void;
  levelInfo: LevelInfo;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onResetProgress: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  levelInfo,
  soundEnabled,
  onToggleSound,
  onResetProgress,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#0B0F19]/90 backdrop-blur-md border-b border-[#1E293B]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single text element wordmark */}
        <button
          onClick={() => {
            playButtonPop(soundEnabled);
            onNavigate('dashboard');
          }}
          className="flex items-center gap-2.5 text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 rounded-lg p-1"
          aria-label="CodeQuest Home"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center shadow-md shadow-violet-950/40">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white group-hover:text-violet-300 transition-colors whitespace-nowrap shrink-0">
            Code<span className="text-violet-400">Quest</span>
          </span>
        </button>

        {/* Zone 2: 4 clean single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
          <button
            onClick={() => {
              playButtonPop(soundEnabled);
              onNavigate('dashboard');
            }}
            className={`transition-colors whitespace-nowrap shrink-0 ${
              currentView === 'dashboard'
                ? 'text-violet-400 font-semibold'
                : 'hover:text-white'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => {
              playButtonPop(soundEnabled);
              onNavigate('map');
            }}
            className={`transition-colors whitespace-nowrap shrink-0 ${
              currentView === 'map'
                ? 'text-violet-400 font-semibold'
                : 'hover:text-white'
            }`}
          >
            World Map
          </button>
          <button
            onClick={() => {
              playButtonPop(soundEnabled);
              onNavigate('codex');
            }}
            className={`transition-colors whitespace-nowrap shrink-0 ${
              currentView === 'codex'
                ? 'text-violet-400 font-semibold'
                : 'hover:text-white'
            }`}
          >
            Codex
          </button>
          <button
            onClick={() => {
              playButtonPop(soundEnabled);
              onNavigate('achievements');
            }}
            className={`transition-colors whitespace-nowrap shrink-0 ${
              currentView === 'achievements'
                ? 'text-violet-400 font-semibold'
                : 'hover:text-white'
            }`}
          >
            Achievements
          </button>
        </nav>

        {/* Zone 3: 1 primary action / status zone */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Level badge */}
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#151D30] border border-[#24304F] text-xs font-medium text-slate-200"
            title={`${levelInfo.currentLevelXp} total XP`}
          >
            <span className="text-amber-400 font-bold tabular-nums">Lv.{levelInfo.level}</span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-300 tabular-nums">{levelInfo.currentLevelXp} XP</span>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={() => {
              onToggleSound();
              if (!soundEnabled) playButtonPop(true);
            }}
            className="p-2 rounded-lg bg-[#151D30] hover:bg-[#1E293B] border border-[#24304F] text-slate-300 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
            aria-label={soundEnabled ? 'Mute sound effects' : 'Enable sound effects'}
            title={soundEnabled ? 'Mute audio' : 'Enable audio'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-violet-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          {/* Reset Progress Button */}
          <button
            onClick={onResetProgress}
            className="p-2 rounded-lg bg-[#151D30] hover:bg-[#1E293B] border border-[#24304F] text-slate-400 hover:text-amber-300 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
            aria-label="Reset progress to default"
            title="Reset progress"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mobile bottom nav bar */}
      <div className="md:hidden flex items-center justify-around border-t border-[#1E293B] bg-[#0E1424] py-2 px-4">
        <button
          onClick={() => {
            playButtonPop(soundEnabled);
            onNavigate('dashboard');
          }}
          className={`flex flex-col items-center gap-1 text-[11px] py-1 px-2 rounded ${
            currentView === 'dashboard' ? 'text-violet-400 font-semibold' : 'text-slate-400'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>Dashboard</span>
        </button>
        <button
          onClick={() => {
            playButtonPop(soundEnabled);
            onNavigate('map');
          }}
          className={`flex flex-col items-center gap-1 text-[11px] py-1 px-2 rounded ${
            currentView === 'map' ? 'text-violet-400 font-semibold' : 'text-slate-400'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Worlds</span>
        </button>
        <button
          onClick={() => {
            playButtonPop(soundEnabled);
            onNavigate('codex');
          }}
          className={`flex flex-col items-center gap-1 text-[11px] py-1 px-2 rounded ${
            currentView === 'codex' ? 'text-violet-400 font-semibold' : 'text-slate-400'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Codex</span>
        </button>
        <button
          onClick={() => {
            playButtonPop(soundEnabled);
            onNavigate('achievements');
          }}
          className={`flex flex-col items-center gap-1 text-[11px] py-1 px-2 rounded ${
            currentView === 'achievements' ? 'text-violet-400 font-semibold' : 'text-slate-400'
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span>Badges</span>
        </button>
      </div>
    </header>
  );
};
