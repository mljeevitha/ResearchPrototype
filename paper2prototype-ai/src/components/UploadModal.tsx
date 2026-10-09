import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileText,
  X,
  AlertCircle,
  CheckCircle2,
  BookOpen,
  ArrowRight,
  Loader2,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { SamplePaper } from '../types/index.ts';
import { uploadPaperPdf, createProject, createProjectFromSample } from '../utils/api.ts';
import { useAuth } from '../firebase/context.tsx';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  samples: SamplePaper[];
  onProjectReady: (projectId: string) => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  samples,
  onProjectReady,
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'upload' | 'samples'>('upload');
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [projectTitle, setProjectTitle] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressStatus, setProgressStatus] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    setError(null);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelected = (file: File) => {
    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      setError('Invalid format: Please upload a scientific research paper in PDF format (.pdf).');
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      setError(`File size (${(file.size / 1024 / 1024).toFixed(1)} MB) exceeds the 25 MB server upload limit.`);
      return;
    }
    setSelectedFile(file);
    if (!projectTitle) {
      // Suggest cleaner title from filename
      const cleanName = file.name
        .replace(/\.pdf$/i, '')
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());
      setProjectTitle(cleanName);
    }
  };

  const handleUploadSubmit = async () => {
    if (!selectedFile) return;
    setIsProcessing(true);
    setError(null);
    setProgressStatus('Creating project workspace on server...');

    try {
      const proj = await createProject(
        projectTitle || selectedFile.name,
        user?.uid || 'guest',
        selectedFile.name,
        selectedFile.size
      );

      setProgressStatus('Uploading PDF and extracting text layer via server-side parser...');
      const updatedProj = await uploadPaperPdf(proj.id, selectedFile);

      setProgressStatus('PDF validated and parsed successfully!');
      setTimeout(() => {
        setIsProcessing(false);
        onProjectReady(updatedProj.id);
        onClose();
      }, 500);
    } catch (err: any) {
      console.error('Upload failed:', err);
      setError(err.message || 'Failed to upload and parse paper PDF.');
      setIsProcessing(false);
    }
  };

  const handleSampleSelect = async (sample: SamplePaper) => {
    setIsProcessing(true);
    setError(null);
    setProgressStatus(`Loading benchmark paper "${sample.title.slice(0, 40)}..."`);

    try {
      const proj = await createProjectFromSample(sample.id, user?.uid || 'guest');
      setProgressStatus('Sample paper loaded! Ready for multi-agent analysis.');
      setTimeout(() => {
        setIsProcessing(false);
        onProjectReady(proj.id);
        onClose();
      }, 500);
    } catch (err: any) {
      console.error('Sample loading failed:', err);
      setError(err.message || 'Failed to load sample paper.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div>
            <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-400" />
              <span>Import Research Paper</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Upload a scientific PDF or select a verified benchmark research paper
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-6 pt-3 gap-6">
          <button
            onClick={() => setActiveTab('upload')}
            className={`pb-3 text-xs font-medium border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'upload'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-300'
            }`}
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload Custom PDF</span>
          </button>
          <button
            onClick={() => setActiveTab('samples')}
            className={`pb-3 text-xs font-medium border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'samples'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-300'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Verified Benchmark Samples</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-indigo-500/20 text-indigo-300 font-mono">
              {samples.length}
            </span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-3 rounded-lg bg-red-950/40 border border-red-800/80 text-red-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Processing Error</p>
                <p className="text-red-300/90 mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {activeTab === 'upload' ? (
            <div className="space-y-4">
              {/* Dropzone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleFileDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                  dragOver
                    ? 'border-indigo-400 bg-indigo-950/20'
                    : selectedFile
                    ? 'border-emerald-500/50 bg-emerald-950/10'
                    : 'border-slate-700 hover:border-slate-600 bg-slate-950/30'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".pdf,application/pdf"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileSelected(e.target.files[0]);
                    }
                  }}
                />

                {selectedFile ? (
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mb-3">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-semibold text-slate-200">{selectedFile.name}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • PDF Document
                    </p>
                    <div className="flex items-center gap-2 mt-3">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFile(null);
                        }}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-red-950/40 text-slate-300 hover:text-red-400 text-xs font-medium border border-slate-700 hover:border-red-800/50 transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove file</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-3">
                      <UploadCloud className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-medium text-slate-200">
                      Drag and drop your research paper PDF here
                    </p>
                    <p className="text-xs text-slate-400 mt-1">or browse files on your computer</p>
                    <p className="text-[11px] text-slate-400 mt-3 font-mono">
                      Max file size: 25 MB • Accepts searchable scientific PDFs
                    </p>
                  </div>
                )}
              </div>

              {/* Title input */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Project Title (Optional)
                </label>
                <input
                  type="text"
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  placeholder="Auto-detected from PDF header or enter custom title"
                  disabled={isProcessing}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 text-xs focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              {isProcessing && (
                <div className="p-3 bg-indigo-950/30 border border-indigo-800/40 rounded-lg space-y-2">
                  <div className="flex items-center gap-2 text-xs text-indigo-300">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                    <span>{progressStatus}</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                    <div className="bg-indigo-500 h-full w-2/3 animate-pulse" />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-slate-400">
                Test the complete agent vertical slice immediately with real pre-packaged scientific methodologies:
              </p>
              <div className="space-y-2.5">
                {samples.map((sample) => (
                  <div
                    key={sample.id}
                    onClick={() => !isProcessing && handleSampleSelect(sample)}
                    className="p-3.5 rounded-xl border border-slate-800 hover:border-indigo-500/50 bg-slate-950/40 hover:bg-slate-800/30 cursor-pointer transition-all flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                          {sample.domain}
                        </span>
                        <span className="text-[10px] text-slate-400">{sample.authors.join(', ')}</span>
                      </div>
                      <h4 className="text-xs font-semibold text-slate-200 group-hover:text-indigo-300 transition-colors">
                        {sample.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                        {sample.description}
                      </p>
                    </div>

                    <div className="mt-2.5 flex items-center justify-end text-[11px] text-indigo-400 font-medium group-hover:translate-x-0.5 transition-transform">
                      <span>Load Paper & Start Pipeline</span>
                      <ArrowRight className="w-3 h-3 ml-1" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Untrusted document text isolated with security safeguards</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="px-3 py-1.5 text-xs text-slate-300 hover:text-white transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            {activeTab === 'upload' && (
              <button
                onClick={handleUploadSubmit}
                disabled={!selectedFile || isProcessing}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 shadow-sm"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <span>Upload & Continue</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
