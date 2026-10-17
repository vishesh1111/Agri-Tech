import { Worker, Assumptions } from '../types';
import { createRNG } from '../rng';

export type ConfirmationStatus = 'unconfirmed' | 'confirmed' | 'no_response' | 'declined';

export type WorkerCandidate = {
  worker: Worker;
  baseP: number;
  adjustedP: number;
  odds: number;
  distanceKm: number;
  wageOffered: number;
  localRate: number;
  startTime: string;
  rainProb: number;
  isNearFestival: boolean;
  confirmationStatus: ConfirmationStatus;
  factorsApplied: {
    name: string;
    multiplier: number;
  }[];
};

export type OverbookingContext = {
  nNeeded: number;
  nMin?: number;
  targetConfidence: number; // e.g. 0.95
  wageOffered: number;
  localRate: number;
  startTime: string; // e.g. '05:30' or '07:00'
  rainProb: number;
  isNearFestival: boolean;
};

/**
 * Compute base attendance probability using Beta prior
 * p = (showed + alpha) / (booked + alpha + beta)
 * Default prior: alpha=8, beta=2 (mean = 0.80)
 */
export function computeBaseProbability(
  worker: Worker,
  alpha: number = 8,
  beta: number = 2
): number {
  const booked = Math.max(0, worker.history.booked);
  const showed = Math.max(0, Math.min(booked, worker.history.showed));
  return (showed + alpha) / (booked + alpha + beta);
}

/**
 * Apply contextual adjustments on odds and confirmation status
 */
export function adjustProbability(
  baseP: number,
  context: {
    rainProb: number;
    isNearFestival: boolean;
    distanceKm: number;
    startTime: string;
    wageOffered: number;
    localRate: number;
    confirmationStatus?: ConfirmationStatus;
  },
  assumptions: Assumptions
): { p: number; odds: number; factors: { name: string; multiplier: number }[] } {
  if (context.confirmationStatus === 'declined') {
    return { p: 0, odds: 0, factors: [{ name: 'Declined (अस्वीकार)', multiplier: 0 }] };
  }

  // Clamped base p to avoid divide-by-zero
  const clampedBase = Math.min(0.999, Math.max(0.001, baseP));
  let odds = clampedBase / (1 - clampedBase);
  const factors: { name: string; multiplier: number }[] = [];

  // Rain > 60%
  if (context.rainProb >= 0.6) {
    odds *= assumptions.oddsRainFactor;
    factors.push({ name: 'Rain > 60%', multiplier: assumptions.oddsRainFactor });
  }

  // Near festival <= 2 days
  if (context.isNearFestival) {
    odds *= assumptions.oddsFestivalFactor;
    factors.push({ name: 'Near Festival', multiplier: assumptions.oddsFestivalFactor });
  }

  // Distance > 5 km
  if (context.distanceKm > 5) {
    odds *= assumptions.oddsDistanceFactor;
    factors.push({ name: 'Distance > 5km', multiplier: assumptions.oddsDistanceFactor });
  }

  // Early start before 06:00
  const hour = parseInt(context.startTime.split(':')[0] || '7', 10);
  if (hour < 6) {
    odds *= assumptions.oddsEarlyStartFactor;
    factors.push({ name: 'Early Start (<06:00)', multiplier: assumptions.oddsEarlyStartFactor });
  }

  // Wage >= 10% above local rate
  if (context.localRate > 0 && context.wageOffered >= context.localRate * 1.1) {
    odds *= assumptions.oddsHighWageFactor;
    factors.push({ name: 'Wage +10% above local', multiplier: assumptions.oddsHighWageFactor });
  }

  // Confirmation update
  if (context.confirmationStatus === 'confirmed') {
    odds *= assumptions.oddsConfirmedFactor;
    factors.push({ name: 'Confirmed (T-24h)', multiplier: assumptions.oddsConfirmedFactor });
  } else if (context.confirmationStatus === 'no_response') {
    odds *= assumptions.oddsNoResponseFactor;
    factors.push({ name: 'No Response (T-24h)', multiplier: assumptions.oddsNoResponseFactor });
  }

  // Convert odds back to probability
  let p = odds / (1 + odds);
  // Clamp to [0.02, 0.98] as per prompt specification
  p = Math.min(0.98, Math.max(0.02, p));

  return { p, odds, factors };
}

/**
 * Exact Poisson-binomial PMF over number of successes S by dynamic programming
 * O(n^2) where n <= 100, computes in < 1 ms
 */
export function computePoissonBinomialPMF(probs: number[]): number[] {
  let pmf = [1.0];
  for (const p of probs) {
    const nextPmf = new Array(pmf.length + 1).fill(0);
    const q = 1 - p;
    for (let k = 0; k < pmf.length; k++) {
      nextPmf[k] += pmf[k] * q;
      nextPmf[k + 1] += pmf[k] * p;
    }
    pmf = nextPmf;
  }
  return pmf;
}

/**
 * Tail probability P(S >= threshold)
 */
