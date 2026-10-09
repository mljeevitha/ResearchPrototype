import React from 'react';
import { useAuth } from '../firebase/context.tsx';
import {
  Sparkles,
  Cpu,
  Database,
  LogIn,
  LogOut,
  FolderGit2,
  FileText,
  ShieldCheck,
} from 'lucide-react';

interface HeaderProps {
  currentProjectTitle?: string;
  onBackToDashboard?: () => void;
  geminiReady?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentProjectTitle,
  onBackToDashboard,
  geminiReady = true,
}) => {
  const { user, signInWithGoogle, signOut, loading, firestoreReady } = useAuth();

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-slate-100 sticky top-0 z-40 backdrop-blur-sm bg-opacity-95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Brand & Breadcrumb */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onBackToDashboard}
            className="flex items-center space-x-2 text-indigo-400 hover:text-indigo-300 font-bold tracking-tight text-lg transition-colors focus:outline-none"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="hidden sm:inline">Paper2Prototype <span className="text-xs px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono font-medium border border-indigo-500/30">AI</span></span>
          </button>

          {currentProjectTitle && (
            <div className="flex items-center space-x-2 text-sm text-slate-400 border-l border-slate-700 pl-3">
              <button
                onClick={onBackToDashboard}
                className="hover:text-slate-200 transition-colors flex items-center gap-1 text-xs"
              >
                <FolderGit2 className="w-3.5 h-3.5" />
                <span>Projects</span>
              </button>
              <span className="text-slate-600">/</span>
              <span className="text-slate-200 font-medium truncate max-w-[200px] sm:max-w-xs md:max-w-md">
                {currentProjectTitle}
              </span>
            </div>
          )}
        </div>

        {/* Center: System Status Chips */}
        <div className="hidden lg:flex items-center space-x-2 text-xs">
          <div
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full border ${
              geminiReady
                ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                : 'bg-amber-950/40 border-amber-800 text-amber-300'
            }`}
            title="Gemini 3.8 Flash multi-agent reasoning engine"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono">Gemini 3.8</span>
          </div>

          <div
            className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-cyan-950/40 border border-cyan-800 text-cyan-300"
            title="Isolated Python 3.10 Subprocess Sandbox Active"
          >
            <Cpu className="w-3 h-3 text-cyan-400" />
            <span className="font-mono">Python 3.10 Sandbox</span>
          </div>

          <div
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full border ${
              firestoreReady
                ? 'bg-purple-950/40 border-purple-800 text-purple-300'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
            title="Cloud Firestore database connection status"
          >
            <Database className="w-3 h-3 text-purple-400" />
            <span className="font-mono">{firestoreReady ? 'Firestore Connected' : 'Firestore Synced'}</span>
          </div>
        </div>

        {/* Right: Auth Controls */}
        <div className="flex items-center space-x-3">
          {loading ? (
            <div className="w-6 h-6 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
          ) : user ? (
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-7 h-7 rounded-full border border-slate-700"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold text-white">
                    {(user.displayName || user.email || 'U')[0].toUpperCase()}
                  </div>
                )}
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-medium text-slate-200 max-w-[120px] truncate">
                    {user.displayName || user.email}
                  </div>
                  <div className="text-[10px] text-slate-400 flex items-center gap-0.5">
                    <ShieldCheck className="w-2.5 h-2.5 text-emerald-400" />
                    <span>Verified</span>
                  </div>
                </div>
              </div>

              <button
                onClick={signOut}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={signInWithGoogle}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium shadow-sm transition-colors"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In with Google</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
