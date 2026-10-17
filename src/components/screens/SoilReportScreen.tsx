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

  const getStatusBadge = (val: number, low: number, high: number) => {
    if (val < low) return { text: 'Low Deficit', color: 'bg-amber-50 text-amber-800 border-amber-200/60' };
    if (val > high) return { text: 'High Excess', color: 'bg-rose-50 text-rose-800 border-rose-200/60' };
    return { text: 'Optimal', color: 'bg-emerald-50 text-emerald-800 border-emerald-200/60' };
  };

  const nStatus = getStatusBadge(selectedParcel.nitrogenPpm || 240, 280, 560);
  const pStatus = getStatusBadge(selectedParcel.phosphorusPpm || 38, 25, 50);
  const kStatus = getStatusBadge(selectedParcel.potassiumPpm || 120, 150, 300);
  const ocStatus = getStatusBadge(selectedParcel.organicMatterPercent || 1.1, 0.75, 1.5);

  return (
    <div className="space-y-6">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-zinc-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
              <FlaskConical className="h-5 w-5" />
            </span>
            <h1 className="text-xl font-semibold text-zinc-900">
              Soil Health Report
            </h1>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Government laboratory accredited soil macronutrient (NPK) tests, pH balance & organic carbon
          </p>
        </div>

        <button
          onClick={() => alert('Downloading official Soil Health Card (PDF)...')}
          className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3.5 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-50 transition-colors shadow-xs"
        >
          <Download className="h-4 w-4 text-emerald-700" />
          <span>Download PDF Report</span>
        </button>
      </div>

      {/* 2. Parcel Selection Chips */}
      {parcels.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {parcels.map((p: LandParcel) => (
            <button
              key={p.id}
              onClick={() => setSelectedParcelId(p.id)}
              className={`px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-2 ${
                selectedParcel.id === p.id
                  ? 'bg-zinc-900 text-white shadow-xs'
                  : 'bg-white text-zinc-700 border border-zinc-200 hover:bg-zinc-50'
              }`}
            >
              <span>{p.name}</span>
            </button>
          ))}
        </div>
      )}

      {/* 3. Main 12-Column Desktop Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (4 Cols): Overall Score Gauge & AI Recommendation */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="p-5 border border-zinc-200/80 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
                  Soil Quality Score
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-semibold text-zinc-900">
                    {selectedParcel.overallSoilScore || 82}
                  </span>
                  <span className="text-xs text-zinc-400 font-normal">/ 100</span>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200/60">
                Grade A · Good
              </span>
            </div>

            <div className="text-xs text-zinc-600 space-y-1.5 pt-2 border-t border-zinc-100">
              <div className="flex justify-between">
                <span className="text-zinc-400">Texture:</span>
                <span className="font-medium text-zinc-800">{selectedParcel.soilType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Sample Verified:</span>
                <span className="font-medium text-zinc-800">{selectedParcel.verifiedSampleDate || 'Oct 15, 2026'}</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-zinc-500 pt-2 border-t border-zinc-100">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>Accredited Lab Test Certificate Verified</span>
            </div>
          </Card>

          {/* AI Soil Advisory Card */}
          <Card className="p-5 border border-zinc-200/80 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-2">
            <div className="flex items-center gap-2 text-zinc-900 font-medium text-xs">
              <Lightbulb className="h-4 w-4 text-amber-500" />
              <span>Agronomic Recommendation</span>
            </div>
            <p className="text-xs text-zinc-600 leading-relaxed">
              Your <strong>Potassium (K)</strong> is slightly below the PAU benchmark (120 kg/ha vs 150 kg/ha recommended). 
              Applying <strong>25kg/Acre Muriate of Potash (MOP)</strong> during the upcoming booting stage will prevent lodging and improve grain weight.
            </p>
          </Card>
        </div>

        {/* Right Column (8 Cols): 6 Nutrient Metric Cards + Remediation */}
        <div className="lg:col-span-8 space-y-6">
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-zinc-600 uppercase tracking-wider">
              Nutrient & Soil Properties
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {/* Nitrogen */}
              <Card className="p-4 border border-zinc-200/80 bg-white space-y-2 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-xs text-zinc-700">Nitrogen (N)</span>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded border ${nStatus.color}`}>
                    {nStatus.text}
                  </span>
                </div>
                <div className="text-xl font-semibold text-zinc-900">
                  {selectedParcel.nitrogenPpm || 240} <span className="text-xs font-normal text-zinc-400">kg/ha</span>
                </div>
                <div className="w-full bg-zinc-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full" style={{ width: '45%' }}></div>
                </div>
                <span className="text-[10px] text-zinc-400 block">Benchmark: 280 - 560 kg/ha</span>
              </Card>

              {/* Phosphorus */}
              <Card className="p-4 border border-zinc-200/80 bg-white space-y-2 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-xs text-zinc-700">Phosphorus (P)</span>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded border ${pStatus.color}`}>
                    {pStatus.text}
                  </span>
                </div>
                <div className="text-xl font-semibold text-zinc-900">
                  {selectedParcel.phosphorusPpm || 38} <span className="text-xs font-normal text-zinc-400">kg/ha</span>
                </div>
                <div className="w-full bg-zinc-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-600 h-full rounded-full" style={{ width: '70%' }}></div>
                </div>
                <span className="text-[10px] text-zinc-400 block">Benchmark: 25 - 50 kg/ha</span>
              </Card>

              {/* Potassium */}
              <Card className="p-4 border border-zinc-200/80 bg-white space-y-2 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-xs text-zinc-700">Potassium (K)</span>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded border ${kStatus.color}`}>
                    {kStatus.text}
                  </span>
                </div>
                <div className="text-xl font-semibold text-zinc-900">
                  {selectedParcel.potassiumPpm || 120} <span className="text-xs font-normal text-zinc-400">kg/ha</span>
                </div>
                <div className="w-full bg-zinc-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full" style={{ width: '40%' }}></div>
                </div>
                <span className="text-[10px] text-zinc-400 block">Benchmark: 150 - 300 kg/ha</span>
              </Card>

              {/* Soil pH */}
              <Card className="p-4 border border-zinc-200/80 bg-white space-y-2 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-xs text-zinc-700">Soil pH</span>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-zinc-100 text-zinc-700">
                    Neutral
                  </span>
                </div>
                <div className="text-xl font-semibold text-zinc-900">
                  {selectedParcel.phLevel || 7.2}
                </div>
                <div className="w-full bg-zinc-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-600 h-full rounded-full" style={{ width: '55%' }}></div>
                </div>
                <span className="text-[10px] text-zinc-400 block">Optimal Range: 6.5 - 7.5</span>
              </Card>

              {/* Organic Carbon */}
              <Card className="p-4 border border-zinc-200/80 bg-white space-y-2 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-xs text-zinc-700">Organic Carbon</span>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded border ${ocStatus.color}`}>
                    {ocStatus.text}
                  </span>
                </div>
                <div className="text-xl font-semibold text-zinc-900">
                  {selectedParcel.organicMatterPercent || 1.1}%
                </div>
                <div className="w-full bg-zinc-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-600 h-full rounded-full" style={{ width: '65%' }}></div>
                </div>
                <span className="text-[10px] text-zinc-400 block">Optimal Range: 0.75% - 1.5%</span>
              </Card>

              {/* Soil Moisture */}
              <Card className="p-4 border border-zinc-200/80 bg-white space-y-2 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-xs text-zinc-700">Moisture</span>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-zinc-100 text-zinc-700">
                    Adequate
                  </span>
                </div>
                <div className="text-xl font-semibold text-zinc-900">
                  {selectedParcel.soilMoisturePercent || 68}%
                </div>
                <div className="w-full bg-zinc-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-zinc-600 h-full rounded-full" style={{ width: '68%' }}></div>
                </div>
                <span className="text-[10px] text-zinc-400 block">Field Capacity: 55% - 75%</span>
              </Card>
            </div>
          </div>

          {/* Quick Action to Precision Fertilizer */}
          <Card className="p-5 border border-zinc-200/80 bg-white flex items-center justify-between shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
            <div>
              <h4 className="font-medium text-sm text-zinc-900">
                Calculate Precision Dosage for this Plot
              </h4>
              <p className="text-xs text-zinc-500 mt-0.5">
                Generate urea, DAP and MOP bags tailored to these soil test figures
              </p>
            </div>
            <button
              onClick={() => navigateToSubScreen('farms_manager')}
              className="rounded-lg bg-emerald-700 px-3.5 py-2 text-xs font-medium text-white hover:bg-emerald-800 transition-colors shadow-xs"
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
