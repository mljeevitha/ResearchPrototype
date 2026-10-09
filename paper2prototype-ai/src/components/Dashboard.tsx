import React, { useState } from 'react';
import {
  FileText,
  Plus,
  ArrowRight,
  Download,
  Trash2,
  Calendar,
  CheckCircle,
  Clock,
  Sparkles,
  BookOpen,
  Cpu,
  Layers,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react';
import { Project, SamplePaper } from '../types/index.ts';
import { getExportZipUrl } from '../utils/api.ts';

interface DashboardProps {
  projects: Project[];
  samples: SamplePaper[];
  onOpenProject: (projectId: string) => void;
  onNewProject: () => void;
  onSelectSample: (sampleId: string) => void;
  onDeleteProject: (projectId: string) => Promise<void> | void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  projects,
  samples,
  onOpenProject,
  onNewProject,
  onSelectSample,
  onDeleteProject,
}) => {
  const [deletingProjectId, setDeletingProjectId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const getStatusBadge = (status: Project['status']) => {
    switch (status) {
      case 'evaluated':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-950/60 text-emerald-300 border border-emerald-800">
            <CheckCircle className="w-3 h-3 text-emerald-400" />
            Evaluated
          </span>
        );
      case 'tested':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-cyan-950/60 text-cyan-300 border border-cyan-800">
            <Cpu className="w-3 h-3 text-cyan-400" />
            Tested
          </span>
        );
      case 'generated':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-950/60 text-blue-300 border border-blue-800">
            <Layers className="w-3 h-3 text-blue-400" />
            Code Generated
          </span>
        );
      case 'analyzed':
      case 'planned':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-950/60 text-indigo-300 border border-indigo-800">
            <Sparkles className="w-3 h-3 text-indigo-400" />
            Analyzed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
            <Clock className="w-3 h-3 text-slate-400" />
            {status}
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/50 to-slate-900 border border-slate-800 p-8 shadow-xl">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Universal Research-to-Prototype Agent</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Transform Scientific Papers into Executable Prototypes
          </h1>
          <p className="text-slate-300 text-sm leading-relaxed">
            Upload any scientific paper in PDF format. A multi-agent orchestration team extracts the methodology, assesses feasibility, synthesizes modular code and test suites, executes isolated verification in a Python sandbox, self-heals failures, and provides an honest academic evaluation report.
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={onNewProject}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>New Research Project</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Start Benchmark Papers */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-400" />
              <span>Quick-Start Benchmark Papers</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Instantly test the end-to-end multi-agent pipeline with pre-verified cross-domain scientific research
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {samples.map((sample) => (
            <div
              key={sample.id}
              onClick={() => onSelectSample(sample.id)}
              className="p-5 rounded-xl bg-slate-900/60 hover:bg-slate-800/40 border border-slate-800 hover:border-indigo-500/40 cursor-pointer transition-all flex flex-col justify-between group shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-medium">
                    {sample.domain}
                  </span>
                </div>
                <h3 className="text-xs font-semibold text-slate-100 group-hover:text-indigo-300 transition-colors line-clamp-2">
                  {sample.title}
                </h3>
                <p className="text-[11px] text-slate-400 mt-2 line-clamp-3">
                  {sample.abstract}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-indigo-400 font-medium">
                <span>Start Prototype Agent</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Projects List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-100">Research Workspaces</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {projects.length} project{projects.length === 1 ? '' : 's'} in active repository
            </p>
          </div>
          {projects.length > 0 && (
            <button
              onClick={onNewProject}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Import PDF</span>
            </button>
          )}
        </div>

        {projects.length === 0 ? (
          <div className="border border-dashed border-slate-800 rounded-2xl p-12 text-center bg-slate-950/30">
            <div className="w-12 h-12 rounded-full bg-slate-800/60 flex items-center justify-center text-slate-400 mx-auto mb-3">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-slate-200">No Research Projects Yet</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
              Upload a scientific paper PDF to extract its methodology or select one of the benchmark papers above.
            </p>
            <button
              onClick={onNewProject}
              className="mt-4 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium shadow-md transition-colors inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Upload Research Paper</span>
            </button>
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <div className="divide-y divide-slate-800">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="p-4 sm:p-5 hover:bg-slate-800/30 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                >
                  <div
                    onClick={() => onOpenProject(project.id)}
                    className="flex-1 cursor-pointer"
                  >
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      {project.domain && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          {project.domain}
                        </span>
                      )}
                      {getStatusBadge(project.status)}
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(project.updatedAt).toLocaleDateString()}
                      </span>
                    </div>

                    <h4 className="text-sm font-semibold text-slate-100 group-hover:text-indigo-400 transition-colors">
                      {project.title}
                    </h4>

                    <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                      {project.currentStage || 'Initialized'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {project.artifacts && (
                      <a
                        href={getExportZipUrl(project.id)}
                        download
                        onClick={(e) => e.stopPropagation()}
                        title="Download ZIP archive"
                        className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    )}

                    {deletingProjectId === project.id ? (
                      <div
                        className="flex items-center gap-1.5 p-1 bg-red-950/60 border border-red-800/80 rounded-lg animate-fade-in shadow-inner"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span className="text-[11px] text-red-300 font-medium pl-1.5 pr-0.5">Delete?</span>
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            setIsDeleting(true);
                            try {
                              await onDeleteProject(project.id);
                            } finally {
                              setIsDeleting(false);
                              setDeletingProjectId(null);
                            }
                          }}
                          disabled={isDeleting}
                          title="Confirm permanent deletion of this project"
                          className="px-2.5 py-1 bg-red-600 hover:bg-red-500 text-white rounded text-xs font-semibold shadow-sm transition-colors flex items-center gap-1 disabled:opacity-50 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>{isDeleting ? 'Deleting...' : 'Confirm'}</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeletingProjectId(null);
                          }}
                          disabled={isDeleting}
                          title="Cancel deletion"
                          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-medium transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeletingProjectId(project.id);
                        }}
                        title="Delete project"
                        className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      onClick={() => onOpenProject(project.id)}
                      className="px-3.5 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white text-xs font-medium border border-indigo-500/30 transition-all flex items-center gap-1"
                    >
                      <span>Open Workspace</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
