import { Crew, Job, Farm, Village, Assumptions } from '../types';
import { diffDaysIso, addDaysIso, euclideanDistance } from '../dates';

export type JobAssignment = {
  jobId: string;
  crewId: string;
  partnerCrewId?: string; // For paired crews
  startDay: string; // ISO date 'YYYY-MM-DD'
  endDay: string; // ISO date 'YYYY-MM-DD'
  travelDays: number;
  travelDistanceKm: number;
  shiftDaysSuggested: number;
  urgencyScore: number;
};

export type CrewScheduleDay = {
  date: string;
  type: 'work' | 'travel' | 'idle';
  jobId?: string;
  jobName?: string;
  farmId?: string;
  villageName?: string;
  travelKm?: number;
};

export type CrewSchedule = {
  crewId: string;
  crew: Crew;
  assignments: JobAssignment[];
  dayTimeline: CrewScheduleDay[];
  totalWorkDays: number;
  totalTravelDays: number;
  totalIdleDays: number;
  totalTravelKm: number;
  longestStreakDays: number;
  totalPersonDays: number;
};

export type RelayMetrics = {
  jobCoveragePct: number; // percentage of jobs assigned
  totalPersonDaysEmployed: number;
  avgStreakDays: number;
  maxStreakDays: number;
  totalIdleDays: number;
  totalTravelKm: number;
  unmetPersonDays: number;
  avgPaidDaysPerWorker: number;
};

export type RelayResult = {
  relaySchedules: Record<string, CrewSchedule>;
  baselineSchedules: Record<string, CrewSchedule>;
  relayMetrics: RelayMetrics;
  baselineMetrics: RelayMetrics;
  unassignedJobsRelay: { job: Job; reason: string }[];
  unassignedJobsBaseline: { job: Job; reason: string }[];
  shiftSuggestions: {
    jobId: string;
    crewId: string;
    farmerName: string;
    suggestedShiftDays: number;
    explanation: string;
  }[];
};

/**
 * Helper to compute distance between two village IDs
 */
function getDistanceBetweenVillages(
  v1Id: string,
  v2Id: string,
  villageMap: Map<string, Village>
): number {
  if (v1Id === v2Id) return 0;
  const v1 = villageMap.get(v1Id);
  const v2 = villageMap.get(v2Id);
  if (!v1 || !v2) return 0;
  return euclideanDistance(v1.xKm, v1.yKm, v2.xKm, v2.yKm);
}

/**
 * Compute travel time in days (0 if <= maxFreeTravelKm, else 1)
 */
function getTravelDays(distanceKm: number, maxFreeKm: number): number {
  return distanceKm <= maxFreeKm ? 0 : 1;
}

/**
 * Calculate metrics for a set of crew schedules
 */
function computeMetrics(
  schedules: CrewSchedule[],
  allJobs: Job[],
  farmMap: Map<string, Farm>
): RelayMetrics {
  const assignedJobIds = new Set<string>();
  let totalWorkDays = 0;
  let totalPersonDays = 0;
  let totalIdleDays = 0;
  let totalTravelKm = 0;
  let maxStreak = 0;
  let sumStreaks = 0;
  let totalWorkers = 0;

  for (const s of schedules) {
    totalWorkDays += s.totalWorkDays;
    totalPersonDays += s.totalPersonDays;
    totalIdleDays += s.totalIdleDays;
    totalTravelKm += s.totalTravelKm;
    if (s.longestStreakDays > maxStreak) {
      maxStreak = s.longestStreakDays;
    }
    sumStreaks += s.longestStreakDays;
    totalWorkers += s.crew.size;
    for (const a of s.assignments) {
      assignedJobIds.add(a.jobId);
    }
  }

  const jobCoveragePct = allJobs.length > 0 ? (assignedJobIds.size / allJobs.length) * 100 : 0;
  const avgStreakDays = schedules.length > 0 ? sumStreaks / schedules.length : 0;
  const avgPaidDaysPerWorker = totalWorkers > 0 ? totalPersonDays / totalWorkers : 0;

  // Unmet person days
  let unmet = 0;
  for (const j of allJobs) {
    if (!assignedJobIds.has(j.id)) {
      unmet += j.crewSizeMin * j.durationDays;
    }
  }

  return {
    jobCoveragePct,
    totalPersonDaysEmployed: totalPersonDays,
    avgStreakDays,
    maxStreakDays: maxStreak,
    totalIdleDays,
    totalTravelKm,
    unmetPersonDays: unmet,
    avgPaidDaysPerWorker,
  };
}

