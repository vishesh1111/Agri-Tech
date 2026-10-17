'use client';

import React, { useState } from 'react';
import {
  CloudSun,
  Stethoscope,
  Droplets,
  Store,
  CheckCircle2,
  ChevronRight,
  ShieldAlert,
  Sprout,
  Activity,
  Sparkles,
  ArrowUpRight,
  FileCheck,
  MapPin,
  Search,
  Check,
  Video
} from 'lucide-react';
import { useKisanStore } from '@/stores/useKisanStore';
import { Card, Badge } from '@/components/ui/Card';

export function HomeScreen() {
  const {
    userProfile,
    farms,
    selectedFarmId,
    selectFarm,
    crops,
    marketPrices,
    tasks,
    notifications,
    farmWeather,
    transactions,
    toggleTaskComplete,
    setTab,
    navigateToSubScreen,
    sendChatMessage,
  } = useKisanStore();

  const [quickInput, setQuickInput] = useState('');

  const activeFarm = farms.find((f) => f.id === selectedFarmId) || farms[0];
  const pendingTasks = tasks.filter((t) => !t.isCompleted).slice(0, 5);
  const criticalAlerts = notifications.filter((n) => n.severity === 'CRITICAL' && !n.isRead);

  // Financial calculations
  const totalIncome = transactions.filter((t) => t.isIncome).reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions.filter((t) => !t.isIncome).reduce((sum, t) => sum + t.amount, 0);
  const netMargin = totalIncome - totalExpense;

  const quickActions = [
    { label: 'Virtual Fencing AI', subLabel: 'Live CCTV perimeter tracking', icon: Video, action: () => navigateToSubScreen('cctv_monitor') },
    { label: 'Crop Doctor', subLabel: 'Instant leaf diagnosis', icon: Stethoscope, action: () => navigateToSubScreen('crop_doctor') },
    { label: 'Weather Forecast', subLabel: 'Hourly & spray advisory', icon: CloudSun, action: () => navigateToSubScreen('weather_report') },
    { label: 'Irrigation & Water', subLabel: 'Zone schedules', icon: Droplets, action: () => navigateToSubScreen('irrigation_detail') },
    { label: 'Farm Tasks', subLabel: `${pendingTasks.length} pending actions`, icon: CheckCircle2, action: () => navigateToSubScreen('tasks_list') },
    { label: 'Herd & Cattle', subLabel: 'Livestock status', icon: Activity, action: () => navigateToSubScreen('livestock_list') },
  ];

  const handleQuickAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickInput.trim()) return;
    const text = quickInput;
    setQuickInput('');
    setTab('ai_agent');
    await sendChatMessage(text);
  };

  return (
    <div className="space-y-6">
      {/* 1. Greeting Banner */}
      <div className="bg-white border border-zinc-200/80 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900 tracking-tight">
            Welcome back, {userProfile?.name?.split(' ')[0] || 'Farmer'}
          </h1>
          <div className="flex items-center gap-2 mt-1 text-xs text-zinc-500">
            <MapPin className="h-3.5 w-3.5 text-zinc-400" />
            <span>{activeFarm?.location || `${userProfile?.village || 'Ludhiana'}, ${userProfile?.state || 'Punjab'}`}</span>
            <span>·</span>
            <span>{activeFarm?.soilType || 'Loamy Alluvial Soil'}</span>
            <span>·</span>
            <span className="text-zinc-700 font-medium">Day {activeFarm?.activeDay || 45} of Season</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {farms.length > 1 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-500 font-medium">Farm:</span>
              <select
                value={selectedFarmId}
                onChange={(e) => selectFarm(e.target.value)}
                aria-label="Active Farm Selection"
                className="rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-1.5 text-xs font-medium text-zinc-800 outline-none hover:border-zinc-300 transition-colors"
              >
                {farms.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} ({f.totalArea} {f.unit})
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            onClick={() => setTab('ai_agent')}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 px-3.5 py-1.5 text-xs font-medium text-white transition-colors"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Ask Assistant</span>
          </button>
        </div>
      </div>

      {/* 2. Four Minimal KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Farm Health Score */}
        <Card className="p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-zinc-500">
              <span className="font-medium">Farm Health Index</span>
              <Badge variant="success">Optimal</Badge>
            </div>
            <div className="mt-3 flex items-baseline gap-1.5">
              <span className="text-3xl font-bold tracking-tight text-zinc-900">
                {activeFarm?.healthScore || 84}
              </span>
              <span className="text-xs text-zinc-400">/ 100</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-500">
            <span>Soil: {activeFarm?.soilHealthScore || 88}%</span>
            <span>·</span>
            <span>Water: {activeFarm?.waterHealthScore || 79}%</span>
            <span>·</span>
            <span>Biosecurity: {activeFarm?.pestHealthScore || 85}%</span>
          </div>
        </Card>

        {/* KPI 2: Live Weather & Spraying */}
        <Card
          onClick={() => navigateToSubScreen('weather_report')}
          className="p-4 sm:p-5 flex flex-col justify-between cursor-pointer hover:border-zinc-300 transition-colors"
        >
          <div>
            <div className="flex items-center justify-between text-xs text-zinc-500">
              <span className="font-medium">Weather & Spray</span>
              <Badge variant={farmWeather?.sprayingWindowStatus === 'OPTIMAL' ? 'success' : 'warning'}>
                {farmWeather?.sprayingWindowStatus === 'OPTIMAL' ? 'Good spray window' : 'Caution'}
              </Badge>
            </div>
            <div className="mt-3 flex items-baseline gap-1.5">
              <span className="text-3xl font-bold tracking-tight text-zinc-900">
                {farmWeather?.currentTempC || 27}°C
              </span>
              <span className="text-xs text-zinc-500">
                · {farmWeather?.conditionText || 'Sunny'}
              </span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-500">
            <span>Wind: {farmWeather?.windSpeedKm || 11} km/h</span>
            <span className="text-emerald-700 font-medium">Hourly radar →</span>
          </div>
        </Card>

        {/* KPI 3: Cultivated Holdings */}
        <Card
          onClick={() => navigateToSubScreen('crop_growth_tracker')}
          className="p-4 sm:p-5 flex flex-col justify-between cursor-pointer hover:border-zinc-300 transition-colors"
        >
          <div>
            <div className="flex items-center justify-between text-xs text-zinc-500">
              <span className="font-medium">Active Holdings</span>
              <Badge variant="neutral">{crops.length} crops active</Badge>
            </div>
            <div className="mt-3 flex items-baseline gap-1.5">
              <span className="text-3xl font-bold tracking-tight text-zinc-900">
                {activeFarm?.totalArea || 12.5}
              </span>
              <span className="text-xs text-zinc-500">{activeFarm?.unit || 'Acres'}</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-500">
            <span>Harvest in ~{crops[0]?.daysRemaining || 48} days</span>
            <span className="text-emerald-700 font-medium">Lifecycle map →</span>
          </div>
        </Card>

        {/* KPI 4: Financial Balance */}
        <Card
          onClick={() => setTab('market')}
          className="p-4 sm:p-5 flex flex-col justify-between cursor-pointer hover:border-zinc-300 transition-colors"
        >
          <div>
            <div className="flex items-center justify-between text-xs text-zinc-500">
              <span className="font-medium">Operating Net Margin</span>
              <Badge variant="primary">+4.2% YoY</Badge>
            </div>
            <div className="mt-3 flex items-baseline gap-1.5">
              <span className="text-3xl font-bold tracking-tight text-emerald-800">
                ₹{netMargin > 0 ? netMargin.toLocaleString() : '84,500'}
              </span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-500">
            <span>Wheat modal: ₹2,425/Qtl</span>
            <span className="text-emerald-700 font-medium">Mandi rates →</span>
          </div>
        </Card>
      </div>

      {/* 3. Main Dashboard Layout (8 Columns Left, 4 Columns Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ── LEFT MAIN SECTION (8 COLS) ── */}
        <div className="lg:col-span-8 space-y-6">
          {/* Critical Alert (Understated if present) */}
          {criticalAlerts.length > 0 && (
            <div
              onClick={() => navigateToSubScreen('notifications')}
              className="cursor-pointer rounded-xl border border-rose-200 bg-rose-50/60 p-4 transition-colors hover:bg-rose-50 flex items-start gap-3"
            >
              <ShieldAlert className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-rose-900">
                    {criticalAlerts[0].title}
                  </span>
                  <span className="text-[11px] text-rose-600">
                    {criticalAlerts[0].timeFormatted}
                  </span>
                </div>
                <p className="text-xs text-rose-800 mt-0.5 leading-relaxed">
                  {criticalAlerts[0].message}
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-rose-400 shrink-0 self-center" />
            </div>
          )}

          {/* Quick Action Navigation Grid (6 clean minimal tiles) */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                Quick Tools
              </span>
              <button
                onClick={() => setTab('more')}
                className="text-xs text-emerald-700 hover:underline font-medium"
              >
                All 22 tools →
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {quickActions.map((qa) => {
                const Icon = qa.icon;
                return (
                  <button
                    key={qa.label}
                    onClick={qa.action}
                    className="flex items-center gap-3 p-3 rounded-xl border border-zinc-200/80 bg-white hover:bg-zinc-50/70 hover:border-zinc-300 transition-all text-left shadow-2xs"
                  >
                    <div className="w-8 h-8 rounded-lg bg-zinc-100 border border-zinc-200/60 flex items-center justify-center text-zinc-600 shrink-0">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-medium text-zinc-900 block truncate">
                        {qa.label}
                      </span>
                      <span className="text-[11px] text-zinc-400 block truncate">
                        {qa.subLabel}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Standing Crops Section */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                Standing Crops ({crops.length})
              </span>
              <button
                onClick={() => navigateToSubScreen('crop_growth_tracker')}
                className="text-xs text-emerald-700 hover:underline font-medium"
              >
                View timeline →
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {crops.map((c) => (
                <Card
                  key={c.id}
                  onClick={() => navigateToSubScreen('crop_growth_tracker')}
                  className="cursor-pointer hover:border-zinc-300 transition-colors p-4 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-sm text-zinc-900">
                          {c.cropName}
                        </span>
                        <span className="text-xs text-zinc-500">({c.variety})</span>
                      </div>
                      <p className="text-xs text-zinc-600 mt-0.5">
                        Stage: {c.growthStage} · Day {c.daysElapsed}
                      </p>
                    </div>

                    <Badge variant="success">
                      {c.healthScore}% health
                    </Badge>
                  </div>

                  {/* Growth Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-zinc-400">
                      <span>Sowing</span>
                      <span>Harvest: {c.expectedHarvest}</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-zinc-100 overflow-hidden">
                      <div
                        className="h-full bg-emerald-600 rounded-full"
                        style={{ width: `${Math.min(100, Math.round((c.daysElapsed / 120) * 100))}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-zinc-500 pt-2 border-t border-zinc-100">
                    <span>Target yield: <strong>{c.expectedYield ?? c.expectedYieldPerAcre ?? 24} Qtl/Acre</strong></span>
                    <span className="text-emerald-700 font-medium hover:underline">
                      Actions →
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* APMC Mandi Rates Table */}
          <Card className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-zinc-900">
                  Live APMC Mandi Rates
                </h3>
                <p className="text-xs text-zinc-500">
                  Government regulated rates from nearby yards
                </p>
              </div>
              <button
                onClick={() => setTab('market')}
                className="text-xs text-emerald-700 hover:underline font-medium flex items-center gap-0.5"
              >
                <span>Full Mandi Desk</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-200 text-zinc-400 text-[11px] font-medium">
                    <th className="pb-2">Commodity</th>
                    <th className="pb-2">Mandi</th>
                    <th className="pb-2">Distance</th>
                    <th className="pb-2 text-right">Modal Price (₹/Qtl)</th>
                    <th className="pb-2 text-right">24h Change</th>
                    <th className="pb-2 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {marketPrices.slice(0, 5).map((m) => (
                    <tr
                      key={m.id}
                      onClick={() => setTab('market')}
                      className="cursor-pointer hover:bg-zinc-50 transition-colors"
                    >
                      <td className="py-2.5 font-medium text-zinc-900">
                        {m.cropName}
                      </td>
                      <td className="py-2.5 text-zinc-600">
                        {m.mandiName}
                      </td>
                      <td className="py-2.5 text-zinc-400">
                        {m.distanceKm} km
                      </td>
                      <td className="py-2.5 text-right font-semibold text-zinc-900">
                        ₹{m.pricePerQuintal.toLocaleString()}
                      </td>
                      <td className="py-2.5 text-right font-medium text-emerald-700">
                        +{m.changePercent}%
                      </td>
                      <td className="py-2.5 text-center">
                        {m.isBestPrice ? (
                          <Badge variant="success">Top Price</Badge>
                        ) : (
                          <span className="text-[11px] text-zinc-400">{m.trend7Day}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* ── RIGHT COLUMN (4 COLS) ── */}
        <div className="lg:col-span-4 space-y-6">
          {/* AI Assistant Card */}
          <Card className="p-4 space-y-3 bg-zinc-50/50">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center shrink-0">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-zinc-900">
                  Ask KisanTech Assistant
                </h4>
                <p className="text-[11px] text-zinc-500">
                  Guidance on spraying, dosage, diseases & prices
                </p>
              </div>
            </div>

            <form onSubmit={handleQuickAsk} className="relative">
              <input
                type="text"
                value={quickInput}
                onChange={(e) => setQuickInput(e.target.value)}
                placeholder="Ask about crops, diseases, rates..."
                className="w-full text-xs bg-white border border-zinc-200 rounded-lg pl-3 pr-8 py-2 outline-none focus:border-zinc-300 text-zinc-800 placeholder:text-zinc-400"
              />
              <button
                type="submit"
                aria-label="Send query"
                className="absolute right-2 top-2 text-emerald-700 hover:text-emerald-800 p-0.5"
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </form>

            <div className="space-y-1 pt-1">
              {[
                '💧 How much water for Field 1 today?',
                '🌾 What is Khanna mandi wheat rate?',
                '🐛 Yellow spots on wheat leaves?',
              ].map((prompt, i) => (
                <button
                  key={i}
                  onClick={async () => {
                    setTab('ai_agent');
                    await sendChatMessage(prompt);
                  }}
                  className="w-full text-left text-xs bg-white hover:bg-zinc-100/80 p-2 rounded-lg border border-zinc-200/70 text-zinc-700 transition-colors flex items-center justify-between"
                >
                  <span className="truncate">{prompt}</span>
                  <ArrowUpRight className="h-3 w-3 text-zinc-400 shrink-0 ml-1" />
                </button>
              ))}
            </div>

            <button
              onClick={() => setTab('ai_agent')}
              className="w-full text-center py-2 text-xs font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100/80 rounded-lg transition-colors"
            >
              Open Full Chat & Voice Assistant →
            </button>
          </Card>

          {/* Today's Tasks */}
          <Card className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-700" />
                <h3 className="font-semibold text-xs text-zinc-900">
                  Today&apos;s Action Plan
                </h3>
              </div>
              <button
                onClick={() => navigateToSubScreen('tasks_list')}
                className="text-xs text-emerald-700 hover:underline font-medium"
              >
                All ({tasks.length}) →
              </button>
            </div>

            <div className="space-y-2">
              {pendingTasks.map((t) => (
                <div
                  key={t.id}
                  className="flex items-start gap-2.5 p-2 rounded-lg border border-zinc-100 bg-zinc-50/50"
                >
                  <input
                    type="checkbox"
                    checked={t.isCompleted}
                    onChange={() => toggleTaskComplete(t.id)}
                    className="mt-0.5 h-3.5 w-3.5 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-medium text-xs text-zinc-800 truncate">
                        {t.title}
                      </span>
                      <Badge variant={t.priority === 'HIGH' || t.priority === 'High' ? 'danger' : 'warning'}>
                        {t.priority}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                      {t.targetArea} · {t.whyReason}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Sensor Gateway */}
          <Card className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-xs text-zinc-900">
                KrishiProbe Telemetry
              </span>
              <span className="flex items-center gap-1 text-[11px] text-emerald-700">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                6 Nodes Online
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-lg bg-zinc-50 border border-zinc-100 p-2.5">
                <span className="text-[10px] text-zinc-400 block">Avg Soil Moisture</span>
                <span className="font-semibold text-zinc-800 mt-0.5 block">62% (Good)</span>
              </div>
              <div className="rounded-lg bg-zinc-50 border border-zinc-100 p-2.5">
                <span className="text-[10px] text-zinc-400 block">Root Zone Temp</span>
                <span className="font-semibold text-zinc-800 mt-0.5 block">22.4°C</span>
              </div>
              <div className="rounded-lg bg-zinc-50 border border-zinc-100 p-2.5">
                <span className="text-[10px] text-zinc-400 block">Solar Pump Battery</span>
                <span className="font-semibold text-emerald-700 mt-0.5 block">94% (Charging)</span>
              </div>
              <div className="rounded-lg bg-zinc-50 border border-zinc-100 p-2.5">
                <span className="text-[10px] text-zinc-400 block">Last Synced</span>
                <span className="font-semibold text-zinc-800 mt-0.5 block">2 mins ago</span>
              </div>
            </div>

            <button
              onClick={() => navigateToSubScreen('soil_report')}
              className="w-full text-center text-xs text-emerald-700 hover:underline pt-1 block"
            >
              View Full Soil Health Card →
            </button>
          </Card>

          {/* PMFBY & Scheme Fast-Track */}
          <Card
            onClick={() => navigateToSubScreen('officer_portal')}
            className="cursor-pointer hover:border-zinc-300 transition-colors p-3.5 flex items-center gap-3"
          >
            <div className="w-8 h-8 rounded-lg bg-zinc-100 border border-zinc-200/60 flex items-center justify-center text-zinc-600 shrink-0">
              <FileCheck className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-xs font-medium text-zinc-900 block truncate">
                Crop Damage & PMFBY Claims
              </span>
              <span className="text-[11px] text-zinc-400 block truncate">
                Evidence submission & officer review desk
              </span>
            </div>
            <ChevronRight className="h-4 w-4 text-zinc-400 shrink-0" />
          </Card>
        </div>
      </div>
    </div>
  );
}

export default HomeScreen;
