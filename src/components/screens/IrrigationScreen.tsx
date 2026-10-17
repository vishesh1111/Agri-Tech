'use client';

import React from 'react';
import { 
  Droplets, Clock, Calendar, Power, AlertCircle, 
  CheckCircle2, ChevronRight, Sliders, Play, Square,
  Settings, Zap, Waves, Sparkles
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { IrrigationZone } from '@/lib/types';
import { useKisanStore } from '@/stores/useKisanStore';

export const IrrigationScreen: React.FC = () => {
  const { 
    irrigationZones, 
    toggleIrrigationZone, 
    navigateToSubScreen 
  } = useKisanStore();

  const totalWaterUsed = irrigationZones.reduce((acc, z) => acc + (z.waterUsedLiters || 0), 0);
  const activeZonesCount = irrigationZones.filter(z => z.isRunning).length;

  return (
    <div className="space-y-6">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-zinc-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
              <Droplets className="h-5 w-5" />
            </span>
            <h1 className="text-xl font-semibold text-zinc-900">
              Irrigation & Water Management
            </h1>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Sensor-driven scheduling, soil moisture tracking, and motorized valve controls
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateToSubScreen('crop_water_advisor')}
            className="flex items-center gap-2 rounded-lg bg-blue-700 hover:bg-blue-800 hover:-translate-y-0.5 active:scale-95 px-3.5 py-2 text-xs font-semibold text-white transition-all duration-200 shadow-xs cursor-pointer"
          >
            <Waves className="w-3.5 h-3.5 animate-pulse-subtle" />
            <span>Visual Water Advisor</span>
          </button>

          <button
            onClick={() => navigateToSubScreen('irrigation_schedule')}
            className="flex items-center gap-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 hover:-translate-y-0.5 active:scale-95 px-3.5 py-2 text-xs font-medium text-white transition-all duration-200 shadow-xs cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Configure Schedule</span>
          </button>
        </div>
      </div>

      {/* 2. Top Telemetry Cards (3 Columns) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5 border border-zinc-200/80 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-md hover:border-emerald-300 transition-all duration-200">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-medium text-zinc-500">
                Active Valves
              </span>
              <p className="text-2xl font-semibold text-zinc-900 mt-1">
                {activeZonesCount} of {irrigationZones.length}
              </p>
              <span className="text-[11px] text-zinc-400 mt-1 block">
                Motorized valves open
              </span>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
              <Droplets className="h-5 w-5" />
            </div>
          </div>
        </Card>

        <Card className="p-5 border border-zinc-200/80 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-md hover:border-zinc-300 transition-all duration-200">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-medium text-zinc-500">
                Water Delivered (Today)
              </span>
              <p className="text-2xl font-semibold text-zinc-900 mt-1">
                {totalWaterUsed.toLocaleString()} <span className="text-xs font-normal text-zinc-400">L</span>
              </p>
              <span className="text-[11px] text-zinc-400 mt-1 block">
                28% savings vs flood method
              </span>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-100 text-zinc-700">
              <Zap className="h-5 w-5" />
            </div>
          </div>
        </Card>

        <Card className="p-5 border border-zinc-200/80 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-md hover:border-zinc-300 transition-all duration-200">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-medium text-zinc-500">
                Moisture Deficit (FAO-56)
              </span>
              <p className="text-2xl font-semibold text-zinc-900 mt-1">
                -4.2 mm
              </p>
              <span className="text-[11px] text-zinc-400 mt-1 block">
                Adequate root zone reserves
              </span>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-100 text-zinc-700">
              <Clock className="h-5 w-5" />
            </div>
          </div>
        </Card>
      </div>

      {/* 2.5 Visual Crop Water Advisor Feature Card */}
      <div 
        onClick={() => navigateToSubScreen('crop_water_advisor')}
        className="bg-gradient-to-r from-blue-900 via-sky-900 to-indigo-950 text-white rounded-xl p-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:shadow-xl hover:-translate-y-1 active:scale-[0.99] transition-all duration-300 border border-blue-800 group"
      >
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20 shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
            <Waves className="w-5 h-5 text-sky-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-white group-hover:text-sky-200 transition-colors">
                Interactive Crop Water Depth & Root Visualizer
              </h4>
              <span className="bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
                Interactive Model
              </span>
            </div>
            <p className="text-xs text-blue-100/80 mt-0.5">
              Input crop & soil details to see the exact minimum irrigation level (cm) with an animated cross-section
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-semibold text-white bg-white/10 group-hover:bg-white/20 px-3.5 py-2 rounded-lg border border-white/20 shrink-0 justify-center group-hover:scale-105 transition-all duration-200">
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>Launch Visualizer</span>
          <ChevronRight className="w-4 h-4 ml-0.5 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>

      {/* 3. Automation Schedule Banner */}
      <div 
        onClick={() => navigateToSubScreen('irrigation_schedule')}
        className="bg-zinc-50 border border-zinc-200/80 rounded-xl p-4 flex items-center justify-between cursor-pointer hover:bg-zinc-100/60 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-zinc-900 text-white flex items-center justify-center shadow-xs">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-zinc-900">
              Automated Schedule Active
            </h4>
            <p className="text-xs text-zinc-500 mt-0.5">
              Mon, Wed, Fri at 05:30 AM (45 min cycle) · Auto-skips if rain forecast exceeds 5mm
            </p>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-zinc-400" />
      </div>

      {/* 4. Irrigation Zones (3-Column Desktop Grid) */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-zinc-600 uppercase tracking-wider">
          Field Irrigation Zones ({irrigationZones.length})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {irrigationZones.map((zone) => (
            <Card key={zone.id} className="p-4 border border-zinc-200/80 bg-white space-y-3 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold text-zinc-900">
                      {zone.name}
                    </h4>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded ${
                      zone.isRunning 
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/60' 
                        : 'bg-zinc-100 text-zinc-600'
                    }`}>
                      {zone.isRunning ? 'Active' : 'Standby'}
                    </span>
                  </div>
                  <span className="text-xs text-zinc-500 mt-0.5 block">
                    {zone.cropName} · Flow: {zone.flowRateLpm || 45} LPM
                  </span>
                </div>

                <button
                  onClick={() => toggleIrrigationZone(zone.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
                    zone.isRunning
                      ? 'bg-rose-700 hover:bg-rose-800 text-white'
                      : 'bg-emerald-700 hover:bg-emerald-800 text-white'
                  }`}
                >
                  {zone.isRunning ? (
                    <>
                      <Square className="w-3 h-3 fill-current" />
                      <span>Stop</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3 h-3 fill-current" />
                      <span>Start</span>
                    </>
                  )}
                </button>
              </div>

              {/* Moisture Gauge */}
              <div className="space-y-1.5 pt-1 border-t border-zinc-100">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-500">Soil Moisture</span>
                  <span className="font-semibold text-zinc-900">
                    {zone.currentMoisture ?? zone.soilMoisture ?? 55}%
                  </span>
                </div>
                <div className="w-full bg-zinc-100 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${
                      (zone.currentMoisture ?? zone.soilMoisture ?? 55) < 40 
                        ? 'bg-amber-500' 
                        : 'bg-emerald-600'
                    }`}
                    style={{ width: `${Math.min(zone.currentMoisture ?? zone.soilMoisture ?? 55, 100)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-[11px] text-zinc-400">
                  <span>Target: {zone.targetMoisture ?? 65}%</span>
                  <span>{zone.isRunning ? `${zone.remainingMinutes} min left` : `Next: ${zone.scheduledTime}`}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default IrrigationScreen;
