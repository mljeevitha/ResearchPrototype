export type ResearchDomain =
  | 'Machine Learning & AI'
  | 'Computer Vision'
  | 'Natural Language Processing'
  | 'Computer Science & Systems'
  | 'Healthcare & Biomedical'
  | 'Agriculture & Environmental'
  | 'Finance & Economics'
  | 'Transportation & Operations'
  | 'Physics & Applied Mathematics'
  | 'Robotics & Control Systems'
  | 'Other Engineering & Science';

export type FeasibilityLevel =
  | 'feasible'
  | 'feasible_with_assumptions'
  | 'partially_feasible'
  | 'blocked_missing_resources'
  | 'requires_hardware'
  | 'not_reproducible';

export type ProjectStatus =
  | 'created'
  | 'uploaded'
  | 'analyzing'
  | 'analyzed'
  | 'planning'
  | 'planned'
  | 'generating'
  | 'generated'
  | 'testing'
  | 'tested'
  | 'debugging'
  | 'evaluated'
  | 'failed';

export type AgentRole =
  | 'supervisor'
  | 'research_analyst'
  | 'feasibility_analyst'
  | 'implementation_planner'
  | 'coding_agent'
  | 'execution_agent'
  | 'debugging_agent'
  | 'evaluation_agent';

export interface AgentEvent {
  id: string;
  timestamp: string;
  agent: AgentRole;
  agentName: string;
  type: 'info' | 'progress' | 'warning' | 'error' | 'success';
  message: string;
  details?: Record<string, any>;
}

export interface ResearchSpecification {
  paperTitle: string;
  authors: string[];
  abstract: string;
  domain: ResearchDomain;
  problemStatement: string;
  researchObjectives: string[];
  contributions: string[];
  methodology: string;
  algorithms: {
    name: string;
    description: string;
    steps: string[];
    equations?: string[];
  }[];
  mathematicalFormulation: string[];
  modelArchitecture?: string;
  inputOutputSpec: {
    inputs: string[];
    outputs: string[];
    format: string;
  };
  datasetRequirements: {
    originalDatasetName?: string;
    isPublic: boolean;
    description: string;
    preprocessingSteps: string[];
    syntheticAlternative: string;
  };
  hardwareRequirements: string;
  dependencies: string[];
  reportedResults: string[];
  limitationsStatedInPaper: string[];
  feasibility: {
    level: FeasibilityLevel;
    rationale: string;
    missingResources: string[];
    minimalFaithfulImplementation: string;
    assumptions: string[];
  };
  provenance: {
    explicitlyStated: string[];
    inferredByAI: string[];
    unextractableOrMissing: string[];
  };
}

export interface TaskItem {
  id: string;
  title: string;
  description: string;
  dependencies: string[]; // Task IDs
  targetFiles: string[];
  requiredInputs: string[];
  expectedOutputs: string[];
  acceptanceCriteria: string[];
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  failureDetails?: string;
}

export interface ImplementationPlan {
  projectId: string;
  targetLanguage: 'python' | 'typescript';
  frameworkOrRunner: string;
  tasks: TaskItem[];
  approvedByUser: boolean;
  userModifications?: string;
  estimatedComplexity: 'Low' | 'Medium' | 'High';
  scopeDisclaimer: string;
}

export interface CodeFile {
  path: string;
  content: string;
  language: string;
  isTest: boolean;
  description?: string;
}

export interface CodeArtifacts {
  projectId: string;
  language: 'python' | 'typescript';
  files: CodeFile[];
  entryPoint: string;
  testFile: string;
  requirements: string[];
  readme: string;
  generatedAt: string;
}

export interface SingleTestResult {
  name: string;
  status: 'passed' | 'failed' | 'error';
  message?: string;
  durationMs?: number;
}

export interface ExecutionRun {
  id: string;
  projectId: string;
  command: string;
  exitCode: number;
  stdout: string;
  stderr: string;
  durationMs: number;
  passed: boolean;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  testDetails: SingleTestResult[];
  executedAt: string;
  environmentInfo: string;
}

export interface DebugPatch {
  iteration: number;
  fileModified: string;
  rootCauseAnalysis: string;
  diffSummary: string;
  timestamp: string;
}

export interface DebugSession {
  projectId: string;
  attempts: number;
  maxAttempts: number;
  patches: DebugPatch[];
  resolved: boolean;
  finalMessage: string;
}

export type EvaluationClassification =
  | 'functional_prototype'
  | 'partially_implemented_methodology'
  | 'experimentally_evaluated_implementation'
  | 'partial_reproduction_of_published_results'
  | 'full_reproduction';

export interface EvaluationReport {
  projectId: string;
  classification: EvaluationClassification;
  classificationTitle: string;
  summary: string;
  implementedComponents: {
    name: string;
    status: 'faithful' | 'approximated' | 'synthetic_baseline' | 'unimplemented';
    details: string;
  }[];
  theoreticalComparison: {
    paperClaim: string;
    prototypeBehavior: string;
    agreement: 'matched' | 'partial' | 'divergent' | 'untested';
    explanation: string;
  }[];
  datasetDisclosures: {
    originalDatasetUsed: boolean;
    datasetNotes: string;
    syntheticBenchmarkDetails: string;
  };
  hardwareLimitations: string[];
  reproducibilityScore: number; // 0 - 100%
  honestLimitationsAndRecommendations: string[];
  generatedAt: string;
}

export interface Project {
  id: string;
  ownerId: string;
  title: string;
  fileName: string;
  fileSize: number;
  pageCount?: number;
  domain?: ResearchDomain;
  status: ProjectStatus;
  currentStage: string;
  error?: string;
  createdAt: string;
  updatedAt: string;
  spec?: ResearchSpecification;
  plan?: ImplementationPlan;
  artifacts?: CodeArtifacts;
  latestExecution?: ExecutionRun;
  debugSession?: DebugSession;
  evaluation?: EvaluationReport;
}

export interface SamplePaper {
  id: string;
  title: string;
  authors: string[];
  domain: ResearchDomain;
  abstract: string;
  description: string;
  filename: string;
  content: string; // Text representation of paper
}
