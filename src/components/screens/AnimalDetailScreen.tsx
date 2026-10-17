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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-zinc-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold text-zinc-900">
              {animal.name}
            </h1>
            <span className="text-xs font-mono font-medium bg-zinc-100 text-zinc-700 px-2 py-0.5 rounded">
              Tag: {animal.tagId}
            </span>
            <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200/60">
              Health {animal.healthScore}%
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            {animal.breed} · {animal.ageYears} Years Old · Location: {animal.barnSection}
          </p>
        </div>

        <button
          onClick={() => navigateToSubScreen('livestock_list')}
          className="rounded-lg border border-zinc-200 bg-white px-3.5 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 shadow-xs"
        >
          ← Back to Herd
        </button>
      </div>

      {/* 2. Main 12-Column Desktop Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 Cols): Animal Profile & Daily Milk Yield Log */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="p-5 border border-zinc-200/80 bg-white space-y-4 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
            <h3 className="font-semibold text-sm text-zinc-900">
              Production & Vital Signs
            </h3>

            <div className="grid grid-cols-3 gap-2 text-center divide-x divide-zinc-100">
              <div>
                <span className="text-[11px] text-zinc-400 font-medium block">Health Index</span>
                <span className="text-xl font-semibold text-zinc-900 mt-0.5 block">{animal.healthScore}%</span>
                <span className="text-[10px] text-emerald-700 block font-medium">Optimal</span>
              </div>

              <div>
                <span className="text-[11px] text-zinc-400 font-medium block">Last Vaccine</span>
                <span className="text-xl font-semibold text-zinc-900 mt-0.5 block">{animal.lastVaccineDaysAgo}d</span>
                <span className="text-[10px] text-zinc-400 block">FMD Booster</span>
              </div>

              <div>
                <span className="text-[11px] text-zinc-400 font-medium block">Daily Yield</span>
                <span className="text-xl font-semibold text-zinc-900 mt-0.5 block">{animal.dailyMilkYield} L</span>
                <span className="text-[10px] text-zinc-400 block">Today</span>
              </div>
            </div>

            {/* Milk Yield Log Form */}
            <form onSubmit={handleSaveYield} className="pt-3 border-t border-zinc-100 space-y-3 text-xs">
              <label className="font-medium text-zinc-700 block">
                Log Milking Session (Liters)
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="0.1"
                  required
                  placeholder="e.g. 17.5"
                  value={inputYield}
                  onChange={(e) => setInputYield(e.target.value)}
                  className="flex-1 rounded-lg border border-zinc-200 bg-white p-2 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                />
                <button
                  type="submit"
                  className="rounded-lg bg-emerald-700 px-4 py-2 text-xs font-medium text-white hover:bg-emerald-800 transition-colors shadow-xs"
                >
                  Save Entry
                </button>
              </div>

              {successMsg && (
                <div className="p-2.5 bg-emerald-50 text-emerald-800 rounded-lg text-xs font-medium flex items-center gap-1.5 border border-emerald-200">
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
          <Card className="p-5 border border-zinc-200/80 bg-white space-y-4 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-sm text-zinc-900">
                  GPS Collar & Geofence Status
                </h3>
                <p className="text-xs text-zinc-500">Collar ID: {animal.trackerDeviceId}</p>
              </div>
              {animal.isInsideFence ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-800 bg-emerald-50 border border-emerald-200/60 px-2.5 py-1 rounded">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                  Inside Perimeter
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-rose-800 bg-rose-50 border border-rose-200/60 px-2.5 py-1 rounded">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  Outside Perimeter
                </span>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs bg-zinc-50 p-3 rounded-lg border border-zinc-100 text-center">
              <div>
                <span className="text-[10px] text-zinc-400 font-medium block">Distance from Barn</span>
                <p className="text-sm font-semibold text-zinc-900 mt-0.5">{animal.distanceFromCenterM} m</p>
              </div>
              <div>
                <span className="text-[10px] text-zinc-400 font-medium block">Geofence Radius</span>
                <p className="text-sm font-semibold text-zinc-900 mt-0.5">{animal.fenceRadiusM} m</p>
              </div>
              <div>
                <span className="text-[10px] text-zinc-400 font-medium block">Battery Level</span>
                <p className="text-sm font-semibold text-zinc-900 mt-0.5">{animal.trackerBatteryPercent}%</p>
              </div>
            </div>

            <span className="text-[11px] text-zinc-400 block">
              Last Telemetry Ping: {animal.lastPingTime} · GPS Fix: Strong
            </span>
          </Card>

          {/* AI Rumination & Health Insight Card */}
          <Card className="p-5 border border-zinc-200/80 bg-white space-y-2 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
            <div className="flex items-center gap-2 text-zinc-900 font-medium text-xs">
              <Sparkles className="h-4 w-4 text-emerald-600" />
              <span>Veterinary & Rumination Insight</span>
            </div>
            <p className="text-xs text-zinc-600 leading-relaxed">
              {animal.insight}
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AnimalDetailScreen;
