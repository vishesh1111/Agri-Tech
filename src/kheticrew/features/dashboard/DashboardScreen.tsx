import React, { useMemo } from 'react';
import { useStore, useTranslation } from '../../store/useStore';
import { SchematicMap } from '../../components/SchematicMap';
import { AssumptionBadge } from '../../components/AssumptionBadge';
import { computeLPI } from '../../lib/engines/lpi';
import { solveCrewRelay } from '../../lib/engines/relay';
import { solveOverbooking, WorkerCandidate } from '../../lib/engines/overbooking';
import { computeAllVillagesFestivalSupply } from '../../lib/engines/festival';
import { FESTIVALS, CROP_OPERATIONS, MICRO_TASKS } from '../../data/seed';
import {
  TrendingDown,
  Clock,
  Users,
  ShieldCheck,
  ChevronRight,
  AlertTriangle,
  Sparkles,
  Zap,
  Leaf,
  Layers,
} from 'lucide-react';
import { formatINR } from '../../lib/dates';

export const DashboardScreen: React.FC = () => {
  const {
    villages,
    farms,
    workers,
    crews,
    jobs,
    forecast,
    migrantProfiles,
    assumptions,
    farmShifts,
    setActiveTab,
    selectedCrewId,
    setSelectedCrewId,
    selectedFarmId,
    setSelectedFarmId,
    setGuidedTourStep,
  } = useStore();

  const t = useTranslation();

  // Compute live metrics across all engines without hardcoding
  const { beforeLpi, afterLpi, relayMetrics, returneeCount, overbookingKpi } = useMemo(() => {
    // 1. Festival supply
    const { supplyLookup } = computeAllVillagesFestivalSupply(
      villages,
      FESTIVALS,
      migrantProfiles,
      assumptions,
      1.0
    );

    // 2. LPI before interventions
    const baseLpiRes = computeLPI(villages, farms, workers, CROP_OPERATIONS, jobs, forecast, assumptions, {
      enableWeatherCompression: true,
      farmShifts: {},
    });

    // 3. LPI after interventions (with festival returnees + farm shifts)
    const afterLpiRes = computeLPI(villages, farms, workers, CROP_OPERATIONS, jobs, forecast, assumptions, {
      enableWeatherCompression: true,
      farmShifts,
      supplements: {
        festivalSupplyByVillageDate: supplyLookup,
      },
    });

    // 4. Relay metrics
    const relayRes = solveCrewRelay(crews, jobs, farms, villages, assumptions);

    // 5. Overbooking on standard 10 worker harvest job
    const candidates: WorkerCandidate[] = workers.slice(0, 20).map((w) => ({
      worker: w,
      baseP: (w.history.showed + 8) / (w.history.booked + 10),
      adjustedP: (w.history.showed + 8) / (w.history.booked + 10),
      odds: 1,
      distanceKm: 3,
      wageOffered: 450,
      localRate: 400,
      startTime: '07:00',
      rainProb: 0,
      isNearFestival: false,
      confirmationStatus: 'unconfirmed',
      factorsApplied: [],
    }));

    const obRes = solveOverbooking(
      candidates,
      {
        nNeeded: 10,
        nMin: 9,
        targetConfidence: 0.95,
        wageOffered: 450,
        localRate: 400,
        startTime: '07:00',
        rainProb: 0,
        isNearFestival: false,
      },
      assumptions
    );

    // Total returnees
    const totalReturnees = Object.values(supplyLookup).reduce((sum, vMap) => {
      return sum + Object.values(vMap).reduce((s, val) => s + val, 0);
    }, 0);

    return {
      beforeLpi: baseLpiRes.peakLpiOverall,
      afterLpi: afterLpiRes.peakLpiOverall,
      relayMetrics: relayRes.relayMetrics,
      returneeCount: Math.round(totalReturnees),
      overbookingKpi: {
        naiveConf: Math.round(obRes.confidenceAtN * 100),
        overConf: Math.round(obRes.confidenceAtM * 100),
        m: obRes.recommendedM,
      },
    };
  }, [villages, farms, workers, crews, jobs, forecast, migrantProfiles, assumptions, farmShifts]);

  const selectedCrewObj = crews.find((c) => c.id === selectedCrewId) || crews[0];

  return (
    <div className="space-y-6">
      {/* Hero Problem Statement & Core Insight Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-brand-900 to-slate-900 text-white rounded-2xl p-5 sm:p-7 shadow-lg border border-slate-800 relative overflow-hidden">
        <div className="max-w-3xl space-y-3 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 border border-brand-400/30 text-brand-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            Hackathon Theme: Social and Climate Change • Simulated Date: 17 Oct 2026
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight leading-snug">
            {t.dashboard.headline}
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            <strong>Core Insight:</strong> Farm labour shortage is a <em>Reliability</em>, <em>Timing</em>, and <em>Continuity</em> problem, not just missing workers. KhetiCrew coordinates five algorithmic engines to optimize harvest logistics across a 25x25 km rural block.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setGuidedTourStep(1)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs sm:text-sm shadow-md transition-colors min-h-touch"
            >
              <Zap className="w-4 h-4" />
              <span>Launch 6-Step Story Tour</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('lpi')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs sm:text-sm transition-colors min-h-touch"
            >
              <span>View Labour Forecast</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Decorative background shape */}
        <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Headline KPI Strip (Before vs After Interventions) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {/* KPI 1: Peak Labour Shortage Risk */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Peak Shortage Risk</span>
            <AssumptionBadge assumptionKey="wageElasticity" />
          </div>
          <div className="my-2">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-brand-700">
                {afterLpi}
              </span>
              <span className="text-xs font-semibold text-slate-400 line-through">
                {beforeLpi}
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs font-semibold text-emerald-600 mt-0.5">
              <TrendingDown className="w-3.5 h-3.5" />
              <span>-{beforeLpi - afterLpi} pts with Date Shifting</span>
            </div>
          </div>
          <span className="text-[11px] text-slate-400">Target safe threshold &lt; 85</span>
        </div>

        {/* KPI 2: Crew Continuous Streak */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Crew Work Continuity</span>
            <AssumptionBadge assumptionKey="relayMaxIdleDays" />
          </div>
          <div className="my-2">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-extrabold text-brand-700">
                {relayMetrics.maxStreakDays}d
              </span>
              <span className="text-xs text-slate-500 font-medium">max streak</span>
            </div>
            <div className="flex items-center gap-1 text-xs font-semibold text-emerald-600 mt-0.5">
              <Clock className="w-3.5 h-3.5" />
              <span>+{Math.round(relayMetrics.avgStreakDays)}d avg continuous local work</span>
            </div>
          </div>
          <span className="text-[11px] text-slate-400">Eliminates migration triggers</span>
        </div>

        {/* KPI 3: Overbooking Reliability */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Crew Arrival Guarantee</span>
            <AssumptionBadge assumptionKey="priorBetaAlpha" />
          </div>
          <div className="my-2">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-brand-700">
                {overbookingKpi.overConf}%
              </span>
              <span className="text-xs text-slate-400 line-through">
                {overbookingKpi.naiveConf}%
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs font-semibold text-emerald-600 mt-0.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Book {overbookingKpi.m} for 10 with Standby</span>
            </div>
          </div>
          <span className="text-[11px] text-slate-400">Airline-style Poisson-binomial PMF</span>
        </div>

        {/* KPI 4: Seasonal Supply Mobilized */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Seasonal Return Supply</span>
            <AssumptionBadge assumptionKey="festivalLocalWorkShare" />
          </div>
          <div className="my-2">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-extrabold text-brand-700">
                {returneeCount}
              </span>
              <span className="text-xs text-slate-500 font-medium">person-days</span>
            </div>
            <div className="flex items-center gap-1 text-xs font-semibold text-brand-600 mt-0.5">
              <Users className="w-3.5 h-3.5" />
              <span>Diwali & Chhath return windows</span>
            </div>
          </div>
          <span className="text-[11px] text-slate-400">Pre-booked short harvest stints</span>
        </div>
      </div>

      {/* Main Grid: Interactive Schematic Map & Engine Navigator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: 25x25 km Schematic Map */}
        <div className="lg:col-span-7 space-y-4">
          <SchematicMap
            selectedCrew={selectedCrewObj}
            crewRouteVillageIds={['v-1', 'v-2', 'v-3', 'v-6']}
            className="w-full"
            onSelectVillage={(vid) => {
              const f = farms.find((farm) => farm.villageId === vid);
              if (f) setSelectedFarmId(f.id);
            }}
          />

          <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <Leaf className="w-4 h-4 text-emerald-600" />
              <span>Active Scenario: <strong>40 Farms (1-6 acres)</strong> • Sowing & Harvest Cluster</span>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('relay')}
              className="font-bold text-brand-600 hover:text-brand-800 underline"
            >
              Inspect Crew Relay Routes →
            </button>
          </div>
        </div>

        {/* Right Column: Five Engines Quick Navigator */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-brand-600" />
              {t.dashboard.enginesTitle}
            </h2>
            <span className="text-xs text-slate-500">Pure TypeScript Libs</span>
          </div>

          {/* Engine 1: Overbooking */}
          <div
            onClick={() => setActiveTab('overbooking')}
            className="group p-4 bg-white hover:bg-brand-50/50 rounded-xl border border-slate-200 hover:border-brand-300 shadow-xs transition-all cursor-pointer"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[11px] font-bold text-brand-600 uppercase tracking-wider">
                  Engine 1 • Reliability
                </span>
                <h3 className="font-bold text-slate-900 group-hover:text-brand-700 transition-colors">
                  Airline-Style Overbooking
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Beta prior + contextual odds adjustment + Poisson-binomial PMF. Guarantees required crew size while paying standby allowances.
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-brand-600 transition-colors shrink-0" />
            </div>
          </div>

          {/* Engine 2: Relay */}
          <div
            onClick={() => setActiveTab('relay')}
            className="group p-4 bg-white hover:bg-brand-50/50 rounded-xl border border-slate-200 hover:border-brand-300 shadow-xs transition-all cursor-pointer"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[11px] font-bold text-brand-600 uppercase tracking-wider">
                  Engine 2 • Continuity
                </span>
                <h3 className="font-bold text-slate-900 group-hover:text-brand-700 transition-colors">
                  Crew Relay Route Scheduler
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Chains back-to-back jobs on adjacent farms within km travel limits, building uninterrupted weeks of local work.
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-brand-600 transition-colors shrink-0" />
            </div>
          </div>

          {/* Engine 3: LPI */}
          <div
            onClick={() => setActiveTab('lpi')}
            className="group p-4 bg-white hover:bg-brand-50/50 rounded-xl border border-slate-200 hover:border-brand-300 shadow-xs transition-all cursor-pointer"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[11px] font-bold text-brand-600 uppercase tracking-wider">
                  Engine 3 • Timing
                </span>
                <h3 className="font-bold text-slate-900 group-hover:text-brand-700 transition-colors">
                  Labour Availability Forecast
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  21-day predictive forecast of farm labour demand vs available workers, shortage alerts, and wage trends.
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-brand-600 transition-colors shrink-0" />
            </div>
          </div>

          {/* Engine 4: Micro-Shift */}
          <div
            onClick={() => setActiveTab('microshift')}
            className="group p-4 bg-white hover:bg-brand-50/50 rounded-xl border border-slate-200 hover:border-brand-300 shadow-xs transition-all cursor-pointer"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[11px] font-bold text-brand-600 uppercase tracking-wider">
                  Engine 4 • Untapped Labour
                </span>
                <h3 className="font-bold text-slate-900 group-hover:text-brand-700 transition-colors">
                  Micro-Shift Task Splitter
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Breaks post-harvest operations into 3-hour micro-tasks, unlocking local adults with strict heat and hazard safeguards.
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-brand-600 transition-colors shrink-0" />
            </div>
          </div>

          {/* Engine 5: Festival */}
          <div
            onClick={() => setActiveTab('festival')}
            className="group p-4 bg-white hover:bg-brand-50/50 rounded-xl border border-slate-200 hover:border-brand-300 shadow-xs transition-all cursor-pointer"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[11px] font-bold text-brand-600 uppercase tracking-wider">
                  Engine 5 • Seasonal Supply
                </span>
                <h3 className="font-bold text-slate-900 group-hover:text-brand-700 transition-colors">
                  Festival-Return Labour Calendar
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Forecasts returning migrant supply during Diwali & Chhath to match pre-committed short stints with harvest peaks.
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-brand-600 transition-colors shrink-0" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
