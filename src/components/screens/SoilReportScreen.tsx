'use client';

import React, { useState } from 'react';
import { 
  FlaskConical, CheckCircle2, AlertTriangle, 
  Lightbulb, Droplets, Info, ChevronRight, Share2, Download,
  Sprout, FileText
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useKisanStore } from '@/stores/useKisanStore';
import { LandParcel } from '@/lib/types';

export const SoilReportScreen: React.FC = () => {
  const { parcels, farms, navigateToSubScreen } = useKisanStore();

  const [selectedParcelId, setSelectedParcelId] = useState<string>(parcels[0]?.id || 'parcel_1');

  const selectedParcel = parcels.find((p: LandParcel) => p.id === selectedParcelId) || parcels[0] || {
    id: 'parcel_1',
    farmId: 'farm_1',
    name: 'North Plot (Wheat Field)',
    areaAcres: 4.5,
    soilType: 'Alluvial Loam',
    soilMoisturePercent: 68,
    nitrogenPpm: 240,
    phosphorusPpm: 38,
    potassiumPpm: 120,
    phLevel: 7.2,
    organicMatterPercent: 1.1,
    verifiedSampleDate: 'Oct 15, 2026',
    overallSoilScore: 82
  };

  const getStatusColor = (val: number, low: number, high: number) => {
    if (val < low) return { text: 'Low Deficit', color: 'text-amber-700 bg-amber-100 border-amber-300 dark:bg-amber-950 dark:text-amber-300' };
    if (val > high) return { text: 'High Excess', color: 'text-rose-700 bg-rose-100 border-rose-300 dark:bg-rose-950 dark:text-rose-300' };
    return { text: 'Optimal', color: 'text-emerald-700 bg-emerald-100 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300' };
  };

  const nStatus = getStatusColor(selectedParcel.nitrogenPpm || 240, 280, 560);
  const pStatus = getStatusColor(selectedParcel.phosphorusPpm || 38, 25, 50);
  const kStatus = getStatusColor(selectedParcel.potassiumPpm || 120, 150, 300);
  const ocStatus = getStatusColor(selectedParcel.organicMatterPercent || 1.1, 0.75, 1.5);

  return (
    <div className="space-y-6">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-xs">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-gray-900 dark:text-zinc-100 flex items-center gap-2">
            <span>🧪</span>
            <span>Soil Health Card & Physicochemical Profile</span>
          </h1>
          <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
            Government laboratory accredited soil macronutrient (NPK) tests, pH balance & organic carbon index
          </p>
        </div>

        <button
          onClick={() => alert('Downloading official Soil Health Card (PDF)...')}
          className="flex items-center gap-2 rounded-xl bg-gray-100 dark:bg-zinc-800 px-4 py-2.5 text-xs font-bold text-gray-800 dark:text-zinc-200 hover:bg-gray-200 transition-colors"
        >
          <Download className="h-4 w-4 text-emerald-600" />
          <span>Download Official Card</span>
        </button>
      </div>

      {/* 2. Parcel Selection Chips */}
      {parcels.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {parcels.map((p: LandParcel) => (
            <button
              key={p.id}
              onClick={() => setSelectedParcelId(p.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
                selectedParcel.id === p.id
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 border border-gray-200 dark:border-zinc-700 hover:bg-gray-50'
              }`}
            >
              <Sprout className="h-3.5 w-3.5" />
              <span>{p.name}</span>
            </button>
          ))}
        </div>
      )}

      {/* 3. Main 12-Column Desktop Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (4 Cols): Overall Score Gauge & AI Recommendation */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="p-6 text-center border-2 border-emerald-300 dark:border-emerald-900/60 shadow-xs space-y-4">
            <div className="w-32 h-32 mx-auto rounded-full bg-emerald-50 dark:bg-emerald-950/40 border-4 border-emerald-500 flex flex-col items-center justify-center shadow-inner">
              <span className="text-4xl font-black text-emerald-700 dark:text-emerald-400">
                {selectedParcel.overallSoilScore || 82}
              </span>
              <span className="text-[10px] uppercase font-bold text-emerald-600">out of 100</span>
            </div>

            <div>
              <h3 className="text-lg font-black text-emerald-700 dark:text-emerald-400">
                Soil Health Index: Grade A (Good)
              </h3>
              <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1 leading-relaxed">
                Texture: <strong>{selectedParcel.soilType}</strong> • Sample Verified: {selectedParcel.verifiedSampleDate || 'Oct 15, 2026'}
              </p>
            </div>

            <div className="pt-2 border-t border-gray-100 dark:border-zinc-800 flex items-center justify-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span className="text-xs font-bold text-gray-700 dark:text-zinc-300">
                Govt Accredited Lab Verified
              </span>
            </div>
          </Card>

          {/* AI Soil Advisory Card */}
          <Card className="p-5 border border-amber-200 dark:border-amber-800/50 bg-amber-50/60 dark:bg-amber-950/20 space-y-2">
            <div className="flex items-center gap-2 text-amber-900 dark:text-amber-300 font-bold text-xs">
              <Lightbulb className="h-4 w-4 text-amber-600" />
              <span>KisanAI Agronomist Remediation</span>
            </div>
            <p className="text-xs text-gray-700 dark:text-zinc-300 leading-relaxed">
              Your <strong>Potassium (K)</strong> is slightly below the PAU benchmark (120 kg/ha vs 150 kg/ha recommended). 
              Applying <strong>25kg/Acre Muriate of Potash (MOP)</strong> during the upcoming booting stage will prevent lodging and improve grain weight.
            </p>
          </Card>
        </div>

        {/* Right Column (8 Cols): 6 Nutrient Metric Cards + Remediation */}
        <div className="lg:col-span-8 space-y-6">
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Physicochemical & Macronutrient Parameters
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Nitrogen */}
              <Card className="p-4 border border-gray-200 dark:border-zinc-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-gray-700 dark:text-zinc-300">Nitrogen (N)</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${nStatus.color}`}>
                    {nStatus.text}
                  </span>
                </div>
                <div className="text-2xl font-black text-gray-900 dark:text-zinc-100">
                  {selectedParcel.nitrogenPpm || 240} <span className="text-xs font-normal text-gray-400">kg/ha</span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full" style={{ width: '45%' }}></div>
                </div>
                <span className="text-[10px] text-gray-400 block">PAU Benchmark: 280 - 560 kg/ha</span>
              </Card>

              {/* Phosphorus */}
              <Card className="p-4 border border-gray-200 dark:border-zinc-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-gray-700 dark:text-zinc-300">Phosphorus (P)</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${pStatus.color}`}>
                    {pStatus.text}
                  </span>
                </div>
                <div className="text-2xl font-black text-gray-900 dark:text-zinc-100">
                  {selectedParcel.phosphorusPpm || 38} <span className="text-xs font-normal text-gray-400">kg/ha</span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: '70%' }}></div>
                </div>
                <span className="text-[10px] text-gray-400 block">PAU Benchmark: 25 - 50 kg/ha</span>
              </Card>

              {/* Potassium */}
              <Card className="p-4 border border-gray-200 dark:border-zinc-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-gray-700 dark:text-zinc-300">Potassium (K)</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${kStatus.color}`}>
                    {kStatus.text}
                  </span>
                </div>
                <div className="text-2xl font-black text-gray-900 dark:text-zinc-100">
                  {selectedParcel.potassiumPpm || 120} <span className="text-xs font-normal text-gray-400">kg/ha</span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full" style={{ width: '40%' }}></div>
                </div>
                <span className="text-[10px] text-gray-400 block">PAU Benchmark: 150 - 300 kg/ha</span>
              </Card>

              {/* Soil pH */}
              <Card className="p-4 border border-gray-200 dark:border-zinc-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-gray-700 dark:text-zinc-300">Soil pH (Reaction)</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    Neutral
                  </span>
                </div>
                <div className="text-2xl font-black text-gray-900 dark:text-zinc-100">
                  {selectedParcel.phLevel || 7.2}
                </div>
                <div className="w-full bg-gray-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: '55%' }}></div>
                </div>
                <span className="text-[10px] text-gray-400 block">Optimal Range: 6.5 - 7.5</span>
              </Card>

              {/* Organic Carbon */}
              <Card className="p-4 border border-gray-200 dark:border-zinc-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-gray-700 dark:text-zinc-300">Organic Carbon (OC)</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${ocStatus.color}`}>
                    {ocStatus.text}
                  </span>
                </div>
                <div className="text-2xl font-black text-gray-900 dark:text-zinc-100">
                  {selectedParcel.organicMatterPercent || 1.1}%
                </div>
                <div className="w-full bg-gray-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: '65%' }}></div>
                </div>
                <span className="text-[10px] text-gray-400 block">Optimal Range: 0.75% - 1.5%</span>
              </Card>

              {/* Soil Moisture */}
              <Card className="p-4 border border-gray-200 dark:border-zinc-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-gray-700 dark:text-zinc-300">Root Zone Moisture</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                    Good
                  </span>
                </div>
                <div className="text-2xl font-black text-blue-600">
                  {selectedParcel.soilMoisturePercent || 68}%
                </div>
                <div className="w-full bg-gray-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-full rounded-full" style={{ width: '68%' }}></div>
                </div>
                <span className="text-[10px] text-gray-400 block">Field Capacity: 55% - 75%</span>
              </Card>
            </div>
          </div>

          {/* Quick Action to Precision Fertilizer */}
          <Card className="p-5 border border-gray-200 dark:border-zinc-800 flex items-center justify-between">
            <div>
              <h4 className="font-bold text-sm text-gray-900 dark:text-zinc-100">
                Calculate Precision Dosage for this Plot
              </h4>
              <p className="text-xs text-gray-500 mt-0.5">
                Generate urea, DAP and MOP bags tailored to these soil test figures
              </p>
            </div>
            <button
              onClick={() => navigateToSubScreen('farms_manager')}
              className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700"
            >
              Open Fertilizer Engine →
            </button>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SoilReportScreen;
