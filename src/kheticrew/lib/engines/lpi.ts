import {
  Village,
  Farm,
  Worker,
  CropOperation,
  Job,
  WeatherForecast,
  Assumptions,
} from '../types';
import { addDaysIso, diffDaysIso } from '../dates';

export type LpiBand = 'calm' | 'moderate' | 'tight' | 'severe' | 'critical';

export type DayDemandBreakdown = {
  farmId: string;
  farmOwner: string;
  operation: string;
  cropId: string;
  personDays: number;
  isWeatherSensitive: boolean;
};

export type VillageDayLPI = {
  villageId: string;
  villageName: string;
  date: string;
  demand: number;
  supply: number;
  ratio: number;
  lpi: number; // 0 to 100
  band: LpiBand;
  projectedWage: number;
  rainProb: number;
  isHeatWave: boolean;
  demandBreakdown: DayDemandBreakdown[];
};

export type VillageLPIHeatmap = {
  villageId: string;
  villageName: string;
  days: VillageDayLPI[];
  peakLpi: number;
  peakDate: string;
  criticalDaysCount: number;
};

export type LpiResult = {
  heatmaps: VillageLPIHeatmap[];
  dayIndexMap: Map<string, VillageDayLPI[]>; // date -> VillageDayLPI[]
  alerts: {
    id: string;
    villageId: string;
    villageName: string;
    date: string;
    band: LpiBand;
    demand: number;
    supply: number;
    wageSurgePct: number;
    message: string;
  }[];
  peakLpiOverall: number;
  peakDateOverall: string;
  totalDemandHorizon: number;
  totalSupplyHorizon: number;
};

export type ExternalSupplements = {
  festivalSupplyByVillageDate?: Record<string, Record<string, number>>; // villageId -> date -> personDays
  microShiftSupplyByVillageDate?: Record<string, Record<string, number>>; // villageId -> date -> personDays (FTE)
};

/**
 * Get LPI band from demand/supply ratio
 */
export function getLpiBand(ratio: number): LpiBand {
  if (ratio < 0.6) return 'calm';
  if (ratio < 0.85) return 'moderate';
  if (ratio < 1.05) return 'tight';
  if (ratio < 1.3) return 'severe';
  return 'critical';
}

/**
 * Spread total person-days across durationDays according to shape
 */
export function distributeDemandAcrossDays(
  totalPersonDays: number,
  durationDays: number,
  shape: 'uniform' | 'peak'
): number[] {
  if (durationDays <= 0) return [];
  if (durationDays === 1) return [totalPersonDays];

  if (shape === 'uniform') {
    const daily = totalPersonDays / durationDays;
    return new Array(durationDays).fill(daily);
  }

  // Triangular peak shape: peak at midpoint
  const mid = (durationDays - 1) / 2;
  const rawWeights: number[] = [];
  let sumWeights = 0;
  for (let d = 0; d < durationDays; d++) {
    const w = Math.max(0.1, 1 - Math.abs(d - mid) / (mid + 0.5));
    rawWeights.push(w);
    sumWeights += w;
  }

  return rawWeights.map((w) => (w / sumWeights) * totalPersonDays);
}

/**
 * Compute raw demand grid: villageId -> date -> DayDemandBreakdown[]
 */