export function computeTailProbability(pmf: number[], threshold: number): number {
  if (threshold <= 0) return 1.0;
  if (threshold >= pmf.length) return 0.0;
  let sum = 0;
  for (let k = threshold; k < pmf.length; k++) {
    sum += pmf[k];
  }
  return Math.min(1.0, Math.max(0.0, sum));
}

/**
 * Compute Expected Cost for choosing M workers
 * E[min(S, N)] * wage + E[max(S - N, 0)] * allowance + E[max(Nmin - S, 0)] * shortfallPenalty
 */
export function computeExpectedCost(
  pmf: number[],
  N: number,
  Nmin: number,
  wage: number,
  reportingAllowance: number,
  shortfallPenalty: number
): number {
  let totalCost = 0;
  for (let s = 0; s < pmf.length; s++) {
    const p = pmf[s];
    const workedCost = Math.min(s, N) * wage;
    const excessAllowance = Math.max(0, s - N) * reportingAllowance;
    const shortfallCost = Math.max(0, Nmin - s) * shortfallPenalty;
    totalCost += p * (workedCost + excessAllowance + shortfallCost);
  }
  return totalCost;
}

export type OverbookingRecommendation = {
  nNeeded: number;
  nMin: number;
  recommendedM: number;
  costOptimalM: number;
  confidenceAtM: number;
  confidenceAtN: number;
  expectedCostAtM: number;
  expectedCostAtN: number;
  maxAchievableConfidence: number;
  candidatesSorted: WorkerCandidate[];
  tierAWorkers: WorkerCandidate[];
  tierBWorkers: WorkerCandidate[];
  pmfAtN: number[];
  pmfAtM: number[];
  suggestedFixes: string[];
};

/**
 * Solve Overbooking optimization for confidence mode & cost mode
 */
export function solveOverbooking(
  candidates: WorkerCandidate[],
  context: OverbookingContext,
  assumptions: Assumptions
): OverbookingRecommendation {
  const N = Math.max(1, context.nNeeded);
  const Nmin = context.nMin ?? N;
  const target = context.targetConfidence;
  const wage = context.wageOffered;
  const allowance = wage * assumptions.reportingAllowanceRatio;
  const penalty = wage * assumptions.shortfallPenaltyRatio;

  // 1. Sort candidates by adjusted probability descending, tie break by distance ascending
  const sorted = [...candidates].sort((a, b) => {
    if (Math.abs(b.adjustedP - a.adjustedP) > 1e-4) {
      return b.adjustedP - a.adjustedP;
    }
    return a.distanceKm - b.distanceKm;
  });

  // If candidate pool is empty
  if (sorted.length === 0) {
    return {
      nNeeded: N,
      nMin: Nmin,
      recommendedM: N,
      costOptimalM: N,
      confidenceAtM: 0,
      confidenceAtN: 0,
      expectedCostAtM: 0,
      expectedCostAtN: 0,
      maxAchievableConfidence: 0,
      candidatesSorted: [],
      tierAWorkers: [],
      tierBWorkers: [],
      pmfAtN: [1],
      pmfAtM: [1],
      suggestedFixes: ['No workers available in radius. Widen search radius or use Micro-Shifts.'],
    };
  }

  // Precompute PMFs for prefixes of sorted candidates
  const prefixPMFs: number[][] = [];
  let currentPMF = [1.0];
  prefixPMFs.push(currentPMF);

  for (let i = 0; i < sorted.length; i++) {
    const p = sorted[i].adjustedP;
    const nextPMF = new Array(currentPMF.length + 1).fill(0);
    const q = 1 - p;
    for (let k = 0; k < currentPMF.length; k++) {
      nextPMF[k] += currentPMF[k] * q;
      nextPMF[k + 1] += currentPMF[k] * p;
    }
    currentPMF = nextPMF;
    prefixPMFs.push(currentPMF);
  }

  const maxPool = sorted.length;
  const maxAchievableConfidence = computeTailProbability(prefixPMFs[maxPool], Nmin);

  // Confidence mode: smallest M >= N with P(S >= Nmin) >= target
  let recommendedM = Math.min(N, maxPool);
  let foundTarget = false;

  for (let m = Math.min(N, maxPool); m <= maxPool; m++) {
    const conf = computeTailProbability(prefixPMFs[m], Nmin);
    if (conf >= target) {
      recommendedM = m;
      foundTarget = true;
      break;
    }
  }

  if (!foundTarget) {
    recommendedM = maxPool;
  }

  // Cost mode: choose M minimising expected cost (M >= Nmin)
  let minCost = Infinity;
  let costOptimalM = Math.min(N, maxPool);

  for (let m = Math.min(Nmin, maxPool); m <= maxPool; m++) {
    const cost = computeExpectedCost(prefixPMFs[m], N, Nmin, wage, allowance, penalty);
    if (cost < minCost) {
      minCost = cost;
      costOptimalM = m;
    }
  }

  // Naive booking PMF and cost
  const naiveM = Math.min(N, maxPool);
  const pmfAtN = prefixPMFs[naiveM];
  const pmfAtM = prefixPMFs[recommendedM];

  const confidenceAtN = computeTailProbability(pmfAtN, Nmin);
  const confidenceAtM = computeTailProbability(pmfAtM, Nmin);

  const expectedCostAtN = computeExpectedCost(pmfAtN, N, Nmin, wage, allowance, penalty);
  const expectedCostAtM = computeExpectedCost(pmfAtM, N, Nmin, wage, allowance, penalty);

  const tierAWorkers = sorted.slice(0, Math.min(N, recommendedM));
  const tierBWorkers = sorted.slice(Math.min(N, recommendedM), recommendedM);

  const suggestedFixes: string[] = [];
  if (recommendedM > maxPool || confidenceAtM < target) {
    suggestedFixes.push('Widen travel radius by +5 km to add surrounding village workers.');
    suggestedFixes.push('Raise wage by 10-15% to boost worker commitment odds (+15%).');
    suggestedFixes.push('Break heavy post-harvest tasks into Micro-Shift slots for local adults.');
    suggestedFixes.push('Check Crew Relay for a nearby crew finishing on an adjacent farm.');
  }

  return {
    nNeeded: N,
    nMin: Nmin,
    recommendedM,
    costOptimalM,
    confidenceAtM,
    confidenceAtN,
    expectedCostAtM,
    expectedCostAtN,
    maxAchievableConfidence,
    candidatesSorted: sorted,
    tierAWorkers,
    tierBWorkers,
    pmfAtN,
    pmfAtM,
    suggestedFixes,
  };
}

