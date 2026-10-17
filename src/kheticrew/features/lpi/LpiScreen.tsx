import React, { useState, useMemo } from 'react';
import { useStore, useTranslation } from '../../store/useStore';
import { computeLPI, simulateFarmShift, VillageDayLPI, LpiBand } from '../../lib/engines/lpi';
import { AssumptionBadge } from '../../components/AssumptionBadge';
import { CROP_OPERATIONS } from '../../data/seed';
import { formatDateShort, formatINR, addDaysIso, SIMULATED_TODAY } from '../../lib/dates';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import {
  BarChart3,
  CloudRain,
  Flame,
  AlertTriangle,
  Sliders,
  Sparkles,
  Calendar,
  CheckCircle,
  HelpCircle,
  Info,
  TrendingUp,
  MapPin,
  TrendingDown,
} from 'lucide-react';

export const LpiScreen: React.FC = () => {
  const {
    villages,
    farms,
    workers,
    jobs,
    forecast,
    assumptions,
    farmShifts,
    setFarmShift,
    selectedFarmId,
    setSelectedFarmId,
    lang,
  } = useStore();
  const t = useTranslation();

  // Weather compression toggle
  const [enableWeatherCompression, setEnableWeatherCompression] = useState<boolean>(true);

  // Farmer-friendly display mode: words (Free, Good, Busy, Short, Alert) vs ratio numbers
  const [displayMode, setDisplayMode] = useState<'words' | 'numbers'>('words');

  // Selected cell for breakdown inspection
  const [selectedCell, setSelectedCell] = useState<VillageDayLPI | null>(null);

  // Selected farm for what-if
  const activeFarmId = selectedFarmId || farms[0]?.id || 'farm-1';
  const targetFarm = farms.find((f) => f.id === activeFarmId) || farms[0];
  const currentShift = farmShifts[activeFarmId] || 0;

  // Run LPI Engine
  const lpiResult = useMemo(() => {
    return computeLPI(
      villages,
      farms,
      workers,
      CROP_OPERATIONS,
      jobs,
      forecast,
      assumptions,
      {
        enableWeatherCompression,
        farmShifts,
        horizonDays: 21,
      }
    );
  }, [villages, farms, workers, jobs, forecast, assumptions, enableWeatherCompression, farmShifts]);

  // Run What-If Simulation on target farm
  const whatIfResult = useMemo(() => {
    return simulateFarmShift(
      activeFarmId,
      villages,
      farms,
      workers,
      CROP_OPERATIONS,
      jobs,
      forecast,
      assumptions
    );
  }, [activeFarmId, villages, farms, workers, jobs, forecast, assumptions]);

  // Aggregate 21-day timeline for block-level line chart
  const aggregateChartData = useMemo(() => {
    const dates: string[] = [];
    for (let i = 0; i < 21; i++) {
      dates.push(addDaysIso(SIMULATED_TODAY, i));
    }

    return dates.map((d) => {
      const vLpis = lpiResult.dayIndexMap.get(d) || [];
      const totalDemand = vLpis.reduce((sum, item) => sum + item.demand, 0);
      const totalSupply = vLpis.reduce((sum, item) => sum + item.supply, 0);
      const ratio = totalSupply > 0 ? totalDemand / totalSupply : 0;
      const avgWage = vLpis.length > 0 ? vLpis.reduce((sum, item) => sum + item.projectedWage, 0) / vLpis.length : 380;
      const isRain = vLpis.some((item) => item.rainProb >= 0.6);
      const isHeat = vLpis.some((item) => item.isHeatWave);

      return {
        date: d,
        label: formatDateShort(d),
        Demand: Math.round(totalDemand * 10) / 10,
        Supply: Math.round(totalSupply * 10) / 10,
        Ratio: Math.round(ratio * 100) / 100,
        LPI: Math.round(ratio * 66.7),
        Wage: Math.round(avgWage),
        isRain,
        isHeat,
      };
    });
  }, [lpiResult]);

  // Band styles helper (accessible color-blind safe: Sky Blue -> Teal -> Amber -> Orange -> Vermilion)
  const getBandBadge = (band: LpiBand) => {
    switch (band) {
      case 'calm':
        return {
          bg: 'bg-sky-100 text-sky-800 border-sky-300',
          dot: 'bg-sky-500',
          label: t.lpi.legendCalm,
        };
      case 'moderate':
        return {
          bg: 'bg-teal-100 text-teal-800 border-teal-300',
          dot: 'bg-teal-600',
          label: t.lpi.legendModerate,
        };
      case 'tight':
        return {
          bg: 'bg-amber-100 text-amber-800 border-amber-300',
          dot: 'bg-amber-500',
          label: t.lpi.legendTight,
        };
      case 'severe':
        return {
          bg: 'bg-orange-100 text-orange-900 border-orange-300',
          dot: 'bg-orange-500',
          label: t.lpi.legendSevere,
        };
      case 'critical':
        return {
          bg: 'bg-rose-100 text-rose-900 border-rose-300',
          dot: 'bg-rose-600',
          label: t.lpi.legendCritical,
        };
    }
  };

  const getHeatmapColor = (band: LpiBand) => {
    switch (band) {
      case 'calm':
        return 'bg-sky-50 text-sky-900 border-sky-200 hover:bg-sky-100';
      case 'moderate':
        return 'bg-teal-50 text-teal-900 border-teal-200 hover:bg-teal-100';
      case 'tight':
        return 'bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200';
      case 'severe':
        return 'bg-orange-200 text-orange-950 border-orange-400 hover:bg-orange-300';
      case 'critical':
        return 'bg-rose-200 text-rose-950 border-rose-400 font-bold hover:bg-rose-300';
    }
  };

  // Farmer-friendly cell text
  const getCellLabel = (day: VillageDayLPI) => {
    if (displayMode === 'numbers') {
      return day.ratio.toFixed(1);
    }
    const isHi = lang === 'hi';
    switch (day.band) {
      case 'calm':
        return isHi ? (day.demand === 0 ? 'खाली' : 'उपलब्ध') : (day.demand === 0 ? 'Free' : 'Good');
      case 'moderate':
        return isHi ? 'उपलब्ध' : 'Good';
      case 'tight':
        return isHi ? 'व्यस्त' : 'Busy';
      case 'severe':
        return isHi ? 'कमी' : 'Short';
      case 'critical':
        return isHi ? 'संकट' : 'Alert';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-100 text-brand-800 border border-brand-200">
                Engine 3 • Timing
              </span>
              <AssumptionBadge assumptionKey="wageElasticity" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
              {t.lpi.title}
            </h1>
          </div>

          {/* Climate Weather Compression Toggle */}
          <button
            type="button"
            onClick={() => setEnableWeatherCompression(!enableWeatherCompression)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors min-h-touch ${
              enableWeatherCompression
                ? 'bg-sky-50 border-sky-300 text-sky-800'
                : 'bg-slate-100 border-slate-300 text-slate-600'
            }`}
          >
            <CloudRain className="w-4 h-4 text-sky-600" />
            <span>{t.lpi.weatherToggle}</span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                enableWeatherCompression ? 'bg-sky-600 text-white' : 'bg-slate-300 text-slate-700'
              }`}
            >
              {enableWeatherCompression ? 'Active (ON)' : 'Bypassed (OFF)'}
            </span>
          </button>
        </div>

        <p className="text-sm text-slate-600 leading-relaxed">
          {t.lpi.subtitle}
        </p>

        {/* Legend strip */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className="font-semibold text-slate-500 mr-1">Status Scale:</span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded border bg-sky-50 text-sky-800 border-sky-200 font-medium">
            <span className="w-2 h-2 rounded-full bg-sky-500" />
            {t.lpi.legendCalm}
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded border bg-teal-50 text-teal-800 border-teal-200 font-medium">
            <span className="w-2 h-2 rounded-full bg-teal-600" />
            {t.lpi.legendModerate}
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded border bg-amber-100 text-amber-900 border-amber-300 font-medium">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            {t.lpi.legendTight}
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded border bg-orange-100 text-orange-900 border-orange-300 font-medium">
            <span className="w-2 h-2 rounded-full bg-orange-500" />
            {t.lpi.legendSevere}
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded border bg-rose-100 text-rose-900 border-rose-300 font-bold">
            <span className="w-2 h-2 rounded-full bg-rose-600" />
            {t.lpi.legendCritical}
          </span>
        </div>
      </div>

      {/* Critical Early-Warning Alerts Feed */}
      {lpiResult.alerts.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-rose-950 text-xs sm:text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{t.lpi.alertsTitle} ({lpiResult.alerts.length} Peak Warnings Detected)</span>
            </h3>
            <span className="text-[11px] font-semibold text-rose-700">Action Recommended: Shift sowing date</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-rose-900">
            {lpiResult.alerts.slice(0, 4).map((alert) => (
              <div key={alert.id} className="p-2.5 bg-white rounded-lg border border-rose-200 flex items-start gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-600 shrink-0 mt-1.5" />
                <div>
                  <strong>{formatDateShort(alert.date)}:</strong> {alert.villageName} enters{' '}
                  <span className="font-bold uppercase text-rose-700">{alert.band}</span> state (Demand: {alert.demand} vs Supply: {alert.supply}). Projected wages spike by +{alert.wageSurgePct}%.
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 21-Day Forward Village Heatmap Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="font-bold text-slate-900 text-sm sm:text-base">
              {t.lpi.heatmapTitle}
            </h2>
            <p className="text-xs text-slate-500">
              Click any cell to inspect local crop drivers, weather alerts and projected daily wage rates.
            </p>
          </div>

          {/* Toggle pill: Farmer Words vs Ratio Numbers */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg text-xs font-semibold">
            <span className="text-[11px] text-slate-500 px-1">View:</span>
            <button
              type="button"
              onClick={() => setDisplayMode('words')}
              className={`px-2 py-0.5 rounded-md transition-colors ${
                displayMode === 'words'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Words (Free, Good, Busy, Short)
            </button>
            <button
              type="button"
              onClick={() => setDisplayMode('numbers')}
              className={`px-2 py-0.5 rounded-md transition-colors ${
                displayMode === 'numbers'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Ratio Numbers
            </button>
          </div>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-lg">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-2 text-left font-bold text-slate-700 min-w-[120px] sticky left-0 bg-slate-50 z-10">
                  Village
                </th>
                {aggregateChartData.map((d) => (
                  <th key={d.date} className="p-1.5 text-center font-semibold text-slate-600 min-w-[38px]">
                    {d.label.split(' ')[0]}
                    <div className="text-[10px] text-slate-400 font-normal">
                      {d.label.split(' ')[1]}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {lpiResult.heatmaps.map((vMap) => (
                <tr key={vMap.villageId}>
                  <td className="p-2 sticky left-0 z-10 bg-white font-bold text-slate-800 border-r border-slate-200">
                    {vMap.villageName}
                    <div className="text-[10px] text-slate-400 font-normal">
                      Peak: {vMap.peakLpi}
                    </div>
                  </td>

                  {vMap.days.map((day) => {
                    const isSelected = selectedCell?.villageId === day.villageId && selectedCell?.date === day.date;
                    return (
                      <td key={day.date} className="p-0.5">
                        <button
                          type="button"
                          onClick={() => setSelectedCell(day)}
                          className={`w-full h-8 rounded border text-center flex flex-col items-center justify-center transition-all ${getHeatmapColor(
                            day.band
                          )} ${isSelected ? 'ring-2 ring-slate-900' : ''}`}
                          title={`${day.villageName} on ${formatDateShort(day.date)}: Status ${getCellLabel(day)}, Ratio ${day.ratio.toFixed(1)}, Projected Wage: ₹${day.projectedWage}`}
                          aria-label={`${day.villageName} on ${formatDateShort(day.date)}: ${getCellLabel(day)}`}
                        >
                          <span className="text-[10px] leading-tight font-extrabold tracking-tight">
                            {getCellLabel(day)}
                          </span>
                          {day.rainProb >= 0.6 && (
                            <CloudRain className="w-2.5 h-2.5 text-sky-700 -mt-0.5" />
                          )}
                          {day.isHeatWave && (
                            <Flame className="w-2.5 h-2.5 text-orange-700 -mt-0.5" />
                          )}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Grid: Day Drivers Breakdown & Block-Level Line Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Top Drivers Breakdown on Cell Click */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div>
              <span className="text-[10px] font-bold text-brand-600 uppercase tracking-wider">
                Daily Driver Breakdown
              </span>
              <h3 className="font-bold text-slate-900 text-base">
                {selectedCell ? `${selectedCell.villageName} • ${formatDateShort(selectedCell.date)}` : 'Select a Day Cell'}
              </h3>
            </div>
            {selectedCell && (
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getBandBadge(selectedCell.band).bg}`}>
                {selectedCell.band.toUpperCase()}
              </span>
            )}
          </div>

          {selectedCell ? (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="p-2 bg-slate-50 rounded-lg">
                  <span className="text-slate-500">Demand</span>
                  <div className="text-base font-bold text-brand-700">{selectedCell.demand}p-d</div>
                </div>
                <div className="p-2 bg-slate-50 rounded-lg">
                  <span className="text-slate-500">Supply</span>
                  <div className="text-base font-bold text-slate-800">{selectedCell.supply}p-d</div>
                </div>
                <div className="p-2 bg-slate-50 rounded-lg">
                  <span className="text-slate-500">Projected Wage</span>
                  <div className="text-base font-bold text-emerald-700">{formatINR(selectedCell.projectedWage)}</div>
                </div>
              </div>

              <div>
                <span className="text-xs font-semibold text-slate-700 block mb-1">
                  Demand Sources ({selectedCell.demandBreakdown.length} Farm Operations)
                </span>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {selectedCell.demandBreakdown.map((item, i) => (
                    <div key={i} className="p-2 bg-slate-50 rounded text-xs text-slate-700 flex justify-between items-center">
                      <div>
                        <div className="font-bold text-slate-900">{item.farmOwner}</div>
                        <div className="text-[11px] text-slate-500">{item.operation} ({item.cropId})</div>
                      </div>
                      <span className="font-bold text-brand-700">{item.personDays.toFixed(1)} p-d</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-xs text-slate-400">
              Click any village/day cell in the heatmap table above to see exact farm breakdown.
            </div>
          )}
        </div>

        {/* Right Column: Block Level Aggregate Demand vs Supply Line Chart */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                {t.lpi.chartTitle}
              </h3>
              <p className="text-xs text-slate-500">
                Aggregated across all 6 villages and 40 farms. Note the harvest squeeze between 8 Nov and 14 Nov.
              </p>
            </div>
            <span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-600 font-semibold">
              Peak Horizon
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={aggregateChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="label" fontSize={11} />
                <YAxis fontSize={11} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Area type="monotone" dataKey="Supply" fill="#e0effe" stroke="#0e86d4" strokeWidth={2} name="Available Supply (p-d)" />
                <Line type="monotone" dataKey="Demand" stroke="#ea580c" strokeWidth={3} dot={{ r: 3 }} name="Labour Demand (p-d)" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* What-If Date Shift Simulator Panel */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                Farmer Decision Support
              </span>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                {t.lpi.whatIfTitle}
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Simulate shifting sowing or harvest start date to desynchronize demand from block peak.
            </p>
          </div>

          {/* Quick Best Date Button */}
          <button
            type="button"
            onClick={() => setFarmShift(activeFarmId, whatIfResult.bestShiftDays)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors min-h-touch"
          >
            <Sparkles className="w-4 h-4" />
            <span>{t.lpi.bestDateBtn} (+{whatIfResult.bestShiftDays}d)</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
          {/* Farm Selector & Shift Slider */}
          <div className="md:col-span-6 space-y-3 text-xs sm:text-sm">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {t.lpi.selectFarm}
              </label>
              <select
                value={activeFarmId}
                onChange={(e) => setSelectedFarmId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-brand-500"
              >
                {farms.slice(0, 15).map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.ownerName} • {f.crop} ({f.acres} ac) in Village {f.villageId}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1 font-semibold text-slate-700">
                <span>{t.lpi.sliderShift}: <strong className="text-brand-700">{currentShift > 0 ? `+${currentShift}` : currentShift} days</strong></span>
                <span className="text-xs text-slate-400">Flex range: ±{targetFarm.sowingFlexDays} days</span>
              </div>
              <input
                type="range"
                min={-Math.min(5, targetFarm.sowingFlexDays)}
                max={Math.min(7, targetFarm.sowingFlexDays)}
                value={currentShift}
                onChange={(e) => setFarmShift(activeFarmId, parseInt(e.target.value, 10))}
                className="w-full accent-brand-600"
              />
            </div>
          </div>

          {/* Result Impact Strip */}
          <div className="md:col-span-6 grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-500 font-medium">{t.lpi.peakReduction}</span>
              <div className="text-xl font-bold text-emerald-700 mt-1 flex items-center gap-1">
                <TrendingDown className="w-5 h-5 text-emerald-600" />
                <span>{Math.abs(whatIfResult.peakLpiDelta)} pts</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Lowers village harvest pressure
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-500 font-medium">{t.lpi.bookLabourBy}</span>
              <div className="text-lg font-bold text-brand-700 mt-1 flex items-center gap-1">
                <Calendar className="w-4 h-4 text-brand-600" />
                <span>{formatDateShort(whatIfResult.bookLabourByDate)}</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Before projected wage spike
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
