import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
import JSZip from 'jszip';
import pdfParseModule from 'pdf-parse';
import { Project, ProjectStatus } from '../types/index.ts';

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

const STORAGE_ROOT = '/tmp/p2p_workspaces';
const PROJECTS_INDEX_FILE = path.join(STORAGE_ROOT, 'projects_index.json');

export class ProjectStorage {
  private projects: Map<string, Project> = new Map();
  private paperTexts: Map<string, string> = new Map();

  constructor() {
    if (!fs.existsSync(STORAGE_ROOT)) {
      fs.mkdirSync(STORAGE_ROOT, { recursive: true });
    }
    this.loadIndex();
  }

  private loadIndex() {
    try {
      if (fs.existsSync(PROJECTS_INDEX_FILE)) {
        const data = fs.readFileSync(PROJECTS_INDEX_FILE, 'utf-8');
        const list: Project[] = JSON.parse(data);
        for (const p of list) {
          this.projects.set(p.id, p);
        }
      }
    } catch (err) {
      console.warn('Could not load projects index file:', err);
    }
  }

  private saveIndex() {
    try {
      const list = Array.from(this.projects.values());
      fs.writeFileSync(PROJECTS_INDEX_FILE, JSON.stringify(list, null, 2), 'utf-8');
    } catch (err) {
      console.warn('Could not save projects index file:', err);
    }
  }

