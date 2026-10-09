# Paper2Prototype AI — Universal Research-to-Prototype Agent

**Paper2Prototype AI** is an engineering platform that transforms scientific and technical research papers (PDF) into executable, testable, self-healing software prototypes.

---

## 1. Multi-Agent Orchestration Architecture

Paper2Prototype AI implements a 7-agent supervisor workflow:

- **Supervisor**: Coordinates agent state transitions, maintains project state in persistent storage, streams real-time Server-Sent Events (SSE), and enforces execution timeouts.
- **Agent A (Research Analyst)**: Parses document structure and extracts domain classification, problem definitions, mathematical equations, algorithm step sequences, and I/O specifications.
- **Agent B (Feasibility Analyst)**: Assesses mathematical and computational feasibility (Classified into 6 levels: Feasible, Feasible with Assumptions, Partially Feasible, Blocked by Missing Resources, Requires Specialized Hardware, or Not Reproducible). Formulates a **Minimal Faithful Implementation (MFI)** if full methodology cannot be replicated in a standard environment.
- **Agent C (Implementation Planner)**: Converts the extracted specification into an ordered task plan with explicit dependencies, target files, and acceptance criteria. Users review and approve or modify the plan before synthesis begins.
- **Agent D (Coding Agent)**: Synthesizes modular repository files:
  - `prototype.py`: Core algorithm, model, or numerical simulation classes.
  - `data_loader.py`: Synthetic benchmark data generator and dataset interface.
  - `test_prototype.py`: Python `unittest` test suite covering mathematical invariants, edge cases, convergence bounds, and determinism.
  - `requirements.txt`: Environment manifests.
  - `README.md`: Reproduction documentation and mathematical formulations.
- **Agent E (Execution & Testing Agent)**: Spawns the isolated sandbox execution provider (`python3 -m unittest`), capturing exit codes, stdout, stderr, execution duration, and individual test results.
- **Agent F (Self-Healing Debugging Agent)**: If execution yields errors or test failures, analyzes the traceback, pinpoints the root cause, generates a targeted patch, updates the workspace files, and re-triggers execution (bounded to 3 iterations).
- **Agent G (Academic Evaluation Agent)**: Compares prototype empirical behavior against published research claims, classifies outcome (`Functional Prototype`, `Experimentally Evaluated`, `Partial Reproduction`, etc.), details synthetic data disclosures, computes reproducibility scores, and reports honest validity limits.

---

## 2. Security & Execution Isolation

1. **Prompt Injection Safeguards**: Untrusted document text is isolated inside `<untrusted_research_paper_content>` boundaries with strict model instructions forbidding instructions inside papers from overriding system directives.
2. **Environment Sanitization**: When tests run in the subprocess provider, all API keys (`GEMINI_API_KEY`), host secrets, and tokens are stripped from `process.env`.
3. **Execution Guardrails**:
   - 20-second hard timeout per test run with `SIGKILL` termination.
   - 512 KB output buffer limit to prevent denial-of-service print loops.
   - Filesystem containment: Workspace paths outside `/tmp/p2p_workspaces` are strictly blocked.
4. **MIME & Signature Validation**: Validates `%PDF-` binary magic bytes and a 25 MB upload ceiling.

---

## 3. Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide Icons
- **Backend**: Node.js (v22), Express, Vite middleware integration (`server.ts`)
- **AI Engine**: Gemini 3.8 Flash via `@google/genai` TypeScript SDK
- **Execution Sandbox**: Subprocess execution provider utilizing native Python 3.10 and `unittest`
- **Database & Auth**: Google Cloud Firestore & Firebase Authentication (Google OAuth popup)
- **PDF Engine**: Server-side binary parser with signature verification

---

## 4. Setup & Running Locally

### Prerequisites
- Node.js >= 20
- Python >= 3.10 (built-in `unittest` module)
- Google AI Studio API key (`GEMINI_API_KEY`)

### Installation & Run
```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Ensure GEMINI_API_KEY is configured

# 3. Start development server
npm run dev

# 4. Run automated test suite
npx tsx --test tests/executionAndStorage.test.ts

# 5. Build for production
npm run build
npm start
```
