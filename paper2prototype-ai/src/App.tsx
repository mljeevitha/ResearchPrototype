import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './firebase/context.tsx';
import { Header } from './components/Header.tsx';
import { Dashboard } from './components/Dashboard.tsx';
import { AgentWorkspace } from './components/AgentWorkspace.tsx';
import { UploadModal } from './components/UploadModal.tsx';
import { Project, SamplePaper } from './types/index.ts';
import {
  fetchProjects,
  fetchProject,
  fetchSamples,
  fetchHealth,
  deleteProject as apiDeleteProject,
  createProjectFromSample,
} from './utils/api.ts';

const AppContent: React.FC = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [samples, setSamples] = useState<SamplePaper[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [geminiReady, setGeminiReady] = useState(true);
  const [loading, setLoading] = useState(true);

  // Load health diagnostics, samples, and projects on boot
  useEffect(() => {
    async function init() {
      try {
        const [healthData, samplesData, projectsData] = await Promise.all([
          fetchHealth().catch(() => ({ geminiConfigured: true })),
          fetchSamples().catch(() => []),
          fetchProjects(user?.uid || 'guest').catch(() => []),
        ]);

        if (healthData && typeof healthData.geminiConfigured === 'boolean') {
          setGeminiReady(healthData.geminiConfigured);
        }
        setSamples(samplesData);
        setProjects(projectsData);
      } catch (err) {
        console.error('Initialization error:', err);
      } finally {
        setLoading(false);
      }
    }

    init();
  }, [user?.uid]);

  const refreshProjectsList = async () => {
    try {
      const data = await fetchProjects(user?.uid || 'guest');
      setProjects(data);
    } catch (err) {
      console.error('Failed to refresh projects:', err);
    }
  };

  const handleOpenProject = async (projectId: string) => {
    try {
      const p = await fetchProject(projectId);
      setCurrentProject(p);
    } catch (err) {
      console.error('Failed to open project:', err);
    }
  };

  const handleRefreshCurrentProject = async () => {
    if (!currentProject) return;
    try {
      const p = await fetchProject(currentProject.id);
      setCurrentProject(p);
      refreshProjectsList();
    } catch (err) {
      console.error('Failed to refresh project:', err);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      await apiDeleteProject(projectId);
      if (currentProject?.id === projectId) {
        setCurrentProject(null);
      }
      refreshProjectsList();
    } catch (err) {
      console.error('Failed to delete project:', err);
    }
  };

  const handleSelectSample = async (sampleId: string) => {
    try {
      const proj = await createProjectFromSample(sampleId, user?.uid || 'guest');
      setCurrentProject(proj);
      refreshProjectsList();
    } catch (err) {
      console.error('Failed to launch sample paper:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      <Header
        currentProjectTitle={currentProject?.title}
        onBackToDashboard={() => setCurrentProject(null)}
        geminiReady={geminiReady}
      />

      <main className="flex-1">
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
            <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-slate-400 font-mono">Initializing Research Environment...</p>
          </div>
        ) : currentProject ? (
          <AgentWorkspace
            project={currentProject}
            onRefreshProject={handleRefreshCurrentProject}
            onDeleteProject={() => handleDeleteProject(currentProject.id)}
          />
        ) : (
          <Dashboard
            projects={projects}
            samples={samples}
            onOpenProject={handleOpenProject}
            onNewProject={() => setIsUploadModalOpen(true)}
            onSelectSample={handleSelectSample}
            onDeleteProject={handleDeleteProject}
          />
        )}
      </main>

      {/* Global PDF Upload & Sample Modal */}
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        samples={samples}
        onProjectReady={(projectId) => {
          handleOpenProject(projectId);
          refreshProjectsList();
        }}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
