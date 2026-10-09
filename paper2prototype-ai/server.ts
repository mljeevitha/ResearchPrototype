import express, { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { projectStorage } from './src/server/projectStorage.ts';
import { agentOrchestrator } from './src/server/agentOrchestrator.ts';
import { SAMPLE_PAPERS } from './src/server/samplePapers.ts';
import { defaultExecutionProvider } from './src/server/executionRunner.ts';
import { isGeminiConfigured } from './src/server/geminiClient.ts';
import { createRequire } from 'module';
import pdfParseModule from 'pdf-parse';

// Safe resolution for pdf-parse handling both CommonJS and ES module import styles:
// 1. Check if the imported pdf-parse module is a function; if not, use module.default.
// 2. Ensure both CommonJS and ES module import styles are handled safely so that pdfParse(...) executes without throwing a TypeError.
let resolvedPdfParse: any = null;

try {
  const require = createRequire(import.meta.url);
  const libPdfParse = require('pdf-parse/lib/pdf-parse.js');
  if (typeof libPdfParse === 'function') {
    resolvedPdfParse = libPdfParse;
  }
} catch {
  // ignore
}

if (typeof resolvedPdfParse !== 'function') {
  if (typeof pdfParseModule === 'function') {
    resolvedPdfParse = pdfParseModule;
  } else if (pdfParseModule && typeof (pdfParseModule as any).default === 'function') {
    resolvedPdfParse = (pdfParseModule as any).default;
  } else {
    resolvedPdfParse = (pdfParseModule as any)?.default || pdfParseModule;
  }
}

export const pdfParse: (buf: Buffer, options?: any) => Promise<any> = resolvedPdfParse;

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Configure multer for memory storage (max 25MB)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf')) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF documents are supported for paper upload.'));
    }
  },
});

// --- API ROUTES ---

// Health & Environment Diagnostics
app.get('/api/health', (_req: Request, res: Response) => {
  const capabilities = defaultExecutionProvider.getCapabilities();
  const hasGemini = isGeminiConfigured();
  res.json({
    status: 'ok',
    version: '1.0.0',
    geminiConfigured: hasGemini,
    executionProvider: capabilities,
    timestamp: new Date().toISOString(),
  });
});

// Sample Papers
app.get(['/api/samples', '/api/sample-papers'], (_req: Request, res: Response) => {
  res.json(SAMPLE_PAPERS);
});

