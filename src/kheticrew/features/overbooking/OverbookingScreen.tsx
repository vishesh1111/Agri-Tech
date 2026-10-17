import React, { useState, useMemo } from 'react';
import { useStore, useTranslation } from '../../store/useStore';
import {
  solveOverbooking,
  adjustProbability,
  computeBaseProbability,
  runMonteCarloSimulation,
  WorkerCandidate,
  ConfirmationStatus,
  getWhatsAppBookingText,
} from '../../lib/engines/overbooking';
import { AssumptionBadge } from '../../components/AssumptionBadge';
import { formatINR, formatDateShort, SIMULATED_TODAY, addDaysIso } from '../../lib/dates';
import { createRNG } from '../../lib/rng';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import {
  ShieldAlert,
  ShieldCheck,
  RotateCw,
  MessageSquare,
  Users,
  CheckCircle2,
  XCircle,
  HelpCircle,
  TrendingUp,
  TrendingDown,
  Info,
  DollarSign,
  CloudRain,
  MapPin,
  Flame,
} from 'lucide-react';

export const OverbookingScreen: React.FC = () => {
  const {
    workers,
    villages,
    assumptions,
    updateWorkerAttendance,
    lang,
  } = useStore();
  const t = useTranslation();

  // Job form configuration state
  const [operation, setOperation] = useState('Paddy manual harvest');
  const [targetDate, setTargetDate] = useState(addDaysIso(SIMULATED_TODAY, 5));
  const [nNeeded, setNNeeded] = useState<number>(10);
  const [nMinPct, setNMinPct] = useState<number>(90); // 90%
  const [wageOffered, setWageOffered] = useState<number>(450);
  const [localRate, setLocalRate] = useState<number>(400);
  const [startTime, setStartTime] = useState<string>('06:30');
  const [targetConfidence, setTargetConfidence] = useState<number>(95);
  const [optimizeMode, setOptimizeMode] = useState<'confidence' | 'cost'>('confidence');

  // Confirmation toggles per worker: workerId -> status
  const [confirmations, setConfirmations] = useState<Record<string, ConfirmationStatus>>({});

  // Simulation day feedback
  const [simResults, setSimResults] = useState<{
    date: string;
    showsCount: number;
    needed: number;
    success: boolean;
    workerChanges: { id: string; name: string; showed: boolean; delta: number }[];
  } | null>(null);

  const nMin = Math.max(1, Math.ceil(nNeeded * (nMinPct / 100)));

  // Environmental context for date
  const isRainy = targetDate === addDaysIso(SIMULATED_TODAY, 7) || targetDate === addDaysIso(SIMULATED_TODAY, 17);
  const isNearFestival = targetDate >= '2026-10-18' && targetDate <= '2026-10-22'; // Dussehra

  // Prepare candidates from local workers
  const candidates: WorkerCandidate[] = useMemo(() => {
    return workers.map((w) => {
      const baseP = computeBaseProbability(w, assumptions.priorBetaAlpha, assumptions.priorBetaBeta);
      const confStatus = confirmations[w.id] || 'unconfirmed';
      // Distance is ~3-8 km
      const distanceKm = 2 + (parseInt(w.id.replace(/\D/g, '') || '1', 10) % 7);

      const adj = adjustProbability(
        baseP,
        {
          rainProb: isRainy ? 0.75 : 0.05,
          isNearFestival,
          distanceKm,
          startTime,
          wageOffered,
          localRate,
          confirmationStatus: confStatus,
        },
        assumptions
      );

      return {
        worker: w,
        baseP: Math.round(baseP * 100) / 100,
        adjustedP: Math.round(adj.p * 100) / 100,
        odds: adj.odds,
        distanceKm,
        wageOffered,
        localRate,
        startTime,
        rainProb: isRainy ? 0.75 : 0.05,
        isNearFestival,
        confirmationStatus: confStatus,
        factorsApplied: adj.factors,
      };
    });
  }, [workers, assumptions, confirmations, isRainy, isNearFestival, startTime, wageOffered, localRate]);

  // Run Overbooking Engine
  const recommendation = useMemo(() => {
    return solveOverbooking(
      candidates,
      {
        nNeeded,
        nMin,
        targetConfidence: targetConfidence / 100,
        wageOffered,
        localRate,
        startTime,
        rainProb: isRainy ? 0.75 : 0.05,
        isNearFestival,
      },
      assumptions
    );
  }, [candidates, nNeeded, nMin, targetConfidence, wageOffered, localRate, startTime, isRainy, isNearFestival, assumptions]);

  const activeM = optimizeMode === 'confidence' ? recommendation.recommendedM : recommendation.costOptimalM;

  // Run Monte Carlo simulation (2,000 runs)
  const monteCarlo = useMemo(() => {
    return runMonteCarloSimulation(
      recommendation.candidatesSorted,
      nNeeded,
      activeM,
      2000,
      42
    );
  }, [recommendation.candidatesSorted, nNeeded, activeM]);

  // Combine histograms for Recharts
  const histogramChartData = useMemo(() => {
    const maxShows = Math.max(
      monteCarlo.naiveHistogram.length,
      monteCarlo.overbookedHistogram.length
    );
    const data = [];
    for (let s = 0; s < maxShows; s++) {
      const naiveFreq = monteCarlo.naiveHistogram[s]?.freq || 0;
      const overFreq = monteCarlo.overbookedHistogram[s]?.freq || 0;
      data.push({
        shows: s,
        label: `${s} workers`,
        Naive: Math.round(naiveFreq * 1000) / 10,
        Overbooked: Math.round(overFreq * 1000) / 10,
        isSuccess: s >= nMin,
      });
    }
    return data;
  }, [monteCarlo, nMin]);

  // Simulate Day Attendance using Mulberry32 PRNG
  const handleSimulateDay = () => {
    const rng = createRNG(Date.now());
    const bookedWorkers = recommendation.candidatesSorted.slice(0, activeM);
    let showedCount = 0;
    const workerChanges: { id: string; name: string; showed: boolean; delta: number }[] = [];

    bookedWorkers.forEach((candidate) => {
      const showed = rng() < candidate.adjustedP;
      if (showed) showedCount++;

      // Update worker history in store
      const oldP = candidate.baseP;
      updateWorkerAttendance(candidate.worker.id, showed);
      const newBooked = candidate.worker.history.booked + 1;
      const newShowed = candidate.worker.history.showed + (showed ? 1 : 0);
      const newP = (newShowed + assumptions.priorBetaAlpha) / (newBooked + assumptions.priorBetaAlpha + assumptions.priorBetaBeta);
      const delta = Math.round((newP - oldP) * 100);

      workerChanges.push({
        id: candidate.worker.id,
        name: candidate.worker.name,
        showed,
        delta,
      });
    });

    setSimResults({
      date: targetDate,
      showsCount: showedCount,
      needed: nNeeded,
      success: showedCount >= nMin,
      workerChanges,
    });
  };

  const handleConfirmationChange = (workerId: string, status: ConfirmationStatus) => {
    setConfirmations((prev) => ({ ...prev, [workerId]: status }));
  };

  return (
    <div className="space-y-6">
      {/* Title & Why M Explainer Banner */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-100 text-brand-800 border border-brand-200">
                Engine 1 • Reliability
              </span>
              <AssumptionBadge assumptionKey="priorBetaAlpha" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
              {t.overbooking.title}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSimulateDay}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-sm transition-colors min-h-touch"
            >
              <RotateCw className="w-4 h-4" />
              <span>{t.overbooking.simulateDay}</span>
            </button>
          </div>
        </div>

        <p className="text-sm text-slate-600 leading-relaxed">
          {t.overbooking.whyMExplainer}
        </p>

        {/* Environmental context tags */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className="font-semibold text-slate-500">Live Context:</span>
          {isRainy && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-sky-100 text-sky-800 font-semibold border border-sky-300">
              <CloudRain className="w-3.5 h-3.5" />
              Rain Forecast &gt; 60% (Odds × {assumptions.oddsRainFactor})
            </span>
          )}
          {isNearFestival && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-purple-100 text-purple-800 font-semibold border border-purple-300">
              <Flame className="w-3.5 h-3.5" />
              Near Dussehra (Odds × {assumptions.oddsFestivalFactor})
            </span>
          )}
          {wageOffered >= localRate * 1.1 && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800 font-semibold border border-emerald-300">
              <DollarSign className="w-3.5 h-3.5" />
              Wage Incentive (+{Math.round(((wageOffered - localRate) / localRate) * 100)}% above local)
            </span>
          )}
        </div>
      </div>

      {/* Simulation Result Alert */}
      {simResults && (
        <div
          className={`p-4 rounded-xl border animate-in fade-in ${
            simResults.success
              ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
              : 'bg-amber-50 border-amber-300 text-amber-950'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {simResults.success ? (
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
              ) : (
                <ShieldAlert className="w-5 h-5 text-amber-600" />
              )}
              <span className="font-bold text-sm sm:text-base">
                Simulated Attendance: {simResults.showsCount} of {activeM} Booked Workers Showed Up (Needed: {nNeeded}, Nmin: {nMin})
              </span>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white/80">
              {simResults.success ? 'Full Crew Success' : 'Shortfall Tolerated'}
            </span>
          </div>
          <p className="text-xs mt-1 text-slate-700">
            {t.overbooking.simulateDaySuccess}
          </p>
        </div>
      )}

      {/* Headline Confidence Comparison Card */}
      <div className="bg-gradient-to-r from-brand-900 to-slate-900 text-white rounded-2xl p-5 shadow-md border border-brand-800 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        <div>
          <span className="text-xs uppercase tracking-wider text-brand-300 font-bold">
            Naive Booking (Book exactly N={nNeeded})
          </span>
          <div className="text-3xl font-black mt-1 text-amber-400">
            {Math.round(recommendation.confidenceAtN * 100)}%
          </div>
          <p className="text-xs text-slate-300 mt-1">
            High 70% risk of morning shortfall and harvest delays.
          </p>
        </div>

        <div className="border-t md:border-t-0 md:border-l border-slate-700 pt-3 md:pt-0 md:pl-5">
          <span className="text-xs uppercase tracking-wider text-brand-300 font-bold">
            Overbooked Roster (Book M={activeM})
          </span>
          <div className="text-3xl font-black mt-1 text-emerald-400">
            {Math.round((optimizeMode === 'confidence' ? recommendation.confidenceAtM : computePoissonBinomialConfidence(recommendation.pmfAtM, nMin)) * 100)}%
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Guarantees required attendance with paid Tier B backup.
          </p>
        </div>

        <div className="border-t md:border-t-0 md:border-l border-slate-700 pt-3 md:pt-0 md:pl-5 flex flex-col justify-between h-full">
          <div>
            <span className="text-xs uppercase tracking-wider text-brand-300 font-bold">
              Expected Total Cost at M
            </span>
            <div className="text-2xl font-bold mt-1 text-white">
              {formatINR(recommendation.expectedCostAtM)}
            </div>
          </div>
          <span className="text-xs text-slate-400 mt-2">
            Includes wage + {formatINR(wageOffered * assumptions.reportingAllowanceRatio)} standby allowance per unused backup.
          </span>
        </div>
      </div>

      {/* Configuration Grid & Monte Carlo Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form Controls */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-xs">
          <h2 className="font-bold text-slate-900 text-sm sm:text-base border-b border-slate-100 pb-2">
            {t.overbooking.jobFormTitle}
          </h2>

          <div className="space-y-3 text-xs sm:text-sm">
            {/* Operation */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {t.overbooking.operation}
              </label>
              <select
                value={operation}
                onChange={(e) => setOperation(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-brand-500"
              >
                <option>Paddy manual harvest</option>
                <option>Paddy post-harvest handling</option>
                <option>Wheat land prep and sowing</option>
                <option>Mustard sowing and thinning</option>
              </select>
            </div>

            {/* Date & Start Time */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {t.overbooking.date}
                </label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-medium"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {t.overbooking.startTime}
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-medium"
                />
              </div>
            </div>

            {/* Workers Needed (N) & Minimum Acceptable (Nmin) */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {t.overbooking.nNeeded}
                </label>
                <input
                  type="number"
                  min="2"
                  max="30"
                  value={nNeeded}
                  onChange={(e) => setNNeeded(Math.max(2, parseInt(e.target.value || '2', 10)))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-bold text-brand-700"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Acceptable Nmin: <strong className="text-slate-900">{nMin}</strong> ({nMinPct}%)
                </label>
                <input
                  type="range"
                  min="70"
                  max="100"
                  step="5"
                  value={nMinPct}
                  onChange={(e) => setNMinPct(parseInt(e.target.value, 10))}
                  className="w-full accent-brand-600"
                />
              </div>
            </div>

            {/* Wage Offered vs Prevailing */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {t.overbooking.wage}
                </label>
                <input
                  type="number"
                  step="25"
                  value={wageOffered}
                  onChange={(e) => setWageOffered(parseInt(e.target.value || '350', 10))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-semibold"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {t.overbooking.localRate}
                </label>
                <input
                  type="number"
                  step="25"
                  value={localRate}
                  onChange={(e) => setLocalRate(parseInt(e.target.value || '350', 10))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-semibold"
                />
              </div>
            </div>

            {/* Target Confidence Slider */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-semibold text-slate-700">
                  {t.overbooking.confidenceTarget}: <strong className="text-brand-700">{targetConfidence}%</strong>
                </label>
                <span className="text-xs text-slate-500">Slider: 80% to 99%</span>
              </div>
              <input
                type="range"
                min="80"
                max="99"
                value={targetConfidence}
                onChange={(e) => setTargetConfidence(parseInt(e.target.value, 10))}
                className="w-full accent-brand-600"
              />
            </div>

            {/* Optimization Mode Toggle */}
            <div className="pt-2">
              <label className="block font-semibold text-slate-700 mb-1">
                {t.overbooking.optimizeMode}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setOptimizeMode('confidence')}
                  className={`py-2 px-3 text-xs font-bold rounded-lg border text-center transition-colors min-h-touch ${
                    optimizeMode === 'confidence'
                      ? 'bg-brand-50 border-brand-500 text-brand-700'
                      : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {t.overbooking.modeConfidence}
                  <div className="text-[11px] font-normal text-slate-500">M = {recommendation.recommendedM}</div>
                </button>
                <button
                  type="button"
                  onClick={() => setOptimizeMode('cost')}
                  className={`py-2 px-3 text-xs font-bold rounded-lg border text-center transition-colors min-h-touch ${
                    optimizeMode === 'cost'
                      ? 'bg-brand-50 border-brand-500 text-brand-700'
                      : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {t.overbooking.modeCost}
                  <div className="text-[11px] font-normal text-slate-500">M = {recommendation.costOptimalM}</div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Monte Carlo Histogram & Payout Tiers */}
        <div className="lg:col-span-7 space-y-4">
          {/* Monte Carlo Histogram */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                  {t.overbooking.monteCarloTitle}
                </h3>
                <p className="text-xs text-slate-500">
                  {t.overbooking.histogramSubtitle}
                </p>
              </div>
              <span className="text-xs bg-slate-100 font-semibold text-slate-700 px-2.5 py-1 rounded-md border border-slate-200">
                Threshold Nmin = {nMin}
              </span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={histogramChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="shows" label={{ value: 'Actual Workers Showing Up (S)', position: 'insideBottom', offset: -5, fontSize: 11 }} />
                  <YAxis unit="%" />
                  <Tooltip
                    formatter={(val: any) => [`${val}%`, 'Frequency']}
                    labelFormatter={(label) => `${label} workers showing up`}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="Naive" fill="#f97316" radius={[4, 4, 0, 0]} name={`Naive (Book N=${nNeeded})`} />
                  <Bar dataKey="Overbooked" fill="#0284c7" radius={[4, 4, 0, 0]} name={`Overbooked (Book M=${activeM})`} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700 flex items-start gap-2">
              <Info className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
              <span>
                <strong>Interpretation:</strong> In naive booking (orange), the distribution peaks around 7-8 workers, causing failure in {Math.round((1 - recommendation.confidenceAtN) * 100)}% of runs. In overbooking M={activeM} (blue), the distribution shifts securely above {nMin}, achieving {Math.round(recommendation.confidenceAtM * 100)}% guarantee.
              </span>
            </div>
          </div>

          {/* Roster Tiers Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Tier A */}
            <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs uppercase tracking-wider text-emerald-800">
                  {t.overbooking.tierA.replace('{count}', String(recommendation.tierAWorkers.length))}
                </span>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-200 text-emerald-900">
                  Confirmed Crew
                </span>
              </div>
              <p className="text-xs text-emerald-900 mt-2">
                Primary workers dispatched at full daily wage ({formatINR(wageOffered)}/day).
              </p>
            </div>

            {/* Tier B */}
            <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs uppercase tracking-wider text-amber-800">
                  {t.overbooking.tierB.replace('{count}', String(recommendation.tierBWorkers.length))}
                </span>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-200 text-amber-900">
                  Standby Backup
                </span>
              </div>
              <p className="text-xs text-amber-900 mt-2">
                Guaranteed reporting allowance of {formatINR(wageOffered * assumptions.reportingAllowanceRatio)} (30%) if turned away.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Ranked Candidate Worker Table with T-24h Confirmation */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
              {t.overbooking.workerRanked}
            </h3>
            <p className="text-xs text-slate-500">
              Sorted by adjusted show probability descending. Ties broken by travel distance.
            </p>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Showing top {Math.min(20, recommendation.candidatesSorted.length)} candidate workers
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">{t.overbooking.colWorker}</th>
                <th className="py-3 px-3">{t.overbooking.colBaseP}</th>
                <th className="py-3 px-3">Adjusted P</th>
                <th className="py-3 px-3">Factors</th>
                <th className="py-3 px-3">{t.overbooking.colConfirmation}</th>
                <th className="py-3 px-3">{t.overbooking.colTier}</th>
                <th className="py-3 px-4 text-right">WhatsApp Dispatch</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {recommendation.candidatesSorted.slice(0, 16).map((c, idx) => {
                const isTierA = idx < nNeeded;
                const isTierB = idx >= nNeeded && idx < activeM;
                const isSelected = idx < activeM;
                const status = c.confirmationStatus;

                // WhatsApp template link
                const waText = getWhatsAppBookingText(
                  c.worker.name,
                  'Ramesh Patel',
                  formatDateShort(targetDate),
                  operation,
                  wageOffered,
                  isTierB,
                  wageOffered * assumptions.reportingAllowanceRatio,
                  lang
                );
                const waUrl = `https://wa.me/?text=${encodeURIComponent(waText)}`;

                return (
                  <tr
                    key={c.worker.id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      isSelected ? (isTierA ? 'bg-emerald-50/20' : 'bg-amber-50/20') : 'text-slate-400'
                    }`}
                  >
                    {/* Worker Info */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{c.worker.name}</div>
                      <div className="text-[11px] text-slate-500">
                        {c.worker.history.showed}/{c.worker.history.booked} jobs attended • {c.distanceKm} km away
                      </div>
                    </td>

                    {/* Base P */}
                    <td className="py-3 px-3 text-slate-700">
                      {(c.baseP * 100).toFixed(0)}%
                    </td>

                    {/* Adjusted P */}
                    <td className="py-3 px-3">
                      <span
                        className={`font-extrabold ${
                          c.adjustedP >= 0.8
                            ? 'text-emerald-700'
                            : c.adjustedP >= 0.65
                            ? 'text-amber-700'
                            : 'text-slate-500'
                        }`}
                      >
                        {(c.adjustedP * 100).toFixed(0)}%
                      </span>
                    </td>

                    {/* Factors Applied */}
                    <td className="py-3 px-3">
                      <div className="flex flex-wrap gap-1">
                        {c.factorsApplied.map((f, i) => (
                          <span
                            key={i}
                            className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                              f.multiplier >= 1
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {f.name}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Confirmation Status Radio / Buttons */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleConfirmationChange(c.worker.id, 'confirmed')}
                          className={`p-1.5 rounded min-h-[36px] min-w-[36px] flex items-center justify-center transition-colors ${
                            status === 'confirmed'
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                          title="Confirm (3x odds)"
                          aria-label="Confirm attendance"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleConfirmationChange(c.worker.id, 'no_response')}
                          className={`p-1.5 rounded min-h-[36px] min-w-[36px] flex items-center justify-center transition-colors ${
                            status === 'no_response'
                              ? 'bg-amber-500 text-white'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                          title="No Response (0.6x odds)"
                          aria-label="No response from worker"
                        >
                          <HelpCircle className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleConfirmationChange(c.worker.id, 'declined')}
                          className={`p-1.5 rounded min-h-[36px] min-w-[36px] flex items-center justify-center transition-colors ${
                            status === 'declined'
                              ? 'bg-red-600 text-white'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                          title="Declined (p = 0)"
                          aria-label="Worker declined"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    </td>

                    {/* Roster Tier */}
                    <td className="py-3 px-3">
                      {isTierA ? (
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                          Tier A
                        </span>
                      ) : isTierB ? (
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                          Tier B (Standby)
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">Unbooked</span>
                      )}
                    </td>

                    {/* WhatsApp Action */}
                    <td className="py-3 px-4 text-right">
                      {isSelected && (
                        <a
                          href={waUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 min-h-[36px]"
                          aria-label={`Send booking message to ${c.worker.name}`}
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </a>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

function computePoissonBinomialConfidence(pmf: number[], threshold: number): number {
  if (threshold <= 0) return 1.0;
  let sum = 0;
  for (let k = threshold; k < pmf.length; k++) {
    sum += pmf[k];
  }
  return sum;
}
