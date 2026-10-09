import React from 'react';
import {
  Brain,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  FileCode,
  Cpu,
  Layers,
  Sparkles,
  Database,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { ResearchSpecification, FeasibilityLevel } from '../types/index.ts';

interface ResearchSpecificationViewProps {
  spec: ResearchSpecification;
  onProceedToPlanning: () => void;
  isPlanning?: boolean;
}

export const ResearchSpecificationView: React.FC<ResearchSpecificationViewProps> = ({
  spec,
  onProceedToPlanning,
  isPlanning = false,
}) => {
  const getFeasibilityBadge = (level: FeasibilityLevel) => {
    switch (level) {
      case 'feasible':
        return {
          label: '1. Feasible with Available Resources',
          bg: 'bg-emerald-950/60 border-emerald-800 text-emerald-300',
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
        };
      case 'feasible_with_assumptions':
        return {
          label: '2. Feasible with Stated Assumptions',
          bg: 'bg-cyan-950/60 border-cyan-800 text-cyan-300',
          icon: <CheckCircle2 className="w-4 h-4 text-cyan-400" />,
        };
      case 'partially_feasible':
        return {
          label: '3. Partially Feasible',
          bg: 'bg-amber-950/60 border-amber-800 text-amber-300',
          icon: <AlertTriangle className="w-4 h-4 text-amber-400" />,
        };
      case 'blocked_missing_resources':
        return {
          label: '4. Blocked by Missing Data/Dependencies',
          bg: 'bg-orange-950/60 border-orange-800 text-orange-300',
          icon: <AlertTriangle className="w-4 h-4 text-orange-400" />,
        };
      case 'requires_hardware':
        return {
          label: '5. Requires Specialized Hardware/Infra',
          bg: 'bg-purple-950/60 border-purple-800 text-purple-300',
          icon: <Cpu className="w-4 h-4 text-purple-400" />,
        };
      case 'not_reproducible':
      default:
        return {
          label: '6. Not Reproducible from Stated Information',
          bg: 'bg-rose-950/60 border-rose-800 text-rose-300',
          icon: <ShieldAlert className="w-4 h-4 text-rose-400" />,
        };
    }
  };

  const feasibilityConfig = getFeasibilityBadge(spec.feasibility.level);

  return (
    <div className="space-y-6">
      {/* Top Banner: Feasibility & Domain */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 font-medium">
              Domain: {spec.domain}
            </span>
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium border ${feasibilityConfig.bg}`}>
              {feasibilityConfig.icon}
              <span>{feasibilityConfig.label}</span>
            </div>
          </div>

          <button
            onClick={onProceedToPlanning}
            disabled={isPlanning}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 shadow-md disabled:opacity-50"
          >
            <span>{isPlanning ? 'Planning...' : 'Generate Implementation Plan'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div>
          <h2 className="text-xl font-bold text-slate-100">{spec.paperTitle}</h2>
          {spec.authors && spec.authors.length > 0 && (
            <p className="text-xs text-slate-400 mt-1">Authors: {spec.authors.join(', ')}</p>
          )}
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
          <h4 className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1">Abstract</h4>
          <p className="text-xs text-slate-300 leading-relaxed">{spec.abstract}</p>
        </div>

        {/* Minimal Faithful Implementation Proposal */}
        <div className="p-3.5 rounded-xl bg-indigo-950/20 border border-indigo-800/40">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-300 mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Agent B Feasibility Assessment & Minimal Faithful Implementation (MFI)</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed mb-2">
            {spec.feasibility.rationale}
          </p>
          {spec.feasibility.minimalFaithfulImplementation && (
            <div className="text-xs bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 text-indigo-200">
              <span className="font-semibold text-indigo-400">Proposed MFI Scope: </span>
              {spec.feasibility.minimalFaithfulImplementation}
            </div>
          )}
        </div>
      </div>

      {/* Grid: Problem & Algorithms */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Problem Statement & Objectives */}
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Brain className="w-4 h-4 text-indigo-400" />
              <span>Problem Statement & Objectives</span>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">{spec.problemStatement}</p>

            {spec.researchObjectives && spec.researchObjectives.length > 0 && (
              <div className="mt-3">
                <h4 className="text-xs font-medium text-slate-400 mb-2">Objectives:</h4>
                <ul className="space-y-1.5">
                  {spec.researchObjectives.map((obj, i) => (
                    <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                      <span>{obj}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Mathematical Formulations */}
          {spec.mathematicalFormulation && spec.mathematicalFormulation.length > 0 && (
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <FileCode className="w-4 h-4 text-cyan-400" />
                <span>Extracted Mathematical Formulation</span>
              </h3>
              <div className="space-y-2">
                {spec.mathematicalFormulation.map((eq, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-lg bg-slate-950 font-mono text-xs text-cyan-300 border border-slate-800 overflow-x-auto"
                  >
                    {eq}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Algorithms & Methodology */}
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>Extracted Algorithms ({spec.algorithms.length})</span>
            </h3>

            <div className="space-y-3">
              {spec.algorithms.map((algo, i) => (
                <div key={i} className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                  <div className="text-xs font-semibold text-emerald-300">{algo.name}</div>
                  <p className="text-xs text-slate-400">{algo.description}</p>
                  {algo.steps && algo.steps.length > 0 && (
                    <ol className="list-decimal list-inside space-y-1 text-xs text-slate-300 pl-1 font-mono">
                      {algo.steps.map((st, sidx) => (
                        <li key={sidx} className="leading-relaxed">
                          <span className="font-sans">{st}</span>
                        </li>
                      ))}
                    </ol>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Dataset & I/O Specifications */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Database className="w-4 h-4 text-purple-400" />
              <span>Dataset & Input/Output Pipeline</span>
            </h3>

            <div className="text-xs space-y-2 text-slate-300">
              <div>
                <span className="font-medium text-slate-400">Dataset Requirement: </span>
                <span>{spec.datasetRequirements.description}</span>
              </div>
              <div>
                <span className="font-medium text-slate-400">Public Availability: </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                    spec.datasetRequirements.isPublic
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : 'bg-amber-950 text-amber-300 border border-amber-800'
                  }`}
                >
                  {spec.datasetRequirements.isPublic ? 'Publicly Available' : 'Requires Synthetic Surrogate'}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
                <span className="text-purple-300 font-medium">Synthetic Benchmark Strategy: </span>
                {spec.datasetRequirements.syntheticAlternative}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Provenance & Uncertainty Disclosure */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
        <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2 mb-3">
          <HelpCircle className="w-4 h-4 text-amber-400" />
          <span>Extraction Provenance & Academic Uncertainties</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
            <h4 className="font-medium text-emerald-400">Explicitly Stated in Paper</h4>
            <ul className="space-y-1 text-slate-300 text-[11px]">
              {spec.provenance.explicitlyStated.map((item, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-emerald-500">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
            <h4 className="font-medium text-cyan-400">Inferred by AI Specification</h4>
            <ul className="space-y-1 text-slate-300 text-[11px]">
              {spec.provenance.inferredByAI.map((item, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-cyan-500">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
            <h4 className="font-medium text-amber-400">Missing / Unextractable Details</h4>
            <ul className="space-y-1 text-slate-300 text-[11px]">
              {spec.provenance.unextractableOrMissing.map((item, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-amber-500">?</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
