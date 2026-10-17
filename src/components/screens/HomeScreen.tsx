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
  Video,
  FlaskConical,
  Radio,
  Users,
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
    livestock,
  } = useKisanStore();

  const [quickInput, setQuickInput] = useState('');

  const activeFarm = farms.find((f) => f.id === selectedFarmId) || farms[0];
  const pendingTasks = tasks.filter((t) => !t.isCompleted).slice(0, 5);
  const criticalAlerts = notifications.filter((n) => n.severity === 'CRITICAL' && !n.isRead);

  // Financial calculations
  const totalIncome = transactions.filter((t) => t.isIncome).reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions.filter((t) => !t.isIncome).reduce((sum, t) => sum + t.amount, 0);
  const netMargin = totalIncome - totalExpense;

  const dashboardModules = [
    {
      id: 'kheticrew_labour',
      title: 'KhetiCrew Labour AI',
      subtitle: 'Overbooking engine, crew relay routes & festival return calendar',
      icon: Users,
      color: 'text-amber-700 bg-amber-50 border-amber-300',
      badge: 'NEW · Port :5173',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-300 font-bold',
      metric: '5 Coordinated Engines Live',
      action: () => navigateToSubScreen('kheticrew_labour'),
    },
    {
      id: 'cctv_monitor',
      title: 'Virtual Fencing AI',
      subtitle: 'Real-time CCTV perimeter radar & automated breach alarms',
      icon: Video,
      color: 'text-rose-600 bg-rose-50 border-rose-200/80',
      badge: 'Live Radar',
      badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
      metric: 'Cam 3 Live · Radar Active',
      action: () => navigateToSubScreen('cctv_monitor'),
    },
    {
      id: 'crop_doctor',
      title: 'Crop Doctor',
      subtitle: 'Instant leaf pathology & targeted treatment protocol',
      icon: Stethoscope,
      color: 'text-emerald-700 bg-emerald-50 border-emerald-200/80',
      badge: 'Vision AI',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      metric: '98% Accuracy · Instant Scan',
      action: () => navigateToSubScreen('crop_doctor'),
    },
    {
      id: 'weather_report',
      title: 'Weather & Spray',
      subtitle: 'Hourly agro-radar, wind suitability & 7-day advisory',
      icon: CloudSun,
      color: 'text-amber-600 bg-amber-50 border-amber-200/80',
      badge: farmWeather?.sprayingWindowStatus === 'OPTIMAL' ? 'Good Spray' : 'Caution',
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
      metric: `${farmWeather?.currentTempC || 30}°C · Wind ${farmWeather?.windSpeedKm || 4} km/h`,
      action: () => navigateToSubScreen('weather_report'),
    },
    {
      id: 'irrigation_detail',
      title: 'Irrigation & Water',
      subtitle: 'Zone valve schedules, soil moisture & ET0 rates',
      icon: Droplets,
      color: 'text-sky-600 bg-sky-50 border-sky-200/80',
      badge: 'Soil 85%',
      badgeColor: 'bg-sky-50 text-sky-700 border-sky-200',
      metric: 'Zone A Active · Drip Cycle',
      action: () => navigateToSubScreen('irrigation_detail'),
    },
    {
      id: 'tasks_list',
      title: 'Farm Tasks',
      subtitle: 'Prioritized agronomic actions & seasonal checklist',
      icon: CheckCircle2,
      color: 'text-indigo-600 bg-indigo-50 border-indigo-200/80',
      badge: `${pendingTasks.length} Pending`,
      badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      metric: '2 High Priority Today',
      action: () => navigateToSubScreen('tasks_list'),
    },
    {
      id: 'livestock_list',
      title: 'Herd & Cattle',
      subtitle: 'Gir cattle registry, lactation metrics & animal health',
      icon: Activity,
      color: 'text-purple-600 bg-purple-50 border-purple-200/80',
      badge: `${livestock.length} Animals`,
      badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
      metric: 'Avg 14.2 L/day · Healthy',
      action: () => navigateToSubScreen('livestock_list'),
    },
    {
      id: 'soil_report',
      title: 'Soil Health Card',
      subtitle: 'N-P-K nutrient analysis, organic carbon & testing',
      icon: FlaskConical,
      color: 'text-teal-600 bg-teal-50 border-teal-200/80',
      badge: 'Score 88%',
      badgeColor: 'bg-teal-50 text-teal-700 border-teal-200',
      metric: 'N: Med · P: High · K: Opt',
      action: () => navigateToSubScreen('soil_report'),
    },
    {
      id: 'market',
      title: 'Mandi & Market',
      subtitle: 'Live APMC mandi rates, MSP benchmarks & price trends',
      icon: Store,
      color: 'text-orange-600 bg-orange-50 border-orange-200/80',
      badge: 'MSP Live',
      badgeColor: 'bg-orange-50 text-orange-700 border-orange-200',
      metric: 'Wheat ₹2,425 · +2.4% today',
      action: () => setTab('market'),
    },
    {
      id: 'crop_growth_tracker',
      title: 'Crop Lifecycle',
      subtitle: 'Growth stage milestones, days to harvest & yield maps',
      icon: Sprout,
      color: 'text-lime-700 bg-lime-50 border-lime-200/80',
      badge: `${crops.length} Active`,
      badgeColor: 'bg-lime-50 text-lime-700 border-lime-200',
      metric: `${crops.map((c) => c.cropName).join(' · ')} in field`,
      action: () => navigateToSubScreen('crop_growth_tracker'),
    },
    {
      id: 'ai_agent',
      title: 'AI Farm Assistant',
      subtitle: 'Voice & multi-lingual farming advisor for diagnosis & schemes',
      icon: Sparkles,
      color: 'text-violet-600 bg-violet-50 border-violet-200/80',
      badge: 'Gemini 2.5',
      badgeColor: 'bg-violet-50 text-violet-700 border-violet-200',
      metric: 'Voice Enabled · 24/7 Desk',
      action: () => setTab('ai_agent'),
    },
    {
      id: 'krishiprobe',
      title: 'IoT Sensor Telemetry',
      subtitle: 'Real-time LoRa sensor nodes, root temp & solar pump status',
      icon: Radio,
      color: 'text-cyan-600 bg-cyan-50 border-cyan-200/80',
      badge: '6 Online',
      badgeColor: 'bg-cyan-50 text-cyan-700 border-cyan-200',
      metric: '62% Moisture · 22.4°C Root',
      action: () => navigateToSubScreen('soil_report'),
    },
    {
      id: 'officer_portal',
      title: 'Schemes & PMFBY',
      subtitle: 'PMFBY crop insurance claims, subsidy tracker & officer desk',
      icon: FileCheck,
      color: 'text-blue-600 bg-blue-50 border-blue-200/80',
      badge: 'Fast-Track',
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
      metric: '1 Claim in Review · ₹45,000',
      action: () => navigateToSubScreen('officer_portal'),
    },
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

      {/* KhetiCrew Labour Intelligence Feature Callout Banner */}
      <div className="bg-gradient-to-r from-amber-600 via-emerald-700 to-teal-800 text-white rounded-xl p-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border border-amber-400/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-white/25 px-2 py-0.5 rounded-full text-white">
                Hackathon Engine Live
              </span>
              <h2 className="text-sm sm:text-base font-bold text-white">
                KhetiCrew: Farm Labour Intelligence Layer
              </h2>
            </div>
            <p className="text-xs text-amber-100 mt-0.5">
              Overbooking Engine, Crew Relay, Labour Pressure Index (LPI), Micro-Shifts, and Festival Calendar.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigateToSubScreen('kheticrew_labour')}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-white text-zinc-900 hover:bg-amber-50 rounded-lg font-bold text-xs shadow-xs transition-colors shrink-0 cursor-pointer"
        >
          <span>Open KhetiCrew Engine</span>
          <ArrowUpRight className="w-4 h-4 text-emerald-700" />
        </button>
      </div>

      {/* 2. Four KPI Metric Box Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Farm Health Score */}
        <Card
          onClick={() => navigateToSubScreen('soil_report')}
          className="p-4 sm:p-5 flex flex-col justify-between cursor-pointer hover:border-zinc-300 hover:shadow-xs transition-all group"
        >
          <div>
            <div className="flex items-center justify-between text-xs text-zinc-500">
              <span className="font-medium group-hover:text-emerald-700 transition-colors">Farm Health Index</span>
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
            <span className="text-emerald-700 font-medium flex items-center gap-0.5">
              <span>Soil card</span>
              <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </span>
          </div>
        </Card>

        {/* KPI 2: Live Weather & Spraying */}
        <Card
          onClick={() => navigateToSubScreen('weather_report')}
          className="p-4 sm:p-5 flex flex-col justify-between cursor-pointer hover:border-zinc-300 hover:shadow-xs transition-all group"
        >
          <div>
            <div className="flex items-center justify-between text-xs text-zinc-500">
              <span className="font-medium group-hover:text-emerald-700 transition-colors">Weather & Spray</span>
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
            <span className="text-emerald-700 font-medium flex items-center gap-0.5">
              <span>Hourly radar</span>
              <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </span>
          </div>
        </Card>

        {/* KPI 3: Cultivated Holdings */}
        <Card
          onClick={() => navigateToSubScreen('crop_growth_tracker')}
          className="p-4 sm:p-5 flex flex-col justify-between cursor-pointer hover:border-zinc-300 hover:shadow-xs transition-all group"
        >
          <div>
            <div className="flex items-center justify-between text-xs text-zinc-500">
              <span className="font-medium group-hover:text-emerald-700 transition-colors">Active Holdings</span>
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
            <span className="text-emerald-700 font-medium flex items-center gap-0.5">
              <span>Lifecycle map</span>
              <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </span>
          </div>
        </Card>

        {/* KPI 4: Financial Balance */}
        <Card
          onClick={() => navigateToSubScreen('finance_dashboard')}
          className="p-4 sm:p-5 flex flex-col justify-between cursor-pointer hover:border-zinc-300 hover:shadow-xs transition-all group"
        >
          <div>
            <div className="flex items-center justify-between text-xs text-zinc-500">
              <span className="font-medium group-hover:text-emerald-700 transition-colors">Operating Net Margin</span>
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
            <span className="text-emerald-700 font-medium flex items-center gap-0.5">
              <span>Ledger & Mandi</span>
              <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </span>
          </div>
        </Card>
      </div>

      {/* 3. Critical Geofence / Security Alert (if active) */}
      {criticalAlerts.length > 0 && (
        <div
          onClick={() => navigateToSubScreen('cctv_monitor')}
          className="group relative flex items-center justify-between p-4.5 sm:p-5 rounded-2xl border border-rose-200/90 bg-rose-50/70 hover:bg-rose-50 hover:border-rose-300 hover:shadow-xs transition-all duration-200 cursor-pointer"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-rose-100 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <ShieldAlert className="h-5 w-5 animate-pulse" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-rose-900 uppercase tracking-wide">
                  {criticalAlerts[0].title}
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200">
                  {criticalAlerts[0].timeFormatted}
                </span>
              </div>
              <p className="text-xs text-rose-800 mt-0.5 leading-relaxed truncate sm:whitespace-normal">
                {criticalAlerts[0].message}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0 pl-3">
            <span className="hidden sm:inline text-xs font-semibold text-rose-700 group-hover:underline">Inspect Radar</span>
            <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
              <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </div>
        </div>
      )}

      {/* 4. Primary Farm Operations & Modules (Full-Width Box Layout Grid) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
            <h2 className="text-xs font-bold text-zinc-800 uppercase tracking-wider">
              Farm Operations & Core Modules
            </h2>
          </div>
          <button
            onClick={() => setTab('more')}
            className="inline-flex items-center gap-1 text-xs text-emerald-700 hover:text-emerald-800 font-semibold transition-colors cursor-pointer"
          >
            <span>All 22 tools & services</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {dashboardModules.map((module) => {
            const Icon = module.icon;
            return (
              <div
                key={module.id}
                onClick={module.action}
                className="group relative flex flex-col justify-between p-4.5 sm:p-5 rounded-2xl border border-zinc-200/80 bg-white hover:border-emerald-400 hover:shadow-[0_8px_24px_rgba(16,185,129,0.1)] hover:-translate-y-1 active:scale-[0.98] transition-all duration-200 cursor-pointer text-left shadow-[0_1px_3px_rgba(0,0,0,0.02)] min-h-[135px]"
              >
                {/* Top Row: Branded Logo Box & Redirect Arrow */}
                <div className="flex items-start justify-between gap-3">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${module.color} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-2`}>
                    <Icon className="h-5 w-5" />
                  </div>

                  <div className="flex items-center gap-1.5">
                    {module.badge && (
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border transition-transform duration-200 ${module.badgeColor}`}>
                        {module.badge}
                      </span>
                    )}
                    <div className="w-7 h-7 rounded-lg bg-zinc-50 group-hover:bg-emerald-50 text-zinc-400 group-hover:text-emerald-700 flex items-center justify-center transition-all duration-200">
                      <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
                    </div>
                  </div>
                </div>

                {/* Middle: Title */}
                <div className="mt-3">
                  <h3 className="text-sm sm:text-base font-bold text-zinc-900 tracking-tight group-hover:text-emerald-800 transition-colors">
                    {module.title}
                  </h3>
                </div>

                {/* Bottom: Live Telemetry Indicator Strip */}
                <div className="mt-3.5 pt-2.5 border-t border-zinc-100 flex items-center justify-between text-[11px] text-zinc-400 font-medium">
                  <span className="truncate">{module.metric}</span>
                  <span className="text-emerald-700 font-semibold group-hover:translate-x-0.5 transition-transform shrink-0 ml-1">
                    Open →
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Live Operations & Deep Dives (Box Layout System) */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
            <h2 className="text-xs font-bold text-zinc-800 uppercase tracking-wider">
              Live Farm Operations & Intelligence
            </h2>
          </div>
          <span className="text-xs text-zinc-400 font-medium hidden sm:inline">
            Real-time activity logs, APMC yard prices & IoT telemetry
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Box Card 1: Today's Action Plan */}
          <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-xs flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-200/70 text-indigo-600 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-zinc-900">
                      Today&apos;s Action Plan
                    </h3>
                    <p className="text-[11px] text-zinc-500">
                      Agronomic tasks scheduled for today
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => navigateToSubScreen('tasks_list')}
                  className="inline-flex items-center gap-1 text-xs text-emerald-700 hover:text-emerald-800 font-semibold transition-colors cursor-pointer"
                >
                  <span>All ({tasks.length})</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="mt-4 space-y-2">
                {pendingTasks.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-start gap-3 p-3 rounded-xl border border-zinc-100 bg-zinc-50/60 hover:bg-zinc-50 transition-colors"
                  >
                    <button
                      type="button"
                      onClick={() => toggleTaskComplete(t.id)}
                      className={`mt-0.5 h-4.5 w-4.5 rounded-md border flex items-center justify-center transition-all shrink-0 cursor-pointer ${
                        t.isCompleted
                          ? 'bg-emerald-600 border-emerald-600 text-white shadow-2xs'
                          : 'border-zinc-300 bg-white hover:border-emerald-500 hover:bg-emerald-50/40'
                      }`}
                      aria-label={t.isCompleted ? 'Mark incomplete' : 'Mark complete'}
                    >
                      {t.isCompleted && <Check className="h-3 w-3 stroke-[3]" />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-xs text-zinc-800 truncate">
                          {t.title}
                        </span>
                        <Badge variant={t.priority === 'HIGH' || t.priority === 'High' ? 'danger' : 'warning'}>
                          {t.priority}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-zinc-500 truncate mt-0.5">
                        {t.targetArea} · {t.whyReason}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => navigateToSubScreen('tasks_list')}
              className="w-full text-center py-2.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100/70 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>Open Farm Tasks Desk</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Box Card 2: Ask KisanTech Assistant */}
          <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-xs flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200/70 text-emerald-700 flex items-center justify-center shrink-0">
                    <Sparkles className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-zinc-900">
                      Ask KisanTech Assistant
                    </h3>
                    <p className="text-[11px] text-zinc-500">
                      Guidance on spraying, dosage, diseases & prices
                    </p>
                  </div>
                </div>
                <Badge variant="primary">Gemini 2.5</Badge>
              </div>

              <form onSubmit={handleQuickAsk} className="relative mt-4">
                <input
                  type="text"
                  value={quickInput}
                  onChange={(e) => setQuickInput(e.target.value)}
                  placeholder="Ask about crops, diseases, rates..."
                  className="w-full text-xs bg-zinc-50/70 border border-zinc-200 rounded-xl pl-3.5 pr-9 py-2.5 outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/15 text-zinc-800 placeholder:text-zinc-400 transition-all duration-200"
                />
                <button
                  type="submit"
                  aria-label="Send query"
                  className="absolute right-2.5 top-2.5 text-emerald-700 hover:text-emerald-800 p-0.5 hover:scale-110 active:scale-90 transition-transform cursor-pointer"
                >
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </form>

              <div className="space-y-1.5 mt-3">
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
                    className="w-full text-left text-xs bg-zinc-50/60 hover:bg-emerald-50/70 hover:border-emerald-300 p-2.5 rounded-xl border border-zinc-200/70 text-zinc-700 transition-all duration-200 flex items-center justify-between cursor-pointer group"
                  >
                    <span className="truncate group-hover:text-emerald-900 transition-colors font-medium">{prompt}</span>
                    <ArrowUpRight className="h-3 w-3 text-zinc-400 group-hover:text-emerald-700 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0 ml-1" />
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setTab('ai_agent')}
              className="w-full text-center py-2.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100/80 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>Open Full Chat & Voice Assistant</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Box Card 3: Standing Crops & Lifecycle */}
          <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-xs flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-lime-50 border border-lime-200/70 text-lime-700 flex items-center justify-center shrink-0">
                    <Sprout className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-zinc-900">
                      Standing Crops & Lifecycle
                    </h3>
                    <p className="text-[11px] text-zinc-500">
                      Active crops, stage timelines & target yields
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => navigateToSubScreen('crop_growth_tracker')}
                  className="inline-flex items-center gap-1 text-xs text-emerald-700 hover:text-emerald-800 font-semibold transition-colors cursor-pointer"
                >
                  <span>View Timeline</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {crops.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => navigateToSubScreen('crop_growth_tracker')}
                    className="p-3.5 rounded-xl border border-zinc-100 bg-zinc-50/60 hover:bg-zinc-50 hover:border-zinc-300 transition-all cursor-pointer space-y-2.5 group"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs text-zinc-900 group-hover:text-emerald-700 transition-colors">
                            {c.cropName}
                          </span>
                          <span className="text-[11px] text-zinc-500">({c.variety})</span>
                        </div>
                        <p className="text-[11px] text-zinc-500 mt-0.5">
                          {c.growthStage} · Day {c.daysElapsed}
                        </p>
                      </div>
                      <Badge variant="success">
                        {c.healthScore}% health
                      </Badge>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] text-zinc-400">
                        <span>Sowing</span>
                        <span>Harvest: {c.expectedHarvest}</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-zinc-200/80 overflow-hidden">
                        <div
                          className="h-full bg-emerald-600 rounded-full"
                          style={{ width: `${Math.min(100, Math.round((c.daysElapsed / 120) * 100))}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-2 border-t border-zinc-200/60">
                      <span>Target: <strong>{c.expectedYield ?? c.expectedYieldPerAcre ?? 24} Qtl/Acre</strong></span>
                      <span className="text-emerald-700 font-semibold flex items-center gap-0.5">
                        <span>Details</span>
                        <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => navigateToSubScreen('crop_growth_tracker')}
              className="w-full text-center py-2.5 text-xs font-semibold text-lime-800 bg-lime-50 hover:bg-lime-100/70 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>Explore Crop Growth Tracker</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Box Card 4: Live APMC Mandi Rates */}
          <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-xs flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-orange-50 border border-orange-200/70 text-orange-700 flex items-center justify-center shrink-0">
                    <Store className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-zinc-900">
                      Live APMC Mandi Rates
                    </h3>
                    <p className="text-[11px] text-zinc-500">
                      Government regulated rates from nearby yards
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setTab('market')}
                  className="inline-flex items-center gap-1 text-xs text-emerald-700 hover:text-emerald-800 font-semibold transition-colors cursor-pointer"
                >
                  <span>Full Mandi Desk</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-zinc-200 text-zinc-400 text-[11px] font-medium">
                      <th className="pb-2">Commodity</th>
                      <th className="pb-2">Mandi</th>
                      <th className="pb-2">Dist</th>
                      <th className="pb-2 text-right">Modal Price</th>
                      <th className="pb-2 text-right">24h</th>
                      <th className="pb-2 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {marketPrices.slice(0, 4).map((m) => (
                      <tr
                        key={m.id}
                        onClick={() => setTab('market')}
                        className="cursor-pointer hover:bg-emerald-50/50 transition-colors group"
                      >
                        <td className="py-2.5 font-bold text-zinc-900 group-hover:text-emerald-800 transition-colors">
                          {m.cropName}
                        </td>
                        <td className="py-2.5 text-zinc-600">
                          {m.mandiName}
                        </td>
                        <td className="py-2.5 text-zinc-400">
                          {m.distanceKm} km
                        </td>
                        <td className="py-2.5 text-right font-bold text-zinc-900">
                          ₹{m.pricePerQuintal.toLocaleString()}
                        </td>
                        <td className="py-2.5 text-right font-semibold text-emerald-700">
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
            </div>

            <button
              onClick={() => setTab('market')}
              className="w-full text-center py-2.5 text-xs font-semibold text-orange-800 bg-orange-50 hover:bg-orange-100/70 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>View All Regional Yard Rates</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Box Card 5: KrishiProbe IoT Sensor Telemetry */}
          <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-xs flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-cyan-50 border border-cyan-200/70 text-cyan-700 flex items-center justify-center shrink-0">
                    <Radio className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-zinc-900">
                      KrishiProbe IoT Telemetry
                    </h3>
                    <p className="text-[11px] text-zinc-500">
                      Live LoRa field sensor network telemetry
                    </p>
                  </div>
                </div>
                <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  6 Nodes Online
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2.5 text-xs">
                <div className="rounded-xl bg-zinc-50 border border-zinc-100 p-3">
                  <span className="text-[10px] text-zinc-400 block font-medium">Avg Soil Moisture</span>
                  <span className="font-bold text-zinc-800 text-sm mt-0.5 block">62% (Optimal)</span>
                </div>
                <div className="rounded-xl bg-zinc-50 border border-zinc-100 p-3">
                  <span className="text-[10px] text-zinc-400 block font-medium">Root Zone Temp</span>
                  <span className="font-bold text-zinc-800 text-sm mt-0.5 block">22.4°C</span>
                </div>
                <div className="rounded-xl bg-zinc-50 border border-zinc-100 p-3">
                  <span className="text-[10px] text-zinc-400 block font-medium">Solar Pump Battery</span>
                  <span className="font-bold text-emerald-700 text-sm mt-0.5 block">94% (Charging)</span>
                </div>
                <div className="rounded-xl bg-zinc-50 border border-zinc-100 p-3">
                  <span className="text-[10px] text-zinc-400 block font-medium">Last Mesh Sync</span>
                  <span className="font-bold text-zinc-800 text-sm mt-0.5 block">2 mins ago</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigateToSubScreen('soil_report')}
              className="w-full text-center py-2.5 text-xs font-semibold text-cyan-800 bg-cyan-50 hover:bg-cyan-100/70 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>View Full Soil Health Card & Probe Logs</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Box Card 6: PMFBY Claims & Schemes Desk */}
          <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-xs flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200/70 text-blue-700 flex items-center justify-center shrink-0">
                    <FileCheck className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-zinc-900">
                      Crop Damage & PMFBY Claims
                    </h3>
                    <p className="text-[11px] text-zinc-500">
                      Evidence submission & officer review desk
                    </p>
                  </div>
                </div>
                <Badge variant="primary">Fast-Track</Badge>
              </div>

              <div className="mt-4 p-3.5 rounded-xl border border-blue-100 bg-blue-50/50 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-blue-900">Claim #PMFBY-2026-PB-84</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200">
                    Loss Assessed
                  </span>
                </div>
                <p className="text-[11px] text-blue-800 leading-relaxed">
                  Wheat Field 2 localized waterlogging assessment complete. Recommended compensation: <strong>₹45,000</strong>.
                </p>
                <div className="text-[10px] text-blue-600 flex items-center justify-between pt-1">
                  <span>Assigned: Agriculture Officer Ludhiana</span>
                  <span>Awaiting Treasury Release</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigateToSubScreen('officer_portal')}
              className="w-full text-center py-2.5 text-xs font-semibold text-blue-800 bg-blue-50 hover:bg-blue-100/70 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>Open PMFBY Claims & Evidence Portal</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomeScreen;
