import {
  MicroTask,
  MicroProfile,
  Worker,
  CropOperation,
  WeatherForecast,
  Assumptions,
  Village,
} from '../types';
import { addDaysIso, diffDaysIso, euclideanDistance } from '../dates';
import { computePoissonBinomialPMF, computeTailProbability, computeBaseProbability } from './overbooking';

export type DayPartSlot = {
  id: string;
  date: string;
  name: string; // 'Early' | 'Late Morning' | 'Evening'
  startTime: string; // '06:00', '09:00', '15:30'
  endTime: string; // '09:00', '12:00', '18:30'
  hours: number; // 3.0
  isHeatRisk: boolean;
};

export type MicroShiftSlot = {
  id: string;
  taskId: string;
  taskName: string;
  operation: string;
  load: 1 | 2 | 3;
  skillLevel: 0 | 1 | 2;
  hazard: boolean;
  isCore: boolean; // load === 3 || hazard || skillLevel === 2
  date: string;
  startTime: string;
  endTime: string;
  hours: number;
  headcountNeeded: number;
  eligibleWorkerIds: string[];
  assignedWorkerIds: string[];
  recommendedExtraBooking: number;
  slotConfidence: number;
  hourlyPayRate: number;
  slotPay: number;
  isHeatRisk: boolean;
};

export type MicroShiftRoster = {
  operation: string;
  acres: number;
  deadlineDate: string;
  totalPersonHours: number;
  coreHours: number;
  microShiftableHours: number;
  microShiftPct: number;
  fullDayWorkersBefore: number;
  fullDayWorkersAfter: number;
  fullDayWorkersFreed: number;
  activatedPeopleCount: number;
  slotCoveragePct: number;
  slots: MicroShiftSlot[];
  workerAssignments: Record<string, { worker: Worker; slots: MicroShiftSlot[]; totalHours: number; totalPay: number }>;
  unfilledSlots: { slot: MicroShiftSlot; suggestions: string[] }[];
  safeguardsReport: {
    adultVerifiedOnly: boolean;
    zeroHazardViolations: boolean;
    heatWindowProtected: boolean;
    hoursCapRespected: boolean;
    noNightWork: boolean;
  };
};

/**
 * Check if a task belongs to core crew or is micro-shiftable
 */
export function isTaskCore(task: MicroTask): boolean {
  return task.load === 3 || task.hazard || task.skillLevel === 2;
}

/**
 * Generate 3-hour day-part time slots for a given date
 * Drop midday slot (12:00-15:30) on heat days, and avoid night work.
 */
export function generateDayPartSlots(
  date: string,
  forecastMap: Map<string, WeatherForecast>,
  heatThreshold: number = 38
): DayPartSlot[] {
  const fc = forecastMap.get(date);
  const isHeatDay = fc ? fc.isHeatWave || fc.maxTempC >= heatThreshold : false;

  const slots: DayPartSlot[] = [
    {
      id: `${date}-early`,
      date,
      name: 'Early Morning',
      startTime: '06:00',
      endTime: '09:00',
      hours: 3.0,
      isHeatRisk: false,
    },
    {
      id: `${date}-late-morning`,
      date,
      name: 'Late Morning',
      startTime: '09:00',
      endTime: '12:00',
      hours: 3.0,
      isHeatRisk: false,
    },
    {
      id: `${date}-evening`,
      date,
      name: 'Evening',
      startTime: '15:30',
      endTime: '18:30',
      hours: 3.0,
      isHeatRisk: false,
    },
  ];

  // Note: Midday slot (12:00-15:30) is explicitly prohibited on heat days
  // On non-heat days, it could be an option, but agricultural practice in North India avoids midday sun
  return slots;
}

/**
 * Check if a worker is eligible for a specific slot
 */
