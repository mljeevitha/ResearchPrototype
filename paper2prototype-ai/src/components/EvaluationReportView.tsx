import React from 'react';
import {
  Award,
  CheckCircle2,
  AlertTriangle,
  Scale,
  Download,
  Database,
  Cpu,
  FileCheck,
  ShieldCheck,
  Info,
} from 'lucide-react';
import { EvaluationReport } from '../types/index.ts';
import { getExportZipUrl } from '../utils/api.ts';

interface EvaluationReportViewProps {
  evaluation: EvaluationReport;
  projectId: string;
}

export const EvaluationReportView: React.FC<EvaluationReportViewProps> = ({
  evaluation,
  projectId,
}) => {
  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-2">
              <Award className="w-3.5 h-3.5" />
              <span>Agent G Academic Rigor Evaluation</span>
            </div>
            <h2 className="text-xl font-bold text-slate-100">
              {evaluation.classificationTitle}
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              {evaluation.summary}
            </p>
          </div>

          <div className="flex flex-col items-center sm:items-end justify-center shrink-0">
            <div className="text-right">
              <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                Reproducibility Score
              </div>
              <div className="text-3xl font-extrabold text-indigo-400 font-mono">
                {evaluation.reproducibilityScore}%
              </div>
            </div>
            <div className="w-32 bg-slate-800 h-2 rounded-full overflow-hidden mt-1.5 border border-slate-700">
              <div
                className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${evaluation.reproducibilityScore}%` }}
              />
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
          <span className="text-[11px] text-slate-400 font-mono">
            Generated: {new Date(evaluation.generatedAt).toLocaleString()}
          </span>

          <a
            href={getExportZipUrl(projectId)}
            download
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-md transition-colors inline-flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Complete Prototype Package (ZIP)</span>
          </a>
        </div>
      </div>

      {/* Component Implementation Audit */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <FileCheck className="w-4 h-4 text-emerald-400" />
          <span>Implemented Components Audit ({evaluation.implementedComponents.length})</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {evaluation.implementedComponents.map((comp, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-200">{comp.name}</span>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase ${
                    comp.status === 'faithful'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : comp.status === 'approximated'
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                      : comp.status === 'synthetic_baseline'
                      ? 'bg-purple-950 text-purple-300 border border-purple-800'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                >
                  {comp.status.replace('_', ' ')}
                </span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">{comp.details}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Theoretical Comparison Table */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <Scale className="w-4 h-4 text-cyan-400" />
          <span>Paper Methodology vs Prototype Empirical Behavior</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-[11px] font-mono text-slate-400 border-b border-slate-800 uppercase">
              <tr>
                <th className="py-2.5 px-3">Paper Claim</th>
                <th className="py-2.5 px-3">Prototype Behavior</th>
                <th className="py-2.5 px-3">Agreement</th>
                <th className="py-2.5 px-3">Analysis</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {evaluation.theoreticalComparison.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-800/20">
                  <td className="py-3 px-3 font-medium text-slate-200">{row.paperClaim}</td>
                  <td className="py-3 px-3 text-slate-300">{row.prototypeBehavior}</td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase ${
                        row.agreement === 'matched'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : row.agreement === 'partial'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {row.agreement}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-400 text-[11px]">{row.explanation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Honest Disclosures and Limitations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Dataset Disclosures */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <h4 className="text-xs font-semibold text-slate-200 flex items-center gap-2">
            <Database className="w-4 h-4 text-purple-400" />
            <span>Dataset & Data Provenance Disclosure</span>
          </h4>
          <div className="space-y-2 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Original Research Data:</span>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                  evaluation.datasetDisclosures.originalDatasetUsed
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    : 'bg-amber-950 text-amber-300 border border-amber-800'
                }`}
              >
                {evaluation.datasetDisclosures.originalDatasetUsed ? 'Original' : 'Synthetic Benchmark'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">{evaluation.datasetDisclosures.datasetNotes}</p>
            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 text-[11px] text-indigo-300">
              <span className="font-semibold">Synthetic Validation: </span>
              {evaluation.datasetDisclosures.syntheticBenchmarkDetails}
            </div>
          </div>
        </div>

        {/* Hardware & Academic Bounds */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <h4 className="text-xs font-semibold text-slate-200 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span>Hardware & Execution Limitations</span>
          </h4>
          <ul className="space-y-1.5 text-xs text-slate-300">
            {evaluation.hardwareLimitations.map((lim, idx) => (
              <li key={idx} className="flex items-start gap-1.5 text-[11px]">
                <span className="text-cyan-400">•</span>
                <span>{lim}</span>
              </li>
            ))}
          </ul>

          <div className="pt-2 border-t border-slate-800">
            <div className="text-[11px] font-medium text-amber-400 mb-1 flex items-center gap-1">
              <Info className="w-3 h-3" />
              <span>Recommendations for Production Reproduction:</span>
            </div>
            <ul className="space-y-1 text-[11px] text-slate-400">
              {evaluation.honestLimitationsAndRecommendations.map((rec, idx) => (
                <li key={idx} className="flex items-start gap-1">
                  <span>-</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