/**
 * Build day-by-day timeline for a crew and compute streaks
 */
function buildCrewDayTimeline(
  crew: Crew,
  assignments: JobAssignment[],
  jobMap: Map<string, Job>,
  farmMap: Map<string, Farm>,
  villageMap: Map<string, Village>
): CrewScheduleDay[] {
  const daysDiff = diffDaysIso(crew.availableFrom, crew.availableTo);
  if (daysDiff < 0) return [];

  const timelineMap = new Map<string, CrewScheduleDay>();
  for (let i = 0; i <= daysDiff; i++) {
    const d = addDaysIso(crew.availableFrom, i);
    timelineMap.set(d, {
      date: d,
      type: 'idle',
    });
  }

  // Populate assignments
  for (const a of assignments) {
    const job = jobMap.get(a.jobId);
    const farm = job ? farmMap.get(job.farmId) : undefined;
    const village = farm ? villageMap.get(farm.villageId) : undefined;

    // Travel day before start if travelDays > 0
    if (a.travelDays > 0) {
      const travelDate = addDaysIso(a.startDay, -a.travelDays);
      if (timelineMap.has(travelDate)) {
        timelineMap.set(travelDate, {
          date: travelDate,
          type: 'travel',
          travelKm: a.travelDistanceKm,
          villageName: village?.name,
        });
      }
    }

    const duration = diffDaysIso(a.startDay, a.endDay) + 1;
    for (let d = 0; d < duration; d++) {
      const workDate = addDaysIso(a.startDay, d);
      if (timelineMap.has(workDate)) {
        timelineMap.set(workDate, {
          date: workDate,
          type: 'work',
          jobId: a.jobId,
          jobName: job?.operation,
          farmId: farm?.id,
          villageName: village?.name,
        });
      }
    }
  }

  return Array.from(timelineMap.values());
}

/**
 * Calculate longest continuous work streak
 */
function calculateLongestStreak(timeline: CrewScheduleDay[]): number {
  let maxStreak = 0;
  let currentStreak = 0;
  for (const day of timeline) {
    if (day.type === 'work') {
      currentStreak++;
      if (currentStreak > maxStreak) maxStreak = currentStreak;
    } else {
      currentStreak = 0;
    }
  }
  return maxStreak;
}

/**
 * Run Crew Relay Engine (Relay vs Baseline)
 */