// Create project from sample paper
app.post('/api/samples/:id/create', (req: Request, res: Response) => {
  try {
    const sample = SAMPLE_PAPERS.find((s) => s.id === req.params.id);
    if (!sample) {
      return res.status(404).json({ error: 'Sample paper not found' });
    }

    const projectId = `proj_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const ownerId = (req.body.ownerId as string) || 'guest';
    const project = projectStorage.createProject(
      projectId,
      sample.title,
      ownerId,
      sample.filename,
      sample.content.length
    );

    projectStorage.setPaperText(projectId, sample.content);
    projectStorage.updateProject(projectId, {
      domain: sample.domain,
      status: 'uploaded',
      currentStage: 'Sample paper loaded, ready for research analysis',
      pageCount: 3,
    });

    res.status(201).json(projectStorage.getProject(projectId));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// List Projects
app.get('/api/projects', (req: Request, res: Response) => {
  const ownerId = req.query.ownerId as string | undefined;
  const list = projectStorage.listProjects(ownerId);
  res.json(list);
});

// Create Project
app.post('/api/projects', (req: Request, res: Response) => {
  try {
    const { title, ownerId, fileName, fileSize } = req.body;
    const projectId = `proj_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const project = projectStorage.createProject(
      projectId,
      title || 'Untitled Research Project',
      ownerId || 'guest',
      fileName || 'paper.pdf',
      fileSize || 0
    );
    res.status(201).json(project);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get Project Details
app.get('/api/projects/:id', (req: Request, res: Response) => {
  const project = projectStorage.getProject(req.params.id);
  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }
  res.json(project);
});

// Delete Project
app.delete('/api/projects/:id', (req: Request, res: Response) => {
  const deleted = projectStorage.deleteProject(req.params.id);
  if (!deleted) {
    return res.status(404).json({ error: 'Project not found' });
  }
  res.json({ success: true, message: 'Project and workspace cleaned up successfully' });
});

// Upload Paper PDF
app.post(
  '/api/projects/:id/upload',
  (req: Request, res: Response, next) => {
    upload.single('file')(req, res, (err) => {
      if (err) {
        return res.status(400).json({ error: err.message || 'File upload error' });
      }
      next();
    });
  },
  async (req: Request, res: Response) => {
    try {
      const projectId = req.params.id;
      const project = projectStorage.getProject(projectId);
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }

      if (!req.file || !req.file.buffer) {
        return res.status(400).json({ error: 'No PDF file attached.' });
      }

      agentOrchestrator.emitEvent(
        projectId,
        'supervisor',
        'Supervisor',
        'progress',
        `Validating and parsing uploaded PDF file (${(req.file.size / 1024 / 1024).toFixed(2)} MB)...`
      );

      const parsed = await projectStorage.parsePdfBuffer(req.file.buffer);

      projectStorage.setPaperText(projectId, parsed.text);

      const updated = projectStorage.updateProject(projectId, {
        title: parsed.titleHint || project.title,
        fileName: req.file.originalname,
        fileSize: req.file.size,
        pageCount: parsed.numPages,
        status: 'uploaded',
        currentStage: `Extracted ${parsed.text.length} characters across ${parsed.numPages} pages. Ready for analysis.`,
        error: undefined,
      });

      agentOrchestrator.emitEvent(
        projectId,
        'supervisor',
        'Supervisor',
        'success',
        `PDF extraction complete: ${parsed.numPages} pages parsed. Title: "${updated.title}".`
      );

      res.json(updated);
    } catch (err: any) {
      const projectId = req.params.id;
      projectStorage.updateStatus(projectId, 'failed', 'PDF extraction failed', err.message);
      agentOrchestrator.emitEvent(
        projectId,
        'supervisor',
        'Supervisor',
        'error',
        `PDF processing error: ${err.message}`
      );
      res.status(400).json({ error: err.message });
    }
  }
);

// Start Research & Feasibility Analysis (Agent A & B)
app.post('/api/projects/:id/analyze', async (req: Request, res: Response) => {
  const projectId = req.params.id;
  const project = projectStorage.getProject(projectId);
  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }

  const paperText = projectStorage.getPaperText(projectId);
  if (!paperText) {
    return res.status(400).json({ error: 'No paper text found for project. Please upload a PDF first.' });
  }

  projectStorage.updateStatus(projectId, 'analyzing', 'Research and Feasibility Agents analyzing methodology...');

  try {
    const spec = await agentOrchestrator.analyzeResearchPaper(project, paperText);

    const updated = projectStorage.updateProject(projectId, {
      title: spec.paperTitle || project.title,
      domain: spec.domain,
      spec,
      status: 'analyzed',
      currentStage: `Analysis complete. Domain: ${spec.domain}. Feasibility: ${spec.feasibility.level}.`,
      error: undefined,
    });

    res.json(updated);
  } catch (err: any) {
    projectStorage.updateStatus(projectId, 'failed', 'Research analysis failed', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Plan Implementation (Agent C)
app.post('/api/projects/:id/plan', async (req: Request, res: Response) => {
  const projectId = req.params.id;
  const project = projectStorage.getProject(projectId);
  if (!project || !project.spec) {
    return res.status(400).json({ error: 'Project must be analyzed before planning.' });
  }

  projectStorage.updateStatus(projectId, 'planning', 'Implementation Planner synthesizing task dependency graph...');

  try {
    const userNotes = req.body.userNotes as string | undefined;
    const plan = await agentOrchestrator.planImplementation(project, project.spec, userNotes);

    const updated = projectStorage.updateProject(projectId, {
      plan,
      status: 'planned',
      currentStage: `Implementation plan formulated (${plan.tasks.length} tasks). Awaiting user review and approval.`,
      error: undefined,
    });

    res.json(updated);
  } catch (err: any) {
    projectStorage.updateStatus(projectId, 'failed', 'Implementation planning failed', err.message);
    res.status(500).json({ error: err.message });
  }
});

// User Approves or Edits Plan
app.post('/api/projects/:id/approve-plan', (req: Request, res: Response) => {
  const projectId = req.params.id;
  const project = projectStorage.getProject(projectId);
  if (!project || !project.plan) {
    return res.status(400).json({ error: 'No implementation plan exists to approve.' });
  }

  const { tasks, userModifications } = req.body;
  if (tasks && Array.isArray(tasks)) {
    project.plan.tasks = tasks;
  }
  project.plan.approvedByUser = true;
  project.plan.userModifications = userModifications;

  const updated = projectStorage.updateProject(projectId, {
    plan: project.plan,
    currentStage: 'Plan approved by user. Ready for code generation.',
  });

  agentOrchestrator.emitEvent(
    projectId,
    'supervisor',
    'Supervisor',
    'info',
    'Implementation plan approved by user. Proceeding with code generation.'
  );

  res.json(updated);
});

// Generate Code (Agent D)
app.post('/api/projects/:id/generate', async (req: Request, res: Response) => {
  const projectId = req.params.id;
  const project = projectStorage.getProject(projectId);
  if (!project || !project.spec || !project.plan) {
    return res.status(400).json({ error: 'Project must be analyzed and planned before code generation.' });
  }

  projectStorage.updateStatus(projectId, 'generating', 'Coding Agent synthesizing modular repository files...');

  try {
    const artifacts = await agentOrchestrator.generateCodeArtifacts(project, project.spec, project.plan);

    // Mark tasks as completed
    project.plan.tasks.forEach((t) => (t.status = 'completed'));

    const updated = projectStorage.updateProject(projectId, {
      artifacts,
      plan: project.plan,
      status: 'generated',
      currentStage: `Code generated (${artifacts.files.length} files). Ready for test execution.`,
      error: undefined,
    });

    res.json(updated);
  } catch (err: any) {
    projectStorage.updateStatus(projectId, 'failed', 'Code generation failed', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Execute Tests (Agent E)
app.post('/api/projects/:id/execute', async (req: Request, res: Response) => {
  const projectId = req.params.id;
  const project = projectStorage.getProject(projectId);
  if (!project || !project.artifacts) {
    return res.status(400).json({ error: 'No code artifacts exist to execute.' });
  }

  projectStorage.updateStatus(projectId, 'testing', 'Execution Agent running isolated sandbox test suite...');

  try {
    const run = await agentOrchestrator.executePrototypeTests(project, project.artifacts);

    const updated = projectStorage.updateProject(projectId, {
      latestExecution: run,
      status: 'tested',
      currentStage: run.passed
        ? `All ${run.passedTests} tests passed in ${run.durationMs}ms.`
        : `Tests failed: ${run.failedTests} failure(s).`,
      error: run.passed ? undefined : `Execution failures: ${run.failedTests} tests failed.`,
    });

    res.json(updated);
  } catch (err: any) {
    projectStorage.updateStatus(projectId, 'failed', 'Execution failed', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Debug & Self-Heal (Agent F)
app.post('/api/projects/:id/debug', async (req: Request, res: Response) => {
  const projectId = req.params.id;
  const project = projectStorage.getProject(projectId);
  if (!project || !project.spec || !project.artifacts || !project.latestExecution) {
    return res.status(400).json({ error: 'Cannot debug without previous execution run.' });
  }

  projectStorage.updateStatus(projectId, 'debugging', 'Debugging Agent analyzing runtime traceback and patching code...');

  try {
    const result = await agentOrchestrator.debugAndSelfHeal(
      project,
      project.spec,
      project.artifacts,
      project.latestExecution,
      project.debugSession
    );

    const updated = projectStorage.updateProject(projectId, {
      artifacts: result.updatedArtifacts,
      latestExecution: result.newRun,
      debugSession: result.session,
      status: result.newRun.passed ? 'tested' : 'debugging',
      currentStage: result.session.finalMessage,
      error: result.newRun.passed ? undefined : result.session.finalMessage,
    });

    res.json(updated);
  } catch (err: any) {
    projectStorage.updateStatus(projectId, 'failed', 'Debugging failed', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Evaluate Prototype (Agent G)
app.post('/api/projects/:id/evaluate', async (req: Request, res: Response) => {
  const projectId = req.params.id;
  const project = projectStorage.getProject(projectId);
  if (!project || !project.spec || !project.artifacts || !project.latestExecution) {
    return res.status(400).json({ error: 'Cannot evaluate without spec, artifacts, and test execution.' });
  }

  try {
    const evaluation = await agentOrchestrator.evaluateImplementation(
      project,
      project.spec,
      project.artifacts,
      project.latestExecution
    );

    const updated = projectStorage.updateProject(projectId, {
      evaluation,
      status: 'evaluated',
      currentStage: `Evaluation complete: ${evaluation.classificationTitle} (${evaluation.reproducibilityScore}%).`,
    });

    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Automated End-to-End Pipeline
app.post('/api/projects/:id/run-pipeline', async (req: Request, res: Response) => {
  const projectId = req.params.id;
  let project = projectStorage.getProject(projectId);
  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }

  const paperText = projectStorage.getPaperText(projectId);
  if (!paperText) {
    return res.status(400).json({ error: 'No paper text found. Please upload a PDF first.' });
  }

  // Respond immediately so user interface can follow via SSE or polling
  res.json({ message: 'Pipeline started', projectId });

  // Run pipeline asynchronously
  (async () => {
    try {
      // 1. Analyze
      projectStorage.updateStatus(projectId, 'analyzing', 'Step 1/5: Research & Feasibility Analysis...');
      const spec = await agentOrchestrator.analyzeResearchPaper(project, paperText);
      project = projectStorage.updateProject(projectId, {
        spec,
        domain: spec.domain,
        title: spec.paperTitle || project.title,
        status: 'analyzed',
      });

      // 2. Plan
      projectStorage.updateStatus(projectId, 'planning', 'Step 2/5: Implementation Planning...');
      const plan = await agentOrchestrator.planImplementation(project, spec);
      plan.approvedByUser = true;
      project = projectStorage.updateProject(projectId, { plan, status: 'planned' });

      // 3. Generate
      projectStorage.updateStatus(projectId, 'generating', 'Step 3/5: Modular Code Synthesis...');
      const artifacts = await agentOrchestrator.generateCodeArtifacts(project, spec, plan);
      project = projectStorage.updateProject(projectId, { artifacts, status: 'generated' });

      // 4. Execute
      projectStorage.updateStatus(projectId, 'testing', 'Step 4/5: Isolated Sandbox Test Execution...');
      let run = await agentOrchestrator.executePrototypeTests(project, artifacts);
      project = projectStorage.updateProject(projectId, { latestExecution: run, status: 'tested' });

      // Self-heal if failed
      if (!run.passed) {
        agentOrchestrator.emitEvent(
          projectId,
          'supervisor',
          'Supervisor',
          'warning',
          'Test suite encountered failures. Engaging Agent F (Debugging Agent) for self-healing...'
        );
        projectStorage.updateStatus(projectId, 'debugging', 'Engaging Debugging Agent for automated patch...');
        const debugResult = await agentOrchestrator.debugAndSelfHeal(
          project,
          spec,
          artifacts,
          run,
          project.debugSession
        );
        project = projectStorage.updateProject(projectId, {
          artifacts: debugResult.updatedArtifacts,
          latestExecution: debugResult.newRun,
          debugSession: debugResult.session,
        });
        run = debugResult.newRun;
      }

      // 5. Evaluate
      projectStorage.updateStatus(projectId, 'evaluated', 'Step 5/5: Academic Rigor Evaluation...');
      const evaluation = await agentOrchestrator.evaluateImplementation(
        project,
        spec,
        project.artifacts || artifacts,
        project.latestExecution || run
      );

      projectStorage.updateProject(projectId, {
        evaluation,
        status: 'evaluated',
        currentStage: `Pipeline finished. Status: ${evaluation.classificationTitle} (${evaluation.reproducibilityScore}%).`,
      });

      agentOrchestrator.emitEvent(
        projectId,
        'supervisor',
        'Supervisor',
        'success',
        `End-to-end pipeline finished successfully. Prototype artifacts and evaluation report ready.`
      );
    } catch (err: any) {
      console.error('Pipeline error:', err);
      let cleanMsg = err.message || 'Pipeline failed';
      if (cleanMsg.includes('{"error":')) {
        try {
          const jsonMatch = cleanMsg.match(/\{"error":.*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            cleanMsg = parsed.error?.message || cleanMsg;
          }
        } catch {
          // ignore
        }
      }
      projectStorage.updateStatus(projectId, 'failed', 'Pipeline failed', cleanMsg);
      agentOrchestrator.emitEvent(
        projectId,
        'supervisor',
        'Supervisor',
        'error',
        `Pipeline execution encountered error: ${cleanMsg}`
      );
    }
  })();
});

// Server-Sent Events (SSE) Stream
app.get('/api/projects/:id/events', (req: Request, res: Response) => {
  const projectId = req.params.id;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  // Send initial connected event
  res.write(`data: ${JSON.stringify({ type: 'connected', projectId, timestamp: new Date().toISOString() })}\n\n`);

  const listener = (event: any) => {
    res.write(`data: ${JSON.stringify(event)}\n\n`);
  };

  agentOrchestrator.addEventListener(projectId, listener);

  req.on('close', () => {
    agentOrchestrator.removeEventListener(projectId, listener);
    res.end();
  });
});

// Export Project as ZIP
app.get('/api/projects/:id/export', async (req: Request, res: Response) => {
  try {
    const projectId = req.params.id;
    const project = projectStorage.getProject(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const zipBuffer = await projectStorage.generateZipArchive(projectId);
    const safeTitle = (project.title || 'prototype').replace(/[^a-zA-Z0-9_\-]/g, '_').slice(0, 40);

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="paper2prototype_${safeTitle}.zip"`);
    res.send(zipBuffer);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Explicit 404 handler for all unmatched API endpoints (prevent Vite SPA html fallback for API calls)
app.all('/api/*', (req: Request, res: Response) => {
  res.status(404).json({ error: `API route not found: ${req.method} ${req.originalUrl}` });
});

// Global API error handler
app.use('/api', (err: any, _req: Request, res: Response, next: any) => {
  console.error('[API Error Middleware]', err);
  if (res.headersSent) {
    return next(err);
  }
  res.status(err.status || 500).json({ error: err.message || 'Internal API error' });
});

// Setup Vite Dev Middlewares or Production Static Files
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Paper2Prototype AI] Full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
