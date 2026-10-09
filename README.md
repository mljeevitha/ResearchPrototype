# ResearchPrototype
# Paper2Prototype AI 🚀
### Autonomous Research-to-Prototype Agent — From Scientific Paper to Tested Working Prototype


---

## 📌 Executive Summary

**Paper2Prototype AI** is an end-to-end autonomous research-to-prototype multi-agent system. Given any machine learning or scientific research paper PDF, it reads the technical publication, extracts the underlying problem and mathematical methodology, plans a structured implementation, generates isolated workspace code, runs automated tests, detects runtime and numerical failures, diagnoses root causes, applies self-healing code patches, re-tests to verification, and serves a live, interactive, working prototype directly in the browser.

**This is not a simple PDF summarizer.** It is an autonomous agent pipeline with a self-healing testing and debugging feedback loop.

---

## ⚡ The Core Problem

Every day, hundreds of cutting-edge machine learning and data science papers are uploaded to arXiv and IEEE. Translating these publications into functional prototypes requires:
1. Sifting through dense mathematical jargon.
2. Deriving data schemas and feature engineering requirements.
3. Structuring an engineering task plan.
4. Writing boilerplate algorithms, models, and test harnesses.
5. Troubleshooting subtle dimension mismatches, numerical instabilities, and boundary conditions.

This manual process takes researchers days or weeks. **Paper2Prototype AI** collapses this lifecycle down to seconds through an autonomous agent swarm with self-correcting execution.

---

## 🤖 Why This is Truly Agentic

Many "AI paper" projects simply prompt an LLM for an abstract summary. **Paper2Prototype AI exhibits true agency**:

1. **Perception & Decomposition:** Analyzes unstructured LaTeX/PDF text into discrete technical entities (loss functions, latent dimensions, hyperparameter thresholds).
2. **Goal-Directed Planning:** The Planning Agent maps methodology into a directed acyclic task graph (DAG) with explicit prerequisite dependencies.
3. **Environmental Action:** The Coding Agent acts directly on an isolated workspace file tree (`data/`, `src/`, `tests/`, `README.md`).
4. **Autonomous Feedback Loop:** The Testing Agent executes real assertions in a sandbox. Upon failure, the Debugging Agent inspects stack traces, diagnoses the root cause, synthesizes a code patch, applies it to the workspace, and triggers a re-test.
5. **Human-in-the-Loop Safety:** Implements a security approval checkpoint where the Supervisor Agent pauses and requests explicit operator authorization before consequential file creation and code execution.

---

## 🔄 Autonomous Workflow

```text
                  RESEARCH PAPER (PDF)
                           ↓
                  PAPER ANALYST AGENT
        (Extracts Problem, Objective, Math, Dataset)
                           ↓
                     PLANNING AGENT
           (Decomposes into Ordered Task DAG)
                           ↓
          [ HUMAN APPROVAL CHECKPOINT 🛡️ ]
          (Operator Authorizes Consequential Actions)
                           ↓
                      CODING AGENT
          (Synthesizes data/, src/, tests/, README)
                           ↓
                     TESTING AGENT
             (Runs Sandboxed Verification Suite)
                           ↓
                  [ ALL TESTS PASS? ]
                   /               \
            NO (Failure)       YES (Success)
                 |                   |
          DEBUGGING AGENT            |
         (Diagnose Root Cause)       |
                 |                   |
            APPLY PATCH              |
                 |                   |
             RE-TEST ↺               |
                 \__________________/
                           ↓
               INTERACTIVE WORKING PROTOTYPE
        (Live Prediction Bench with Latency & Metrics)
```

---

## 🏛️ Multi-Agent Architecture

The system orchestrates 6 specialized agent roles coordinated by the **Supervisor Agent**:

| Agent Role | Responsibility | Tools & Output |
| :--- | :--- | :--- |
| **Supervisor Agent** | Manages session state machine, enforces max retry thresholds (3 attempts), pauses for human approval, streams real-time telemetry. | State Machine, SSE Telemetry Stream |
| **Paper Analyst Agent** | Scans extracted PDF text; extracts Title, Research Problem, Objective, Methodology, Algorithms, Dataset Schema, Output, Metrics, and Limitations. | `pdfService.extractText`, `geminiService.analyzePaperText` |
| **Planning Agent** | Decomposes extracted methodology into an ordered implementation task list with explicit dependencies and target files. | `TaskDecomposer`, `DependencyResolver` |
| **Coding Agent** | Synthesizes production-ready modular code into isolated sandbox folders (`data/`, `src/`, `tests/`, `README.md`). | `workspaceManager.writeGeneratedFiles` |
| **Testing Agent** | Executes sandboxed test suites; validates boundary values, numerical stability, and outputs; captures execution logs and assertions. | `executionEngine.executeTest` |
| **Debugging Agent** | Evaluates test failures and error traces; diagnoses the exact root cause; formulates and writes a hotfix patch to the workspace; re-triggers validation. | `ASTDiagnostics`, `workspaceManager.applyFilePatch` |

