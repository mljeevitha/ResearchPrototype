import { Project, SamplePaper, TaskItem } from '../types/index.ts';

async function parseJsonResponse<T>(res: Response, fallbackError: string): Promise<T> {
  const text = await res.text();
  let json: any = null;
  try {
    json = JSON.parse(text);
  } catch {
    if (!res.ok) {
      throw new Error(`Server returned status ${res.status}: ${text.slice(0, 150) || fallbackError}`);
    }
    throw new Error('Server returned an unexpected non-JSON response.');
  }

  if (!res.ok) {
    throw new Error(json?.error || fallbackError);
  }

  return json as T;
}

export async function fetchHealth(): Promise<{
  status: string;
  version: string;
  geminiConfigured: boolean;
  executionProvider: {
    name: string;
    isSandboxed: boolean;
    isolationLevel: string;
    supportedRuntimes: string[];
    securityDisclosure: string;
  };
}> {
  const res = await fetch('/api/health');
  return parseJsonResponse(res, 'Health check failed');
}

export async function fetchSamples(): Promise<SamplePaper[]> {
  const res = await fetch('/api/samples');
  return parseJsonResponse(res, 'Failed to load sample papers');
}

export async function createProjectFromSample(sampleId: string, ownerId?: string): Promise<Project> {
  const res = await fetch(`/api/samples/${sampleId}/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ownerId: ownerId || 'guest' }),
  });
  return parseJsonResponse<Project>(res, 'Failed to create project from sample');
}

export async function fetchProjects(ownerId?: string): Promise<Project[]> {
  const url = ownerId ? `/api/projects?ownerId=${encodeURIComponent(ownerId)}` : '/api/projects';
  const res = await fetch(url);
  return parseJsonResponse<Project[]>(res, 'Failed to fetch projects');
}

export async function fetchProject(id: string): Promise<Project> {
  const res = await fetch(`/api/projects/${id}`);
  return parseJsonResponse<Project>(res, `Failed to fetch project ${id}`);
}

export async function createProject(
  title: string,
  ownerId?: string,
  fileName?: string,
  fileSize?: number
): Promise<Project> {
  const res = await fetch('/api/projects', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title,
      ownerId: ownerId || 'guest',
      fileName: fileName || 'paper.pdf',
      fileSize: fileSize || 0,
    }),
  });
  return parseJsonResponse<Project>(res, 'Failed to create project');
}

export async function deleteProject(id: string): Promise<void> {
  const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
  await parseJsonResponse<{ success: boolean }>(res, 'Failed to delete project');
}

export async function uploadPaperPdf(id: string, file: File): Promise<Project> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`/api/projects/${id}/upload`, {
    method: 'POST',
    body: formData,
  });

  return parseJsonResponse<Project>(res, 'Failed to upload and parse PDF');
}

export async function analyzeProject(id: string): Promise<Project> {
  const res = await fetch(`/api/projects/${id}/analyze`, { method: 'POST' });
  return parseJsonResponse<Project>(res, 'Research analysis failed');
}

export async function planProject(id: string, userNotes?: string): Promise<Project> {
  const res = await fetch(`/api/projects/${id}/plan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userNotes }),
  });
  return parseJsonResponse<Project>(res, 'Planning failed');
}

export async function approvePlan(
  id: string,
  tasks: TaskItem[],
  userModifications?: string
): Promise<Project> {
  const res = await fetch(`/api/projects/${id}/approve-plan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tasks, userModifications }),
  });
  return parseJsonResponse<Project>(res, 'Plan approval failed');
}

export async function generateCode(id: string): Promise<Project> {
  const res = await fetch(`/api/projects/${id}/generate`, { method: 'POST' });
  return parseJsonResponse<Project>(res, 'Code generation failed');
}

export async function executeTests(id: string): Promise<Project> {
  const res = await fetch(`/api/projects/${id}/execute`, { method: 'POST' });
  return parseJsonResponse<Project>(res, 'Test execution failed');
}

export async function debugProject(id: string): Promise<Project> {
  const res = await fetch(`/api/projects/${id}/debug`, { method: 'POST' });
  return parseJsonResponse<Project>(res, 'Debugging step failed');
}

export async function evaluateProject(id: string): Promise<Project> {
  const res = await fetch(`/api/projects/${id}/evaluate`, { method: 'POST' });
  return parseJsonResponse<Project>(res, 'Evaluation failed');
}

export async function startFullPipeline(id: string): Promise<void> {
  const res = await fetch(`/api/projects/${id}/run-pipeline`, { method: 'POST' });
  await parseJsonResponse<{ message: string }>(res, 'Failed to start automated pipeline');
}

export function getExportZipUrl(id: string): string {
  return `/api/projects/${id}/export`;
}