/**
 * Monte Carlo validation simulation (e.g. 2000 runs)
 * Compares empirical distribution of S for Naive booking vs Overbooked M
 */
export function runMonteCarloSimulation(
  candidates: WorkerCandidate[],
  N: number,
  M: number,
  runs: number = 2000,
  seed: number = 42
): {
  naiveHistogram: { shows: number; count: number; freq: number }[];
  overbookedHistogram: { shows: number; count: number; freq: number }[];
  naiveSuccessRate: number;
  overbookedSuccessRate: number;
} {
  const rng = createRNG(seed);
  const naiveK = Math.min(N, candidates.length);
  const overK = Math.min(M, candidates.length);

  const naiveCounts = new Array(naiveK + 1).fill(0);
  const overCounts = new Array(overK + 1).fill(0);

  let naiveSuccesses = 0;
  let overSuccesses = 0;

  for (let r = 0; r < runs; r++) {
    // Naive run
    let naiveShows = 0;
    for (let i = 0; i < naiveK; i++) {
      if (rng() < candidates[i].adjustedP) {
        naiveShows++;
      }
    }
    naiveCounts[naiveShows]++;
    if (naiveShows >= N) naiveSuccesses++;

    // Overbooked run
    let overShows = 0;
    for (let i = 0; i < overK; i++) {
      if (rng() < candidates[i].adjustedP) {
        overShows++;
      }
    }
    overCounts[overShows]++;
    if (overShows >= N) overSuccesses++;
  }

  const naiveHistogram = naiveCounts.map((count, shows) => ({
    shows,
    count,
    freq: count / runs,
  }));

  const overbookedHistogram = overCounts.map((count, shows) => ({
    shows,
    count,
    freq: count / runs,
  }));

  return {
    naiveHistogram,
    overbookedHistogram,
    naiveSuccessRate: naiveSuccesses / runs,
    overbookedSuccessRate: overSuccesses / runs,
  };
}

/**
 * Generate WhatsApp message template
 */
export function getWhatsAppBookingText(
  workerName: string,
  farmerName: string,
  dateFormatted: string,
  operation: string,
  wage: number,
  isTierB: boolean,
  allowance: number,
  lang: 'en' | 'hi'
): string {
  if (lang === 'hi') {
    if (isTierB) {
      return `नमस्ते ${workerName} जी, किसान ${farmerName} को ${dateFormatted} को ${operation} के लिए स्टैंडबाय मजदूर चाहिए। मजदूरी ₹${wage}। यदि काम नहीं मिला तो भी ₹${allowance} हाजिरी भत्ता मिलेगा। कृपया सहमति दें।`;
    }
    return `नमस्ते ${workerName} जी, किसान ${farmerName} को ${dateFormatted} को ${operation} के लिए पक्की मजदूरी ₹${wage}/दिन पर आपकी आवश्यकता है। क्या आप आएंगे? कृपया पुष्टि करें।`;
  }

  if (isTierB) {
    return `Hello ${workerName}, farmer ${farmerName} requests you as standby crew on ${dateFormatted} for ${operation}. Wage is ₹${wage}. If not required, you receive ₹${allowance} reporting allowance. Please confirm availability.`;
  }
  return `Hello ${workerName}, farmer ${farmerName} books you for ${operation} on ${dateFormatted} at ₹${wage}/day. Please confirm your arrival.`;
}
