'use client';

import React, { useState } from 'react';
import { 
  Heart, ArrowLeft, Shield, MapPin, Battery, Activity, 
  Calendar, Clock, CheckCircle2, AlertTriangle, Sparkles, Plus,
  Radio
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useKisanStore } from '@/stores/useKisanStore';

export const AnimalDetailScreen: React.FC = () => {
  const { 
    selectedAnimalId, 
    livestock, 
    logMilkYield, 
    navigateBack,
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20">
      {/* Top Header */}
      <div className="bg-gradient-to-r from-emerald-700 to-green-700 text-white px-4 pt-4 pb-5 shadow-md">
        <div className="flex items-center gap-3">
          <button 
            onClick={navigateBack}
            className="p-1.5 rounded-full hover:bg-white/10 active:bg-white/20 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <span>{animal.name}</span>
              <span className="text-xs font-normal bg-emerald-800/80 px-2 py-0.5 rounded-md">
                Tag {animal.tagId}
              </span>
            </h1>
            <p className="text-xs text-emerald-100">{animal.breed} • {animal.ageYears} Years Old</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Health & Yield Snapshot */}
        <Card className="p-4 shadow-sm">
          <div className="grid grid-cols-3 gap-2 text-center divide-x divide-slate-100 dark:divide-slate-800">
            <div>
              <span className="text-[10px] text-slate-400 font-semibold block uppercase">Health Score</span>
              <span className="text-xl font-black text-emerald-600">{animal.healthScore}%</span>
              <span className="text-[10px] text-emerald-600 block font-medium">Optimal</span>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 font-semibold block uppercase">Last Vaccine</span>
              <span className="text-xl font-black text-slate-800 dark:text-slate-100">{animal.lastVaccineDaysAgo}d</span>
              <span className="text-[10px] text-slate-500 block">FMD Done</span>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 font-semibold block uppercase">Daily Yield</span>
              <span className="text-xl font-black text-emerald-600">{animal.dailyMilkYield} L</span>
              <span className="text-[10px] text-slate-500 block">Target: 16 L</span>
            </div>
          </div>
        </Card>

        {/* Log Today's Yield */}
        <Card className="p-4 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-2">
            Record Today&apos;s Milk Yield
          </h3>

          {successMsg && (
            <div className="p-2.5 mb-3 bg-emerald-100 text-emerald-800 rounded-lg text-xs font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Milk yield updated successfully!</span>
            </div>
          )}

          <form onSubmit={handleSaveYield} className="flex gap-2">
            <input 
              type="number"
              step="0.1"
              value={inputYield}
              onChange={(e) => setInputYield(e.target.value)}
              placeholder="e.g. 17.2 Liters"
              className="flex-1 text-sm p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 rounded-xl text-xs transition-colors"
            >
              Log Yield
            </button>
          </form>
        </Card>

        {/* GPS Geofence & BLE Tracker */}
        <Card className="p-4 shadow-sm border-l-4 border-l-emerald-600">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                GPS Collar & Geofence
              </h3>
            </div>
            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
              animal.isInsideFence 
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' 
                : 'bg-rose-100 text-rose-800 animate-pulse'
            }`}>
              {animal.isInsideFence ? 'Inside Permitted Area' : 'GEOFENCE BREACH!'}
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Collar ID</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">{animal.trackerDeviceId || 'KisanTrack-BLE-04'}</span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Distance from Barn</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">{animal.distanceFromCenterM || 42} meters (Radius: {animal.fenceRadiusM || 150}m)</span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Collar Battery</span>
              <span className="font-semibold text-emerald-600 flex items-center gap-1">
                <Battery className="w-3.5 h-3.5" />
                {animal.trackerBatteryPercent || 88}%
              </span>
            </div>

            <div className="flex justify-between py-1">
              <span className="text-slate-500">Last Telemetry Ping</span>
              <span className="text-slate-400">{animal.lastPingTime || '2 mins ago'}</span>
            </div>
          </div>
        </Card>

        {/* AI Health Advisory */}
        <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 rounded-xl p-3.5 text-xs flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-emerald-950 dark:text-emerald-200 text-xs mb-1">
              Veterinary AI Insight
            </h4>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              {animal.insight || 'Consistent milk production. Rumination activity indicates optimal fiber digestion. Next FMD booster recommended in 45 days.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
export default AnimalDetailScreen;