export function solveCrewRelay(
  crews: Crew[],
  jobs: Job[],
  farms: Farm[],
  villages: Village[],
  assumptions: Assumptions,
  weightsOverride?: { urgency: number; gap: number; distance: number; wage: number }
): RelayResult {
  const farmMap = new Map<string, Farm>(farms.map((f) => [f.id, f]));
  const villageMap = new Map<string, Village>(villages.map((v) => [v.id, v]));
  const jobMap = new Map<string, Job>(jobs.map((j) => [j.id, j]));

  const weights = {
    urgency: weightsOverride?.urgency ?? assumptions.relayUrgencyWeight,
    gap: weightsOverride?.gap ?? assumptions.relayGapWeight,
    distance: weightsOverride?.distance ?? assumptions.relayDistanceWeight,
    wage: weightsOverride?.wage ?? assumptions.relayWageWeight,
  };

  const maxWage = Math.max(...jobs.map((j) => j.wagePerPersonDay), 500);

  // -------------------------------------------------------------
  // 1. BASELINE: Independent Hiring (No Chaining)
  // Each job independently picks nearest available crew at earliestStart
  // -------------------------------------------------------------
  const baselineAssignments = new Map<string, JobAssignment[]>();
  crews.forEach((c) => baselineAssignments.set(c.id, []));
  const unassignedJobsBaseline: { job: Job; reason: string }[] = [];

  // Sort jobs by earliestStart
  const baselineJobs = [...jobs].sort((a, b) => a.earliestStart.localeCompare(b.earliestStart));
  const crewBusyUntilBaseline = new Map<string, string>(); // crewId -> available Date

  for (const job of baselineJobs) {
    const farm = farmMap.get(job.farmId);
    if (!farm) continue;

    let bestCrew: Crew | null = null;
    let minDistance = Infinity;

    for (const crew of crews) {
      if (crew.size < job.crewSizeMin) continue;

      const busyUntil = crewBusyUntilBaseline.get(crew.id) || crew.availableFrom;
      const farmVillageId = farm.villageId;
      const dist = getDistanceBetweenVillages(crew.homeVillageId, farmVillageId, villageMap);
      if (dist > crew.maxTravelKm) continue;

      const travelDays = getTravelDays(dist, assumptions.relayMaxFreeTravelKm);
      const readyDate = addDaysIso(busyUntil, travelDays);
      // Independent hiring picks strictly at preferred start date (earliestStart)
      if (readyDate <= job.earliestStart) {
        const startCandidate = job.earliestStart;
        const endCandidate = addDaysIso(startCandidate, job.durationDays - 1);
        if (endCandidate <= crew.availableTo) {
          if (dist < minDistance) {
            minDistance = dist;
            bestCrew = crew;
          }
        }
      }
    }

    if (bestCrew) {
      const busyUntil = crewBusyUntilBaseline.get(bestCrew.id) || bestCrew.availableFrom;
      const farmVillageId = farm.villageId;
      const dist = getDistanceBetweenVillages(bestCrew.homeVillageId, farmVillageId, villageMap);
      const travelDays = getTravelDays(dist, assumptions.relayMaxFreeTravelKm);
      const startDay = job.earliestStart;
      const endDay = addDaysIso(startDay, job.durationDays - 1);

      crewBusyUntilBaseline.set(bestCrew.id, addDaysIso(endDay, 1));
      baselineAssignments.get(bestCrew.id)!.push({
        jobId: job.id,
        crewId: bestCrew.id,
        startDay,
        endDay,
        travelDays,
        travelDistanceKm: dist,
        shiftDaysSuggested: 0,
        urgencyScore: 0,
      });
    } else {
      unassignedJobsBaseline.push({
        job: job,
        reason: 'No crew available within travel range for preferred window',
      });
    }
  }

  // -------------------------------------------------------------
  // 2. RELAY SCHEDULER: Greedy Chaining with Gap Filler & Suggestions
  // -------------------------------------------------------------
  const relayAssignments = new Map<string, JobAssignment[]>();
  crews.forEach((c) => relayAssignments.set(c.id, []));
  const assignedJobIdsRelay = new Set<string>();
  const shiftSuggestions: {
    jobId: string;
    crewId: string;
    farmerName: string;
    suggestedShiftDays: number;
    explanation: string;
  }[] = [];

  // Sort crews by size descending
  const sortedCrews = [...crews].sort((a, b) => b.size - a.size);

  for (const crew of sortedCrews) {
    let t = crew.availableFrom;
    let locVillageId = crew.homeVillageId;
    let idleStreak = 0;

    while (t <= crew.availableTo) {
      // Find feasible unassigned jobs
      const feasible: {
        job: Job;
        startDay: string;
        travelDays: number;
        distKm: number;
        score: number;
        gapDays: number;
        urgency: number;
      }[] = [];

      for (const job of jobs) {
        if (assignedJobIdsRelay.has(job.id)) continue;
        if (crew.size < job.crewSizeMin) continue;

        const farm = farmMap.get(job.farmId);
        if (!farm) continue;

        const distFromLoc = getDistanceBetweenVillages(locVillageId, farm.villageId, villageMap);
        const distFromHome = getDistanceBetweenVillages(crew.homeVillageId, farm.villageId, villageMap);
        const dist = distFromLoc <= crew.maxTravelKm ? distFromLoc : distFromHome;
        if (dist > crew.maxTravelKm) continue;

        const travelDays = getTravelDays(dist, assumptions.relayMaxFreeTravelKm);
        const earliestReady = addDaysIso(t, travelDays);
        const s = earliestReady > job.earliestStart ? earliestReady : job.earliestStart;

        if (s <= job.latestStart) {
          const endDay = addDaysIso(s, job.durationDays - 1);
          if (endDay <= crew.availableTo) {
            // Gap days
            const gapDays = diffDaysIso(t, s);
            const horizonDays = Math.max(1, diffDaysIso(s, job.latestStart));
            const urgency = Math.max(0, Math.min(1, 1 - (diffDaysIso(s, job.latestStart) / 14)));
            const gapScore = Math.max(0, 1 - gapDays / 5);
            const distScore = Math.max(0, 1 - dist / crew.maxTravelKm);
            const wageNorm = job.wagePerPersonDay / maxWage;

            const score =
              weights.urgency * urgency +
              weights.gap * gapScore +
              weights.distance * distScore +
              weights.wage * wageNorm;

            feasible.push({
              job,
              startDay: s,
              travelDays,
              distKm: dist,
              score,
              gapDays,
              urgency,
            });
          }
        }
      }

      if (feasible.length === 0) {
        // Find next earliest start date of unassigned jobs reachable from home or current loc
        let nextJobDate: string | null = null;
        for (const job of jobs) {
          if (assignedJobIdsRelay.has(job.id)) continue;
          if (crew.size < job.crewSizeMin) continue;
          const farm = farmMap.get(job.farmId);
          if (!farm) continue;
          const distHome = getDistanceBetweenVillages(crew.homeVillageId, farm.villageId, villageMap);
          if (distHome <= crew.maxTravelKm && job.latestStart >= t) {
            const candidateDate = job.earliestStart > t ? job.earliestStart : t;
            if (!nextJobDate || candidateDate < nextJobDate) {
              nextJobDate = candidateDate;
            }
          }
        }

        if (nextJobDate && nextJobDate <= crew.availableTo && nextJobDate > t) {
          t = nextJobDate;
          locVillageId = crew.homeVillageId; // Return home during long wait
        } else {
          t = addDaysIso(t, 1);
        }
        idleStreak++;
        if (idleStreak > 30) {
          break;
        }
      } else {
        // Pick best feasible job
        feasible.sort((a, b) => b.score - a.score);
        const pick = feasible[0];
        const endDay = addDaysIso(pick.startDay, pick.job.durationDays - 1);
        const farm = farmMap.get(pick.job.farmId);

        let shiftDaysSuggested = 0;
        if (pick.startDay > pick.job.earliestStart) {
          shiftDaysSuggested = diffDaysIso(pick.job.earliestStart, pick.startDay);
          shiftSuggestions.push({
            jobId: pick.job.id,
            crewId: crew.id,
            farmerName: farm?.ownerName || 'Farmer',
            suggestedShiftDays: shiftDaysSuggested,
            explanation: `Start on ${pick.startDay} (+${shiftDaysSuggested}d) lets ${crew.name} chain immediately without relocation.`,
          });
        }

        relayAssignments.get(crew.id)!.push({
          jobId: pick.job.id,
          crewId: crew.id,
          startDay: pick.startDay,
          endDay,
          travelDays: pick.travelDays,
          travelDistanceKm: pick.distKm,
          shiftDaysSuggested,
          urgencyScore: pick.urgency,
        });

        assignedJobIdsRelay.add(pick.job.id);
        t = addDaysIso(endDay, 1);
        if (farm) locVillageId = farm.villageId;
        idleStreak = 0;
      }
    }
  }

  // -------------------------------------------------------------
  // Gap-Filler Pass: find ALL idle gaps (start, interior, end) and insert unassigned jobs
  // -------------------------------------------------------------
  for (const crew of sortedCrews) {
    const assignments = relayAssignments.get(crew.id)!;
    // Collect all idle intervals: [startDay, endDay]
    // 1. Initial idle before first job
    const freeIntervals: { start: string; end: string }[] = [];
    if (assignments.length === 0) {
      freeIntervals.push({ start: crew.availableFrom, end: crew.availableTo });
    } else {
      assignments.sort((a, b) => a.startDay.localeCompare(b.startDay));
      if (assignments[0].startDay > crew.availableFrom) {
        freeIntervals.push({
          start: crew.availableFrom,
          end: addDaysIso(assignments[0].startDay, -1),
        });
      }
      for (let i = 0; i < assignments.length - 1; i++) {
        const curEnd = assignments[i].endDay;
        const nextStart = assignments[i + 1].startDay;
        if (nextStart > addDaysIso(curEnd, 1)) {
          freeIntervals.push({
            start: addDaysIso(curEnd, 1),
            end: addDaysIso(nextStart, -1),
          });
        }
      }
      const lastEnd = assignments[assignments.length - 1].endDay;
      if (lastEnd < crew.availableTo) {
        freeIntervals.push({
          start: addDaysIso(lastEnd, 1),
          end: crew.availableTo,
        });
      }
    }

    for (const interval of freeIntervals) {
      for (const job of jobs) {
        if (assignedJobIdsRelay.has(job.id)) continue;
        if (crew.size < job.crewSizeMin) continue;

        const farm = farmMap.get(job.farmId);
        if (!farm) continue;

        const dist = getDistanceBetweenVillages(crew.homeVillageId, farm.villageId, villageMap);
        if (dist > crew.maxTravelKm) continue;

        const s = job.earliestStart > interval.start ? job.earliestStart : interval.start;
        const endCandidate = addDaysIso(s, job.durationDays - 1);

        if (s <= job.latestStart && endCandidate <= interval.end) {
          assignments.push({
            jobId: job.id,
            crewId: crew.id,
            startDay: s,
            endDay: endCandidate,
            travelDays: getTravelDays(dist, assumptions.relayMaxFreeTravelKm),
            travelDistanceKm: dist,
            shiftDaysSuggested: s > job.earliestStart ? diffDaysIso(job.earliestStart, s) : 0,
            urgencyScore: 1,
          });
          assignedJobIdsRelay.add(job.id);
          assignments.sort((a, b) => a.startDay.localeCompare(b.startDay));
          break;
        }
      }
    }
  }

  // Unassigned jobs Relay
  const unassignedJobsRelay: { job: Job; reason: string }[] = [];
  for (const job of jobs) {
    if (!assignedJobIdsRelay.has(job.id)) {
      const farm = farmMap.get(job.farmId);
      const nearCrews = crews.filter(
        (c) => getDistanceBetweenVillages(c.homeVillageId, farm?.villageId || '', villageMap) <= c.maxTravelKm
      );
      if (nearCrews.length === 0) {
        unassignedJobsRelay.push({ job, reason: 'No crew with base within max travel km' });
      } else {
        unassignedJobsRelay.push({ job, reason: 'Schedules fully booked during harvest window' });
      }
    }
  }

  // -------------------------------------------------------------
  // Construct Full Crew Schedules & Timeline
  // -------------------------------------------------------------
  const relaySchedules: Record<string, CrewSchedule> = {};
  for (const crew of crews) {
    const list = relayAssignments.get(crew.id) || [];
    const timeline = buildCrewDayTimeline(crew, list, jobMap, farmMap, villageMap);
    const workDays = timeline.filter((d) => d.type === 'work').length;
    const travelDays = timeline.filter((d) => d.type === 'travel').length;
    const idleDays = timeline.filter((d) => d.type === 'idle').length;
    const travelKm = list.reduce((sum, a) => sum + a.travelDistanceKm, 0);
    const streak = calculateLongestStreak(timeline);

    relaySchedules[crew.id] = {
      crewId: crew.id,
      crew,
      assignments: list,
      dayTimeline: timeline,
      totalWorkDays: workDays,
      totalTravelDays: travelDays,
      totalIdleDays: idleDays,
      totalTravelKm: travelKm,
      longestStreakDays: streak,
      totalPersonDays: workDays * crew.size,
    };
  }

  const baselineSchedules: Record<string, CrewSchedule> = {};
  for (const crew of crews) {
    const list = baselineAssignments.get(crew.id) || [];
    const timeline = buildCrewDayTimeline(crew, list, jobMap, farmMap, villageMap);
    const workDays = timeline.filter((d) => d.type === 'work').length;
    const travelDays = timeline.filter((d) => d.type === 'travel').length;
    const idleDays = timeline.filter((d) => d.type === 'idle').length;
    const travelKm = list.reduce((sum, a) => sum + a.travelDistanceKm, 0);
    const streak = calculateLongestStreak(timeline);

    baselineSchedules[crew.id] = {
      crewId: crew.id,
      crew,
      assignments: list,
      dayTimeline: timeline,
      totalWorkDays: workDays,
      totalTravelDays: travelDays,
      totalIdleDays: idleDays,
      totalTravelKm: travelKm,
      longestStreakDays: streak,
      totalPersonDays: workDays * crew.size,
    };
  }

  const relayMetrics = computeMetrics(Object.values(relaySchedules), jobs, farmMap);
  const baselineMetrics = computeMetrics(Object.values(baselineSchedules), jobs, farmMap);

  return {
    relaySchedules,
    baselineSchedules,
    relayMetrics,
    baselineMetrics,
    unassignedJobsRelay,
    unassignedJobsBaseline,
    shiftSuggestions,
  };
}
