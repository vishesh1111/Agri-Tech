import React, { useState, useMemo } from 'react';
import { useStore, useTranslation } from '../../store/useStore';
import { solveCrewRelay, CrewSchedule, JobAssignment } from '../../lib/engines/relay';
import { SchematicMap } from '../../components/SchematicMap';
import { AssumptionBadge } from '../../components/AssumptionBadge';
import { formatDateShort, formatINR, diffDaysIso, addDaysIso, SIMULATED_TODAY } from '../../lib/dates';
import {
  Workflow,
  Sliders,
  Calendar,
  AlertCircle,
  Briefcase,
  Compass,
  CheckCircle2,
  XCircle,
  ArrowRight,
  TrendingUp,
  Clock,
  MapPin,
  HelpCircle,
} from 'lucide-react';

export const RelayScreen: React.FC = () => {
  const {
    crews,
    jobs,
    farms,
    villages,
    assumptions,
    selectedCrewId,
    setSelectedCrewId,
  } = useStore();
  const t = useTranslation();

  // Mode: Relay vs Baseline
  const [scheduleMode, setScheduleMode] = useState<'relay' | 'baseline'>('relay');

  // Weight sliders for greedy score optimization
  const [urgencyWeight, setUrgencyWeight] = useState(assumptions.relayUrgencyWeight);
  const [gapWeight, setGapWeight] = useState(assumptions.relayGapWeight);
  const [distWeight, setDistWeight] = useState(assumptions.relayDistanceWeight);
  const [wageWeight, setWageWeight] = useState(assumptions.relayWageWeight);

  // Run Relay Engine
  const relayResult = useMemo(() => {
    return solveCrewRelay(
      crews,
      jobs,
      farms,
      villages,
      assumptions,
      {
        urgency: urgencyWeight,
        gap: gapWeight,
        distance: distWeight,
        wage: wageWeight,
      }
    );
  }, [crews, jobs, farms, villages, assumptions, urgencyWeight, gapWeight, distWeight, wageWeight]);

  const activeSchedules =
    scheduleMode === 'relay' ? relayResult.relaySchedules : relayResult.baselineSchedules;
  const activeMetrics =
    scheduleMode === 'relay' ? relayResult.relayMetrics : relayResult.baselineMetrics;
  const unassignedList =
    scheduleMode === 'relay' ? relayResult.unassignedJobsRelay : relayResult.unassignedJobsBaseline;

  // Selected crew for deep-dive and route polyline
  const currentCrewId = selectedCrewId || crews[0]?.id || 'crew-1';
  const selectedCrewSchedule = activeSchedules[currentCrewId];
  const selectedCrewObj = crews.find((c) => c.id === currentCrewId);

  // Extract route village IDs for schematic map
  const crewRouteVillageIds = useMemo(() => {
    if (!selectedCrewSchedule) return [];
    const farmMap = new Map(farms.map((f) => [f.id, f]));
    const jobMap = new Map(jobs.map((j) => [j.id, j]));
    const vIds = [selectedCrewSchedule.crew.homeVillageId];

    for (const a of selectedCrewSchedule.assignments) {
      const job = jobMap.get(a.jobId);
      const farm = job ? farmMap.get(job.farmId) : null;
      if (farm && !vIds.includes(farm.villageId)) {
        vIds.push(farm.villageId);
      }
    }
    return vIds;
  }, [selectedCrewSchedule, farms, jobs]);

  // Distinct operations for color palette
  const opColor = (opName?: string) => {
    if (!opName) return 'bg-slate-200 text-slate-700';
    if (opName.includes('Paddy manual')) return 'bg-sky-600 text-white';
    if (opName.includes('post-harvest')) return 'bg-teal-600 text-white';
    if (opName.includes('Wheat')) return 'bg-amber-600 text-white';
    return 'bg-orange-600 text-white';
  };

  // Day columns (28 days starting from today)
  const timelineDates = useMemo(() => {
    const list: string[] = [];
    for (let i = 0; i < 28; i++) {
      list.push(addDaysIso(SIMULATED_TODAY, i));
    }
    return list;
  }, []);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-100 text-brand-800 border border-brand-200">
                Engine 2 • Continuity
              </span>
              <AssumptionBadge assumptionKey="relayMaxIdleDays" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
              {t.relay.title}
            </h1>
          </div>

          {/* Baseline vs Relay Switcher */}
          <div className="inline-flex rounded-xl p-1 bg-slate-100 border border-slate-200">
            <button
              type="button"
              onClick={() => setScheduleMode('baseline')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all min-h-[38px] ${
                scheduleMode === 'baseline'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t.relay.baselineLabel}
            </button>
            <button
              type="button"
              onClick={() => setScheduleMode('relay')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all min-h-[38px] ${
                scheduleMode === 'relay'
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t.relay.relayLabel}
            </button>
          </div>
        </div>

        <p className="text-sm text-slate-600 leading-relaxed">
          {t.relay.subtitle}
        </p>
      </div>

      {/* Side-by-Side KPI Comparison Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {/* Coverage */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">{t.relay.kpiJobCoverage}</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-brand-700">
              {Math.round(activeMetrics.jobCoveragePct)}%
            </span>
            {scheduleMode === 'relay' && (
              <span className="text-xs text-slate-400 line-through">
                {Math.round(relayResult.baselineMetrics.jobCoveragePct)}%
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {jobs.length - unassignedList.length} of {jobs.length} jobs allocated
          </p>
        </div>

        {/* Longest Work Streak */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">{t.relay.kpiMaxStreak}</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-brand-700">
              {activeMetrics.maxStreakDays}d
            </span>
            {scheduleMode === 'relay' && (
              <span className="text-xs text-slate-400 line-through">
                {relayResult.baselineMetrics.maxStreakDays}d
              </span>
            )}
          </div>
          <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">
            Continuous local paid work
          </p>
        </div>

        {/* Total Person Days */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">{t.relay.kpiPersonDays}</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-brand-700">
              {activeMetrics.totalPersonDaysEmployed}
            </span>
            {scheduleMode === 'relay' && (
              <span className="text-xs text-slate-400 line-through">
                {relayResult.baselineMetrics.totalPersonDaysEmployed}
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Avg {Math.round(activeMetrics.avgPaidDaysPerWorker)} days/worker
          </p>
        </div>

        {/* Total Travel Km */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">{t.relay.kpiTravelKm}</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-brand-700">
              {Math.round(activeMetrics.totalTravelKm)} km
            </span>
            {scheduleMode === 'relay' && (
              <span className="text-xs text-slate-400 line-through">
                {Math.round(relayResult.baselineMetrics.totalTravelKm)} km
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Across 12 village crews
          </p>
        </div>
      </div>

      {/* Main Gantt Timeline View */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-bold text-slate-900 text-sm sm:text-base">
              {t.relay.timelineTitle}
            </h2>
            <p className="text-xs text-slate-500">
              Rows = 12 Crews, Columns = 28 Days. Click any crew to visualize route polyline on schematic map.
            </p>
          </div>

          {/* Operation Legend */}
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-3 h-3 rounded bg-sky-600 inline-block" />
              Paddy Harvest
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-3 h-3 rounded bg-teal-600 inline-block" />
              Post-Harvest
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-3 h-3 rounded bg-amber-600 inline-block" />
              Wheat Sowing
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-3 h-3 rounded pattern-hatch-travel inline-block" />
              Relocation Day
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-3 h-3 rounded bg-slate-200 inline-block" />
              Idle Day
            </span>
          </div>
        </div>

        {/* Scrollable Gantt Chart Table */}
        <div className="overflow-x-auto border border-slate-200 rounded-lg">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-2 text-left font-bold text-slate-700 min-w-[150px] sticky left-0 bg-slate-50 z-10">
                  Labour Crew
                </th>
                {timelineDates.map((d) => (
                  <th key={d} className="p-1.5 text-center font-semibold text-slate-600 min-w-[34px]">
                    {formatDateShort(d).split(' ')[0]}
                    <div className="text-[10px] text-slate-400 font-normal">
                      {formatDateShort(d).split(' ')[1]}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {crews.map((crew) => {
                const schedule = activeSchedules[crew.id];
                const isSelected = crew.id === currentCrewId;
                const timelineMap = new Map(schedule?.dayTimeline.map((d) => [d.date, d]));

                return (
                  <tr
                    key={crew.id}
                    onClick={() => setSelectedCrewId(crew.id)}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? 'bg-brand-50/70 font-semibold' : 'hover:bg-slate-50'
                    }`}
                  >
                    {/* Crew Name Sticky Header */}
                    <td className={`p-2 sticky left-0 z-10 border-r border-slate-200 ${
                      isSelected ? 'bg-brand-100 text-brand-900 font-bold' : 'bg-white text-slate-900'
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className="truncate max-w-[120px]">{crew.name}</span>
                        <span className="text-[10px] text-slate-500 font-normal">({crew.size}p)</span>
                      </div>
                    </td>

                    {/* 28 Day Cells */}
                    {timelineDates.map((date) => {
                      const day = timelineMap.get(date);
                      if (!day) {
                        return <td key={date} className="p-1 bg-slate-100/50" />;
                      }

                      if (day.type === 'work') {
                        return (
                          <td
                            key={date}
                            className="p-0.5"
                            title={`${day.date}: ${day.jobName} on Farm ${day.farmId} in ${day.villageName}`}
                          >
                            <div className={`h-7 rounded flex items-center justify-center font-bold text-[10px] shadow-xs ${opColor(day.jobName)}`}>
                              W
                            </div>
                          </td>
                        );
                      }

                      if (day.type === 'travel') {
                        return (
                          <td
                            key={date}
                            className="p-0.5"
                            title={`${day.date}: Travel ${day.travelKm} km to ${day.villageName}`}
                          >
                            <div className="h-7 rounded pattern-hatch-travel flex items-center justify-center text-[10px] font-bold text-slate-800 border border-slate-300">
                              T
                            </div>
                          </td>
                        );
                      }

                      // Idle
                      return (
                        <td key={date} className="p-0.5">
                          <div className="h-7 rounded bg-slate-100 flex items-center justify-center text-[10px] text-slate-400">
                            -
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Grid: Route Polyline Map & Work Passport & Weight Sliders */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Route Polyline Map */}
        <div className="lg:col-span-7 space-y-4">
          <SchematicMap
            selectedCrew={selectedCrewObj}
            crewRouteVillageIds={crewRouteVillageIds}
            className="w-full"
          />

          {/* Shift Suggestions Box */}
          {relayResult.shiftSuggestions.length > 0 && (
            <div className="bg-amber-50 rounded-xl p-4 border border-amber-200 space-y-2">
              <h3 className="font-bold text-amber-950 text-xs sm:text-sm flex items-center gap-2">
                <Compass className="w-4 h-4 text-amber-700" />
                {t.relay.shiftSuggestionsTitle} ({relayResult.shiftSuggestions.length} Opportunities)
              </h3>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 text-xs text-amber-900">
                {relayResult.shiftSuggestions.slice(0, 4).map((s, idx) => (
                  <div key={idx} className="p-2 bg-white/80 rounded-lg border border-amber-200">
                    <strong>{s.farmerName} ({s.jobId}):</strong> {s.explanation}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Work Passport Card & Weight Sliders */}
        <div className="lg:col-span-5 space-y-4">
          {/* Selected Crew Work Passport */}
          {selectedCrewSchedule && (
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div>
                  <span className="text-[10px] font-bold text-brand-600 uppercase tracking-wider">
                    Crew Work Passport
                  </span>
                  <h3 className="font-bold text-slate-900 text-base">
                    {selectedCrewSchedule.crew.name}
                  </h3>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-brand-50 text-brand-700 border border-brand-200">
                  {selectedCrewSchedule.crew.size} Members
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 bg-slate-50 rounded-lg">
                  <span className="text-slate-500">Continuous Streak</span>
                  <div className="text-lg font-bold text-brand-700">
                    {selectedCrewSchedule.longestStreakDays} days
                  </div>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg">
                  <span className="text-slate-500">Total Work Days</span>
                  <div className="text-lg font-bold text-slate-900">
                    {selectedCrewSchedule.totalWorkDays} days
                  </div>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg">
                  <span className="text-slate-500">Idle Days Remaining</span>
                  <div className="text-lg font-bold text-amber-600">
                    {selectedCrewSchedule.totalIdleDays} days
                  </div>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg">
                  <span className="text-slate-500">Travel Distance</span>
                  <div className="text-lg font-bold text-slate-900">
                    {Math.round(selectedCrewSchedule.totalTravelKm)} km
                  </div>
                </div>
              </div>

              <div>
                <span className="text-xs font-semibold text-slate-700 block mb-1">
                  Chained Farm Assignments ({selectedCrewSchedule.assignments.length})
                </span>
                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {selectedCrewSchedule.assignments.map((a, i) => (
                    <div
                      key={i}
                      className="p-2 rounded bg-slate-50 text-xs text-slate-700 flex items-center justify-between"
                    >
                      <span className="font-medium">
                        {a.jobId}: {formatDateShort(a.startDay)} - {formatDateShort(a.endDay)}
                      </span>
                      <span className="text-[11px] text-brand-600 font-semibold">
                        {a.travelDistanceKm} km
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Weight Optimization Sliders */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Sliders className="w-4 h-4 text-brand-600" />
                Scheduler Priority Weights
              </h3>
              <AssumptionBadge assumptionKey="relayUrgencyWeight" />
            </div>

            <div className="space-y-2.5 text-xs">
              <div>
                <div className="flex justify-between font-semibold text-slate-700 mb-1">
                  <span>{t.relay.weightUrgency}</span>
                  <span>{urgencyWeight.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="0.8"
                  step="0.05"
                  value={urgencyWeight}
                  onChange={(e) => setUrgencyWeight(parseFloat(e.target.value))}
                  className="w-full accent-brand-600"
                />
              </div>

              <div>
                <div className="flex justify-between font-semibold text-slate-700 mb-1">
                  <span>{t.relay.weightGap}</span>
                  <span>{gapWeight.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="0.8"
                  step="0.05"
                  value={gapWeight}
                  onChange={(e) => setGapWeight(parseFloat(e.target.value))}
                  className="w-full accent-brand-600"
                />
              </div>

              <div>
                <div className="flex justify-between font-semibold text-slate-700 mb-1">
                  <span>{t.relay.weightDistance}</span>
                  <span>{distWeight.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="0.8"
                  step="0.05"
                  value={distWeight}
                  onChange={(e) => setDistWeight(parseFloat(e.target.value))}
                  className="w-full accent-brand-600"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
