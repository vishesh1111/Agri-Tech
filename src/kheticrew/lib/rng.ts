/**
 * Seeded Pseudo-Random Number Generator using Mulberry32.
 * Deterministic for seed 42 to ensure reproducible demos and testing.
 */
export function createRNG(seed: number = 42): () => number {
  let s = seed >>> 0;
  return function next(): number {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Box-Muller transform for normal distribution sampling
 */
export function normalRandom(rng: () => number, mean: number = 0, stdDev: number = 1): number {
  let u1 = rng();
  while (u1 <= 1e-15) {
    u1 = rng();
  }
  const u2 = rng();
  const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  return mean + z0 * stdDev;
}

export function sampleInt(rng: () => number, min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

export function sampleChoice<T>(rng: () => number, items: T[]): T {
  return items[Math.floor(rng() * items.length)];
}