export function computeRawDemand(
  farms: Farm[],
  cropOperations: CropOperation[],
  jobs: Job[],
  farmShifts: Record<string, number> = {} // farmId -> shift in days
): Map<string, Map<string, DayDemandBreakdown[]>> {
  const demandMap = new Map<string, Map<string, DayDemandBreakdown[]>>();

  // Find explicit jobs per farm-operation to avoid double counting
  const explicitJobKeys = new Set<string>();
  for (const job of jobs) {
    explicitJobKeys.add(`${job.farmId}__${job.operation}`);
  }

  for (const farm of farms) {
    if (!demandMap.has(farm.villageId)) {
      demandMap.set(farm.villageId, new Map());
    }
    const villageDemand = demandMap.get(farm.villageId)!;

    // Apply farm shift if present
    const shift = farmShifts[farm.id] || 0;
    const effectiveSowingDate = addDaysIso(farm.sowingDate, shift);

    // Operations for this farm's crop
    const ops = cropOperations.filter((op) => op.cropId === farm.crop);

    for (const op of ops) {
      const key = `${farm.id}__${op.operation}`;
      const explicitJob = jobs.find((j) => j.farmId === farm.id && j.operation === op.operation);

      if (explicitJob) {
        // Use explicit job dates and crewSize x duration
        const duration = explicitJob.durationDays;
        const dailyHeadcount = Math.round((explicitJob.crewSizeMin + explicitJob.crewSizeMax) / 2);
        for (let d = 0; d < duration; d++) {
          const dayDate = addDaysIso(explicitJob.earliestStart, d);
          if (!villageDemand.has(dayDate)) {
            villageDemand.set(dayDate, []);
          }
          villageDemand.get(dayDate)!.push({
            farmId: farm.id,
            farmOwner: farm.ownerName,
            operation: op.operation,
            cropId: farm.crop,
            personDays: dailyHeadcount,
            isWeatherSensitive: explicitJob.weatherSensitive,
          });
        }
      } else {
        // Forecast from crop operation model
        const totalPersonDays = farm.acres * op.personDaysPerAcre;
        const opStart = addDaysIso(effectiveSowingDate, op.startOffsetDays);
        const dailySpread = distributeDemandAcrossDays(totalPersonDays, op.durationDays, op.shape);

        for (let d = 0; d < op.durationDays; d++) {
          const dayDate = addDaysIso(opStart, d);
          if (!villageDemand.has(dayDate)) {
            villageDemand.set(dayDate, []);
          }
          villageDemand.get(dayDate)!.push({
            farmId: farm.id,
            farmOwner: farm.ownerName,
            operation: op.operation,
            cropId: farm.crop,
            personDays: dailySpread[d],
            isWeatherSensitive: op.weatherSensitive,
          });
        }
      }
    }
  }

  return demandMap;
}

/**
 * Apply weather compression:
 * On rainy days (rainProb >= 0.6), move weatherSensitive demand to nearest dry days within window.
 * Strictly conserves total demand.
 */
export function applyWeatherCompression(
  demandMap: Map<string, Map<string, DayDemandBreakdown[]>>,
  forecast: WeatherForecast[],
  rainWeatherWindowDays: number = 3
): Map<string, Map<string, DayDemandBreakdown[]>> {
  const forecastMap = new Map(forecast.map((f) => [f.date, f]));
  const compressedMap = new Map<string, Map<string, DayDemandBreakdown[]>>();

  for (const [villageId, vMap] of demandMap.entries()) {
    const newVMap = new Map<string, DayDemandBreakdown[]>();
    // Clone existing
    for (const [date, list] of vMap.entries()) {
      newVMap.set(date, list.map((item) => ({ ...item })));
    }

    const allDates = Array.from(newVMap.keys()).sort();

    for (const date of allDates) {
      const fc = forecastMap.get(date);
      if (fc && fc.rainProb >= 0.6) {
        const list = newVMap.get(date) || [];
        const weatherSensitiveItems = list.filter((i) => i.isWeatherSensitive);

        if (weatherSensitiveItems.length > 0) {
          // Find eligible dry days within +/- rainWeatherWindowDays
          const dryDates: string[] = [];
          for (let offset = -rainWeatherWindowDays; offset <= rainWeatherWindowDays; offset++) {
            if (offset === 0) continue;
            const targetDate = addDaysIso(date, offset);
            const targetFc = forecastMap.get(targetDate);
            if (!targetFc || targetFc.rainProb < 0.5) {
              dryDates.push(targetDate);
            }
          }

          if (dryDates.length > 0) {
            // Remove sensitive items from rain day
            const nonSensitive = list.filter((i) => !i.isWeatherSensitive);
            newVMap.set(date, nonSensitive);

            // Distribute evenly across dry days
            for (const item of weatherSensitiveItems) {
              const splitDemand = item.personDays / dryDates.length;
              for (const dryDate of dryDates) {
                if (!newVMap.has(dryDate)) {
                  newVMap.set(dryDate, []);
                }
                newVMap.get(dryDate)!.push({
                  ...item,
                  personDays: splitDemand,
                });
              }
            }
          }
        }
      }
    }

    compressedMap.set(villageId, newVMap);
  }

  return compressedMap;
}

/**
 * Compute Labour Pressure Index across all villages for horizonDays
 */
