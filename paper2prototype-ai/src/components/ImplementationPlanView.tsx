import React, { useState } from 'react';
import {
  ListChecks,
  CheckCircle2,
  ArrowRight,
  FileCode,
  ShieldCheck,
  AlertCircle,
  Clock,
  Sparkles,
  Layers,
} from 'lucide-react';
import { ImplementationPlan, TaskItem } from '../types/index.ts';

interface ImplementationPlanViewProps {
  plan: ImplementationPlan;
  onApproveAndGenerate: (tasks: TaskItem[], userNotes?: string) => void;
  isGenerating?: boolean;
}

export const ImplementationPlanView: React.FC<ImplementationPlanViewProps> = ({
  plan,
  onApproveAndGenerate,
  isGenerating = false,
}) => {
  const [tasks, setTasks] = useState<TaskItem[]>(plan.tasks);
  const [userNotes, setUserNotes] = useState(plan.userModifications || '');

  const handleApprove = () => {
    onApproveAndGenerate(tasks, userNotes);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-medium">
              Target: Python 3 + unittest runner
            </span>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
              Complexity: {plan.estimatedComplexity}
            </span>
            {plan.approvedByUser && (
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                Approved by User
              </span>
            )}
          </div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <ListChecks className="w-5 h-5 text-indigo-400" />
            <span>Agent C Implementation Plan ({tasks.length} Ordered Tasks)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">{plan.scopeDisclaimer}</p>
        </div>

        <button
          onClick={handleApprove}
          disabled={isGenerating}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isGenerating ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Coding Agent Generating Repository...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Approve Plan & Generate Code</span>
            </>
          )}
        </button>
      </div>

      {/* Task Cards */}
      <div className="space-y-3.5">
        {tasks.map((task, index) => (
          <div
            key={task.id}
            className="p-4 sm:p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3 transition-colors hover:border-slate-700"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center text-xs font-mono font-bold">
                  {index + 1}
                </span>
                <h3 className="text-sm font-semibold text-slate-200">{task.title}</h3>
              </div>

              <div className="flex items-center gap-2 text-xs">
                {task.dependencies && task.dependencies.length > 0 && (
                  <span className="text-[11px] font-mono text-slate-400">
                    Prereq: {task.dependencies.join(', ')}
                  </span>
                )}
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase ${
                    task.status === 'completed'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : task.status === 'running'
                      ? 'bg-indigo-950 text-indigo-300 border border-indigo-800 animate-pulse'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                >
                  {task.status}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">{task.description}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
                <div className="text-[11px] font-medium text-cyan-400 flex items-center gap-1 mb-1">
                  <FileCode className="w-3.5 h-3.5" />
                  <span>Target Files:</span>
                </div>
                <div className="font-mono text-slate-300 text-[11px]">
                  {task.targetFiles.join(', ')}
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
                <div className="text-[11px] font-medium text-emerald-400 flex items-center gap-1 mb-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Acceptance Criteria:</span>
                </div>
                <ul className="space-y-0.5 text-slate-300 text-[11px]">
                  {task.acceptanceCriteria.map((crit, cidx) => (
                    <li key={cidx} className="flex items-start gap-1.5">
                      <span className="text-emerald-500">•</span>
                      <span>{crit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* User Review / Custom Instructions */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
        <label className="block text-xs font-semibold text-slate-200">
          User Directives or Modifications (Optional)
        </label>
        <p className="text-xs text-slate-400">
          Add specific constraints or mathematical adjustments to the implementation before code generation:
        </p>
        <textarea
          rows={3}
          value={userNotes}
          onChange={(e) => setUserNotes(e.target.value)}
          placeholder="e.g. Ensure reproducible seed = 42; prioritize vector math without external pip packages; include benchmark for high condition numbers..."
          className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-indigo-500 transition-colors font-sans"
        />
      </div>
    </div>
  );
};
