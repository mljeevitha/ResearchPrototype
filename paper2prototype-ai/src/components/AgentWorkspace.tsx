import React, { useState, useEffect } from 'react';
import {
  FileText,
  Brain,
  ListChecks,
  FileCode,
  Play,
  Award,
  Download,
  Sparkles,
  RefreshCw,
  Terminal,
  Activity,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Trash2,
} from 'lucide-react';
import { Project, AgentEvent, TaskItem } from '../types/index.ts';
import { ResearchSpecificationView } from './ResearchSpecificationView.tsx';
import { ImplementationPlanView } from './ImplementationPlanView.tsx';
import { CodeEditorView } from './CodeEditorView.tsx';
import { ExecutionResultsView } from './ExecutionResultsView.tsx';
import { EvaluationReportView } from './EvaluationReportView.tsx';
import {
  analyzeProject,
  planProject,
  approvePlan,
  generateCode,
  executeTests,
  debugProject,
  evaluateProject,
  startFullPipeline,
  getExportZipUrl,
} from '../utils/api.ts';

interface AgentWorkspaceProps {
  project: Project;
  onRefreshProject: () => void;
  onDeleteProject?: () => void | Promise<void>;
}

type WorkspaceTab = 'spec' | 'plan' | 'code' | 'execution' | 'evaluation';