export function isWorkerEligibleForSlot(
  worker: Worker,
  profile: MicroProfile,
  slot: { load: 1 | 2 | 3; skillLevel: 0 | 1 | 2; hazard: boolean; startTime: string; endTime: string; date: string },
  farmVillage: Village,
  workerVillage: Village,
  currentDayAssignedHours: number,
  maxDailyHours: number,
  assumptions: Assumptions
): boolean {
  // 1. Adult verification
  if (!profile.adultVerified) return false;

  // 2. Unavailable dates
  if (worker.unavailableDates.includes(slot.date)) return false;

  // 3. Load capacity
  if (slot.load > profile.maxLoad) return false;

  // 4. Skill level
  if (worker.skillLevel < slot.skillLevel) return false;

  // 5. Hazard certification
  if (slot.hazard && !worker.certifiedForHazard) return false;

  // 6. Max daily hours
  const slotLength = 3.0;
  if (currentDayAssignedHours + slotLength > Math.min(maxDailyHours, profile.maxHoursPerDay)) {
    return false;
  }

  // 7. Distance
  const dist = euclideanDistance(farmVillage.xKm, farmVillage.yKm, workerVillage.xKm, workerVillage.yKm);
  if (dist > profile.maxDistanceKm) return false;

  // 8. Time window coverage
  // Worker must have an availability window matching the slot
  const slotStartMinutes = parseTimeMinutes(slot.startTime);
  const slotEndMinutes = parseTimeMinutes(slot.endTime);

  const hasWindow = profile.windows.some((w) => {
    const wStart = parseTimeMinutes(w.start);
    const wEnd = parseTimeMinutes(w.end);
    return wStart <= slotStartMinutes && wEnd >= slotEndMinutes;
  });

  return hasWindow;
}

function parseTimeMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + (m || 0);
}

/**
 * Run Micro-Shift Task Splitter and Scarcity-First Matching
 */
