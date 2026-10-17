'use client';

import React, { useState } from 'react';
import { 
  Heart, ArrowLeft, Shield, MapPin, Battery, Activity, 
  Calendar, Clock, CheckCircle2, AlertTriangle, Sparkles, Plus,
  Radio, Droplet, Compass, Navigation
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useKisanStore } from '@/stores/useKisanStore';

export const AnimalDetailScreen: React.FC = () => {
  const { 
    selectedAnimalId, 
    livestock, 
    logMilkYield, 
    navigateToSubScreen,
    addNotification
  } = useKisanStore();

  const [inputYield, setInputYield] = useState('');
  const [successMsg, setSuccessMsg] = useState(false);
  const [simulatedStray, setSimulatedStray] = useState(false);

  const animal = livestock.find(a => a.id === selectedAnimalId) || livestock[0] || {
    id: 'l_1',
    farmId: 'farm_1',
    name: 'Gauri (Gir Cow #01)',
    tagId: 'IN-PB-9012',
    type: 'Cow',
    breed: 'Gir Purebred',
    ageYears: 4,
    healthScore: 94,
    dailyMilkYield: 16.5,
    lastVaccineDaysAgo: 14,
    nextVaccineName: 'FMD Booster',
    nextVaccineInDays: 45,
    isInsideFence: true,
    distanceFromCenterM: 42,
    fenceRadiusM: 150,
    trackerBatteryPercent: 92,
    trackerDeviceId: 'KisanTrack-BLE-01',
    lastPingTime: 'Just now',
    barnSection: 'Barn 1, Stanchion 4',
    insight: 'Milk production +8% above cohort average. Rumination index optimal.'
  };

  const isInside = simulatedStray ? false : animal.isInsideFence;
  const currentDistance = simulatedStray ? 172 : (animal.distanceFromCenterM ?? 42);

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

  const handleToggleSimulation = () => {
    if (!simulatedStray) {
      setSimulatedStray(true);
      addNotification({
        farmId: 'farm_1',
        title: `🚨 GEOFENCE BREACH: ${animal.name}`,
        message: `${animal.name} has moved 172m away from the barn (exceeding 150m perimeter). Check pasture boundary fence!`,
        severity: 'CRITICAL',
        type: 'LIVESTOCK',
      });
    } else {
      setSimulatedStray(false);
      addNotification({
        farmId: 'farm_1',
        title: `✅ Animal Returned: ${animal.name}`,
        message: `${animal.name} is back inside the 150m grazing perimeter (42m from barn).`,
        severity: 'INFO',
        type: 'LIVESTOCK',
      });
    }
  };

  // Radar position math (center at 110, 110 with radius 85 = 150m)
  // Distance scaling: 150m -> 85px
  const scale = 85 / 150;
  const animalDistPx = Math.min(100, currentDistance * scale);
  // Place at angle (35 degrees for inside, or 125 degrees outside)
  const angleRad = simulatedStray ? (140 * Math.PI) / 180 : (38 * Math.PI) / 180;
  const animalX = 110 + animalDistPx * Math.cos(angleRad);
  const animalY = 110 - animalDistPx * Math.sin(angleRad);

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
          className="rounded-lg border border-zinc-200 bg-white px-3.5 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 shadow-xs transition-colors"
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

        {/* Right Column (7 Cols): Virtual GPS Geofence & Radar Map */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="p-5 border border-zinc-200/80 bg-white space-y-4 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Radio className="w-4 h-4 text-emerald-600 animate-pulse" />
                  <h3 className="font-semibold text-sm text-zinc-900">
                    Virtual Pasture Geofence & Collar Telemetry
                  </h3>
                </div>
                <p className="text-xs text-zinc-500 mt-0.5">Collar ID: {animal.trackerDeviceId}</p>
              </div>

              {isInside ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-800 bg-emerald-50 border border-emerald-200/60 px-2.5 py-1 rounded">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping"></span>
                  <span>Inside Perimeter</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-rose-800 bg-rose-50 border border-rose-200/60 px-2.5 py-1 rounded animate-pulse">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  <span>Outside Perimeter (Straying!)</span>
                </span>
              )}
            </div>

            {/* Visual Geofence Radar / Satellite Boundary Canvas */}
            <div className="relative rounded-xl border border-zinc-200 bg-zinc-950 p-4 overflow-hidden flex flex-col items-center justify-center">
              <div className="absolute top-3 left-3 flex items-center gap-2 text-[10px] text-zinc-400 font-mono">
                <Compass className="w-3 h-3 text-emerald-500" />
                <span>LAT: 30.9010° N · LON: 75.8573° E</span>
              </div>

              <div className="absolute top-3 right-3">
                <button
                  onClick={handleToggleSimulation}
                  className={`px-2.5 py-1 rounded text-[10px] font-semibold transition-all ${
                    simulatedStray
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                      : 'bg-rose-900/60 text-rose-200 border border-rose-700 hover:bg-rose-800'
                  }`}
                >
                  {simulatedStray ? '↺ Reset to Grazing Yard' : '⚡ Simulate Breach Alert'}
                </button>
              </div>

              {/* Radar Circles SVG */}
              <div className="w-56 h-56 relative my-2">
                <svg viewBox="0 0 220 220" className="w-full h-full">
                  {/* Outer danger zone ring */}
                  <circle cx="110" cy="110" r="105" fill="none" stroke="#27272a" strokeWidth="1" strokeDasharray="3 3" />
                  
                  {/* 150m Perimeter Fence (Green if inside, Red if breach) */}
                  <circle 
                    cx="110" 
                    cy="110" 
                    r="85" 
                    fill={isInside ? "rgba(16, 185, 129, 0.08)" : "rgba(244, 63, 94, 0.12)"}
                    stroke={isInside ? "#10b981" : "#f43f5e"}
                    strokeWidth="2"
                    strokeDasharray="4 2"
                  />
                  
                  {/* Inner barn zone */}
                  <circle cx="110" cy="110" r="40" fill="none" stroke="#3f3f46" strokeWidth="1" />
                  
                  {/* Crosshairs */}
                  <line x1="110" y1="5" x2="110" y2="215" stroke="#27272a" strokeWidth="1" />
                  <line x1="5" y1="110" x2="215" y2="110" stroke="#27272a" strokeWidth="1" />

                  {/* Barn Center Marker */}
                  <circle cx="110" cy="110" r="5" fill="#f43f5e" />
                  <text x="110" y="125" textAnchor="middle" fill="#a1a1aa" fontSize="9" fontFamily="sans-serif">
                    Main Barn
                  </text>

                  {/* Fence boundary label */}
                  <text x="110" y="32" textAnchor="middle" fill={isInside ? "#10b981" : "#f43f5e"} fontSize="9" fontWeight="bold" fontFamily="sans-serif">
                    150m Geofence Boundary
                  </text>

                  {/* Animal Marker */}
                  <circle 
                    cx={animalX} 
                    cy={animalY} 
                    r="8" 
                    fill={isInside ? "#34d399" : "#fb7185"} 
                    className="animate-pulse"
                  />
                  <circle 
                    cx={animalX} 
                    cy={animalY} 
                    r="14" 
                    fill="none" 
                    stroke={isInside ? "#34d399" : "#fb7185"} 
                    strokeWidth="1.5"
                    opacity="0.6"
                  />
                  <text 
                    x={animalX} 
                    y={animalY - 12} 
                    textAnchor="middle" 
                    fill="#ffffff" 
                    fontSize="10" 
                    fontWeight="bold"
                    fontFamily="sans-serif"
                  >
                    {animal.name.split(' ')[0]} ({currentDistance}m)
                  </text>
                </svg>
              </div>

              <div className="w-full flex items-center justify-between text-[11px] text-zinc-400 pt-2 border-t border-zinc-800 font-mono">
                <span className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${isInside ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                  Status: {isInside ? 'Grazing Inside Boundary' : '⚠️ Pasture Boundary Violated'}
                </span>
                <span>Signal: -68 dBm (Strong)</span>
              </div>
            </div>

            {/* Geofence Telemetry Grid */}
            <div className="grid grid-cols-3 gap-3 text-xs bg-zinc-50 p-3 rounded-lg border border-zinc-100 text-center">
              <div>
                <span className="text-[10px] text-zinc-400 font-medium block">Distance from Barn</span>
                <p className={`text-sm font-semibold mt-0.5 ${isInside ? 'text-zinc-900' : 'text-rose-600 font-bold'}`}>
                  {currentDistance} m
                </p>
              </div>
              <div>
                <span className="text-[10px] text-zinc-400 font-medium block">Perimeter Fence Limit</span>
                <p className="text-sm font-semibold text-zinc-900 mt-0.5">{animal.fenceRadiusM} m</p>
              </div>
              <div>
                <span className="text-[10px] text-zinc-400 font-medium block">Collar Battery</span>
                <p className="text-sm font-semibold text-zinc-900 mt-0.5">{animal.trackerBatteryPercent}%</p>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-1">
              <span>Last Telemetry Ping: {animal.lastPingTime} · Protocol: BLE Long-Range Beacon</span>
              <span className="text-emerald-700 font-medium">GPS Fix: 9 Satellites Locked</span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AnimalDetailScreen;