export const AgentWorkspace: React.FC<AgentWorkspaceProps> = ({
  project,
  onRefreshProject,
  onDeleteProject,
}) => {
  const [activeTab, setActiveTab] = useState<WorkspaceTab>(() => {
    if (project.evaluation) return 'evaluation';
    if (project.latestExecution) return 'execution';
    if (project.artifacts) return 'code';
    if (project.plan) return 'plan';
    return 'spec';
  });

  const [events, setEvents] = useState<AgentEvent[]>([]);
  const [showEventsDrawer, setShowEventsDrawer] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeletingProject, setIsDeletingProject] = useState(false);

  // Connect to SSE stream for live agent events
  useEffect(() => {
    const sse = new EventSource(`/api/projects/${project.id}/events`);

    sse.onmessage = (e) => {
      try {
        const parsed = JSON.parse(e.data);
        if (parsed.agent) {
          setEvents((prev) => [parsed, ...prev.slice(0, 49)]);
          // Also poll for project state updates on milestones
          if (parsed.type === 'success' || parsed.type === 'error') {
            onRefreshProject();
          }
        }
      } catch (err) {
        // ignore parse error
      }
    };

    return () => {
      sse.close();
    };
  }, [project.id]);

  // Stage Handlers
  const handleAnalyze = async () => {
    setActionLoading('analyzing');
    setErrorMessage(null);
    try {
      await analyzeProject(project.id);
      onRefreshProject();
      setActiveTab('spec');
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handlePlan = async (userNotes?: string) => {
    setActionLoading('planning');
    setErrorMessage(null);
    try {
      await planProject(project.id, userNotes);
      onRefreshProject();
      setActiveTab('plan');
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleApprovePlan = async (tasks: TaskItem[], userModifications?: string) => {
    setActionLoading('approving');
    setErrorMessage(null);
    try {
      await approvePlan(project.id, tasks, userModifications);
      setActionLoading('generating');
      await generateCode(project.id);
      onRefreshProject();
      setActiveTab('code');
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleExecuteTests = async () => {
    setActionLoading('executing');
    setErrorMessage(null);
    try {
      await executeTests(project.id);
      onRefreshProject();
      setActiveTab('execution');
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDebug = async () => {
    setActionLoading('debugging');
    setErrorMessage(null);
    try {
      await debugProject(project.id);
      onRefreshProject();
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleEvaluate = async () => {
    setActionLoading('evaluating');
    setErrorMessage(null);
    try {
      await evaluateProject(project.id);
      onRefreshProject();
      setActiveTab('evaluation');
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRunFullPipeline = async () => {
    setActionLoading('pipeline');
    setErrorMessage(null);
    try {
      await startFullPipeline(project.id);
      // Continuous polling while pipeline runs
      const interval = setInterval(() => {
        onRefreshProject();
      }, 3000);
      setTimeout(() => clearInterval(interval), 120000);
    } catch (err: any) {
      setErrorMessage(err.message);
      setActionLoading(null);
    }
  };

  // Determine current active agent badge
  const getAgentBadge = () => {
    if (actionLoading === 'analyzing' || project.status === 'analyzing')
      return { role: 'Agent A & B', name: 'Research & Feasibility Analysts', active: true };
    if (actionLoading === 'planning' || project.status === 'planning')
      return { role: 'Agent C', name: 'Implementation Planner', active: true };
    if (actionLoading === 'generating' || project.status === 'generating')
      return { role: 'Agent D', name: 'Coding Agent', active: true };
    if (actionLoading === 'executing' || project.status === 'testing')
      return { role: 'Agent E', name: 'Execution Agent (Sandbox)', active: true };
    if (actionLoading === 'debugging' || project.status === 'debugging')
      return { role: 'Agent F', name: 'Self-Healing Debugger', active: true };
    if (actionLoading === 'evaluating')
      return { role: 'Agent G', name: 'Evaluation Agent', active: true };
    return { role: 'Supervisor', name: 'Ready / Idle', active: false };
  };

  const activeAgent = getAgentBadge();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-fade-in">
      {/* Top Multi-Agent Status Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              activeAgent.active
                ? 'bg-indigo-600/30 text-indigo-400 border border-indigo-500/40 animate-pulse'
                : 'bg-slate-800 text-slate-400'
            }`}
          >
            <Sparkles className="w-5 h-5" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-semibold text-slate-200">
                {activeAgent.role}
              </span>
              <span className="text-xs text-slate-400">• {activeAgent.name}</span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 max-w-xl truncate">
              {project.currentStage}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {!project.spec && (
            <button
              onClick={handleAnalyze}
              disabled={Boolean(actionLoading)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              {actionLoading === 'analyzing' ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Analyzing Paper...</span>
                </>
              ) : (
                <>
                  <Brain className="w-3.5 h-3.5" />
                  <span>Start Analysis</span>
                </>
              )}
            </button>
          )}

          {!project.evaluation && (
            <button
              onClick={handleRunFullPipeline}
              disabled={Boolean(actionLoading)}
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-lg text-xs font-semibold shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Run Automated End-to-End Pipeline</span>
            </button>
          )}

          {project.artifacts && (
            <a
              href={getExportZipUrl(project.id)}
              download
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium border border-slate-700 transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export ZIP</span>
            </a>
          )}

          {/* Delete Project Workspace */}
          {onDeleteProject && (
            showDeleteConfirm ? (
              <div className="flex items-center gap-1.5 p-1 bg-red-950/60 border border-red-800/80 rounded-lg animate-fade-in shadow-inner">
                <span className="text-[11px] text-red-300 font-medium pl-1.5 pr-0.5">Delete workspace?</span>
                <button
                  onClick={async () => {
                    setIsDeletingProject(true);
                    try {
                      await onDeleteProject();
                    } finally {
                      setIsDeletingProject(false);
                      setShowDeleteConfirm(false);
                    }
                  }}
                  disabled={isDeletingProject}
                  title="Confirm delete workspace"
                  className="px-2.5 py-1 bg-red-600 hover:bg-red-500 text-white rounded text-xs font-semibold shadow-sm transition-colors flex items-center gap-1 disabled:opacity-50 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{isDeletingProject ? 'Deleting...' : 'Confirm'}</span>
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeletingProject}
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-medium transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                title="Delete project workspace"
                className="px-3 py-2 bg-slate-950 hover:bg-red-950/40 text-slate-400 hover:text-red-400 rounded-lg text-xs border border-slate-800 hover:border-red-800/50 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Delete</span>
              </button>
            )
          )}

          {/* SSE Toggle Button */}
          <button
            onClick={() => setShowEventsDrawer(!showEventsDrawer)}
            className="px-3 py-2 bg-slate-950 hover:bg-slate-800 text-slate-300 rounded-lg text-xs font-mono border border-slate-800 transition-colors flex items-center gap-1.5"
          >
            <Activity className="w-3.5 h-3.5 text-indigo-400" />
            <span>Agent Stream ({events.length})</span>
            {showEventsDrawer ? (
              <ChevronUp className="w-3.5 h-3.5 text-slate-500" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
            )}
          </button>
        </div>
      </div>

      {/* SSE Real-Time Event Stream Drawer */}
      {showEventsDrawer && (
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 shadow-xl space-y-2 max-h-60 overflow-y-auto font-mono text-xs text-slate-300">
          <div className="flex items-center justify-between text-[11px] text-slate-400 pb-2 border-b border-slate-800">
            <span>LIVE SERVER-SENT AGENT EVENT STREAM</span>
            <span>{events.length} events logged</span>
          </div>
          {events.length === 0 ? (
            <div className="text-slate-500 text-center py-4 italic">
              Listening for agent events on /api/projects/{project.id}/events...
            </div>
          ) : (
            <div className="space-y-1.5">
              {events.map((evt) => (
                <div key={evt.id} className="flex items-start gap-2 py-0.5">
                  <span className="text-slate-600 text-[10px] shrink-0">
                    {new Date(evt.timestamp).toLocaleTimeString()}
                  </span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded shrink-0 ${
                      evt.type === 'success'
                        ? 'bg-emerald-950 text-emerald-300'
                        : evt.type === 'error'
                        ? 'bg-rose-950 text-rose-300'
                        : evt.type === 'warning'
                        ? 'bg-amber-950 text-amber-300'
                        : 'bg-indigo-950 text-indigo-300'
                    }`}
                  >
                    {evt.agentName}
                  </span>
                  <span className="text-slate-200">{evt.message}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Error alert if any */}
      {(errorMessage || project.error) && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 text-xs flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-semibold">Workflow Error:</span>
            <p className="text-rose-300/90">{errorMessage || project.error}</p>
          </div>
        </div>
      )}

      {/* Workspace Stage Tabs */}
      <div className="flex border-b border-slate-800 gap-1 overflow-x-auto pb-1 text-xs font-medium">
        <button
          onClick={() => setActiveTab('spec')}
          disabled={!project.spec}
          className={`px-4 py-2.5 rounded-t-xl transition-all flex items-center gap-2 border-b-2 disabled:opacity-40 disabled:cursor-not-allowed ${
            activeTab === 'spec'
              ? 'border-indigo-500 bg-slate-900 text-indigo-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Brain className="w-4 h-4" />
          <span>1. Research Spec & Feasibility</span>
        </button>

        <button
          onClick={() => setActiveTab('plan')}
          disabled={!project.plan}
          className={`px-4 py-2.5 rounded-t-xl transition-all flex items-center gap-2 border-b-2 disabled:opacity-40 disabled:cursor-not-allowed ${
            activeTab === 'plan'
              ? 'border-indigo-500 bg-slate-900 text-indigo-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <ListChecks className="w-4 h-4" />
          <span>2. Implementation Plan</span>
        </button>

        <button
          onClick={() => setActiveTab('code')}
          disabled={!project.artifacts}
          className={`px-4 py-2.5 rounded-t-xl transition-all flex items-center gap-2 border-b-2 disabled:opacity-40 disabled:cursor-not-allowed ${
            activeTab === 'code'
              ? 'border-indigo-500 bg-slate-900 text-indigo-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileCode className="w-4 h-4" />
          <span>3. Prototype Repository</span>
        </button>

        <button
          onClick={() => setActiveTab('execution')}
          disabled={!project.latestExecution}
          className={`px-4 py-2.5 rounded-t-xl transition-all flex items-center gap-2 border-b-2 disabled:opacity-40 disabled:cursor-not-allowed ${
            activeTab === 'execution'
              ? 'border-indigo-500 bg-slate-900 text-indigo-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Terminal className="w-4 h-4" />
          <span>4. Isolated Execution Tests</span>
        </button>

        <button
          onClick={() => setActiveTab('evaluation')}
          disabled={!project.evaluation}
          className={`px-4 py-2.5 rounded-t-xl transition-all flex items-center gap-2 border-b-2 disabled:opacity-40 disabled:cursor-not-allowed ${
            activeTab === 'evaluation'
              ? 'border-indigo-500 bg-slate-900 text-indigo-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>5. Academic Evaluation</span>
        </button>
      </div>

      {/* Main Tab Content */}
      <div className="pt-2">
        {!project.spec && (
          <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
            <Brain className="w-10 h-10 text-indigo-400 mx-auto" />
            <h3 className="text-base font-semibold text-slate-100">Paper Uploaded & Ready</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              File: <span className="font-mono text-slate-300">{project.fileName}</span> ({((project.fileSize || 0) / 1024 / 1024).toFixed(2)} MB, {project.pageCount || 1} pages).
              Click below to initiate Agent A (Research Analyst) and Agent B (Feasibility Analyst).
            </p>
            <button
              onClick={handleAnalyze}
              disabled={Boolean(actionLoading)}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md transition-all inline-flex items-center gap-2"
            >
              {actionLoading === 'analyzing' ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Analyzing Research Methodology...</span>
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4" />
                  <span>Analyze Paper Methodology</span>
                </>
              )}
            </button>
          </div>
        )}

        {project.spec && activeTab === 'spec' && (
          <ResearchSpecificationView
            spec={project.spec}
            onProceedToPlanning={() => handlePlan()}
            isPlanning={actionLoading === 'planning'}
          />
        )}

        {project.plan && activeTab === 'plan' && (
          <ImplementationPlanView
            plan={project.plan}
            onApproveAndGenerate={handleApprovePlan}
            isGenerating={actionLoading === 'generating' || actionLoading === 'approving'}
          />
        )}

        {project.artifacts && activeTab === 'code' && (
          <CodeEditorView
            artifacts={project.artifacts}
            onExecuteTests={handleExecuteTests}
            isExecuting={actionLoading === 'executing'}
          />
        )}

        {project.latestExecution && activeTab === 'execution' && (
          <ExecutionResultsView
            run={project.latestExecution}
            debugSession={project.debugSession}
            onDebug={handleDebug}
            onProceedToEvaluation={handleEvaluate}
            isDebugging={actionLoading === 'debugging'}
          />
        )}

        {project.evaluation && activeTab === 'evaluation' && (
          <EvaluationReportView
            evaluation={project.evaluation}
            projectId={project.id}
          />
        )}
      </div>
    </div>
  );
};
