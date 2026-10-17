'use client';

import React, { useState } from 'react';
import { 
  Heart, ArrowLeft, Shield, MapPin, Battery, Activity, 
  Calendar, Clock, CheckCircle2, AlertTriangle, Sparkles, Plus,
  Radio, Droplet
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useKisanStore } from '@/stores/useKisanStore';

export const AnimalDetailScreen: React.FC = () => {
  const { 
    selectedAnimalId, 
    livestock, 
    logMilkYield, 
    navigateToSubScreen 
  } = useKisanStore();

  const [inputYield, setInputYield] = useState('');
  const [successMsg, setSuccessMsg] = useState(false);

  const animal = livestock.find(a => a.id === selectedAnimalId) || livestock[0] || {
    id: 'l_1',
    farmId: 'farm_1',
    name: 'Lakshmi',
    tagId: 'C-04',
    type: 'Cow',
    breed: 'Sahiwal Dairy',
    ageYears: 4,
    healthScore: 94,
    dailyMilkYield: 16.5,
    lastVaccineDaysAgo: 14,
    nextVaccineName: 'FMD Booster',
    nextVaccineInDays: 45,
    isInsideFence: true,
    distanceFromCenterM: 42,
    fenceRadiusM: 150,
    trackerBatteryPercent: 88,
    trackerDeviceId: 'KisanTrack-BLE-04',
    lastPingTime: '2 mins ago',
    barnSection: 'Barn 1, Stanchion 4',
    insight: 'Milk production +8% above cohort average. Rumination index optimal.'
  };

  const handleSaveYield = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(inputYield);
    if (!isNaN(val) && val > 0) {
      logMilkYield(animal.id, val);
      setSuccessMsg(true);
      setInputYield('');
      setTimeout(() => setSuccessMsg(false), 3000);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-xs">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-gray-900 dark:text-zinc-100 flex items-center gap-2">
              <span>🐄</span>
              <span>{animal.name}</span>
            </h1>
            <span className="text-xs font-mono font-bold bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 px-2.5 py-1 rounded-lg">
              Tag: {animal.tagId}
            </span>
            <Badge variant="success">Health: {animal.healthScore}%</Badge>
          </div>
          <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
            {animal.breed} • {animal.ageYears} Years Old • Stanchion Location: {animal.barnSection}
          </p>
        </div>

        <button
          onClick={() => navigateToSubScreen('livestock_list')}
          className="rounded-xl bg-gray-100 dark:bg-zinc-800 px-4 py-2 text-xs font-bold text-gray-800 dark:text-zinc-200 hover:bg-gray-200"
        >
          ← Back to Herd
        </button>
      </div>

      {/* 2. Main 12-Column Desktop Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 Cols): Animal Profile & Daily Milk Yield Log */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="p-6 border border-gray-200 dark:border-zinc-800 space-y-5">
            <h3 className="font-extrabold text-sm text-gray-900 dark:text-zinc-100">
              Vigour & Milk Production Telemetry
            </h3>

            <div className="grid grid-cols-3 gap-2 text-center divide-x divide-gray-100 dark:divide-zinc-800">
              <div>
                <span className="text-[10px] text-gray-400 font-bold uppercase block">Health Score</span>
                <span className="text-2xl font-black text-emerald-600">{animal.healthScore}%</span>
                <span className="text-[10px] text-emerald-600 block font-semibold">Optimal</span>
              </div>

              <div>
                <span className="text-[10px] text-gray-400 font-bold uppercase block">Last Vaccine</span>
                <span className="text-2xl font-black text-gray-900 dark:text-zinc-100">{animal.lastVaccineDaysAgo}d</span>
                <span className="text-[10px] text-gray-400 block">FMD Booster</span>
              </div>

              <div>
                <span className="text-[10px] text-gray-400 font-bold uppercase block">Daily Yield</span>
                <span className="text-2xl font-black text-emerald-600">{animal.dailyMilkYield} L</span>
                <span className="text-[10px] text-gray-400 block">Today</span>
              </div>
            </div>

            {/* Milk Yield Log Form */}
            <form onSubmit={handleSaveYield} className="pt-3 border-t border-gray-100 dark:border-zinc-800 space-y-3 text-xs">
              <label className="font-bold text-gray-700 dark:text-zinc-300 block">
                Log Today&apos;s Milking Session (Liters)
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="0.1"
                  required
                  placeholder="e.g. 17.5"
                  value={inputYield}
                  onChange={(e) => setInputYield(e.target.value)}
                  className="flex-1 rounded-xl border border-gray-300 p-2.5 dark:border-zinc-700 dark:bg-zinc-800"
                />
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700"
                >
                  Save Milk
                </button>
              </div>

              {successMsg && (
                <div className="p-2.5 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-emerald-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Logged {animal.dailyMilkYield} Liters successfully!</span>
                </div>
              )}
            </form>
          </Card>
        </div>

        {/* Right Column (7 Cols): GPS Geofence & AI Insights */}
        <div className="lg:col-span-7 space-y-6">
          {/* GPS Geofence Card */}
          <Card className="p-6 border border-gray-200 dark:border-zinc-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-sm text-gray-900 dark:text-zinc-100">
                  GPS Collar & Geofence Telemetry
                </h3>
                <p className="text-xs text-gray-500">KisanTrack BLE Collar: {animal.trackerDeviceId}</p>
              </div>
              {animal.isInsideFence ? (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300 px-3 py-1 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  Safe Inside Boundary
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-100 px-3 py-1 rounded-full animate-pulse">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  Outside Permitted Area!
                </span>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs bg-gray-50 dark:bg-zinc-800/60 p-3.5 rounded-xl text-center">
              <div>
                <span className="text-[10px] text-gray-400 font-bold uppercase block">Distance From Barn</span>
                <p className="text-base font-black text-gray-900 dark:text-zinc-100 mt-0.5">{animal.distanceFromCenterM} Meters</p>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 font-bold uppercase block">Geofence Radius</span>
                <p className="text-base font-black text-gray-900 dark:text-zinc-100 mt-0.5">{animal.fenceRadiusM} Meters</p>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 font-bold uppercase block">Battery Level</span>
                <p className="text-base font-black text-emerald-600 mt-0.5">{animal.trackerBatteryPercent}%</p>
              </div>
            </div>

            <span className="text-[11px] text-gray-400 block">
              Last Telemetry Ping: {animal.lastPingTime} • GPS Lock: 8 Satellites
            </span>
          </Card>

          {/* AI Rumination & Health Insight Card */}
          <Card className="p-5 border-2 border-emerald-300 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20 space-y-2">
            <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-300 font-bold text-xs">
              <Sparkles className="h-4 w-4 text-emerald-600" />
              <span>Autonomous Herd AI Insight</span>
            </div>
            <p className="text-xs text-gray-700 dark:text-zinc-300 leading-relaxed">
              {animal.insight}
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AnimalDetailScreen;
