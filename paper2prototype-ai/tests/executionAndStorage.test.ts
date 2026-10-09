import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'fs';
import path from 'path';
import { SubprocessExecutionProvider } from '../src/server/executionRunner.ts';
import { ProjectStorage } from '../src/server/projectStorage.ts';

describe('Paper2Prototype AI Core Subsystems', () => {
  describe('ProjectStorage & Validation', () => {
    const storage = new ProjectStorage();
    const testId = `test_proj_${Date.now()}`;

    it('should create and retrieve project metadata', () => {
      const proj = storage.createProject(testId, 'Test Quantum Paper', 'user_123', 'paper.pdf', 1024);
      assert.strictEqual(proj.id, testId);
      assert.strictEqual(proj.title, 'Test Quantum Paper');
      assert.strictEqual(proj.status, 'created');

      const retrieved = storage.getProject(testId);
      assert.ok(retrieved);
      assert.strictEqual(retrieved?.title, 'Test Quantum Paper');
    });

    it('should validate PDF magic bytes signature %PDF-', async () => {
      // Non-PDF buffer
      const fakeBuffer = Buffer.from('This is not a PDF file');
      await assert.rejects(
        async () => {
          await storage.parsePdfBuffer(fakeBuffer);
        },
        /missing %PDF- magic signature/i
      );
    });

    it('should parse real PDF file using safe pdfParse without TypeError', async () => {
      const samplePdfPath = path.resolve('node_modules/pdf-parse/test/data/01-valid.pdf');
      if (fs.existsSync(samplePdfPath)) {
        const buf = fs.readFileSync(samplePdfPath);
        const parsed = await storage.parsePdfBuffer(buf);
        assert.ok(parsed.text.length > 100);
        assert.ok(parsed.numPages >= 1);
      }
    });

    it('should cleanly delete project and workspace directory', () => {
      const deleted = storage.deleteProject(testId);
      assert.strictEqual(deleted, true);
      const after = storage.getProject(testId);
      assert.strictEqual(after, undefined);
    });
  });

  describe('SubprocessExecutionProvider Sandbox Security', () => {
    const provider = new SubprocessExecutionProvider();
    const testWorkspace = '/tmp/p2p_workspaces/test_sandbox_run';

    it('should block directory traversal attacks outside workspace root', async () => {
      await assert.rejects(
        async () => {
          await provider.executeWorkspaceTests('test', '/etc', 'python');
        },
        /Security Violation/i
      );
    });

    it('should execute real Python test suite and capture exit code, stdout, stderr', async () => {
      if (!fs.existsSync(testWorkspace)) {
        fs.mkdirSync(testWorkspace, { recursive: true });
      }

      // Write a real Python unittest file
      const pythonTestCode = `
import unittest

class TestMathematicalProperties(unittest.TestCase):
    def test_convex_quadratic_minimum(self):
        # f(x) = (x - 3)^2, min at x=3
        x = 0.0
        lr = 0.1
        for _ in range(50):
            grad = 2 * (x - 3)
            x -= lr * grad
        self.assertAlmostEqual(x, 3.0, places=2)

    def test_reproducibility(self):
        import random
        random.seed(42)
        val1 = random.random()
        random.seed(42)
        val2 = random.random()
        self.assertEqual(val1, val2)

if __name__ == '__main__':
    unittest.main()
`;
      fs.writeFileSync(path.join(testWorkspace, 'test_sample.py'), pythonTestCode, 'utf-8');

      const run = await provider.executeWorkspaceTests('test_proj', testWorkspace, 'python');

      assert.strictEqual(run.passed, true);
      assert.strictEqual(run.exitCode, 0);
      assert.strictEqual(run.failedTests, 0);
      assert.ok(run.totalTests >= 2, `Expected at least 2 tests, got ${run.totalTests}`);
      assert.ok(run.durationMs > 0);

      // Clean up test workspace
      fs.rmSync(testWorkspace, { recursive: true, force: true });
    });
  });
});
