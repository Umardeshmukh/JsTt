import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[CodeQuest ErrorBoundary caught error]:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleClearAndReload = () => {
    try {
      localStorage.removeItem('codequest_user_progress_v1');
    } catch {}
    window.location.href = window.location.pathname;
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#090d16] text-slate-100 flex items-center justify-center p-4">
          <div className="max-w-md w-full rounded-lg bg-slate-900 border border-slate-800 p-6 text-center space-y-4 shadow-xl">
            <div className="w-12 h-12 rounded-full bg-rose-950/60 border border-rose-800/60 flex items-center justify-center mx-auto text-rose-400">
              <AlertCircle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h1 className="text-lg font-bold text-slate-100">
                Something unexpected happened
              </h1>
              <p className="text-xs text-slate-400 leading-relaxed">
                CodeQuest encountered a rendering issue. Your saved progress is safely stored.
              </p>
              {this.state.error && (
                <div className="mt-2 p-2 rounded bg-slate-950 border border-slate-800 text-[11px] font-mono text-rose-300 text-left overflow-x-auto">
                  {this.state.error.message}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={this.handleReload}
                className="flex-1 py-2 px-3 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors focus-visible:ring-2 focus-visible:ring-indigo-400"
              >
                Reload Lesson
              </button>
              <button
                onClick={this.handleClearAndReload}
                className="flex-1 py-2 px-3 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors focus-visible:ring-2 focus-visible:ring-slate-500 flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Cache</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
