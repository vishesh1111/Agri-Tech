'use client';

import React from 'react';
import {
  CloudSun,
  Stethoscope,
  Droplets,
  Store,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  Sparkles,
  TrendingUp,
  MapPin,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { useKisanStore } from '@/stores/useKisanStore';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export function HomeScreen() {
  const {
    userProfile,
    farms,
    selectedFarmId,
    selectFarm,
    parcels,
    crops,
    marketPrices,
    tasks,
    notifications,
    farmWeather,
    toggleTaskComplete,
    setTab,
    navigateToSubScreen,
    sendChatMessage,
  } = useKisanStore();

  const activeFarm = farms.find((f) => f.id === selectedFarmId) || farms[0];
  const pendingTasks = tasks.filter((t) => !t.isCompleted).slice(0, 3);
  const criticalAlerts = notifications.filter((n) => n.severity === 'CRITICAL' && !n.isRead);

  const quickActions = [
    { label: 'Weather', icon: CloudSun, color: 'bg-sky-500', sub: 'weather_report' },
    { label: 'Crop Doctor', icon: Stethoscope, color: 'bg-emerald-600', sub: 'crop_doctor' },
    { label: 'Irrigation', icon: Droplets, color: 'bg-blue-600', sub: 'irrigation_detail' },
    { label: 'Mandi Rates', icon: Store, color: 'bg-amber-600', action: () => setTab('market') },
    { label: 'Tasks Plan', icon: CheckCircle2, color: 'bg-purple-600', sub: 'tasks_list' },
    { label: 'Livestock', icon: Sparkles, color: 'bg-rose-500', sub: 'livestock_list' },
  ];

  return (
    <div className="space-y-4 pb-20 pt-2">
      {/* 1. Farmer Header & Farm Selector */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-zinc-100">
            Ram Ram, {userProfile?.name?.split(' ')[0] || 'Kisan'} 🙏
          </h2>
          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-zinc-400">
            <MapPin className="h-3.5 w-3.5 text-emerald-600" />
            <span>{activeFarm?.location || `${userProfile?.village}, ${userProfile?.state}`}</span>
          </div>
        </div>

        {farms.length > 1 && (
          <select
            value={selectedFarmId}
            onChange={(e) => selectFarm(e.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
          >
            {farms.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* 2. Critical Weather / Severe Risk Banner */}
      {criticalAlerts.length > 0 && (
        <div
          onClick={() => navigateToSubScreen('notifications')}
          className="cursor-pointer rounded-2xl border border-rose-200 bg-rose-50 p-4 shadow-sm transition-all hover:bg-rose-100/80 dark:border-rose-900/50 dark:bg-rose-950/40"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-rose-500 text-white">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400">
                  Critical Risk Alert
                </span>
                <span className="text-xs font-medium text-rose-600 dark:text-rose-400">
                  {criticalAlerts[0].timeFormatted}
                </span>
              </div>
              <h4 className="text-sm font-bold text-gray-900 dark:text-zinc-100">
                {criticalAlerts[0].title}
              </h4>
              <p className="mt-0.5 text-xs text-gray-600 line-clamp-2 dark:text-zinc-300">
                {criticalAlerts[0].message}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 3. Farm Health Command Center Card */}
      {activeFarm && (
        <Card className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-700 to-green-800 text-white">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-medium uppercase tracking-wider text-emerald-100">
                Farm Command Center
              </span>
              <h3 className="text-lg font-bold">{activeFarm.name}</h3>
              <p className="text-xs text-emerald-100">
                {activeFarm.totalArea} {activeFarm.unit} • {activeFarm.primaryCropOrAnimal}
              </p>
            </div>

            {/* Circular Health Gauge */}
            <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-white/20 ring-4 ring-white/30 backdrop-blur-sm">
              <span className="text-xl font-extrabold">{activeFarm.healthScore}</span>
              <span className="absolute -bottom-1 rounded-full bg-emerald-900 px-1.5 py-0.2 text-[9px] font-bold text-emerald-200">
                /100
              </span>
            </div>
          </div>

          {/* Sub-Score Bars */}
          <div className="mt-4 grid grid-cols-3 gap-2 border-t border-white/15 pt-3 text-center text-xs">
            <div>
              <span className="text-[11px] text-emerald-200">Soil Health</span>
              <p className="font-bold">{activeFarm.soilHealthScore}%</p>
            </div>
            <div className="border-x border-white/15">
              <span className="text-[11px] text-emerald-200">Irrigation</span>
              <p className="font-bold">{activeFarm.waterHealthScore}%</p>
            </div>
            <div>
              <span className="text-[11px] text-emerald-200">Biosecurity</span>
              <p className="font-bold">{activeFarm.pestHealthScore}%</p>
            </div>
          </div>

          <p className="mt-3 text-xs text-emerald-100 line-clamp-1 italic">
            &quot;{activeFarm.healthSummary}&quot;
          </p>
        </Card>
      )}

      {/* 4. Live Weather Quick Bar */}
      {farmWeather && (
        <Card
          onClick={() => navigateToSubScreen('weather_report')}
          className="cursor-pointer hover:border-emerald-300 transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300">
                <CloudSun className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-extrabold text-gray-900 dark:text-zinc-100">
                    {farmWeather.currentTempC}°C
                  </span>
                  <Badge
                    variant={
                      farmWeather.sprayingWindowStatus === 'OPTIMAL'
                        ? 'success'
                        : farmWeather.sprayingWindowStatus === 'CAUTION'
                        ? 'warning'
                        : 'danger'
                    }
                  >
                    Spray: {farmWeather.sprayingWindowStatus}
                  </Badge>
                </div>
                <p className="text-xs text-gray-500 dark:text-zinc-400">
                  {farmWeather.conditionText} • Rain: {farmWeather.rainProbabilityPercent}% • Wind:{' '}
                  {farmWeather.windSpeedKm} km/h
                </p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </div>
        </Card>
      )}

      {/* 5. Quick Action Grid (6 Icons) */}
      <div>
        <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
          Quick Actions
        </h3>
        <div className="grid grid-cols-3 gap-2.5">
          {quickActions.map((qa) => {
            const Icon = qa.icon;
            return (
              <button
                key={qa.label}
                onClick={() => (qa.action ? qa.action() : navigateToSubScreen(qa.sub as any))}
                className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-gray-100 bg-white p-3.5 shadow-sm transition-all hover:scale-102 hover:border-emerald-200 active:scale-95 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-sm ${qa.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <span className="text-xs font-semibold text-gray-800 dark:text-zinc-200 text-center">
                  {qa.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 6. Active Crop Growth Lifecycle Status */}
      {crops.length > 0 && (
        <div>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
              Active Crops ({crops.length})
            </h3>
            <button
              onClick={() => navigateToSubScreen('crop_growth_tracker')}
              className="text-xs font-semibold text-emerald-600 hover:underline dark:text-emerald-400"
            >
              View Lifecycle →
            </button>
          </div>

          <div className="space-y-2">
            {crops.map((c) => (
              <Card
                key={c.id}
                onClick={() => navigateToSubScreen('crop_growth_tracker')}
                className="cursor-pointer hover:border-emerald-300 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-zinc-100">
                      {c.cropName} — <span className="text-xs font-medium text-gray-500">{c.variety}</span>
                    </h4>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                      Stage: {c.growthStage} (Day {c.daysElapsed})
                    </p>
                    <p className="text-[11px] text-gray-500">Harvest: {c.expectedHarvest}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full dark:bg-emerald-950 dark:text-emerald-400">
                      Health: {c.healthScore}%
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* 7. Today's Pending Action Tasks */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
            Action Plan Tasks
          </h3>
          <button
            onClick={() => navigateToSubScreen('tasks_list')}
            className="text-xs font-semibold text-emerald-600 hover:underline dark:text-emerald-400"
          >
            All Tasks ({tasks.length}) →
          </button>
        </div>

        <div className="space-y-2">
          {pendingTasks.map((t) => (
            <Card key={t.id} className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={t.isCompleted}
                onChange={() => toggleTaskComplete(t.id)}
                className="mt-1 h-5 w-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-gray-900 dark:text-zinc-100">
                    {t.title}
                  </span>
                  <Badge variant={t.priority === 'High' ? 'danger' : 'warning'}>
                    {t.priorityLabel || t.priority}
                  </Badge>
                </div>
                <p className="text-xs text-gray-600 line-clamp-1 dark:text-zinc-300">{t.description}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">Area: {t.targetArea} • {t.whyReason}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* 8. Live Mandi Prices Ticker */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
            APMC Mandi Rates
          </h3>
          <button
            onClick={() => setTab('market')}
            className="text-xs font-semibold text-emerald-600 hover:underline dark:text-emerald-400"
          >
            Full Market →
          </button>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {marketPrices.map((m) => (
            <div
              key={m.id}
              onClick={() => setTab('market')}
              className="min-w-[140px] shrink-0 cursor-pointer rounded-xl border border-gray-100 bg-white p-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 hover:border-emerald-300 transition-all"
            >
              <span className="text-[11px] font-semibold text-gray-500 dark:text-zinc-400 block truncate">
                {m.cropName}
              </span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-base font-extrabold text-gray-900 dark:text-zinc-100">
                  ₹{m.pricePerQuintal}
                </span>
                <span className="text-[10px] text-gray-400">/Qtl</span>
              </div>
              <div className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                <TrendingUp className="h-3 w-3" />
                <span>+{m.changePercent}%</span>
              </div>
              <span className="text-[10px] text-gray-400 block truncate mt-0.5">{m.mandiName}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 9. AI Advisor Quick Chat Input */}
      <Card className="bg-gradient-to-r from-emerald-50 via-green-50 to-emerald-100/60 dark:from-emerald-950/30 dark:to-zinc-900 border-emerald-200 dark:border-emerald-900">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shrink-0">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-300">
              Ask KisanAI Advisor
            </h4>
            <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
              Get instant advice on diseases, mandi rates, fertilizer, and weather
            </p>
          </div>
          <button
            onClick={() => setTab('ai_agent')}
            className="flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition-all"
          >
            <span>Ask</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </Card>
    </div>
  );
}

export default HomeScreen;