export function computeLPI(
  villages: Village[],
  farms: Farm[],
  workers: Worker[],
  cropOperations: CropOperation[],
  jobs: Job[],
  forecast: WeatherForecast[],
  assumptions: Assumptions,
  options?: {
    startDate?: string;
    horizonDays?: number;
    enableWeatherCompression?: boolean;
    farmShifts?: Record<string, number>;
    supplements?: ExternalSupplements;
  }
): LpiResult {
  const startDate = options?.startDate ?? forecast[0]?.date ?? '2026-10-17';
  const horizonDays = options?.horizonDays ?? Math.min(21, forecast.length);
  const enableWeather = options?.enableWeatherCompression ?? true;
  const farmShifts = options?.farmShifts ?? {};
  const supplements = options?.supplements;

  // 1. Demand computation
  let demandMap = computeRawDemand(farms, cropOperations, jobs, farmShifts);
  if (enableWeather) {
    demandMap = applyWeatherCompression(demandMap, forecast, assumptions.rainWeatherWindowDays);
  }

  // 2. Base local worker pool per village
  const workersByVillage = new Map<string, Worker[]>();
  for (const w of workers) {
    if (!workersByVillage.has(w.villageId)) {
      workersByVillage.set(w.villageId, []);
    }
    workersByVillage.get(w.villageId)!.push(w);
  }

  const forecastMap = new Map(forecast.map((f) => [f.date, f]));
  const dayIndexMap = new Map<string, VillageDayLPI[]>();
  const alerts: LpiResult['alerts'] = [];
  const heatmaps: VillageLPIHeatmap[] = [];

  let overallPeakLpi = 0;
  let overallPeakDate = startDate;
  let totalDemandHorizon = 0;
  let totalSupplyHorizon = 0;

  for (const village of villages) {
    const vWorkers = workersByVillage.get(village.id) || [];
    const vDemandMap = demandMap.get(village.id) || new Map();
    const dayLpis: VillageDayLPI[] = [];
    let villagePeakLpi = 0;
    let villagePeakDate = startDate;
    let criticalDaysCount = 0;

    for (let d = 0; d < horizonDays; d++) {
      const date = addDaysIso(startDate, d);
      const fc = forecastMap.get(date);
      const rainProb = fc?.rainProb ?? 0;
      const isHeatWave = fc?.isHeatWave ?? false;

      // Demand
      const items: DayDemandBreakdown[] = vDemandMap.get(date) || [];
      const demand = items.reduce((sum: number, item: DayDemandBreakdown) => sum + item.personDays, 0);

      // Local Supply: 1 if free, 0 if on unavailableDates, times baseWorkerAvailability
      let localAvailableCount = 0;
      for (const w of vWorkers) {
        if (!w.unavailableDates.includes(date)) {
          localAvailableCount += 1.0;
        }
      }
      let supply = localAvailableCount * assumptions.baseWorkerAvailability;

      // Add festival returnee supply
      if (supplements?.festivalSupplyByVillageDate?.[village.id]?.[date]) {
        supply += supplements.festivalSupplyByVillageDate[village.id][date];
      }

      // Add micro-shift supply (FTE)
      if (supplements?.microShiftSupplyByVillageDate?.[village.id]?.[date]) {
        supply += supplements.microShiftSupplyByVillageDate[village.id][date];
      }

      // Safe ratio calculation
      let ratio = 0;
      if (supply > 0) {
        ratio = Math.min(assumptions.lpiCapRatio, demand / supply);
      } else {
        ratio = demand > 0 ? assumptions.lpiCapRatio : 0;
      }

      // LPI = clamp(ratio * 66.7, 0, 100)
      const lpi = Math.min(100, Math.max(0, Math.round(ratio * 66.7)));
      const band = getLpiBand(ratio);

      // Projected wage = baseWage * (1 + elasticity * max(0, ratio - 0.8))
      const surgeFactor = Math.max(0, ratio - 0.8);
      const wageSurge = assumptions.wageElasticity * surgeFactor;
      const projectedWage = Math.round(assumptions.minimumDailyWage * (1 + wageSurge));

      totalDemandHorizon += demand;
      totalSupplyHorizon += supply;

      if (lpi > villagePeakLpi) {
        villagePeakLpi = lpi;
        villagePeakDate = date;
      }
      if (band === 'critical' || band === 'severe') {
        criticalDaysCount++;
      }

      const dayObj: VillageDayLPI = {
        villageId: village.id,
        villageName: village.name,
        date,
        demand: Math.round(demand * 10) / 10,
        supply: Math.round(supply * 10) / 10,
        ratio: Math.round(ratio * 100) / 100,
        lpi,
        band,
        projectedWage,
        rainProb,
        isHeatWave,
        demandBreakdown: items,
      };

      dayLpis.push(dayObj);

      if (!dayIndexMap.has(date)) {
        dayIndexMap.set(date, []);
      }
      dayIndexMap.get(date)!.push(dayObj);

      // Trigger alert for Critical / Severe days
      if (band === 'critical' || (band === 'severe' && demand > 20)) {
        const surgePct = Math.round(wageSurge * 100);
        alerts.push({
          id: `alert-${village.id}-${date}`,
          villageId: village.id,
          villageName: village.name,
          date,
          band,
          demand: Math.round(demand),
          supply: Math.round(supply),
          wageSurgePct: surgePct,
          message: `${date}: ${band.toUpperCase()} in ${village.name}, demand ${Math.round(demand)} vs supply ${Math.round(supply)}, wages projected +${surgePct}%.`,
        });
      }
    }

    if (villagePeakLpi > overallPeakLpi) {
      overallPeakLpi = villagePeakLpi;
      overallPeakDate = villagePeakDate;
    }

    heatmaps.push({
      villageId: village.id,
      villageName: village.name,
      days: dayLpis,
      peakLpi: villagePeakLpi,
      peakDate: villagePeakDate,
      criticalDaysCount,
    });
  }

  // Sort alerts by date
  alerts.sort((a, b) => a.date.localeCompare(b.date));

  return {
    heatmaps,
    dayIndexMap,
    alerts,
    peakLpiOverall: overallPeakLpi,
    peakDateOverall: overallPeakDate,
    totalDemandHorizon: Math.round(totalDemandHorizon),
    totalSupplyHorizon: Math.round(totalSupplyHorizon),
  };
}

