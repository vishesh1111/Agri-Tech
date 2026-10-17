'use client';

import React from 'react';
import { 
  Droplets, Clock, Calendar, Power, AlertCircle, 
  CheckCircle2, ChevronRight, Sliders, Play, Square,
  Settings, Zap
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-xs">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-gray-900 dark:text-zinc-100 flex items-center gap-2">
            <span>💧</span>
            <span>Minimum Water Irrigation Engine</span>
          </h1>
          <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
            Sensor-driven precision scheduling, solar pump telemetry & automated motorized valve controls
          </p>
        </div>

        <button
          onClick={() => navigateToSubScreen('irrigation_schedule')}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition-all active:scale-95"
        >
          <Settings className="w-4 h-4" />
          <span>Configure Automation Schedule</span>
        </button>
      </div>

      {/* 2. Top Telemetry Cards (3 Columns) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5 border border-blue-200 dark:border-blue-900/60 bg-blue-50/50 dark:bg-blue-950/20">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-800 dark:text-blue-400">
                Pumps & Valves Active
              </span>
              <p className="text-3xl font-black text-blue-700 dark:text-blue-300 mt-1">
                {activeZonesCount} / {irrigationZones.length}
              </p>
              <span className="text-[11px] text-blue-600 font-semibold block mt-1">
                Motorized valves open
              </span>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 dark:bg-blue-900 text-blue-600">
              <Droplets className="h-6 w-6" />
            </div>
          </div>
        </Card>

        <Card className="p-5 border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/20">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
                Estimated Water Used
              </span>
              <p className="text-3xl font-black text-emerald-700 dark:text-emerald-300 mt-1">
                {totalWaterUsed.toLocaleString()} <span className="text-sm font-normal text-gray-500">Liters</span>
              </p>
              <span className="text-[11px] text-emerald-600 font-semibold block mt-1">
                28% savings vs flood irrigation
              </span>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-900 text-emerald-600">
              <Zap className="h-6 w-6" />
            </div>
          </div>
        </Card>

        <Card className="p-5 border border-purple-200 dark:border-purple-900/60 bg-purple-50/50 dark:bg-purple-950/20">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-purple-800 dark:text-purple-400">
                FAO-56 ET0 Soil Deficit
              </span>
              <p className="text-3xl font-black text-purple-700 dark:text-purple-300 mt-1">
                -4.2 mm
              </p>
              <span className="text-[11px] text-purple-600 font-semibold block mt-1">
                Adequate root zone moisture
              </span>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-100 dark:bg-purple-900 text-purple-600">
              <Clock className="h-6 w-6" />
            </div>
          </div>
        </Card>
      </div>

      {/* 3. Autonomous Schedule Banner */}
      <div 
        onClick={() => navigateToSubScreen('irrigation_schedule')}
        className="bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/40 rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:bg-blue-100/60 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-extrabold text-blue-950 dark:text-blue-200">
              Autonomous Smart Irrigation Automation Active
            </h4>
            <p className="text-xs text-blue-700 dark:text-blue-300 mt-0.5">
              Scheduled: Mon, Wed, Fri @ 05:30 AM (45 mins cycle) • Auto-skips if rain forecast exceeds 5mm
            </p>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-blue-600" />
      </div>

      {/* 4. Irrigation Zones (3-Column Desktop Grid) */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
          Field Irrigation Zones & Motorized Valve Actuators ({irrigationZones.length})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {irrigationZones.map((zone) => (
            <Card key={zone.id} className="p-5 border border-gray-200 dark:border-zinc-800 space-y-4 shadow-xs">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-extrabold text-gray-900 dark:text-zinc-100">
                      {zone.name}
                    </h4>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      zone.isRunning 
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 animate-pulse' 
                        : 'bg-gray-100 text-gray-600 dark:bg-zinc-800 dark:text-zinc-400'
                    }`}>
                      {zone.isRunning ? 'IRRIGATING' : 'STOPPED'}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500 mt-0.5 block">
                    {zone.cropName} • Flow: {zone.flowRateLpm || 45} LPM
                  </span>
                </div>

                <button
                  onClick={() => toggleIrrigationZone(zone.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs ${
                    zone.isRunning
                      ? 'bg-rose-600 hover:bg-rose-700 text-white'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  }`}
                >
                  {zone.isRunning ? (
                    <>
                      <Square className="w-3.5 h-3.5 fill-current" />
                      <span>Stop Valve</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Start Valve</span>
                    </>
                  )}
                </button>
              </div>

              {/* Moisture Gauge */}
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500 font-medium">Volumetric Soil Moisture</span>
                  <span className="font-extrabold text-gray-900 dark:text-zinc-100">
                    {zone.currentMoisture ?? zone.soilMoisture ?? 55}%
                  </span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      (zone.currentMoisture ?? zone.soilMoisture ?? 55) < 40 
                        ? 'bg-amber-500' 
                        : (zone.currentMoisture ?? zone.soilMoisture ?? 55) > 80 
                        ? 'bg-blue-600' 
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(zone.currentMoisture ?? zone.soilMoisture ?? 55, 100)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-[11px] text-gray-400">
                  <span>Target: {zone.targetMoisture ?? 65}%</span>
                  <span>{zone.isRunning ? `${zone.remainingMinutes} min remaining` : `Next: ${zone.scheduledTime}`}</span>
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
