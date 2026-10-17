import React, { useState, useMemo } from 'react';
import { useStore, useTranslation } from '../../store/useStore';
import { solveMicroShifts, MicroShiftSlot } from '../../lib/engines/microshift';
import { AssumptionBadge } from '../../components/AssumptionBadge';
import { MICRO_TASKS } from '../../data/seed';
import { formatDateShort, formatINR, addDaysIso, SIMULATED_TODAY } from '../../lib/dates';
import {
  Split,
  ShieldCheck,
  Flame,
  Clock,
  Users,
  AlertTriangle,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  CheckCircle2,
  Share2,
  DollarSign,
  Briefcase,
  FileText,
} from 'lucide-react';

export const MicroshiftScreen: React.FC = () => {
  const {
    workers,
    microProfiles,
    villages,
    forecast,
    assumptions,
    lang,
  } = useStore();
  const t = useTranslation();

  // Wizard step state (1 to 5)
  const [step, setStep] = useState<number>(1);

  // Wizard form inputs
  const [operation, setOperation] = useState('Paddy post-harvest handling');
  const [acres, setAcres] = useState<number>(3.5);
  const [startDate, setStartDate] = useState(addDaysIso(SIMULATED_TODAY, 4));
  const [deadlineDate, setDeadlineDate] = useState(addDaysIso(SIMULATED_TODAY, 7));
  const [dailyWage, setDailyWage] = useState<number>(440);
  const [selectedVillageId, setSelectedVillageId] = useState('v-1');

  // Run Microshift Engine
  const roster = useMemo(() => {
    return solveMicroShifts(
      operation,
      acres,
      startDate,
      deadlineDate,
      MICRO_TASKS,
      workers,
      microProfiles,
      villages,
      selectedVillageId,
      dailyWage,
      forecast,
      assumptions
    );
  }, [operation, acres, startDate, deadlineDate, workers, microProfiles, villages, selectedVillageId, dailyWage, forecast, assumptions]);

  // Distinct tasks in operation
  const operationTasks = useMemo(() => {
    return MICRO_TASKS.filter((t) => t.operation === operation);
  }, [operation]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-100 text-brand-800 border border-brand-200">
                Engine 4 • Untapped Labour
              </span>
              <AssumptionBadge assumptionKey="microShiftPremiumRate" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
              {t.microshift.title}
            </h1>
          </div>

          {/* Stepper Navigation */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStep(s)}
                className={`w-7 h-7 rounded-lg text-xs font-bold transition-all flex items-center justify-center ${
                  step === s
                    ? 'bg-brand-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <p className="text-sm text-slate-600 leading-relaxed">
          {t.microshift.subtitle}
        </p>
      </div>

      {/* Prominent Decent Work & Climate Safeguards Strip */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-emerald-950 text-xs sm:text-sm flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>{t.microshift.safeguardsTitle}</span>
          </h2>
          <span className="text-[11px] font-bold text-emerald-800 bg-emerald-200/60 px-2 py-0.5 rounded-full">
            Zero Violations Verified
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs text-emerald-900">
          <div className="flex items-center gap-1.5 p-1.5 bg-white/70 rounded">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>{t.microshift.safeguardAdults}</span>
          </div>
          <div className="flex items-center gap-1.5 p-1.5 bg-white/70 rounded">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>{t.microshift.safeguardHazard}</span>
          </div>
          <div className="flex items-center gap-1.5 p-1.5 bg-white/70 rounded">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>{t.microshift.safeguardHeat}</span>
          </div>
          <div className="flex items-center gap-1.5 p-1.5 bg-white/70 rounded">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>{t.microshift.safeguardHours}</span>
          </div>
          <div className="flex items-center gap-1.5 p-1.5 bg-white/70 rounded">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>{t.microshift.safeguardNight}</span>
          </div>
          <div className="flex items-center gap-1.5 p-1.5 bg-white/70 rounded font-semibold text-emerald-950">
            <DollarSign className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>{formatINR(roster.slots[0]?.slotPay || 165)} per 3h slot (+10% premium)</span>
          </div>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">{t.microshift.kpiMicroPct}</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-brand-700 mt-1">
            {roster.microShiftPct}%
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {roster.microShiftableHours} of {roster.totalPersonHours} hrs micro-shiftable
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">{t.microshift.kpiWorkersFreed}</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-700 mt-1">
            {roster.fullDayWorkersFreed} workers
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Scarce heavy crew focused on cutting
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">{t.microshift.kpiPeopleActivated}</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-brand-700 mt-1">
            {roster.activatedPeopleCount} adults
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Local adults engaged on 3h slots
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">{t.microshift.kpiCoverage}</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-brand-700 mt-1">
            {roster.slotCoveragePct}%
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Scarcity-first greedy allocation
          </p>
        </div>
      </div>

      {/* Wizard Step 1: Operation & Plot Details */}
      {step === 1 && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-xs">
          <h2 className="font-bold text-slate-900 text-sm sm:text-base border-b border-slate-100 pb-2">
            {t.microshift.wizardStep1}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Crop Operation
              </label>
              <select
                value={operation}
                onChange={(e) => setOperation(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 font-medium bg-white"
              >
                <option>Paddy post-harvest handling</option>
                <option>Paddy manual harvest</option>
                <option>Wheat land prep and sowing</option>
                <option>Mustard sowing and thinning</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Plot Size (Acres)
              </label>
              <input
                type="number"
                step="0.5"
                min="1"
                max="10"
                value={acres}
                onChange={(e) => setAcres(parseFloat(e.target.value || '1'))}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 font-bold text-brand-700"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Harvest Deadline Date
              </label>
              <input
                type="date"
                value={deadlineDate}
                onChange={(e) => setDeadlineDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 font-medium"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-lg min-h-touch"
            >
              <span>{t.common.next}: Task Catalog</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Wizard Step 2: Task Catalog Breakdown */}
      {step === 2 && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-xs">
          <h2 className="font-bold text-slate-900 text-sm sm:text-base border-b border-slate-100 pb-2">
            {t.microshift.wizardStep2}
          </h2>

          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3">Task Name</th>
                  <th className="p-3">Load Category</th>
                  <th className="p-3">Skill Level</th>
                  <th className="p-3">Hazard Restricted?</th>
                  <th className="p-3">Workload Share</th>
                  <th className="p-3">Classification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {operationTasks.map((task) => {
                  const isCore = task.load === 3 || task.hazard || task.skillLevel === 2;
                  return (
                    <tr key={task.id} className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-slate-900">{task.name}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                          task.load === 3 ? 'bg-orange-100 text-orange-900' : task.load === 2 ? 'bg-amber-100 text-amber-900' : 'bg-sky-100 text-sky-900'
                        }`}>
                          Load {task.load} ({task.load === 3 ? 'Heavy' : task.load === 2 ? 'Medium' : 'Light'})
                        </span>
                      </td>
                      <td className="p-3">Skill {task.skillLevel}</td>
                      <td className="p-3">
                        {task.hazard ? (
                          <span className="font-bold text-red-600 flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            Yes (Certified Only)
                          </span>
                        ) : (
                          <span className="text-slate-400">No</span>
                        )}
                      </td>
                      <td className="p-3 font-bold">{(task.workShare * 100).toFixed(0)}%</td>
                      <td className="p-3">
                        {isCore ? (
                          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-200 text-slate-800">
                            Core Crew
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                            Micro-Shiftable
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center pt-2">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex items-center gap-1 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg min-h-touch"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>{t.common.back}</span>
            </button>
            <button
              type="button"
              onClick={() => setStep(3)}
              className="flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-lg min-h-touch"
            >
              <span>{t.common.next}: Slot Grid</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Wizard Step 3 & 4: Slot Grid & Allocation */}
      {(step === 3 || step === 4) && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
            <div>
              <h2 className="font-bold text-slate-900 text-sm sm:text-base">
                {step === 3 ? t.microshift.wizardStep3 : t.microshift.wizardStep4}
              </h2>
              <p className="text-xs text-slate-500">
                3-hour day parts: Early (06:00-09:00), Late-Morning (09:00-12:00), Evening (15:30-18:30). Midday dropped for heat safety.
              </p>
            </div>
            <span className="text-xs bg-brand-50 text-brand-700 font-semibold px-2.5 py-1 rounded-full border border-brand-200">
              {roster.slots.length} Total Micro-Slots Generated
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {roster.slots.slice(0, 12).map((slot) => {
              const filled = slot.assignedWorkerIds.length >= slot.headcountNeeded;
              return (
                <div
                  key={slot.id}
                  className={`p-3 rounded-xl border transition-all ${
                    filled
                      ? 'bg-slate-50/70 border-slate-200'
                      : 'bg-amber-50/70 border-amber-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-1">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        {formatDateShort(slot.date)} • {slot.startTime}-{slot.endTime}
                      </span>
                      <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                        {slot.taskName}
                      </h4>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        slot.isCore ? 'bg-slate-200 text-slate-800' : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {slot.isCore ? 'Core' : 'Micro'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs mt-2 pt-2 border-t border-slate-200/60">
                    <span className="text-slate-600">
                      Headcount: <strong>{slot.assignedWorkerIds.length}</strong> / {slot.headcountNeeded}
                    </span>
                    <span className="font-bold text-emerald-700">
                      {formatINR(slot.slotPay)} (3h)
                    </span>
                  </div>

                  {slot.eligibleWorkerIds.length > 0 && (
                    <div className="text-[11px] text-slate-500 mt-1">
                      {slot.eligibleWorkerIds.length} eligible in radius • Reliability: {Math.round(slot.slotConfidence * 100)}%
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex justify-between items-center pt-2">
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="flex items-center gap-1 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg min-h-touch"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>{t.common.back}</span>
            </button>
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-lg min-h-touch"
            >
              <span>{t.common.next}: Payout & Roster</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Wizard Step 5: Payout Summary & WhatsApp Roster */}
      {step === 5 && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
            <div>
              <h2 className="font-bold text-slate-900 text-sm sm:text-base">
                {t.microshift.wizardStep5}
              </h2>
              <p className="text-xs text-slate-500">
                Transparent earnings per worker compliant with state minimum wage ({formatINR(assumptions.minimumDailyWage)}/day baseline).
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                const text = `KhetiCrew Micro-Shift Roster for ${acres}ac ${operation}: ${roster.activatedPeopleCount} local workers assigned across ${roster.slots.length} slots. Total payout: ₹${Object.values(roster.workerAssignments).reduce((sum, w) => sum + w.totalPay, 0)}`;
                window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold min-h-[38px]"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share Roster on WhatsApp</span>
            </button>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3">Worker Name</th>
                  <th className="p-3">Slots Assigned</th>
                  <th className="p-3">Total Hours</th>
                  <th className="p-3">Effective Hourly Rate</th>
                  <th className="p-3 text-right">Total Payout (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {Object.values(roster.workerAssignments).slice(0, 10).map((wa) => (
                  <tr key={wa.worker.id} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-900">
                      {wa.worker.name}
                      <div className="text-[11px] text-slate-400 font-normal">
                        Village {wa.worker.villageId}
                      </div>
                    </td>
                    <td className="p-3">{wa.slots.length} slots</td>
                    <td className="p-3">{wa.totalHours} hrs</td>
                    <td className="p-3">{formatINR(wa.slots[0]?.hourlyPayRate || 55)}/hr</td>
                    <td className="p-3 text-right font-extrabold text-emerald-700">
                      {formatINR(wa.totalPay)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center pt-2">
            <button
              type="button"
              onClick={() => setStep(4)}
              className="flex items-center gap-1 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg min-h-touch"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>{t.common.back}</span>
            </button>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-lg min-h-touch"
            >
              <span>Start New Micro-Shift Roster</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