/**
 * What-If Shift Simulator:
 * Scans shifts for a farm and evaluates peak LPI reduction and cost savings
 */
export function simulateFarmShift(
  farmId: string,
  villages: Village[],
  farms: Farm[],
  workers: Worker[],
  cropOperations: CropOperation[],
  jobs: Job[],
  forecast: WeatherForecast[],
  assumptions: Assumptions
): {
  allowedShifts: { shiftDays: number; peakLpi: number; avgWage: number }[];
  bestShiftDays: number;
  peakLpiDelta: number;
  bookLabourByDate: string;
} {
  const targetFarm = farms.find((f) => f.id === farmId);
  if (!targetFarm) {
    return { allowedShifts: [], bestShiftDays: 0, peakLpiDelta: 0, bookLabourByDate: '2026-10-20' };
  }

  const baseResult = computeLPI(villages, farms, workers, cropOperations, jobs, forecast, assumptions);
  const baseVillageHeatmap = baseResult.heatmaps.find((h) => h.villageId === targetFarm.villageId);
  const basePeak = baseVillageHeatmap?.peakLpi ?? 50;

  const allowedShifts: { shiftDays: number; peakLpi: number; avgWage: number }[] = [];
  let bestShift = 0;
  let lowestPeak = basePeak;

  // Scan shifts from -sowingFlexDays to +sowingFlexDays
  const minShift = -Math.min(5, targetFarm.sowingFlexDays);
  const maxShift = Math.min(7, targetFarm.sowingFlexDays);

  for (let s = minShift; s <= maxShift; s++) {
    const simRes = computeLPI(villages, farms, workers, cropOperations, jobs, forecast, assumptions, {
      farmShifts: { [farmId]: s },
    });
    const vMap = simRes.heatmaps.find((h) => h.villageId === targetFarm.villageId);
    const peak = vMap?.peakLpi ?? 50;
    const avgWage = vMap ? vMap.days.reduce((acc, d) => acc + d.projectedWage, 0) / vMap.days.length : 400;

    allowedShifts.push({ shiftDays: s, peakLpi: peak, avgWage: Math.round(avgWage) });

    if (peak < lowestPeak) {
      lowestPeak = peak;
      bestShift = s;
    }
  }

  // Book labour by date: the first day before peak when wage exceeds threshold
  let bookBy = baseVillageHeatmap?.days[0]?.date || '2026-10-20';
  if (baseVillageHeatmap) {
    const peakIdx = baseVillageHeatmap.days.findIndex((d) => d.date === baseVillageHeatmap.peakDate);
    if (peakIdx > 3) {
      bookBy = baseVillageHeatmap.days[Math.max(0, peakIdx - 4)].date;
    }
  }

  return {
    allowedShifts,
    bestShiftDays: bestShift,
    peakLpiDelta: lowestPeak - basePeak,
    bookLabourByDate: bookBy,
  };
}
