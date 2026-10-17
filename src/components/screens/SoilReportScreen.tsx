'use client';

import React, { useState } from 'react';
import { 
  FlaskConical, CheckCircle2, AlertTriangle, ArrowLeft, 
  Lightbulb, Droplets, Info, ChevronRight, Share2, Download
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useKisanStore } from '@/stores/useKisanStore';
import { LandParcel } from '@/lib/types';

export const SoilReportScreen: React.FC = () => {
  const { parcels, farms, navigateBack, navigateToSubScreen } = useKisanStore();

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
    verifiedSampleDate: 'Oct 15, 2024',
    overallSoilScore: 82
  };

  const getStatusColor = (val: number, low: number, high: number) => {
    if (val < low) return { text: 'Low Deficit', color: 'text-amber-600 bg-amber-50 border-amber-200' };
    if (val > high) return { text: 'High Excess', color: 'text-rose-600 bg-rose-50 border-rose-200' };
    return { text: 'Optimal', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' };
  };

  const nStatus = getStatusColor(selectedParcel.nitrogenPpm || 240, 280, 560);
  const pStatus = getStatusColor(selectedParcel.phosphorusPpm || 38, 25, 50);
  const kStatus = getStatusColor(selectedParcel.potassiumPpm || 120, 150, 300);
  const ocStatus = getStatusColor(selectedParcel.organicMatterPercent || 1.1, 0.75, 1.5);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20">
      {/* Top Header */}
      <div className="bg-gradient-to-r from-emerald-700 to-green-700 text-white px-4 pt-4 pb-5 shadow-md">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <button 
              onClick={navigateBack}
              className="p-1.5 rounded-full hover:bg-white/10 active:bg-white/20 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold flex items-center gap-2">
                <FlaskConical className="w-5 h-5 text-emerald-300" />
                Soil Health Card
              </h1>
              <p className="text-xs text-emerald-100">Lab-tested physicochemical & macronutrient profile</p>
            </div>
          </div>
        </div>

        {/* Parcel selector */}
        {parcels.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {parcels.map((p: LandParcel) => (
              <button
                key={p.id}
                onClick={() => setSelectedParcelId(p.id)}
                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedParcel.id === p.id
                    ? 'bg-white text-emerald-800 shadow-sm'
                    : 'bg-emerald-800/60 text-emerald-100 hover:bg-emerald-800'
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Verification Banner */}
        <div className="flex items-center justify-between bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div>
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">{selectedParcel.name}</h2>
            <span className="text-xs text-slate-500">Sample Verified: {selectedParcel.verifiedSampleDate || 'Oct 15, 2024'}</span>
          </div>
          <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Govt Lab Verified
          </span>
        </div>

        {/* Overall Score Circle */}
        <Card className="p-6 text-center shadow-md">
          <div className="w-28 h-28 mx-auto rounded-full bg-emerald-50 dark:bg-emerald-950/40 border-4 border-emerald-500 flex flex-col items-center justify-center shadow-inner">
            <span className="text-3xl font-black text-emerald-700 dark:text-emerald-400">
              {selectedParcel.overallSoilScore || 82}
            </span>
            <span className="text-[10px] uppercase font-bold text-emerald-600">out of 100</span>
          </div>

          <h3 className="text-base font-bold text-emerald-700 dark:text-emerald-400 mt-3">
            Soil Health Index: Good (Grade A)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto mt-1">
            Excellent soil texture ({selectedParcel.soilType}) and organic activity suitable for cereal and pulse crops.
          </p>
        </Card>

        {/* AI Soil Advisory Card */}
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-xl p-3.5 text-xs flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
            <Lightbulb className="w-4 h-4" />
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-amber-900 dark:text-amber-200 text-xs">KisanAI Agronomist Recommendation</h4>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              Your <strong>Potassium (K)</strong> is slightly below the PAU benchmark (120 kg/ha vs 150 kg/ha recommended). 
              Applying <strong>25kg/Acre Muriate of Potash (MOP)</strong> during the upcoming booting stage will prevent lodging and improve grain weight.
            </p>
          </div>
        </div>

        {/* Nutrient Grid */}
        <div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-2">
            Soil Physicochemical & Nutrient Parameters
          </h3>

          <div className="grid grid-cols-2 gap-3">
            {/* Nitrogen */}
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 shadow-sm">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Nitrogen (N)</span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${nStatus.color}`}>
                  {nStatus.text}
                </span>
              </div>
              <div className="text-lg font-black text-slate-800 dark:text-slate-100">
                {selectedParcel.nitrogenPpm || 240} <span className="text-xs font-normal text-slate-400">kg/ha</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full" style={{ width: '45%' }}></div>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">Normal: 280 - 560 kg/ha</span>
            </div>

            {/* Phosphorus */}
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 shadow-sm">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Phosphorus (P)</span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${pStatus.color}`}>
                  {pStatus.text}
                </span>
              </div>
              <div className="text-lg font-black text-slate-800 dark:text-slate-100">
                {selectedParcel.phosphorusPpm || 38} <span className="text-xs font-normal text-slate-400">kg/ha</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: '75%' }}></div>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">Normal: 25 - 50 kg/ha</span>
            </div>

            {/* Potassium */}
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 shadow-sm">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Potassium (K)</span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${kStatus.color}`}>
                  {kStatus.text}
                </span>
              </div>
              <div className="text-lg font-black text-slate-800 dark:text-slate-100">
                {selectedParcel.potassiumPpm || 120} <span className="text-xs font-normal text-slate-400">kg/ha</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full" style={{ width: '40%' }}></div>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">Normal: 150 - 300 kg/ha</span>
            </div>

            {/* pH */}
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 shadow-sm">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Soil pH</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded border text-emerald-600 bg-emerald-50 border-emerald-200">
                  Neutral (7.2)
                </span>
              </div>
              <div className="text-lg font-black text-slate-800 dark:text-slate-100">
                {selectedParcel.phLevel || 7.2} <span className="text-xs font-normal text-slate-400">pH</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: '51%' }}></div>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">Optimal range: 6.5 - 7.5</span>
            </div>

            {/* Organic Carbon */}
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 shadow-sm">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Organic Carbon</span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${ocStatus.color}`}>
                  {ocStatus.text}
                </span>
              </div>
              <div className="text-lg font-black text-slate-800 dark:text-slate-100">
                {selectedParcel.organicMatterPercent || 1.1}%
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">Benchmark: &gt; 0.75%</span>
            </div>

            {/* Moisture */}
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 shadow-sm">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Moisture Content</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded border text-emerald-600 bg-emerald-50 border-emerald-200">
                  Adequate
                </span>
              </div>
              <div className="text-lg font-black text-slate-800 dark:text-slate-100">
                {selectedParcel.soilMoisturePercent || 68}%
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">Sensor: Soil probe 1</span>
            </div>
          </div>
        </div>

        {/* Action Button: Book Soil Test */}
        <div className="pt-2">
          <button
            onClick={() => navigateToSubScreen('market_soil_testing')}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-xl shadow-md flex items-center justify-center gap-2 text-sm transition-colors"
          >
            <FlaskConical className="w-4 h-4" />
            Book New Govt Soil Test Lab Sample (₹150)
          </button>
        </div>
      </div>
    </div>
  );
};
export default SoilReportScreen;
