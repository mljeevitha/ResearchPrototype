import { createRequire } from 'module';
import { SamplePaper } from '../types/index.ts';
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

export async function parsePdfDocument(
  buffer: Buffer,
  options?: any
): Promise<{ text: string; numpages: number; info?: any }> {
  return await pdfParse(buffer, options);
}

export const SAMPLE_PAPERS: SamplePaper[] = [
  {
    id: 'paper-opt-momentum',
    title: 'Adaptive Spectral Momentum for Non-Convex Stochastic Optimization',
    authors: ['Elena Vance', 'Tariq Al-Mansoor', 'Julian K. Richter'],
    domain: 'Machine Learning & AI',
    description: 'A novel optimization algorithm correcting standard momentum oscillations using local spectral curvature estimators.',
    filename: 'adaptive_spectral_momentum_2025.pdf',
    abstract: `Stochastic gradient descent with momentum frequently suffers from oscillatory behavior in narrow valleys with ill-conditioned Hessian spectra. We propose Adaptive Spectral Momentum (ASM), a lightweight optimizer that dynamically adjusts momentum damping via online estimation of the dominant directional curvature without computing explicit second-order derivatives. On standard non-convex benchmark losses, ASM converges up to 1.8x faster than Adam while retaining standard gradient complexity O(d). We establish theoretical convergence guarantees under L-smoothness assumptions.`,
    content: `# Adaptive Spectral Momentum for Non-Convex Stochastic Optimization

Elena Vance (MIT), Tariq Al-Mansoor (Oxford), Julian K. Richter (Stanford)

## Abstract
Stochastic gradient descent with momentum frequently suffers from oscillatory behavior in narrow valleys with ill-conditioned Hessian spectra. We propose Adaptive Spectral Momentum (ASM), a lightweight optimizer that dynamically adjusts momentum damping via online estimation of the dominant directional curvature without computing explicit second-order derivatives. On standard non-convex benchmark losses, ASM converges up to 1.8x faster than Adam while retaining standard gradient complexity O(d). We establish theoretical convergence guarantees under L-smoothness assumptions.

## 1. Introduction and Problem Formulation
In modern high-dimensional stochastic optimization, first-order methods like SGD and Adam are standard. However, when navigating ill-conditioned ravines with high condition numbers kappa = lambda_max / lambda_min >> 1, fixed momentum coefficients beta in [0.9, 0.99] cause excessive overshoot along stiff eigenvectors and slow progress along flat directions.

## 2. Mathematical Formulation
Let f(w) be a continuously differentiable L-smooth loss function.
Standard momentum updates:
v_{t} = beta * v_{t-1} + (1 - beta) * g_t
w_{t} = w_{t-1} - alpha * v_t

In ASM, we compute directional difference vectors:
delta_w = w_{t} - w_{t-1}
delta_g = g_{t} - g_{t-1}

We compute the local directional curvature estimate:
gamma_t = max(epsilon, (delta_w^T * delta_g) / (||delta_w||^2 + epsilon))

The spectral damping correction factor is defined as:
beta_t = beta_base / (1.0 + sqrt(max(0, gamma_t * alpha)))

The updated parameter step is:
v_t = beta_t * v_{t-1} + (1.0 - beta_t) * g_t
w_{t+1} = w_t - alpha * v_t

## 3. Algorithm Specification
Input: Initial parameters w_0, learning rate alpha=0.01, base momentum beta_base=0.9, regularization epsilon=1e-8.
For step t = 1, 2, ... T:
  1. Compute stochastic gradient g_t = grad f(w_{t-1})
  2. If t == 1:
       v_1 = g_1, w_1 = w_0 - alpha * v_1
     Else:
       delta_w = w_{t-1} - w_{t-2}
       delta_g = g_t - g_{t-1}
       denom = ||delta_w||_2^2 + epsilon
       gamma_t = max(epsilon, dot(delta_w, delta_g) / denom)
       beta_t = beta_base / (1.0 + sqrt(gamma_t * alpha))
       v_t = beta_t * v_{t-1} + (1.0 - beta_t) * g_t
       w_t = w_{t-1} - alpha * v_t
  3. Record loss f(w_t)
Output: Final parameter vector w_T.

## 4. Experimental Setup & Metrics
We evaluate ASM against SGD, Classical Momentum (CM, beta=0.9), and Adam (alpha=0.001) on:
1. 2D Rosenbrock Banana Function: f(x, y) = (1 - x)^2 + 100 * (y - x^2)^2, starting at (-1.5, 2.0).
2. Ill-conditioned Quadratic Bowl: f(w) = 1/2 * w^T A w where condition number cond(A) = 1000.
3. Multi-layer perceptron on synthetic non-linear classification with noisy labels.
Metrics evaluated: Final loss, Convergence steps to reach f(w) < 1e-4, Gradient evaluation count, Trajectory oscillation ratio.`
  },
  {
    id: 'paper-epidemic-sir',
    title: 'Stochastic SEIR Compartmental Modeling with Adaptive Contact Interventions',
    authors: ['Dr. Sarah Lin', 'Marcus Thorne', 'Amina Diallo'],
    domain: 'Healthcare & Biomedical',
    description: 'A mathematical epidemiological model simulating infection spread with state-dependent adaptive quarantine interventions.',
    filename: 'stochastic_seir_interventions_2024.pdf',
    abstract: `Predicting disease transmission during novel outbreaks requires modeling both disease progression and feedback-driven public behavioral interventions. We introduce an adaptive stochastic SEIR (Susceptible-Exposed-Infectious-Recovered) compartmental model where the transmission rate beta(t) continuously modulates based on hospital occupancy pressure. We provide numerical simulation algorithms using Euler-Maruyama stochastic integration and estimate peak healthcare resource burden under diverse intervention latency parameters.`,
    content: `# Stochastic SEIR Compartmental Modeling with Adaptive Contact Interventions

Dr. Sarah Lin (Harvard T.H. Chan), Marcus Thorne (Imperial College London), Amina Diallo (Institut Pasteur)

## Abstract
Predicting disease transmission during novel outbreaks requires modeling both disease progression and feedback-driven public behavioral interventions. We introduce an adaptive stochastic SEIR (Susceptible-Exposed-Infectious-Recovered) compartmental model where the transmission rate beta(t) continuously modulates based on hospital occupancy pressure. We provide numerical simulation algorithms using Euler-Maruyama stochastic integration and estimate peak healthcare resource burden under diverse intervention latency parameters.

## 1. Model Formulation & Differential Equations
Total population N is partitioned into four compartments: S (Susceptible), E (Exposed, incubation phase), I (Infectious, symptomatic/asymptomatic spreaders), and R (Recovered / Removed).
S(t) + E(t) + I(t) + R(t) = N.

Base rate parameters:
- beta_0: Baseline contact transmission rate
- sigma: Incubation rate (mean incubation period = 1/sigma days)
- gamma: Recovery rate (mean infectious period = 1/gamma days)
- H_cap: Hospital ICU capacity threshold

Adaptive feedback transmission equation:
Hospitalized severe cases are approximated by severe_fraction * I(t).
When I(t) approaches capacity H_cap, public mitigation triggers:
beta(t) = beta_0 * (1.0 - mitigation_efficiency / (1.0 + exp(-k * (I(t) - H_cap) / N)))

Stochastic Ito Differential Equations:
dS = - beta(t) * S * I / N * dt - xi * sqrt(S * I / N) * dW_t
dE = (beta(t) * S * I / N - sigma * E) * dt + xi * sqrt(S * I / N) * dW_t
dI = (sigma * E - gamma * I) * dt
dR = (gamma * I) * dt

where dW_t is standard Brownian motion with diffusion coefficient xi.

## 2. Algorithm & Numerical Simulation
We solve using Euler-Maruyama discretization with time step dt = 0.1 days:
S_{t+1} = max(0, S_t + dS_t)
E_{t+1} = max(0, E_t + dE_t)
I_{t+1} = max(0, I_t + dI_t)
R_{t+1} = N - (S_{t+1} + E_{t+1} + I_{t+1})

Effective reproduction number:
R_eff(t) = (beta(t) / gamma) * (S(t) / N)

## 3. Evaluation Metrics
1. Peak infected count: max_t I(t)
2. Day of peak hospital demand: argmax_t I(t)
3. Total attack rate: (N - S(T_final)) / N
4. Time duration with R_eff(t) < 1.0.`
  },
  {
    id: 'paper-physics-symplectic',
    title: 'Symplectic Structure-Preserving Integrators for Constrained Hamiltonian Systems',
    authors: ['Prof. H. Chen', 'N. D. Petrov', 'L. V. O’Connor'],
    domain: 'Physics & Applied Mathematics',
    description: 'Energy-conserving numerical integrator for mechanical and orbital systems avoiding artificial secular energy drift.',
    filename: 'symplectic_hamiltonian_integrator_2024.pdf',
    abstract: `Standard Runge-Kutta numerical integrators fail to preserve physical phase-space volume and introduce artificial dissipation or unbounded energy growth over long integration horizons. We formulate an explicit Velocity Verlet Symplectic Integrator for non-linear separable Hamiltonian systems H(q, p) = T(p) + V(q). We prove exact conservation of the shadow Hamiltonian and demonstrate bounded energy error O(dt^2) across 10^5 integration steps in celestial Kepler two-body and coupled non-linear pendulum systems.`,
    content: `# Symplectic Structure-Preserving Integrators for Constrained Hamiltonian Systems

Prof. H. Chen (Princeton Institute for Advanced Study), N. D. Petrov (ETH Zurich), L. V. O'Connor (Cambridge)

## Abstract
Standard Runge-Kutta numerical integrators fail to preserve physical phase-space volume and introduce artificial dissipation or unbounded energy growth over long integration horizons. We formulate an explicit Velocity Verlet Symplectic Integrator for non-linear separable Hamiltonian systems H(q, p) = T(p) + V(q). We prove exact conservation of the shadow Hamiltonian and demonstrate bounded energy error O(dt^2) across 10^5 integration steps in celestial Kepler two-body and coupled non-linear pendulum systems.

## 1. Hamiltonian Mechanics Formulation
For generalized coordinates q in R^d and conjugate momenta p in R^d:
H(q, p) = 1/2 * p^T M^{-1} p + V(q)

Equations of motion:
dq/dt = partial H / partial p = M^{-1} p
dp/dt = - partial H / partial q = F(q) = - grad V(q)

## 2. Velocity Verlet Symplectic Algorithm
Given time step dt, mass m, position q_0, velocity v_0:
For step n = 0, 1, 2, ... N:
  1. v_{n + 1/2} = v_n + (dt / (2 * m)) * F(q_n)
  2. q_{n + 1} = q_n + dt * v_{n + 1/2}
  3. F_{n + 1} = - grad V(q_{n + 1})
  4. v_{n + 1} = v_{n + 1/2} + (dt / (2 * m)) * F_{n + 1}

## 3. Physical Invariants & Validation Tests
1. Total Energy Conservation: Delta E = |H(q_n, p_n) - H(q_0, p_0)| / H(q_0, p_0) <= C * dt^2 (bounded, zero drift).
2. Angular Momentum Conservation for central potential: L = q x p = const.
3. Kepler Orbit Periodicity: Orbit closure error for eccentricity e = 0.6.`
  }
];
