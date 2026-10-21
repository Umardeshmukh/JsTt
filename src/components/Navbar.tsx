import React, { useState, useRef, useEffect } from 'react';
import { Settings, Volume2, VolumeX, RotateCcw, User, LogOut, Check, ArrowRight, X } from 'lucide-react';
import { LevelInfo } from '../game/scoring';
import { AuthUser } from '../services/auth_service';

interface NavbarProps {
  currentView: 'learn' | 'progress';
  onNavigate: (view: 'learn' | 'progress') => void;
  levelInfo: LevelInfo;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onResetProgress: () => void;
  authUser?: AuthUser | null;
  onSendMagicLink?: (email: string) => Promise<{ success: boolean; verificationUrl?: string; error?: string }>;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  levelInfo,
  soundEnabled,
  onToggleSound,
  onResetProgress,
  authUser,
  onSendMagicLink,
  onLogout,
}) => {
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [authEmail, setAuthEmail] = useState('');
  const [authStatus, setAuthStatus] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowSettingsMenu(false);
      }
    };
    if (showSettingsMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSettingsMenu]);

  const handleMagicLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail || !onSendMagicLink) return;
    setAuthLoading(true);
    setAuthStatus(null);
    try {
      const res = await onSendMagicLink(authEmail);
      if (res.success) {
        setAuthStatus('Magic link generated! Check console/click link below.');
      } else {
        setAuthStatus(res.error || 'Failed to generate link.');
      }
    } catch {
      setAuthStatus('Network error.');
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#090d16]/95 backdrop-blur border-b border-slate-800">
      <div className="max-w-5xl mx-auto px-3 sm:px-6 h-14 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand & Minimal Navigation */}
        <div className="flex items-center gap-2.5 sm:gap-6 min-w-0">
          <button
            onClick={() => onNavigate('learn')}
            className="text-sm sm:text-base font-bold tracking-tight text-slate-100 hover:text-white transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 rounded shrink-0"
            aria-label="CodeQuest Home"
          >
            Code<span className="text-indigo-400">Quest</span>
          </button>

          <nav className="flex items-center gap-1 sm:gap-2" aria-label="Main navigation">
            <button
              onClick={() => onNavigate('learn')}
              className={`px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                currentView === 'learn'
                  ? 'bg-slate-800 text-indigo-300 border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              Learn
            </button>
            <button
              onClick={() => onNavigate('progress')}
              className={`px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                currentView === 'progress'
                  ? 'bg-slate-800 text-indigo-300 border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              Progress
            </button>
          </nav>
        </div>

        {/* Status & Secondary Menu */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Authoritative Level & XP Badge */}
          <div
            className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-[11px] sm:text-xs font-mono text-slate-300"
            title={`${levelInfo.currentLevelXp} total XP`}
          >
            <span className="text-indigo-400 font-semibold">Lv.{levelInfo.level}</span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-300">{levelInfo.currentLevelXp} XP</span>
          </div>

          {/* Secondary Menu (Settings & Account) */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowSettingsMenu(!showSettingsMenu)}
              className="p-1.5 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500"
              aria-label="Settings and account menu"
              aria-expanded={showSettingsMenu}
              title="Settings & Profile"
            >
              <Settings className="w-4 h-4" />
            </button>

            {showSettingsMenu && (
              <div
                role="menu"
                className="absolute right-0 mt-2 w-72 max-w-[calc(100vw-1.5rem)] rounded-lg bg-slate-900 border border-slate-800 shadow-xl p-3 text-xs text-slate-300 z-50 space-y-3"
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="font-semibold text-slate-200">Settings</span>
                  <button
                    onClick={() => setShowSettingsMenu(false)}
                    className="text-slate-500 hover:text-slate-300 p-0.5 rounded"
                    aria-label="Close settings"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Sound toggle */}
                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-400">Sound Effects</span>
                  <button
                    onClick={onToggleSound}
                    className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                  >
                    {soundEnabled ? (
                      <>
                        <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Enabled</span>
                      </>
                    ) : (
                      <>
                        <VolumeX className="w-3.5 h-3.5 text-slate-500" />
                        <span>Muted</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Reset Progress */}
                <div className="flex items-center justify-between py-1 border-t border-slate-800 pt-2">
                  <span className="text-slate-400">Reset Data</span>
                  <button
                    onClick={() => {
                      setShowSettingsMenu(false);
                      onResetProgress();
                    }}
                    className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-rose-950/40 text-slate-400 hover:text-rose-300 transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset</span>
                  </button>
                </div>

                {/* Account / Magic Link Auth */}
                <div className="border-t border-slate-800 pt-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Account</span>
                    {authUser ? (
                      <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        {authUser.email.slice(0, 16)}
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-500">Guest mode</span>
                    )}
                  </div>

                  {authUser ? (
                    <button
                      onClick={() => {
                        if (onLogout) onLogout();
                        setShowSettingsMenu(false);
                      }}
                      className="w-full flex items-center justify-center gap-1.5 py-1 px-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
                    >
                      <LogOut className="w-3 h-3" />
                      <span>Log Out</span>
                    </button>
                  ) : (
                    <form onSubmit={handleMagicLinkSubmit} className="space-y-1.5">
                      <input
                        type="email"
                        placeholder="Sign in with email (optional)"
                        value={authEmail}
                        onChange={(e) => setAuthEmail(e.target.value)}
                        className="w-full px-2 py-1 rounded bg-slate-950 border border-slate-800 text-slate-200 placeholder:text-slate-600 text-xs outline-none focus:border-indigo-500"
                      />
                      <button
                        type="submit"
                        disabled={authLoading || !authEmail}
                        className="w-full py-1 px-2 rounded bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium text-xs transition-colors flex items-center justify-center gap-1"
                      >
                        {authLoading ? 'Sending...' : 'Send Magic Link'}
                        <ArrowRight className="w-3 h-3" />
                      </button>
                      {authStatus && (
                        <p className="text-[11px] text-slate-400 mt-1 leading-tight break-words">
                          {authStatus}
                        </p>
                      )}
                    </form>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
