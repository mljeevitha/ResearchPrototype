import React from 'react';
import {
  CheckCircle2,
  XCircle,
  Terminal,
  Clock,
  Cpu,
  RefreshCw,
  ArrowRight,
  ShieldAlert,
  Wrench,
  Sparkles,
} from 'lucide-react';
import { ExecutionRun, DebugSession } from '../types/index.ts';

interface ExecutionResultsViewProps {
  run: ExecutionRun;
  debugSession?: DebugSession;
  onDebug: () => void;
  onProceedToEvaluation: () => void;
  isDebugging?: boolean;
}

export const ExecutionResultsView: React.FC<ExecutionResultsViewProps> = ({
  run,
  debugSession,
  onDebug,
  onProceedToEvaluation,
  isDebugging = false,
}) => {
  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Status Card */}
        <div
          className={`p-4 rounded-xl border flex items-center gap-3 ${
            run.passed
              ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
              : 'bg-rose-950/40 border-rose-800 text-rose-300'
          }`}
        >
          {run.passed ? (
            <CheckCircle2 className="w-8 h-8 text-emerald-400 shrink-0" />
          ) : (
            <XCircle className="w-8 h-8 text-rose-400 shrink-0" />
          )}
          <div>
            <div className="text-[11px] uppercase tracking-wider font-mono opacity-80">
              Outcome
            </div>
            <div className="text-base font-bold">
              {run.passed ? 'All Tests Passed' : `${run.failedTests} Test Failure(s)`}
            </div>
          </div>
        </div>

        {/* Exit Code */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-3">
          <Terminal className="w-8 h-8 text-cyan-400 shrink-0" />
          <div>
            <div className="text-[11px] uppercase tracking-wider font-mono text-slate-400">
              Exit Code
            </div>
            <div className={`text-base font-bold font-mono ${run.exitCode === 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {run.exitCode} {run.exitCode === 0 ? '(SUCCESS)' : '(ERROR)'}
            </div>
          </div>
        </div>

        {/* Tests Count */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-3">
          <Cpu className="w-8 h-8 text-indigo-400 shrink-0" />
          <div>
            <div className="text-[11px] uppercase tracking-wider font-mono text-slate-400">
              Pass / Total
            </div>
            <div className="text-base font-bold text-slate-100 font-mono">
              {run.passedTests} / {run.totalTests} tests
            </div>
          </div>
        </div>

        {/* Duration */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-3">
          <Clock className="w-8 h-8 text-purple-400 shrink-0" />
          <div>
            <div className="text-[11px] uppercase tracking-wider font-mono text-slate-400">
              Duration
            </div>
            <div className="text-base font-bold text-slate-100 font-mono">
              {run.durationMs} ms
            </div>
          </div>
        </div>
      </div>

      {/* Action CTA Bar */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="text-xs text-slate-400 font-mono">
          Command: <span className="text-slate-200">{run.command}</span>
        </div>

        <div className="flex items-center gap-3">
          {!run.passed && (
            <button
              onClick={onDebug}
              disabled={isDebugging || (debugSession && debugSession.attempts >= debugSession.maxAttempts)}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              {isDebugging ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Agent F Debugging & Patching...</span>
                </>
              ) : (
                <>
                  <Wrench className="w-3.5 h-3.5" />
                  <span>
                    Engage Agent F Self-Healing Debugger
                    {debugSession ? ` (${debugSession.attempts}/${debugSession.maxAttempts})` : ''}
                  </span>
                </>
              )}
            </button>
          )}

          <button
            onClick={onProceedToEvaluation}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-md transition-colors flex items-center gap-1.5"
          >
            <span>Proceed to Academic Evaluation</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Self-Healing History if available */}
      {debugSession && debugSession.patches.length > 0 && (
        <div className="p-5 rounded-2xl bg-amber-950/20 border border-amber-800/40 space-y-3">
          <h3 className="text-sm font-semibold text-amber-300 flex items-center gap-2">
            <Wrench className="w-4 h-4 text-amber-400" />
            <span>Agent F Self-Healing Session ({debugSession.patches.length} Patch Applied)</span>
          </h3>
          <p className="text-xs text-slate-300">{debugSession.finalMessage}</p>

          <div className="space-y-2 pt-1">
            {debugSession.patches.map((patch, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs space-y-1">
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span className="text-amber-400 font-semibold">Iteration #{patch.iteration}</span>
                  <span>{patch.fileModified}</span>
                </div>
                <div className="text-slate-300 text-xs">
                  <span className="text-slate-400 font-medium">Root Cause: </span>
                  {patch.rootCauseAnalysis}
                </div>
                <div className="text-cyan-300 font-mono text-[11px]">
                  Diff: {patch.diffSummary}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Test Case Breakdown */}
      {run.testDetails && run.testDetails.length > 0 && (
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <h3 className="text-sm font-semibold text-slate-200">Test Case Breakdown</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {run.testDetails.map((td, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2 truncate">
                  {td.status === 'passed' ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  )}
                  <span className="font-mono text-slate-200 truncate">{td.name}</span>
                </div>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase ${
                    td.status === 'passed'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : 'bg-rose-950 text-rose-300 border border-rose-800'
                  }`}
                >
                  {td.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Terminal Output Logs */}
      <div className="rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden shadow-xl">
        <div className="px-4 py-2.5 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 font-mono text-slate-300">
            <Terminal className="w-3.5 h-3.5 text-indigo-400" />
            <span>Isolated Subprocess Output Stream</span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            {run.environmentInfo}
          </span>
        </div>

        <div className="p-4 font-mono text-xs text-slate-300 overflow-x-auto space-y-3 max-h-[450px]">
          {run.stdout && (
            <div>
              <div className="text-[11px] text-emerald-400 mb-1 font-semibold uppercase tracking-wider">
                [STDOUT]
              </div>
              <pre className="whitespace-pre-wrap leading-relaxed text-slate-300">{run.stdout}</pre>
            </div>
          )}

          {run.stderr && (
            <div className="pt-2 border-t border-slate-800/80">
              <div className="text-[11px] text-rose-400 mb-1 font-semibold uppercase tracking-wider">
                [STDERR / RUNNER LOGS]
              </div>
              <pre className="whitespace-pre-wrap leading-relaxed text-rose-300/90">{run.stderr}</pre>
            </div>
          )}

          {!run.stdout && !run.stderr && (
            <div className="text-slate-500 italic">No output streams generated.</div>
          )}
        </div>
      </div>
    </div>
  );
};
