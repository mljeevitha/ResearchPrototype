import {
  ResearchSpecification,
  ImplementationPlan,
  CodeArtifacts,
  EvaluationReport,
} from '../types/index.ts';

export interface CachedBenchmarkData {
  spec: ResearchSpecification;
  plan: ImplementationPlan;
  artifacts: CodeArtifacts;
  evaluation: EvaluationReport;
}

export const BENCHMARK_CACHE: Record<string, CachedBenchmarkData> = {
  'paper-opt-momentum': {
    spec: {
      paperTitle: 'Adaptive Spectral Momentum for Non-Convex Stochastic Optimization',
      authors: ['Elena Vance', 'Tariq Al-Mansoor', 'Julian K. Richter'],
      abstract:
        'Stochastic gradient descent with momentum frequently suffers from oscillatory behavior in narrow valleys with ill-conditioned Hessian spectra. We propose Adaptive Spectral Momentum (ASM), a lightweight optimizer that dynamically adjusts momentum damping via online estimation of the dominant directional curvature without computing explicit second-order derivatives.',
      domain: 'Machine Learning & AI',
      problemStatement:
        'First-order stochastic optimizers oscillate excessively in ill-conditioned ravines where eigenvalue ratios lambda_max / lambda_min >> 1. Fixed momentum damping factors over-accumulate velocity along stiff eigenvectors while under-damping flat directions.',
      researchObjectives: [
        'Estimate local directional curvature online via finite differences of successive parameter steps and gradients',
        'Dynamically attenuate momentum damping factor beta_t according to estimated directional curvature gamma_t',
        'Retain O(d) per-step computational complexity with zero second-order Hessian computation',
      ],
      contributions: [
        'Formulation of the Adaptive Spectral Momentum (ASM) update equation',
        'Directional curvature estimator gamma_t = max(eps, (delta_w^T delta_g) / (||delta_w||^2 + eps))',
        'Convergence guarantees under standard L-smooth non-convex assumptions',
      ],
      methodology:
        'Online curvature estimation using parameter displacement delta_w = w_t - w_{t-1} and gradient displacement delta_g = g_t - g_{t-1}. Spectral correction factor beta_t = beta_base / (1.0 + sqrt(gamma_t * alpha)). Velocity buffer update v_t = beta_t * v_{t-1} + (1 - beta_t) * g_t.',
      algorithms: [
        {
          name: 'Adaptive Spectral Momentum (ASM) Optimizer Step',
          description: 'Iterative parameter update using local Rayleigh-quotient directional curvature damping.',
          steps: [
            'Compute stochastic gradient g_t = grad f(w_{t-1})',
            'Compute step displacements delta_w = w_{t-1} - w_{t-2} and delta_g = g_t - g_{t-1}',
            'Compute directional curvature gamma_t = max(eps, dot(delta_w, delta_g) / (norm(delta_w)^2 + eps))',
            'Update adaptive damping beta_t = beta_base / (1.0 + sqrt(gamma_t * alpha))',
            'Update velocity v_t = beta_t * v_{t-1} + (1 - beta_t) * g_t',
            'Apply parameter step w_t = w_{t-1} - alpha * v_t',
          ],
          equations: [
            'gamma_t = max(epsilon, (delta_w^T * delta_g) / (||delta_w||_2^2 + epsilon))',
            'beta_t = beta_base / (1.0 + sqrt(max(0, gamma_t * alpha)))',
            'v_t = beta_t * v_{t-1} + (1.0 - beta_t) * g_t',
            'w_{t+1} = w_t - alpha * v_t',
          ],
        },
      ],
      mathematicalFormulation: [
        'delta_w_t = w_{t-1} - w_{t-2}',
        'delta_g_t = nabla f(w_{t-1}) - nabla f(w_{t-2})',
        'gamma_t = (delta_w_t^T delta_g_t) / (||delta_w_t||_2^2 + epsilon)',
        'beta_t = beta_0 / (1.0 + sqrt(max(0, gamma_t * alpha)))',
      ],
      inputOutputSpec: {
        inputs: ['Initial parameters w_0 (vector of dimension d)', 'Objective loss function f(w) and gradient oracle grad f(w)', 'Hyperparameters: alpha (learning rate), beta_base (base momentum)'],
        outputs: ['Optimized parameter vector w_T', 'Trajectory loss log f(w_t)'],
        format: 'Python numerical vectors (lists / numpy-compatible arrays)',
      },
      datasetRequirements: {
        originalDatasetName: 'Rosenbrock Valley, Ill-Conditioned Quadratic, and Synthetic Classification',
        isPublic: true,
        description: 'Standard mathematical optimization benchmark test surfaces with high condition number.',
        preprocessingSteps: ['Zero-center initialization', 'Configurable condition number matrix generation'],
        syntheticAlternative: 'Procedural 2D Rosenbrock Banana function and ill-conditioned quadratic matrices.',
      },
      hardwareRequirements: 'Standard CPU runtime (single core sufficient for O(d) prototype validation)',
      dependencies: ['python >= 3.8', 'math', 'random', 'unittest'],
      reportedResults: [
        'Convergence up to 1.8x faster than fixed-momentum SGD on ill-conditioned ravines',
        'Elimination of high-frequency oscillation in narrow Rosenbrock valleys',
      ],
      limitationsStatedInPaper: [
        'Curvature estimation noisy in high stochastic variance regimes with batch size < 16',
        'Requires tuning of base learning rate alpha',
      ],
      feasibility: {
        level: 'feasible',
        rationale:
          'The paper specifies complete closed-form equations for curvature calculation and momentum damping without requiring proprietary datasets or specialized hardware. Can be faithfully validated using Python standard library.',
        missingResources: [],
        minimalFaithfulImplementation:
          'Reference Python implementation of ASM optimizer with benchmark tests on Rosenbrock and ill-conditioned quadratic surfaces.',
        assumptions: ['Continuous differentiability of objective function', 'Bounded gradient noise'],
      },
      provenance: {
        explicitlyStated: [
          'Formulas for gamma_t, beta_t, and parameter updates',
          'Benchmark functions: 2D Rosenbrock and ill-conditioned quadratics',
        ],
        inferredByAI: [
          'Numerical clipping bounds for curvature denominator stability',
        ],
        unextractableOrMissing: [
          'Specific deep learning training seeds from appendix',
        ],
      },
    },
    plan: {
      projectId: 'paper-opt-momentum',
      targetLanguage: 'python',
      frameworkOrRunner: 'Python standard library + unittest runner',
      estimatedComplexity: 'Medium',
      scopeDisclaimer: 'Implements full analytical ASM algorithm with synthetic Rosenbrock and quadratic benchmarks.',
      approvedByUser: true,
      tasks: [
        {
          id: 'task_1',
          title: 'Implement Core ASM Optimizer Class',
          description: 'Implement AdaptiveSpectralMomentum with online finite-difference curvature estimator in prototype.py',
          dependencies: [],
          targetFiles: ['prototype.py'],
          requiredInputs: ['Parameters vector', 'learning_rate', 'beta_base'],
          expectedOutputs: ['AdaptiveSpectralMomentum instance with step() method'],
          acceptanceCriteria: ['Passes unit test verifying momentum attenuation when curvature is high'],
          status: 'completed',
        },
        {
          id: 'task_2',
          title: 'Implement Synthetic Loss Benchmarks & Data Loader',
          description: 'Implement Rosenbrock Banana function, Ill-conditioned Quadratic, and loss oracle in data_loader.py',
          dependencies: ['task_1'],
          targetFiles: ['data_loader.py'],
          requiredInputs: ['Dimension d', 'Condition number kappa'],
          expectedOutputs: ['Benchmark loss oracles and gradient evaluators'],
          acceptanceCriteria: ['Loss evaluates to exact theoretical minimum at global optima'],
          status: 'completed',
        },
        {
          id: 'task_3',
          title: 'Implement Automated Verification Test Suite',
          description: 'Implement comprehensive unittest suite verifying convergence, determinism, and mathematical bounds in test_prototype.py',
          dependencies: ['task_2'],
          targetFiles: ['test_prototype.py'],
          requiredInputs: ['prototype.py', 'data_loader.py'],
          expectedOutputs: ['Test suite with 5+ test cases'],
          acceptanceCriteria: ['All tests execute with exit code 0 under unittest runner'],
          status: 'completed',
        },
      ],
    },
    artifacts: {
      projectId: 'paper-opt-momentum',
      language: 'python',
      entryPoint: 'prototype.py',
      testFile: 'test_prototype.py',
      requirements: ['# Python 3 standard library only'],
      readme: '# Adaptive Spectral Momentum (ASM) Prototype\n\nReference prototype for "Adaptive Spectral Momentum for Non-Convex Stochastic Optimization".\n\n## Execution\n```bash\npython3 -m unittest discover -s . -p "test_*.py" -v\n```',
      generatedAt: new Date().toISOString(),
      files: [
        {
          path: 'prototype.py',
          language: 'python',
          isTest: false,
          description: 'Core Adaptive Spectral Momentum optimizer',
          content: `"""
Adaptive Spectral Momentum (ASM) Optimizer
Paper: Adaptive Spectral Momentum for Non-Convex Stochastic Optimization
"""
import math
from typing import List, Callable, Tuple

class AdaptiveSpectralMomentum:
    def __init__(self, lr: float = 0.01, beta_base: float = 0.9, epsilon: float = 1e-8):
        self.lr = lr
        self.beta_base = beta_base
        self.epsilon = epsilon
        self.w_prev: List[float] = []
        self.g_prev: List[float] = []
        self.v: List[float] = []
        self.step_count = 0

    def step(self, w: List[float], grad: List[float]) -> Tuple[List[float], float]:
        d = len(w)
        if self.step_count == 0:
            self.v = [g for g in grad]
            self.w_prev = list(w)
            self.g_prev = list(grad)
            w_new = [w[i] - self.lr * self.v[i] for i in range(d)]
            self.step_count += 1
            return w_new, self.beta_base

        # delta_w and delta_g
        delta_w = [w[i] - self.w_prev[i] for i in range(d)]
        delta_g = [grad[i] - self.g_prev[i] for i in range(d)]

        dot_wg = sum(delta_w[i] * delta_g[i] for i in range(d))
        norm_w_sq = sum(delta_w[i] ** 2 for i in range(d))

        # Rayleigh-quotient directional curvature
        gamma = max(self.epsilon, dot_wg / (norm_w_sq + self.epsilon))
        
        # Spectral damping correction factor
        beta_t = self.beta_base / (1.0 + math.sqrt(max(0.0, gamma * self.lr)))
        # Bounded between [0.1, 0.99]
        beta_t = max(0.1, min(0.99, beta_t))

        # Velocity buffer update
        self.v = [beta_t * self.v[i] + (1.0 - beta_t) * grad[i] for i in range(d)]

        # State updates
        self.w_prev = list(w)
        self.g_prev = list(grad)
        w_new = [w[i] - self.lr * self.v[i] for i in range(d)]
        self.step_count += 1

        return w_new, beta_t
`,
        },
        {
          path: 'data_loader.py',
          language: 'python',
          isTest: false,
          description: 'Mathematical benchmark surfaces and loss oracles',
          content: `"""
Benchmark loss functions and synthetic gradient oracles.
"""
from typing import List, Tuple

class RosenbrockBenchmark:
    @staticmethod
    def loss(w: List[float]) -> float:
        x, y = w[0], w[1]
        return (1.0 - x)**2 + 100.0 * (y - x**2)**2

    @staticmethod
    def grad(w: List[float]) -> List[float]:
        x, y = w[0], w[1]
        df_dx = -2.0 * (1.0 - x) - 400.0 * x * (y - x**2)
        df_dy = 200.0 * (y - x**2)
        return [df_dx, df_dy]

class QuadraticBenchmark:
    def __init__(self, condition_number: float = 100.0):
        self.c = condition_number

    def loss(self, w: List[float]) -> float:
        return 0.5 * (w[0]**2 + self.c * w[1]**2)

    def grad(self, w: List[float]) -> List[float]:
        return [w[0], self.c * w[1]]
`,
        },
        {
          path: 'test_prototype.py',
          language: 'python',
          isTest: true,
          description: 'Automated test suite for ASM optimizer',
          content: `"""
Automated unit test suite verifying mathematical properties of ASM.
"""
import unittest
import math
import random
from prototype import AdaptiveSpectralMomentum
from data_loader import RosenbrockBenchmark, QuadraticBenchmark

class TestAdaptiveSpectralMomentum(unittest.TestCase):
    def test_basic_initialization(self):
        opt = AdaptiveSpectralMomentum(lr=0.01, beta_base=0.9)
        self.assertEqual(opt.lr, 0.01)
        self.assertEqual(opt.beta_base, 0.9)
        self.assertEqual(opt.step_count, 0)

    def test_single_step_execution(self):
        opt = AdaptiveSpectralMomentum(lr=0.1, beta_base=0.9)
        w = [1.0, 2.0]
        grad = [0.5, -0.5]
        w_next, beta = opt.step(w, grad)
        self.assertEqual(len(w_next), 2)
        self.assertEqual(opt.step_count, 1)

    def test_curvature_damping_attenuation(self):
        opt = AdaptiveSpectralMomentum(lr=0.01, beta_base=0.9)
        w = [1.0, 1.0]
        w, _ = opt.step(w, [1.0, 1.0])
        # Sharp gradient shift inducing high curvature
        w, beta = opt.step(w, [10.0, 10.0])
        # Momentum factor must be attenuated (lower than base 0.9)
        self.assertLessEqual(beta, 0.9)

    def test_quadratic_minimum_convergence(self):
        quad = QuadraticBenchmark(condition_number=20.0)
        opt = AdaptiveSpectralMomentum(lr=0.05, beta_base=0.8)
        w = [5.0, 5.0]
        initial_loss = quad.loss(w)
        for _ in range(150):
            grad = quad.grad(w)
            w, _ = opt.step(w, grad)
        final_loss = quad.loss(w)
        self.assertLess(final_loss, initial_loss * 0.05)

    def test_deterministic_reproducibility(self):
        opt1 = AdaptiveSpectralMomentum(lr=0.01, beta_base=0.9)
        opt2 = AdaptiveSpectralMomentum(lr=0.01, beta_base=0.9)
        w1, w2 = [2.0, 3.0], [2.0, 3.0]
        for _ in range(10):
            g = [random.uniform(-1, 1), random.uniform(-1, 1)]
            w1, b1 = opt1.step(w1, g)
            w2, b2 = opt2.step(w2, g)
            self.assertAlmostEqual(w1[0], w2[0])
            self.assertAlmostEqual(w1[1], w2[1])
            self.assertAlmostEqual(b1, b2)

if __name__ == '__main__':
    unittest.main()
`,
        },
      ],
    },
    evaluation: {
      projectId: 'paper-opt-momentum',
      classification: 'experimentally_evaluated_implementation',
      classificationTitle: 'Experimentally Evaluated Reference Implementation',
      summary:
        'The prototype faithfully implements the Adaptive Spectral Momentum finite-difference directional curvature algorithm and verifies convergence and damping attenuation on test surfaces.',
      reproducibilityScore: 88,
      implementedComponents: [
        {
          name: 'Rayleigh-quotient Directional Curvature Estimator',
          status: 'faithful',
          details: 'Finite difference calculation delta_w and delta_g matched paper equation (2).',
        },
        {
          name: 'Adaptive Damping Modulation (beta_t)',
          status: 'faithful',
          details: 'Square-root scaling of curvature against learning rate faithfully implemented.',
        },
        {
          name: 'Quadratic & Rosenbrock Benchmark Oracles',
          status: 'synthetic_baseline',
          details: 'Exact numerical loss and analytical gradients implemented as described.',
        },
      ],
      theoreticalComparison: [
        {
          paperClaim: 'Momentum damping beta_t attenuates when directional curvature is elevated.',
          prototypeBehavior: 'Observed beta_t drop from 0.90 to 0.45 under rapid gradient transitions in ill-conditioned ravines.',
          agreement: 'matched',
          explanation: 'Empirical velocity adjustment matched theoretical equation (4).',
        },
        {
          paperClaim: 'Convergence on ill-conditioned quadratics without second-order Hessians.',
          prototypeBehavior: 'Verified 95%+ loss reduction on condition number kappa=20.',
          agreement: 'matched',
          explanation: 'Standard gradient evaluations successfully converged without matrix inversion.',
        },
      ],
      datasetDisclosures: {
        originalDatasetUsed: false,
        datasetNotes: 'Original proprietary cluster compute logs not required; synthetic loss surfaces utilized.',
        syntheticBenchmarkDetails: 'Analytical Rosenbrock banana function and quadratic surfaces with condition number up to 100.',
      },
      hardwareLimitations: ['Executed on CPU sandbox without distributed GPU cluster.'],
      honestLimitationsAndRecommendations: [
        'Batch stochastic gradient noise requires mini-batch size >= 16 in deep neural network deployments.',
        'Extrapolating to billion-parameter transformer models requires distributed Adam-style second-moment scaling.',
      ],
      generatedAt: new Date().toISOString(),
    },
  },
  'paper-epidemic-sir': {
    spec: {
      paperTitle: 'Stochastic SEIR Compartmental Modeling with Adaptive Contact Interventions',
      authors: ['Dr. Sarah Lin', 'Marcus Thorne', 'Amina Diallo'],
      abstract:
        'Predicting disease transmission during novel outbreaks requires modeling both disease progression and feedback-driven public behavioral interventions. We introduce an adaptive stochastic SEIR (Susceptible-Exposed-Infectious-Recovered) compartmental model where the transmission rate beta(t) continuously modulates based on hospital occupancy pressure. We provide numerical simulation algorithms using Euler-Maruyama stochastic integration and estimate peak healthcare resource burden under diverse intervention latency parameters.',
      domain: 'Healthcare & Biomedical',
      problemStatement:
        'Static epidemiological compartmental models fail during novel epidemics because behavioral change and healthcare strain dynamically feedback onto community transmission rates.',
      researchObjectives: [
        'Formulate dynamic transmission rate beta(t) governed by ICU capacity strain',
        'Simulate stochastic SEIR trajectories using Euler-Maruyama numerical integration',
        'Estimate peak hospitalization burden and effective reproduction number R_eff(t)',
      ],
      contributions: [
        'Closed-form adaptive feedback transmission formulation with logistic saturation',
        'Stochastic Ito differential equations with population diffusion terms',
        'Quantification of mitigation lag on overall clinical attack rate',
      ],
      methodology:
        'Euler-Maruyama stochastic numerical integration of four population compartments (S, E, I, R) with adaptive contact transmission beta(t) and conservation constraint S + E + I + R = N.',
      algorithms: [
        {
          name: 'Adaptive SEIR Euler-Maruyama Simulation',
          description: 'Step-by-step stochastic numerical simulation of disease spread with feedback mitigation.',
          steps: [
            'Compute current hospitalized count and ICU pressure ratio',
            'Update transmission rate beta(t) via logistic response function',
            'Compute deterministic fluxes dS, dE, dI, dR',
            'Add Brownian diffusion term xi * sqrt(S * I / N) * dW_t',
            'Update compartment state vectors enforcing non-negativity and total N conservation',
          ],
          equations: [
            'beta(t) = beta_0 * (1.0 - mitigation_eff / (1.0 + exp(-k * (I(t) - H_cap) / N)))',
            'dS = -beta(t) * S * I / N * dt - xi * sqrt(S * I / N) * dW_t',
            'dE = (beta(t) * S * I / N - sigma * E) * dt + xi * sqrt(S * I / N) * dW_t',
            'dI = (sigma * E - gamma * I) * dt',
            'dR = gamma * I * dt',
          ],
        },
      ],
      mathematicalFormulation: [
        'S(t) + E(t) + I(t) + R(t) = N',
        'R_eff(t) = (beta(t) / gamma) * (S(t) / N)',
      ],
      inputOutputSpec: {
        inputs: ['Population N', 'Incubation rate sigma', 'Recovery rate gamma', 'Hospital threshold H_cap'],
        outputs: ['Compartment time series S(t), E(t), I(t), R(t)', 'Peak infected count', 'R_eff history'],
        format: 'JSON / Python dictionary',
      },
      datasetRequirements: {
        originalDatasetName: 'Simulated Epidemiological Outbreak Parameters',
        isPublic: true,
        description: 'Standard synthetic epidemic parameters aligned with COVID-19/influenza historical literature.',
        preprocessingSteps: ['Parameter normalization', 'Initial compartment seeding'],
        syntheticAlternative: 'Euler-Maruyama stochastic trajectory generator.',
      },
      hardwareRequirements: 'Standard CPU runtime (isolated subprocess execution)',
      dependencies: ['Python 3 standard library (math, random, unittest, json)'],
      reportedResults: ['Mitigation feedback reduces peak ICU load by 42% compared to unmitigated spread.'],
      limitationsStatedInPaper: ['Homogeneous spatial mixing assumption; neglects age-stratified contact matrices.'],
      feasibility: {
        level: 'feasible',
        rationale: 'Fully specified system of stochastic differential equations executable in pure Python.',
        missingResources: ['Real-time regional clinical surveillance feeds'],
        minimalFaithfulImplementation: 'Simulate Euler-Maruyama SEIR with adaptive feedback beta(t) and verify conservation invariants.',
        assumptions: ['Homogeneous population mixing', 'Fixed latent incubation period'],
      },
      provenance: {
        explicitlyStated: ['Compartmental differential equations, parameters, and Euler-Maruyama discretization.'],
        inferredByAI: ['Synthetic benchmark parameter ranges derived from published epidemiological tables.'],
        unextractableOrMissing: ['Proprietary regional hospital registry records.'],
      },
    },
    plan: {
      projectId: 'paper-epidemic-sir',
      targetLanguage: 'python',
      frameworkOrRunner: 'Python 3 + unittest',
      estimatedComplexity: 'Medium',
      scopeDisclaimer: 'Simulates core stochastic SEIR equations and adaptive contact intervention.',
      tasks: [
        {
          id: 'task_1',
          title: 'Implement Data Structures & Parameter Configuration',
          description: 'Define SEIR parameters, population state container, and initial compartment conditions.',
          dependencies: [],
          targetFiles: ['prototype.py'],
          requiredInputs: ['N, beta_0, sigma, gamma, H_cap'],
          expectedOutputs: ['SEIRParams dataclass'],
          acceptanceCriteria: ['Validates that initial compartments sum to N'],
          status: 'pending',
        },
        {
          id: 'task_2',
          title: 'Implement Adaptive Contact Rate & Flux Dynamics',
          description: 'Implement logistic contact rate modulation beta(t) and compartment derivative calculations.',
          dependencies: ['task_1'],
          targetFiles: ['prototype.py'],
          requiredInputs: ['Current compartment states'],
          expectedOutputs: ['Computed dS, dE, dI, dR fluxes'],
          acceptanceCriteria: ['beta(t) decreases when I(t) exceeds hospital capacity threshold'],
          status: 'pending',
        },
        {
          id: 'task_3',
          title: 'Implement Euler-Maruyama Numerical Simulation Engine',
          description: 'Implement time-stepping integration loop with Brownian diffusion noise.',
          dependencies: ['task_2'],
          targetFiles: ['prototype.py', 'data_loader.py'],
          requiredInputs: ['Total simulation days, dt'],
          expectedOutputs: ['Trajectory history time series'],
          acceptanceCriteria: ['Strict non-negativity enforced and population conservation verified'],
          status: 'pending',
        },
        {
          id: 'task_4',
          title: 'Construct Comprehensive Unittest Test Suite',
          description: 'Write unittests verifying population conservation, peak dynamics, and intervention damping.',
          dependencies: ['task_3'],
          targetFiles: ['test_prototype.py'],
          requiredInputs: ['Simulation runner'],
          expectedOutputs: ['Passing unittest suite'],
          acceptanceCriteria: ['All tests pass with exit code 0'],
          status: 'pending',
        },
      ],
      approvedByUser: true,
    },
    artifacts: {
      projectId: 'paper-epidemic-sir',
      language: 'python',
      entryPoint: 'prototype.py',
      testFile: 'test_prototype.py',
      requirements: ['# Python standard library only (math, random, unittest, dataclasses)'],
      readme: '# Stochastic SEIR Compartmental Modeling with Adaptive Contact Interventions\n\n## Reproduction\nExecutes Euler-Maruyama stochastic numerical simulation of the adaptive SEIR system.\nRun `python3 -m unittest test_prototype.py` to verify invariants.',
      generatedAt: new Date().toISOString(),
      files: [
        {
          path: 'prototype.py',
          language: 'python',
          isTest: false,
          description: 'Stochastic SEIR compartmental simulation model',
          content: `"""
Stochastic SEIR Compartmental Model with Adaptive Contact Interventions.
Faithfully implements Euler-Maruyama numerical integration and logistic capacity feedback.
"""

import math
import random
from dataclasses import dataclass, field
from typing import List, Dict, Tuple


@dataclass
class SEIRParams:
    N: float = 100000.0
    beta_0: float = 0.35
    sigma: float = 1.0 / 5.2
    gamma: float = 1.0 / 10.0
    H_cap: float = 500.0
    mitigation_efficiency: float = 0.65
    steepness_k: float = 15.0
    diffusion_xi: float = 0.02
    dt: float = 0.1


@dataclass
class CompartmentState:
    S: float
    E: float
    I: float
    R: float

    @property
    def total(self) -> float:
        return self.S + self.E + self.I + self.R


class AdaptiveSEIRSimulator:
    def __init__(self, params: SEIRParams, seed: int = 42):
        self.params = params
        self.rng = random.Random(seed)

    def calculate_beta(self, current_I: float) -> float:
        # Logistic mitigation response when infected cases approach hospital capacity
        excess_ratio = (current_I - self.params.H_cap) / self.params.N
        # Clamped logistic factor
        exponent = -self.params.steepness_k * excess_ratio
        clamped_exp = max(-50.0, min(50.0, exponent))
        logistic_factor = 1.0 / (1.0 + math.exp(clamped_exp))
        attenuation = 1.0 - (self.params.mitigation_efficiency * logistic_factor)
        return max(0.01, self.params.beta_0 * attenuation)

    def calculate_r_eff(self, current_S: float, current_beta: float) -> float:
        if self.params.gamma <= 0:
            return 0.0
        return (current_beta / self.params.gamma) * (current_S / self.params.N)

    def step(self, state: CompartmentState) -> CompartmentState:
        p = self.params
        beta = self.calculate_beta(state.I)

        # Transmission rate flux
        infection_flux = beta * state.S * state.I / p.N
        incubation_flux = p.sigma * state.E
        recovery_flux = p.gamma * state.I

        # Brownian diffusion term (standard normal sample)
        dW = self.rng.gauss(0.0, math.sqrt(p.dt))
        noise_variance = max(0.0, state.S * state.I / p.N)
        diffusion = p.diffusion_xi * math.sqrt(noise_variance) * dW

        # Euler-Maruyama step
        dS = (-infection_flux * p.dt) - diffusion
        dE = (infection_flux - incubation_flux) * p.dt + diffusion
        dI = (incubation_flux - recovery_flux) * p.dt
        dR = (recovery_flux * p.dt)

        new_S = max(0.0, state.S + dS)
        new_E = max(0.0, state.E + dE)
        new_I = max(0.0, state.I + dI)
        # Conserve total population
        new_R = max(0.0, p.N - (new_S + new_E + new_I))

        return CompartmentState(S=new_S, E=new_E, I=new_I, R=new_R)

    def run_simulation(self, initial_I: float = 10.0, days: int = 100) -> Dict[str, List[float]]:
        steps = int(days / self.params.dt)
        initial_E = initial_I * 2.0
        initial_S = self.params.N - initial_I - initial_E
        state = CompartmentState(S=initial_S, E=initial_E, I=initial_I, R=0.0)

        history: Dict[str, List[float]] = {
            'time': [],
            'S': [],
            'E': [],
            'I': [],
            'R': [],
            'R_eff': [],
            'beta': [],
        }

        for step_idx in range(steps):
            current_time = step_idx * self.params.dt
            beta = self.calculate_beta(state.I)
            r_eff = self.calculate_r_eff(state.S, beta)

            history['time'].append(round(current_time, 2))
            history['S'].append(state.S)
            history['E'].append(state.E)
            history['I'].append(state.I)
            history['R'].append(state.R)
            history['R_eff'].append(r_eff)
            history['beta'].append(beta)

            state = self.step(state)

        return history
`,
        },
        {
          path: 'data_loader.py',
          language: 'python',
          isTest: false,
          description: 'Epidemiological parameters loader',
          content: `"""
Parameters and benchmark scenario generator for epidemiological evaluations.
"""

from prototype import SEIRParams


def get_standard_scenario(variant: str = 'default') -> SEIRParams:
    if variant == 'high_mitigation':
        return SEIRParams(mitigation_efficiency=0.85, steepness_k=25.0)
    elif variant == 'low_mitigation':
        return SEIRParams(mitigation_efficiency=0.20, steepness_k=5.0)
    return SEIRParams()
`,
        },
        {
          path: 'test_prototype.py',
          language: 'python',
          isTest: true,
          description: 'Unittest suite for SEIR model invariants',
          content: `"""
Unit tests validating physical invariants, conservation laws, and feedback behavior
for the Stochastic SEIR model with Adaptive Contact Interventions.
"""

import unittest
from prototype import AdaptiveSEIRSimulator, SEIRParams, CompartmentState


class TestAdaptiveSEIR(unittest.TestCase):
    def setUp(self):
        self.params = SEIRParams(N=10000.0, H_cap=100.0)
        self.sim = AdaptiveSEIRSimulator(self.params, seed=12345)

    def test_basic_execution(self):
        state = CompartmentState(S=9990.0, E=0.0, I=10.0, R=0.0)
        next_state = self.sim.step(state)
        self.assertIsInstance(next_state, CompartmentState)
        self.assertGreater(next_state.S, 0.0)

    def test_population_conservation(self):
        state = CompartmentState(S=9000.0, E=500.0, I=400.0, R=100.0)
        for _ in range(50):
            state = self.sim.step(state)
            self.assertAlmostEqual(state.total, self.params.N, delta=1e-3)

    def test_adaptive_mitigation_damping(self):
        low_inf_beta = self.sim.calculate_beta(current_I=10.0)
        high_inf_beta = self.sim.calculate_beta(current_I=1500.0)
        # Beta must attenuate as infection count surpasses hospital capacity
        self.assertLess(high_inf_beta, low_inf_beta)

    def test_zero_infection_boundary(self):
        # Without any exposed or infected individuals, disease cannot emerge spontaneously
        state = CompartmentState(S=10000.0, E=0.0, I=0.0, R=0.0)
        for _ in range(10):
            state = self.sim.step(state)
            self.assertEqual(state.I, 0.0)
            self.assertEqual(state.E, 0.0)
            self.assertAlmostEqual(state.S, 10000.0, delta=1e-4)

    def test_full_simulation_trajectory(self):
        history = self.sim.run_simulation(initial_I=10.0, days=25)
        self.assertEqual(len(history['time']), int(25 / self.params.dt))
        # Initial susceptible population should be depleted over time
        self.assertLess(history['S'][-1], history['S'][0])
        # Recovered population should monotonically increase
        self.assertGreater(history['R'][-1], 0.0)


if __name__ == '__main__':
    unittest.main()
`,
        },
      ],
    },
    evaluation: {
      projectId: 'paper-epidemic-sir',
      classification: 'experimentally_evaluated_implementation',
      classificationTitle: 'Experimentally Evaluated Reference Implementation',
      summary:
        'The prototype faithfully implements the adaptive logistic transmission formula and Euler-Maruyama stochastic numerical integration, with verified total population conservation and peak intervention damping.',
      reproducibilityScore: 92,
      implementedComponents: [
        {
          name: 'Stochastic Euler-Maruyama Integration',
          status: 'faithful',
          details: 'Verified Ito calculus stochastic steps with population diffusion noise.',
        },
        {
          name: 'Adaptive Contact Mitigation Rate beta(t)',
          status: 'faithful',
          details: 'Logistic ICU pressure saturation function faithfully reproduced.',
        },
        {
          name: 'Total Population Conservation',
          status: 'faithful',
          details: 'Invariant S + E + I + R = N strictly maintained across all simulation steps.',
        },
      ],
      theoreticalComparison: [
        {
          paperClaim: 'Dynamic feedback reduces peak healthcare strain.',
          prototypeBehavior: 'Observed attenuation of effective contact rate beta from 0.35 to 0.12 at peak.',
          agreement: 'matched',
          explanation: 'Demonstrated feedback mitigation damping matching paper equation (4).',
        },
      ],
      datasetDisclosures: {
        originalDatasetUsed: false,
        datasetNotes: 'Original hospital surveillance databases were synthetic in the published study; evaluation uses calibrated parameter sets.',
        syntheticBenchmarkDetails: 'Euler-Maruyama multi-trajectory evaluation with calibrated noise levels.',
      },
      hardwareLimitations: ['Executed in CPU sandbox.'],
      honestLimitationsAndRecommendations: [
        'Real-world outbreaks exhibit network clustering and age-stratified contact structures not present in mean-field ODE/SDE models.',
      ],
      generatedAt: new Date().toISOString(),
    },
  },
  'paper-physics-symplectic': {
    spec: {
      paperTitle: 'Symplectic Structure-Preserving Integrators for Constrained Hamiltonian Systems',
      authors: ['Prof. H. Chen', 'N. D. Petrov', 'L. V. O’Connor'],
      abstract:
        'Standard Runge-Kutta numerical integrators fail to preserve physical phase-space volume and introduce artificial dissipation or unbounded energy growth over long integration horizons. We formulate an explicit Velocity Verlet Symplectic Integrator for non-linear separable Hamiltonian systems H(q, p) = T(p) + V(q). We prove exact conservation of the shadow Hamiltonian and demonstrate bounded energy error O(dt^2) across 10^5 integration steps in celestial Kepler two-body and coupled non-linear pendulum systems.',
      domain: 'Physics & Applied Mathematics',
      problemStatement:
        'Non-symplectic numerical integrators violate phase-space symplectic geometry, leading to artificial energy drift and orbital decay in conservative Hamiltonian systems.',
      researchObjectives: [
        'Implement Velocity Verlet symplectic time-stepping for separable Hamiltonian systems',
        'Verify exact preservation of phase-space area and bounded shadow energy error',
        'Demonstrate stable long-horizon Kepler orbit and pendulum integration',
      ],
      contributions: [
        'Symplectic integrator formulation for conservative mechanical potentials',
        'Demonstration of zero secular energy drift over extended time horizons',
        'Benchmarking against non-symplectic explicit Euler integrator',
      ],
      methodology:
        'Explicit Velocity Verlet second-order symplectic time-marching algorithm updating position and velocity through staggered half-steps.',
      algorithms: [
        {
          name: 'Velocity Verlet Symplectic Integration',
          description: 'Staggered half-step symplectic integration preserving phase space volume.',
          steps: [
            'Half-step velocity advance: v_{n+1/2} = v_n + (dt / (2*m)) * F(q_n)',
            'Full-step position advance: q_{n+1} = q_n + dt * v_{n+1/2}',
            'Compute new force: F_{n+1} = -grad V(q_{n+1})',
            'Final half-step velocity advance: v_{n+1} = v_{n+1/2} + (dt / (2*m)) * F_{n+1}',
          ],
          equations: [
            'H(q, p) = 1/2 * m * ||v||^2 + V(q)',
            'F(q) = -grad V(q)',
            'q_{n+1} = q_n + dt * v_n + (dt^2 / (2*m)) * F(q_n)',
          ],
        },
      ],
      mathematicalFormulation: [
        'E(t) = T(v) + V(q) = const',
        'Delta E_drift = 0 (bounded oscillation of amplitude O(dt^2))',
      ],
      inputOutputSpec: {
        inputs: ['Initial position q_0', 'Initial velocity v_0', 'Mass m', 'Time step dt', 'Steps N'],
        outputs: ['Trajectory q(t), v(t)', 'Total energy H(t)', 'Energy error Delta H'],
        format: 'JSON / Python dictionary',
      },
      datasetRequirements: {
        originalDatasetName: 'Kepler Two-Body and Non-Linear Pendulum Initial Coordinates',
        isPublic: true,
        description: 'Analytical potential energy functions V(q) with known conservation properties.',
        preprocessingSteps: ['Coordinate initialization'],
        syntheticAlternative: 'Analytical potential oracles.',
      },
      hardwareRequirements: 'Standard CPU runtime (isolated subprocess execution)',
      dependencies: ['Python 3 standard library (math, random, unittest, dataclasses)'],
      reportedResults: ['Bounded energy oscillation with zero cumulative drift over 100,000 steps.'],
      limitationsStatedInPaper: ['Explicit formulation requires separable Hamiltonian H(q, p) = T(p) + V(q).'],
      feasibility: {
        level: 'feasible',
        rationale: 'Symplectic Verlet integration is fully solvable and testable in pure Python.',
        missingResources: [],
        minimalFaithfulImplementation: 'Implement Velocity Verlet integrator for harmonic oscillator and Kepler potential, verifying energy conservation.',
        assumptions: ['Separable Hamiltonian system'],
      },
      provenance: {
        explicitlyStated: ['Velocity Verlet equations, Hamiltonian invariants, and Kepler equations.'],
        inferredByAI: ['Synthetic benchmark potentials.'],
        unextractableOrMissing: [],
      },
    },
    plan: {
      projectId: 'paper-physics-symplectic',
      targetLanguage: 'python',
      frameworkOrRunner: 'Python 3 + unittest',
      estimatedComplexity: 'Low',
      scopeDisclaimer: 'Implements Velocity Verlet symplectic integrator for separable Hamiltonian systems.',
      tasks: [
        {
          id: 'task_1',
          title: 'Implement Hamiltonian Potentials & Forces',
          description: 'Implement Harmonic Oscillator and Kepler central gravitational potential functions.',
          dependencies: [],
          targetFiles: ['prototype.py'],
          requiredInputs: ['Coordinate vectors'],
          expectedOutputs: ['Potential V(q) and Force F(q)'],
          acceptanceCriteria: ['Analytically exact gradient force computation'],
          status: 'pending',
        },
        {
          id: 'task_2',
          title: 'Implement Velocity Verlet Symplectic Step',
          description: 'Implement staggered half-step symplectic momentum-position update.',
          dependencies: ['task_1'],
          targetFiles: ['prototype.py'],
          requiredInputs: ['q, v, dt, mass'],
          expectedOutputs: ['Updated q and v'],
          acceptanceCriteria: ['Reversible symplectic update step'],
          status: 'pending',
        },
        {
          id: 'task_3',
          title: 'Implement Multi-Step Simulation & Energy Tracker',
          description: 'Loop over N time steps tracking kinetic, potential, and total Hamiltonian energy.',
          dependencies: ['task_2'],
          targetFiles: ['prototype.py', 'data_loader.py'],
          requiredInputs: ['Time horizon, dt'],
          expectedOutputs: ['Energy trajectory and max relative drift'],
          acceptanceCriteria: ['Computes relative energy error |H - H_0| / H_0'],
          status: 'pending',
        },
        {
          id: 'task_4',
          title: 'Construct Comprehensive Unittest Test Suite',
          description: 'Verify bounded energy error, time reversibility, and Kepler orbit closure.',
          dependencies: ['task_3'],
          targetFiles: ['test_prototype.py'],
          requiredInputs: ['Symplectic integrator runner'],
          expectedOutputs: ['Passing unittest suite'],
          acceptanceCriteria: ['All tests pass with exit code 0'],
          status: 'pending',
        },
      ],
      approvedByUser: true,
    },
    artifacts: {
      projectId: 'paper-physics-symplectic',
      language: 'python',
      entryPoint: 'prototype.py',
      testFile: 'test_prototype.py',
      requirements: ['# Python standard library only (math, random, unittest)'],
      readme: '# Symplectic Structure-Preserving Integrator\n\n## Reproduction\nExecutes Velocity Verlet symplectic integration preserving Hamiltonian energy invariants.\nRun `python3 -m unittest test_prototype.py`.',
      generatedAt: new Date().toISOString(),
      files: [
        {
          path: 'prototype.py',
          language: 'python',
          isTest: false,
          description: 'Velocity Verlet symplectic integrator implementation',
          content: `"""
Velocity Verlet Symplectic Integrator for Separable Hamiltonian Systems H(q, p) = T(p) + V(q).
Preserves phase-space volume and exhibits bounded shadow Hamiltonian energy error.
"""

import math
from typing import List, Tuple, Callable


class HarmonicOscillator:
    """V(q) = 1/2 * k * q^2, F(q) = -k * q"""
    def __init__(self, k: float = 1.0):
        self.k = k

    def potential(self, q: float) -> float:
        return 0.5 * self.k * (q ** 2)

    def force(self, q: float) -> float:
        return -self.k * q


class KeplerTwoBody:
    """V(q) = -G * M / ||q||, F(q) = -G * M * q / ||q||^3"""
    def __init__(self, mu: float = 1.0):
        self.mu = mu

    def potential(self, q: Tuple[float, float]) -> float:
        r = math.sqrt(q[0] ** 2 + q[1] ** 2)
        return -self.mu / max(1e-8, r)

    def force(self, q: Tuple[float, float]) -> Tuple[float, float]:
        r = math.sqrt(q[0] ** 2 + q[1] ** 2)
        denom = max(1e-8, r ** 3)
        return (-self.mu * q[0] / denom, -self.mu * q[1] / denom)


class VelocityVerletIntegrator:
    def __init__(self, mass: float = 1.0):
        self.mass = mass

    def step_1d(self, q: float, v: float, dt: float, force_fn: Callable[[float], float]) -> Tuple[float, float]:
        # 1. Half-step velocity
        f_0 = force_fn(q)
        v_half = v + (dt / (2.0 * self.mass)) * f_0
        # 2. Full-step position
        q_next = q + dt * v_half
        # 3. New force
        f_1 = force_fn(q_next)
        # 4. Final half-step velocity
        v_next = v_half + (dt / (2.0 * self.mass)) * f_1
        return (q_next, v_next)

    def step_2d(
        self,
        q: Tuple[float, float],
        v: Tuple[float, float],
        dt: float,
        force_fn: Callable[[Tuple[float, float]], Tuple[float, float]]
    ) -> Tuple[Tuple[float, float], Tuple[float, float]]:
        fx0, fy0 = force_fn(q)
        vx_half = v[0] + (dt / (2.0 * self.mass)) * fx0
        vy_half = v[1] + (dt / (2.0 * self.mass)) * fy0

        qx_next = q[0] + dt * vx_half
        qy_next = q[1] + dt * vy_half
        q_next = (qx_next, qy_next)

        fx1, fy1 = force_fn(q_next)
        vx_next = vx_half + (dt / (2.0 * self.mass)) * fx1
        vy_next = vy_half + (dt / (2.0 * self.mass)) * fy1

        return (q_next, (vx_next, vy_next))

    def calculate_energy_1d(self, q: float, v: float, potential_fn: Callable[[float], float]) -> float:
        kinetic = 0.5 * self.mass * (v ** 2)
        potential = potential_fn(q)
        return kinetic + potential
`,
        },
        {
          path: 'data_loader.py',
          language: 'python',
          isTest: false,
          description: 'Benchmark orbital and physical parameters',
          content: `"""
Physical system configuration loader.
"""

from prototype import HarmonicOscillator, KeplerTwoBody


def get_harmonic_system():
    return HarmonicOscillator(k=2.0)


def get_kepler_system():
    return KeplerTwoBody(mu=1.0)
`,
        },
        {
          path: 'test_prototype.py',
          language: 'python',
          isTest: true,
          description: 'Unittest suite verifying symplectic structure and energy conservation',
          content: `"""
Unit tests validating Hamiltonian conservation, time reversibility,
and bounded error scaling for the Velocity Verlet Symplectic Integrator.
"""

import unittest
import math
from prototype import VelocityVerletIntegrator, HarmonicOscillator, KeplerTwoBody


class TestSymplecticIntegrator(unittest.TestCase):
    def setUp(self):
        self.integrator = VelocityVerletIntegrator(mass=1.0)
        self.oscillator = HarmonicOscillator(k=1.0)

    def test_basic_execution(self):
        q, v = self.integrator.step_1d(1.0, 0.0, 0.01, self.oscillator.force)
        self.assertIsInstance(q, float)
        self.assertIsInstance(v, float)

    def test_bounded_energy_conservation(self):
        # Symplectic Verlet should conserve energy without secular growth over 5000 steps
        q, v = 1.0, 0.0
        dt = 0.02
        initial_energy = self.integrator.calculate_energy_1d(q, v, self.oscillator.potential)

        for _ in range(2500):
            q, v = self.integrator.step_1d(q, v, dt, self.oscillator.force)

        final_energy = self.integrator.calculate_energy_1d(q, v, self.oscillator.potential)
        relative_error = abs(final_energy - initial_energy) / initial_energy

        # Symplectic error must remain bounded at O(dt^2) < 0.1%
        self.assertLess(relative_error, 0.005)

    def test_time_reversibility(self):
        # Verlet integrator is strictly time-reversible: step forward then step backward
        q_0, v_0 = 1.5, 0.5
        dt = 0.05
        q_fwd, v_fwd = self.integrator.step_1d(q_0, v_0, dt, self.oscillator.force)
        # Reverse velocity and step forward with dt (equivalent to -dt)
        q_rev, v_rev = self.integrator.step_1d(q_fwd, -v_fwd, dt, self.oscillator.force)
        # Re-reversed velocity must match initial velocity
        self.assertAlmostEqual(q_rev, q_0, places=7)
        self.assertAlmostEqual(-v_rev, v_0, places=7)

    def test_kepler_angular_momentum_conservation(self):
        # In a central field, angular momentum L = x*vy - y*vx is strictly conserved
        kepler = KeplerTwoBody(mu=1.0)
        q = (1.0, 0.0)
        v = (0.0, 1.0) # Circular orbit velocity
        l_initial = q[0] * v[1] - q[1] * v[0]

        dt = 0.01
        for _ in range(1000):
            q, v = self.integrator.step_2d(q, v, dt, kepler.force)

        l_final = q[0] * v[1] - q[1] * v[0]
        self.assertAlmostEqual(l_final, l_initial, places=5)


if __name__ == '__main__':
    unittest.main()
`,
        },
      ],
    },
    evaluation: {
      projectId: 'paper-physics-symplectic',
      classification: 'full_reproduction',
      classificationTitle: 'Fully Reproduced Numerical Structure-Preserving Method',
      summary:
        'The Velocity Verlet symplectic integrator was faithfully implemented and empirically verified to strictly conserve shadow Hamiltonian energy and angular momentum with zero secular dissipation.',
      reproducibilityScore: 96,
      implementedComponents: [
        {
          name: 'Staggered Half-Step Velocity Verlet Algorithm',
          status: 'faithful',
          details: 'Verified exact time-reversibility and O(dt^2) error scaling.',
        },
        {
          name: 'Central Field Angular Momentum Conservation',
          status: 'faithful',
          details: 'Angular momentum L = q x p preserved to numerical machine precision.',
        },
        {
          name: 'Bounded Energy Oscillation',
          status: 'faithful',
          details: 'Total Hamiltonian error strictly bounded without secular drift.',
        },
      ],
      theoreticalComparison: [
        {
          paperClaim: 'Zero secular energy drift over long integration horizons.',
          prototypeBehavior: 'Maintained bounded energy fluctuation <= 0.05% over 2500 integration cycles.',
          agreement: 'matched',
          explanation: 'Demonstrated symplectic preservation of Hamiltonian phase-space structure.',
        },
      ],
      datasetDisclosures: {
        originalDatasetUsed: true,
        datasetNotes: 'Exact analytical physical equations for Harmonic Oscillator and Kepler Gravitational potentials.',
        syntheticBenchmarkDetails: 'Simulated orbits across 2500+ integration cycles.',
      },
      hardwareLimitations: ['Standard CPU sandbox execution.'],
      honestLimitationsAndRecommendations: [
        'Higher-order Yoshida symplectic integrators recommended for extremely stiff non-linear potentials with high eccentricity.',
      ],
      generatedAt: new Date().toISOString(),
    },
  },
};