  public listProjects(ownerId?: string): Project[] {
    const all = Array.from(this.projects.values());
    if (ownerId && ownerId !== 'guest' && ownerId !== 'all') {
      return all.filter((p) => p.ownerId === ownerId || p.ownerId === 'guest');
    }
    return all.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  public getProject(id: string): Project | undefined {
    return this.projects.get(id);
  }

  public createProject(
    id: string,
    title: string,
    ownerId: string = 'guest',
    fileName: string = 'paper.pdf',
    fileSize: number = 0
  ): Project {
    const project: Project = {
      id,
      ownerId,
      title,
      fileName,
      fileSize,
      status: 'created',
      currentStage: 'Project initialized',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.projects.set(id, project);
    this.saveIndex();
    return project;
  }

  public updateProject(id: string, updates: Partial<Project>): Project {
    const existing = this.projects.get(id);
    if (!existing) {
      throw new Error(`Project ${id} not found`);
    }
    const updated: Project = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.projects.set(id, updated);
    this.saveIndex();
    return updated;
  }

  public updateStatus(id: string, status: ProjectStatus, stage: string, error?: string): Project {
    return this.updateProject(id, {
      status,
      currentStage: stage,
      error: error || undefined,
    });
  }

  public setPaperText(projectId: string, text: string) {
    this.paperTexts.set(projectId, text);
    // Also save to disk inside workspace
    const workspaceDir = path.join(STORAGE_ROOT, projectId);
    if (!fs.existsSync(workspaceDir)) {
      fs.mkdirSync(workspaceDir, { recursive: true });
    }
    fs.writeFileSync(path.join(workspaceDir, 'extracted_paper_text.txt'), text, 'utf-8');
  }

  public getPaperText(projectId: string): string | undefined {
    if (this.paperTexts.has(projectId)) {
      return this.paperTexts.get(projectId);
    }
    const filePath = path.join(STORAGE_ROOT, projectId, 'extracted_paper_text.txt');
    if (fs.existsSync(filePath)) {
      const text = fs.readFileSync(filePath, 'utf-8');
      this.paperTexts.set(projectId, text);
      return text;
    }
    return undefined;
  }

  private extractPdfTextFallback(buffer: Buffer): string {
    try {
      const str = buffer.toString('binary');
      const textChunks: string[] = [];
      const btRegex = /BT[\s\S]*?ET/g;
      let match;
      while ((match = btRegex.exec(str)) !== null) {
        const block = match[0];
        const tjRegex = /\((.*?)\)\s*Tj/g;
        let tjMatch;
        while ((tjMatch = tjRegex.exec(block)) !== null) {
          textChunks.push(tjMatch[1]);
        }
      }
      return textChunks.join(' ').replace(/\\([()\\])/g, '$1').trim();
    } catch {
      return '';
    }
  }

  public async parsePdfBuffer(
    buffer: Buffer
  ): Promise<{ text: string; numPages: number; titleHint?: string }> {
    // 1. Signature check: magic bytes "%PDF-"
    const magic = buffer.slice(0, 5).toString('ascii');
    if (magic !== '%PDF-') {
      throw new Error('Invalid file format: uploaded file is not a valid PDF (missing %PDF- magic signature).');
    }

    let text = '';
    let numPages = 1;
    let titleHint: string | undefined;

    // 2. Parse PDF supporting both function and class styles safely
    try {
      if (typeof pdfParse === 'function') {
        const parsed = await pdfParse(buffer, { max: 50 });
        text = (parsed?.text || '').trim();
        numPages = parsed?.numpages || 1;
        titleHint = parsed?.info?.Title || undefined;
      } else if (pdfParse && typeof (pdfParse as any).PDFParse === 'function') {
        const parser = new (pdfParse as any).PDFParse({ data: buffer });
        try {
          const textRes = await parser.getText();
          text = (textRes?.text || '').trim();
          numPages = textRes?.total || (textRes?.pages ? textRes.pages.length : 1);
          const infoRes = await parser.getInfo().catch(() => null);
          titleHint = infoRes?.info?.Title || undefined;
        } finally {
          await parser.destroy().catch(() => {});
        }
      }
    } catch (parseErr: any) {
      console.warn('[PDF Parser] Primary parser failed, attempting fallback extractor:', parseErr.message);
    }

    // 3. Fallback text extraction if needed
    if (!text || text.length < 20) {
      const fallbackText = this.extractPdfTextFallback(buffer);
      if (fallbackText && fallbackText.length > text.length) {
        text = fallbackText;
      }
    }

    if (!text || text.length < 15) {
      throw new Error(
        'Insufficient extractable text: The uploaded PDF appears to be scanned or image-only without an embedded text layer. Please use an OCR-processed or text-searchable PDF.'
      );
    }

    const firstNonEmpty = text
      .split('\n')
      .map((l: string) => l.trim())
      .filter((l: string) => l.length > 5 && !l.startsWith('--'))[0];

    if (!titleHint && firstNonEmpty && firstNonEmpty.length < 180) {
      titleHint = firstNonEmpty;
    }

    return {
      text,
      numPages,
      titleHint,
    };
  }

  public async generateZipArchive(projectId: string): Promise<Buffer> {
    const project = this.getProject(projectId);
    if (!project || !project.artifacts) {
      throw new Error('Project or generated artifacts not found.');
    }

    const zip = new JSZip();
    const folderName = `paper2prototype_${projectId.slice(0, 8)}`;
    const root = zip.folder(folderName) || zip;

    for (const file of project.artifacts.files) {
      root.file(file.path, file.content);
    }

    // Add evaluation report if present
    if (project.evaluation) {
      root.file('EVALUATION_REPORT.json', JSON.stringify(project.evaluation, null, 2));
    }

    // Add research spec if present
    if (project.spec) {
      root.file('RESEARCH_SPECIFICATION.json', JSON.stringify(project.spec, null, 2));
    }

    return await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  }

  public deleteProject(projectId: string): boolean {
    const existed = this.projects.delete(projectId);
    this.paperTexts.delete(projectId);
    this.saveIndex();

    // Clean up directory
    const workspaceDir = path.join(STORAGE_ROOT, projectId);
    if (fs.existsSync(workspaceDir)) {
      try {
        fs.rmSync(workspaceDir, { recursive: true, force: true });
      } catch (err) {
        console.warn(`Failed to clean workspace directory ${workspaceDir}:`, err);
      }
    }

    return existed;
  }
}

export const projectStorage = new ProjectStorage();
