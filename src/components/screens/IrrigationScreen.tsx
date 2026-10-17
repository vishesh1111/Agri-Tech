'use client';

import React, { useState } from 'react';
import { 
  Droplets, Clock, Calendar, Power, AlertCircle, 
  ArrowLeft, CheckCircle2, ChevronRight, Sliders, Play, Square,
  Settings
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { IrrigationZone } from '@/lib/types';
import { useKisanStore } from '@/stores/useKisanStore';

export const IrrigationScreen: React.FC = () => {
  const { 
    irrigationZones, 
    toggleIrrigationZone, 
    navigateBack, 
    navigateToSubScreen 
  } = useKisanStore();

  const totalWaterUsed = irrigationZones.reduce((acc, z) => acc + (z.waterUsedLiters || 0), 0);
  const activeZonesCount = irrigationZones.filter(z => z.isRunning).length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20">
      {/* Top Header */}
      <div className="bg-gradient-to-r from-emerald-700 to-green-700 text-white px-4 pt-4 pb-5 shadow-md">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <button 
              onClick={navigateBack}
              className="p-1.5 rounded-full hover:bg-white/10 active:bg-white/20 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold flex items-center gap-2">
                <Droplets className="w-5 h-5 text-blue-300" />
                Minimum Water Irrigation
              </h1>
              <p className="text-xs text-emerald-100">Sensor-driven precision scheduling & valve control</p>
            </div>
          </div>

          <button
            onClick={() => navigateToSubScreen('irrigation_schedule')}
            className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white transition-colors"
            title="Set Irrigation Schedule"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* System Status Hero Card */}
        <Card className="p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              System Telemetry
            </span>
            <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Pumps Online
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-slate-50 dark:bg-slate-800 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 block font-medium">Active Valves</span>
              <span className="text-base font-extrabold text-slate-800 dark:text-slate-100">
                {activeZonesCount} / {irrigationZones.length}
              </span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 block font-medium">Est. Water Used</span>
              <span className="text-base font-extrabold text-blue-600">
                {totalWaterUsed.toLocaleString()} <span className="text-[10px] font-normal text-slate-400">L</span>
              </span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 block font-medium">AI ET0 Deficit</span>
              <span className="text-base font-extrabold text-emerald-600">
                Low (-4mm)
              </span>
            </div>
          </div>
        </Card>

        {/* Quick Schedule Prompt */}
        <div 
          onClick={() => navigateToSubScreen('irrigation_schedule')}
          className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/40 rounded-xl p-3 flex items-center justify-between cursor-pointer hover:bg-blue-100/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-blue-950 dark:text-blue-200">Autonomous Schedule Configured</h4>
              <p className="text-[11px] text-blue-700 dark:text-blue-300">Mon, Wed, Fri @ 05:30 AM (45 mins)</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-blue-600" />
        </div>

        {/* Zones List */}
        <div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-3">
            Irrigation Zones & Motorized Valves
          </h3>

          <div className="space-y-3">
            {irrigationZones.map(zone => (
              <Card key={zone.id} className="p-4 shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">{zone.name}</h4>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        zone.isRunning 
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300' 
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}>
                        {zone.isRunning ? 'IRRIGATING' : 'STOPPED'}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500">{zone.cropName} • Flow Rate: {zone.flowRateLpm || 45} LPM</span>
                  </div>

                  <button
                    onClick={() => toggleIrrigationZone(zone.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm ${
                      zone.isRunning
                        ? 'bg-rose-600 hover:bg-rose-700 text-white'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    }`}
                  >
                    {zone.isRunning ? (
                      <>
                        <Square className="w-3.5 h-3.5 fill-current" />
                        Stop
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" />
                        Start
                      </>
                    )}
                  </button>
                </div>

                {/* Moisture Gauge */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500 font-medium">Volumetric Soil Moisture</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{zone.currentMoisture ?? zone.soilMoisture ?? 55}%</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
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
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Target: {zone.targetMoisture ?? 65}%</span>
                    <span>{zone.isRunning ? `${zone.remainingMinutes} min remaining` : `Next: ${zone.scheduledTime}`}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
export default IrrigationScreen;