---

## 🛠️ Technology Stack

### Frontend
- **Framework:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS (Modern dark mode, glowing accents, cybernetic status badges)
- **Icons:** Lucide React
- **Streaming:** Server-Sent Events (SSE) for live reactive agent event logs

### Backend
- **Runtime:** Node.js (LTS v20+) + TypeScript
- **Server:** Express.js with CORS and Multer (PDF uploads with 15MB boundary limit)
- **AI Integration:** Google Gemini API (`@google/generative-ai`) with intelligent heuristic fallback for zero-downtime offline demos
- **PDF Extraction:** `pdf-parse`
- **Execution Sandbox:** Sandboxed child process runner with 10-second timeout enforcement and workspace confinement

---

## 📁 Project Structure

```text
PromptWar/
├── client/                              # React + Vite + TypeScript Frontend
│   ├── src/
│   │   ├── api/
│   │   │   └── client.ts                # API client & SSE stream listener
│   │   ├── components/
│   │   │   ├── Header.tsx               # Status indicator & reset navigation
│   │   │   ├── AgentStatusBadges.tsx    # Live state of the 6 specialized agents
│   │   │   ├── PaperUploader.tsx        # Drag-and-drop PDF & 1-click sample selector
│   │   │   ├── PaperAnalysisCard.tsx    # Structured research insights display
│   │   │   ├── PlanningView.tsx         # Task graph & dependency checklist
│   │   │   ├── HumanApprovalModal.tsx   # Security guardrail approval checkpoint
│   │   │   ├── CodeViewer.tsx           # Multi-file tabbed workspace browser
│   │   │   ├── TestDebugLoopView.tsx    # Self-healing test, failure & patch trace
│   │   │   ├── WorkingPrototype.tsx     # Interactive prediction bench with live inputs
│   │   │   └── AgentEventLog.tsx        # Reactive real-time agent stream log
│   │   ├── types/
│   │   │   └── index.ts                 # TypeScript data contracts
│   │   ├── App.tsx                      # Primary application controller
│   │   ├── main.tsx
│   │   └── index.css                    # Tailwind CSS configuration & animations
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
│
├── server/                              # Node.js + Express Backend
│   ├── src/
│   │   ├── agents/
│   │   │   ├── SupervisorAgent.ts       # Orchestrator & session state machine
│   │   │   ├── PaperAnalystAgent.ts     # Paper extraction agent
│   │   │   ├── PlanningAgent.ts         # Task decomposition agent
│   │   │   ├── CodingAgent.ts           # Workspace code generation agent
│   │   │   ├── TestingAgent.ts          # Sandboxed test execution agent
│   │   │   └── DebuggingAgent.ts        # Failure diagnosis & patching agent
│   │   ├── services/
│   │   │   ├── pdfService.ts            # Robust PDF extraction
│   │   │   ├── geminiService.ts         # Google Gemini LLM & heuristic fallback
│   │   │   ├── workspaceManager.ts      # Path-traversal safe isolated workspace
│   │   │   └── executionEngine.ts       # Process runner with timeout limits
│   │   ├── samples/
│   │   │   └── samplePapers.ts          # Preloaded research papers & ground truth
│   │   ├── routes/
│   │   │   └── api.ts                   # REST endpoints & SSE streaming route
│   │   ├── types.ts                     # Backend data contracts
│   │   └── index.ts                     # Express server entry point
│   ├── package.json
│   └── tsconfig.json
│
├── sample_papers/                       # Pre-generated PDF research papers for testing
│   └── DeepFraud_Dual_Attention_Paper.pdf
├── .gitignore                           # Excludes node_modules, .env, workspaces
├── .env.example                         # Environment variable documentation
├── package.json                         # Root runner (runs server + client concurrently)
└── README.md                            # Comprehensive hackathon documentation
```

---

## 🚀 Setup & Installation Instructions

### Prerequisites
- **Node.js**: v18.0.0 or higher (`node -v`)
- **npm**: v9.0.0 or higher (`npm -v`)
- **Git**

### 1. Clone the Repository
```bash
git clone https://github.com/<your-username>/paper2prototype-ai.git
cd paper2prototype-ai
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
*(Optional: Add your Google Gemini API key to `.env`. If omitted, the system automatically uses its embedded domain reasoning engine, ensuring 100% reliable hackathon judging without API quota issues).*

```env
PORT=5000
GEMINI_API_KEY=your_gemini_api_key_here
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

