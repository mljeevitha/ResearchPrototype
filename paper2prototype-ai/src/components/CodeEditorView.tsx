import React, { useState } from 'react';
import {
  FileCode,
  Download,
  Copy,
  Check,
  Play,
  FileText,
  FolderGit2,
  Terminal,
} from 'lucide-react';
import { CodeArtifacts } from '../types/index.ts';
import { getExportZipUrl } from '../utils/api.ts';

interface CodeEditorViewProps {
  artifacts: CodeArtifacts;
  onExecuteTests: () => void;
  isExecuting?: boolean;
}

export const CodeEditorView: React.FC<CodeEditorViewProps> = ({
  artifacts,
  onExecuteTests,
  isExecuting = false,
}) => {
  const [selectedFileIdx, setSelectedFileIdx] = useState(0);
  const [copied, setCopied] = useState(false);

  const currentFile = artifacts.files[selectedFileIdx] || artifacts.files[0];

  const handleCopy = () => {
    if (!currentFile) return;
    navigator.clipboard.writeText(currentFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadFile = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-900 border border-slate-800">
        <div className="flex items-center gap-2">
          <FolderGit2 className="w-5 h-5 text-indigo-400" />
          <div>
            <h3 className="text-sm font-semibold text-slate-100">
              Generated Prototype Repository ({artifacts.files.length} Files)
            </h3>
            <p className="text-xs text-slate-400">
              Language: Python 3 • Test runner: {artifacts.testFile}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={getExportZipUrl(artifacts.projectId)}
            download
            className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export ZIP</span>
          </a>

          <button
            onClick={onExecuteTests}
            disabled={isExecuting}
            className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            {isExecuting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Running Test Suite in Sandbox...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Execute Isolated Tests</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Editor & File Tree Container */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl min-h-[550px]">
        {/* File Browser Sidebar */}
        <div className="md:col-span-1 border-r border-slate-800 bg-slate-950/60 p-3 flex flex-col justify-between">
          <div>
            <div className="px-2 py-1 text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-2">
              Workspace Files
            </div>
            <div className="space-y-1">
              {artifacts.files.map((file, idx) => (
                <button
                  key={file.path}
                  onClick={() => setSelectedFileIdx(idx)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-mono flex items-center justify-between transition-colors ${
                    selectedFileIdx === idx
                      ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                      : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
                  }`}
                >
                  <span className="flex items-center gap-2 truncate">
                    {file.isTest ? (
                      <Terminal className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    ) : file.path.endsWith('.md') ? (
                      <FileText className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    ) : (
                      <FileCode className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    )}
                    <span className="truncate">{file.path}</span>
                  </span>
                  {file.isTest && (
                    <span className="text-[9px] px-1 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                      TEST
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 px-2 space-y-1">
            <div>Sandbox: Local Subprocess</div>
            <div>Isolation: Env-sanitized</div>
          </div>
        </div>

        {/* Code Content Area */}
        <div className="md:col-span-3 flex flex-col bg-slate-950">
          {/* File Tab Bar */}
          <div className="px-4 py-2.5 border-b border-slate-800 flex items-center justify-between bg-slate-900/40">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-semibold text-slate-200">
                {currentFile?.path}
              </span>
              {currentFile?.description && (
                <span className="text-xs text-slate-400 hidden sm:inline">
                  — {currentFile.description}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors flex items-center gap-1 text-xs"
                title="Copy code"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 text-[11px]">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span className="text-[11px]">Copy</span>
                  </>
                )}
              </button>

              <button
                onClick={() => downloadFile(currentFile.path, currentFile.content)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                title="Download this file"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Syntax Code Display with Line Numbers */}
          <div className="p-4 overflow-x-auto font-mono text-xs text-slate-300 leading-relaxed flex-1 select-text">
            <pre className="table">
              {currentFile?.content.split('\n').map((line, idx) => (
                <div key={idx} className="table-row">
                  <span className="table-cell select-none pr-4 text-right text-slate-600 text-[11px]">
                    {idx + 1}
                  </span>
                  <span className="table-cell whitespace-pre">{line || ' '}</span>
                </div>
              ))}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