export function solveMicroShifts(
  operationName: string,
  acres: number,
  startDate: string,
  deadlineDate: string,
  tasks: MicroTask[],
  workers: Worker[],
  microProfiles: MicroProfile[],
  villages: Village[],
  farmVillageId: string,
  dailyWage: number,
  forecast: WeatherForecast[],
  assumptions: Assumptions
): MicroShiftRoster {
  const villageMap = new Map(villages.map((v) => [v.id, v]));
  const farmVillage = villageMap.get(farmVillageId) || villages[0];
  const profileMap = new Map(microProfiles.map((p) => [p.workerId, p]));
  const workerMap = new Map(workers.map((w) => [w.id, w]));
  const forecastMap = new Map(forecast.map((f) => [f.date, f]));

  // 1. Calculate workload
  // Standard benchmark: ~10 person-days per acre for paddy post harvest -> 80 hours per acre
  const personDaysPerAcre = 10;
  const totalPersonHours = Math.round(acres * personDaysPerAcre * 8);

  const opTasks = tasks.filter((t) => t.operation === operationName);
  const effectiveTasks = opTasks.length > 0 ? opTasks : tasks.slice(0, 5);

  let coreHours = 0;
  let microShiftableHours = 0;

  for (const t of effectiveTasks) {
    const taskHours = totalPersonHours * t.workShare;
    if (isTaskCore(t)) {
      coreHours += taskHours;
    } else {
      microShiftableHours += taskHours;
    }
  }

  const microShiftPct = totalPersonHours > 0 ? Math.round((microShiftableHours / totalPersonHours) * 100) : 0;
  const daysCount = Math.max(1, diffDaysIso(startDate, deadlineDate) + 1);

  // Hourly pay with micro-shift premium
  const baseHourly = dailyWage / 8;
  const hourlyPayRate = Math.round(baseHourly * (1 + assumptions.microShiftPremiumRate));
  const slotPay = Math.round(hourlyPayRate * 3.0);

  // 2. Generate slots for each task across days
  const slots: MicroShiftSlot[] = [];
  let slotSeq = 1;

  for (const t of effectiveTasks) {
    const isCore = isTaskCore(t);
    const taskTotalHours = totalPersonHours * t.workShare;
    const dailyHours = taskTotalHours / daysCount;

    for (let d = 0; d < daysCount; d++) {
      const date = addDaysIso(startDate, d);
      const dayParts = generateDayPartSlots(date, forecastMap, assumptions.heatIndexThreshold);
      const hoursPerPart = dailyHours / dayParts.length;
      const headcountNeeded = Math.max(1, Math.ceil(hoursPerPart / 3.0));

      for (const dp of dayParts) {
        slots.push({
          id: `slot-${slotSeq++}`,
          taskId: t.id,
          taskName: t.name,
          operation: t.operation,
          load: t.load,
          skillLevel: t.skillLevel,
          hazard: t.hazard,
          isCore,
          date,
          startTime: dp.startTime,
          endTime: dp.endTime,
          hours: dp.hours,
          headcountNeeded,
          eligibleWorkerIds: [],
          assignedWorkerIds: [],
          recommendedExtraBooking: 0,
          slotConfidence: 0,
          hourlyPayRate,
          slotPay,
          isHeatRisk: dp.isHeatRisk,
        });
      }
    }
  }

  // 3. Find eligible workers for each slot
  for (const slot of slots) {
    for (const worker of workers) {
      const profile = profileMap.get(worker.id);
      if (!profile) continue;
      const wVillage = villageMap.get(worker.villageId) || farmVillage;

      if (
        isWorkerEligibleForSlot(
          worker,
          profile,
          slot,
          farmVillage,
          wVillage,
          0, // test base eligibility
          assumptions.maxDailyHoursDefault,
          assumptions
        )
      ) {
        slot.eligibleWorkerIds.push(worker.id);
      }
    }
  }

  // 4. Scarcity-first greedy assignment
  // Sort slots by fewest eligible workers first
  const sortedSlots = [...slots].sort(
    (a, b) => a.eligibleWorkerIds.length - b.eligibleWorkerIds.length
  );

  // Track worker hours per day: workerId -> date -> hours
  const workerDailyHours = new Map<string, Map<string, number>>();
  // Track worker hours total
  const workerTotalHours = new Map<string, number>();
  // Track worker last assigned slot end time: workerId -> date -> endMinutes
  const workerLastSlotEnd = new Map<string, Map<string, number>>();

  for (const slot of sortedSlots) {
    const slotStartMin = parseTimeMinutes(slot.startTime);
    const slotEndMin = parseTimeMinutes(slot.endTime);

    // Candidates who are eligible and still under hours cap
    const scoredCandidates: { workerId: string; score: number }[] = [];

    for (const wId of slot.eligibleWorkerIds) {
      const worker = workerMap.get(wId)!;
      const profile = profileMap.get(wId)!;
      const wVillage = villageMap.get(worker.villageId) || farmVillage;

      const dMap = workerDailyHours.get(wId) || new Map<string, number>();
      const currentHours = dMap.get(slot.date) || 0;

      if (currentHours + slot.hours <= Math.min(assumptions.maxDailyHoursDefault, profile.maxHoursPerDay)) {
        // Check rest time (min 30 min)
        const lastEnd = workerLastSlotEnd.get(wId)?.get(slot.date);
        if (lastEnd !== undefined && slotStartMin - lastEnd < assumptions.restMinutesBetweenSlots && slotStartMin >= lastEnd) {
          continue;
        }

        // Scoring: 0.35 skill match + 0.25 distance + 0.20 continuity + 0.20 fairness
        const skillMatch = worker.skillLevel === slot.skillLevel ? 1.0 : 0.8;
        const dist = euclideanDistance(farmVillage.xKm, farmVillage.yKm, wVillage.xKm, wVillage.yKm);
        const distScore = Math.max(0, 1 - dist / profile.maxDistanceKm);
        const continuity = currentHours > 0 ? 1.0 : 0.0;
        const totalHrs = workerTotalHours.get(wId) || 0;
        const fairness = Math.max(0, 1 - totalHrs / 30);

        const score = 0.35 * skillMatch + 0.25 * distScore + 0.20 * continuity + 0.20 * fairness;
        scoredCandidates.push({ workerId: wId, score });
      }
    }

    scoredCandidates.sort((a, b) => b.score - a.score);

    const needed = slot.headcountNeeded;
    const assigned = scoredCandidates.slice(0, needed).map((c) => c.workerId);
    slot.assignedWorkerIds = assigned;

    for (const wId of assigned) {
      if (!workerDailyHours.has(wId)) workerDailyHours.set(wId, new Map());
      const dMap = workerDailyHours.get(wId)!;
      dMap.set(slot.date, (dMap.get(slot.date) || 0) + slot.hours);

      workerTotalHours.set(wId, (workerTotalHours.get(wId) || 0) + slot.hours);

      if (!workerLastSlotEnd.has(wId)) workerLastSlotEnd.set(wId, new Map());
      workerLastSlotEnd.get(wId)!.set(slot.date, slotEndMin);
    }

    // Overbooking calculation per slot
    if (assigned.length > 0) {
      const probs = assigned.map((wId) => {
        const w = workerMap.get(wId)!;
        return computeBaseProbability(w, assumptions.priorBetaAlpha, assumptions.priorBetaBeta);
      });
      const pmf = computePoissonBinomialPMF(probs);
      slot.slotConfidence = computeTailProbability(pmf, Math.ceil(needed * 0.8));
      slot.recommendedExtraBooking = slot.slotConfidence < 0.9 && slot.eligibleWorkerIds.length > assigned.length ? 1 : 0;
    }
  }

  // 5. Build worker assignment aggregates
  const workerAssignments: MicroShiftRoster['workerAssignments'] = {};
  const activatedWorkers = new Set<string>();

  for (const slot of slots) {
    for (const wId of slot.assignedWorkerIds) {
      activatedWorkers.add(wId);
      if (!workerAssignments[wId]) {
        workerAssignments[wId] = {
          worker: workerMap.get(wId)!,
          slots: [],
          totalHours: 0,
          totalPay: 0,
        };
      }
      workerAssignments[wId].slots.push(slot);
      workerAssignments[wId].totalHours += slot.hours;
      workerAssignments[wId].totalPay += slot.slotPay;
    }
  }

  // Unfilled slots
  const unfilledSlots: MicroShiftRoster['unfilledSlots'] = [];
  let filledHeadcount = 0;
  let totalHeadcountNeeded = 0;

  for (const slot of slots) {
    totalHeadcountNeeded += slot.headcountNeeded;
    filledHeadcount += slot.assignedWorkerIds.length;
    if (slot.assignedWorkerIds.length < slot.headcountNeeded) {
      unfilledSlots.push({
        slot,
        suggestions: [
          `Raise slot pay from ₹${slot.slotPay} to ₹${Math.round(slot.slotPay * 1.15)} to draw from adjacent villages.`,
          'Widen worker travel radius by +4 km.',
          'Shift slot to early morning day-part on next day.',
        ],
      });
    }
  }

  const slotCoveragePct = totalHeadcountNeeded > 0 ? Math.round((filledHeadcount / totalHeadcountNeeded) * 100) : 0;

  // Full-day workers needed before vs after
  // Before: all person-hours divided by 8 hours per full-day worker
  const fullDayWorkersBefore = Math.ceil(totalPersonHours / (daysCount * 8));
  // After: only core hours need full-day workers
  const fullDayWorkersAfter = Math.ceil(coreHours / (daysCount * 8));
  const fullDayWorkersFreed = Math.max(0, fullDayWorkersBefore - fullDayWorkersAfter);

  return {
    operation: operationName,
    acres,
    deadlineDate,
    totalPersonHours,
    coreHours: Math.round(coreHours),
    microShiftableHours: Math.round(microShiftableHours),
    microShiftPct,
    fullDayWorkersBefore,
    fullDayWorkersAfter,
    fullDayWorkersFreed,
    activatedPeopleCount: activatedWorkers.size,
    slotCoveragePct,
    slots,
    workerAssignments,
    unfilledSlots,
    safeguardsReport: {
      adultVerifiedOnly: true,
      zeroHazardViolations: true,
      heatWindowProtected: true,
      hoursCapRespected: true,
      noNightWork: true,
    },
  };
}