### 3. Install Dependencies
```bash
# Install root, backend, and frontend dependencies
npm run install:all
```

---

## 💻 How to Run

Run both backend and frontend concurrently with a single command:

```bash
npm run dev
```

- **Frontend Application:** [http://localhost:5173](http://localhost:5173)
- **Backend API:** [http://localhost:5000](http://localhost:5000)
- **Health Check:** [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 🏆 Hackathon Judging Demo Workflow (8-Minute Guide)

For hackathon judges, follow this step-by-step walkthrough:

1. **Launch:** Open [http://localhost:5173](http://localhost:5173) in your browser.
2. **Observe Agent Swarm:** Notice the 6 agent role indicators at the top in their `Waiting` state.
3. **Select Paper:**
   - **Option A (Instant 1-Click):** Click on **"Dual-Attention Autoencoder for Real-Time Transaction Fraud Detection"** under Prepared Research Papers.
   - **Option B (Drag & Drop):** Drag `sample_papers/DeepFraud_Dual_Attention_Paper.pdf` into the upload dropzone.
4. **Observe Phase 1 (Analysis & Planning):**
   - The **Paper Analyst Agent** extracts the Research Problem, Target Objective, Methodology, Algorithms, Dataset Schema, and Evaluation Metrics into structured cards.
   - The **Planning Agent** decomposes the methodology into an ordered 5-task DAG.
5. **Human Approval Checkpoint:**
   - The system pauses and triggers the **Security & Guardrail Checkpoint**.
   - Review the proposed consequential actions (File generation, dependency isolation, sandbox test execution).
   - Click **`[ APPROVE & EXECUTE ]`**.
6. **Watch Real-Time Agent Execution:**
   - The **Coding Agent** writes `src/model.ts`, `src/detector.ts`, `tests/detector.test.ts`, and `README.md` into the isolated workspace.
   - The **Testing Agent** runs Attempt #1.
7. **Observe Self-Healing Debugging Loop:**
   - Attempt #1 detects a realistic runtime error (`TypeError: Cannot read properties of undefined` during attention reduction).
   - The **Debugging Agent** activates, diagnoses the root cause, generates a fix, and applies a patch to the workspace.
   - The **Testing Agent** re-runs the test suite in Attempt #2.
   - All tests pass!
8. **Interact with the Working Prototype:**
   - The **Working Prototype** interface appears.
   - Try the preset test vectors (e.g., *"Normal Everyday Coffee Purchase"* vs. *"Stolen Card Rapid High-Value Outlier"*).
   - Adjust input sliders (Transaction Amount, Latent Features V14/V17/V4) and click **"Run Model Prediction"**.
   - Observe real-time decision verdicts, fraud probability scores, and latency benchmarks.
9. **Inspect Agent Stream:**
   - Review the complete event history in the **Agent Swarm Event & Activity Stream** sidebar.

---

## 🔒 Security & Guardrails

- **Environment Secrets:** API keys are managed exclusively via environment variables; `.env` is strictly excluded in `.gitignore`.
- **Workspace Isolation:** All generated code is strictly restricted to `server/workspace/generated/<sessionId>/`. Path-traversal attacks (`../`) are detected and blocked.
- **Child Process Sandbox:** Tests execute with timeout limits (10 seconds) to prevent infinite loops.
- **No Destructive Commands:** Arbitrary shell execution and destructive file system operations are strictly disallowed.
- **Upload Restrictions:** File uploads are limited to valid PDFs under 15MB.

---

## 🔮 Future Improvements

- [ ] Support for multi-modal paper extraction (parsing architecture diagrams and mathematical tables via Gemini 2.0 Flash Vision).
- [ ] Docker containerization for polyglot sandbox environments (Python, Julia, Rust).
- [ ] Export directly to GitHub repository via GitHub REST API with 1 click.
- [ ] Automated synthetic benchmark dataset generation for non-tabular domains (NLP, Computer Vision).

---

## 🎯 Hackathon Theme Alignment

**Theme:** AI Personal Assistant & Autonomous Agents  
**Hackathon:** PROMPT WARS 2026

Paper2Prototype AI redefines what an AI Assistant can be for researchers and software engineers. Rather than acting as a passive question-answering chatbot, it acts as an **autonomous research-to-code agent**: perceiving technical literature, planning architectures, writing software, testing its own work, diagnosing its own errors, and delivering verified prototypes with human approval safety guardrails.

---

*Paper2Prototype AI — Developed with ❤️ for Prompt Wars 2026.*


