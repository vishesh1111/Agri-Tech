'use client';

import React, { useState } from 'react';
import { 
  Sprout, Calendar, Clock, AlertTriangle, CheckCircle2, 
  ArrowLeft, Plus, FileText, ChevronRight, Activity, X, Droplet,
  Check, ArrowRight, NotebookPen
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { CropRecord } from '@/lib/types';
import { useKisanStore } from '@/stores/useKisanStore';

interface GrowthStageItem {
  stageNumber: number;
  stageName: string;
  dayRange: string;
  description: string;
  isCompleted: boolean;
  isCurrent: boolean;
  requiredAction: string;
  keyWatchout: string;
}

interface FieldObservationLog {
  id: string;
  dateDisplay: string;
  stageName: string;
  note: string;
  healthTag: string;
}

const WHEAT_STAGES: GrowthStageItem[] = [
  {
    stageNumber: 1,
    stageName: 'Sowing & Germination',
    dayRange: 'Day 0 - 15',
    description: 'Seed germination and primary root emergence.',
    isCompleted: true,
    isCurrent: false,
    requiredAction: 'Apply basal dose of DAP + MOP with light germination irrigation.',
    keyWatchout: 'Watch for termite attack and seed rot in waterlogged zones.'
  },
  {
    stageNumber: 2,
    stageName: 'Crown Root Initiation (CRI)',
    dayRange: 'Day 20 - 25',
    description: 'Crown roots anchor the seedling. Most critical irrigation window.',
    isCompleted: true,
    isCurrent: false,
    requiredAction: 'First critical irrigation (21 days). Top-dress 1/3rd Urea.',
    keyWatchout: 'Water stress here reduces tiller count by up to 30%.'
  },
  {
    stageNumber: 3,
    stageName: 'Tillering & Vegetative',
    dayRange: 'Day 30 - 45',
    description: 'Rapid production of side shoots and leaf canopy development.',
    isCompleted: true,
    isCurrent: false,
    requiredAction: 'Apply 2nd dose of Nitrogen. Hoeing/weeding if broadleaf weeds appear.',
    keyWatchout: 'Yellowing of lower leaves indicates nitrogen deficiency.'
  },
  {
    stageNumber: 4,
    stageName: 'Flowering & Booting',
    dayRange: 'Day 45 - 65',
    description: 'Flag leaf expands and flower head emerges from leaf sheath.',
    isCompleted: false,
    isCurrent: true,
    requiredAction: 'Apply 0:52:34 soluble spray for robust earhead development.',
    keyWatchout: 'Inspect for yellow rust (Puccinia striiformis) on upper leaves.'
  },
  {
    stageNumber: 5,
    stageName: 'Milking & Grain Filling',
    dayRange: 'Day 70 - 95',
    description: 'Kernels fill with milky starch. Moisture critical for grain weight.',
    isCompleted: false,
    isCurrent: false,
    requiredAction: 'Light irrigation to prevent shriveling if hot westerly winds blow.',
    keyWatchout: 'Terminal heat stress above 30°C can reduce test weight.'
  },
  {
    stageNumber: 6,
    stageName: 'Maturity & Harvest',
    dayRange: 'Day 100 - 120',
    description: 'Stems and spikes turn golden yellow. Grain moisture drops below 14%.',
    isCompleted: false,
    isCurrent: false,
    requiredAction: 'Cease irrigation 10-14 days before combining.',
    keyWatchout: 'Lodging risk if irrigated during strong winds close to harvest.'
  }
];

export const CropGrowthTrackerScreen: React.FC = () => {
  const { crops, farms, addCrop } = useKisanStore();

  const [selectedCropId, setSelectedCropId] = useState<string>(crops[0]?.id || 'crop_1');
  const [showAddCropModal, setShowAddCropModal] = useState(false);
  const [showObservationModal, setShowObservationModal] = useState(false);

  // New crop state
  const [newCropName, setNewCropName] = useState('Wheat');
  const [newVariety, setNewVariety] = useState('HD-3086 Sharbati');
  const [newPlotArea, setNewPlotArea] = useState('4.5');
  const [newExpectedYield, setNewExpectedYield] = useState('22 Quintals / Acre');

  // Observation state
  const [obsNote, setObsNote] = useState('');
  const [obsTag, setObsTag] = useState('Healthy / Vigorous');
  const [observations, setObservations] = useState<FieldObservationLog[]>([
    {
      id: 'obs_1',
      dateDisplay: 'Yesterday, 04:30 PM',
      stageName: 'Flowering & Booting',
      note: 'Canopy is dense and vibrant green. Flag leaves emerging uniformly across Plot A.',
      healthTag: 'Healthy'
    },
    {
      id: 'obs_2',
      dateDisplay: '5 days ago',
      stageName: 'Tillering & Vegetative',
      note: 'Minor aphid presence spotted on south plot boundary. Applied neem biopesticide spray.',
      healthTag: 'Treated'
    }
  ]);

  const activeCrop = crops.find(c => c.id === selectedCropId) || crops[0] || {
    id: 'crop_1',
    farmId: 'farm_1',
    cropName: 'Wheat (Kanak)',
    variety: 'HD-3086 Sharbati',
    growthStage: 'Tillering & Booting',
    daysElapsed: 48,
    daysRemaining: 72,
    healthScore: 88,
    expectedYield: '22-24 Qtl/Acre',
    expectedHarvest: 'April 15, 2027',
  };

  const handleCreateCrop = (e: React.FormEvent) => {
    e.preventDefault();
    addCrop({
      id: `crop_${Date.now()}`,
      farmId: farms[0]?.id || 'farm_1',
      cropName: newCropName,
      variety: newVariety,
      growthStage: 'Sowing & Germination',
      daysElapsed: 0,
      daysRemaining: 120,
      healthScore: 95,
      expectedYield: newExpectedYield,
      expectedHarvest: 'May 2027',
      icon: '🌱'
    });
    setShowAddCropModal(false);
  };

  const handleAddObservation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!obsNote.trim()) return;
    setObservations([
      {
        id: `obs_${Date.now()}`,
        dateDisplay: 'Just now',
        stageName: activeCrop.growthStage,
        note: obsNote,
        healthTag: obsTag
      },
      ...observations
    ]);
    setObsNote('');
    setShowObservationModal(false);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-zinc-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
              <Sprout className="h-5 w-5" />
            </span>
            <h1 className="text-xl font-semibold text-zinc-900">
              Crop Lifecycle Tracker
            </h1>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Phenological growth tracking from sowing to harvest with stage-specific nutrition
          </p>
        </div>

        <button
          onClick={() => setShowAddCropModal(true)}
          className="flex items-center gap-2 rounded-lg bg-emerald-700 px-3.5 py-2 text-xs font-medium text-white hover:bg-emerald-800 transition-colors shadow-xs"
        >
          <Plus className="h-4 w-4" />
          <span>Add Crop Cycle</span>
        </button>
      </div>

      {/* 2. Crop Switcher Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {crops.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedCropId(c.id)}
            className={`shrink-0 rounded-lg px-3.5 py-2 text-xs font-medium transition-colors flex items-center gap-2 ${
              activeCrop.id === c.id
                ? 'bg-zinc-900 text-white shadow-xs'
                : 'border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50'
            }`}
          >
            <span>{c.cropName}</span>
            <span className="text-zinc-400 text-[11px]">({c.variety})</span>
          </button>
        ))}
      </div>

      {/* 3. Selected Crop Overview Banner */}
      <Card className="p-5 border border-zinc-200/80 bg-white space-y-4 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-lg font-semibold text-zinc-900">
                {activeCrop.cropName} — {activeCrop.variety}
              </h2>
              <span className="inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200/60">
                Health {activeCrop.healthScore}%
              </span>
            </div>
            <p className="text-xs text-zinc-500 font-medium mt-1">
              Current Stage: {activeCrop.growthStage} · Day {activeCrop.daysElapsed} of 120
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="rounded-lg bg-zinc-50 border border-zinc-100 p-2.5 px-3.5 text-center">
              <span className="text-[11px] text-zinc-400 font-medium block">Days to Harvest</span>
              <p className="text-base font-semibold text-zinc-900 mt-0.5">{activeCrop.daysRemaining || 72} Days</p>
            </div>
            <div className="rounded-lg bg-zinc-50 border border-zinc-100 p-2.5 px-3.5 text-center">
              <span className="text-[11px] text-zinc-400 font-medium block">Target Yield</span>
              <p className="text-base font-semibold text-zinc-900 mt-0.5">{activeCrop.expectedYield}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* 4. Full-Width Horizontal Stage Pipeline (6 Columns) */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-zinc-600 uppercase tracking-wider">
          Growth Milestones
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {WHEAT_STAGES.map((st) => (
            <Card
              key={st.stageNumber}
              className={`p-3.5 border transition-all space-y-2 flex flex-col justify-between ${
                st.isCurrent
                  ? 'border-emerald-600 bg-white ring-1 ring-emerald-600 shadow-xs'
                  : st.isCompleted
                  ? 'border-zinc-200 bg-zinc-50/70'
                  : 'border-zinc-200/80 bg-white opacity-60'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium text-zinc-400">Stage {st.stageNumber}</span>
                  {st.isCompleted ? (
                    <span className="h-4 w-4 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-[10px] font-bold">
                      ✓
                    </span>
                  ) : st.isCurrent ? (
                    <span className="h-2 w-2 rounded-full bg-emerald-600"></span>
                  ) : null}
                </div>

                <h4 className="font-medium text-xs text-zinc-900 mt-1">
                  {st.stageName}
                </h4>
                <span className="text-[11px] text-zinc-500 block mt-0.5">
                  {st.dayRange}
                </span>
              </div>

              <p className="text-[11px] text-zinc-500 line-clamp-2 leading-relaxed">{st.description}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* 5. Bottom 12-Column Grid (Stage Deep Dive vs Field Observation Logs) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 Cols): Current Stage Agronomic Deep Dive */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="p-5 border border-zinc-200/80 bg-white space-y-4 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
                  Active Stage
                </span>
                <h3 className="font-semibold text-base text-zinc-900 mt-0.5">
                  Flowering & Booting (Day 45 - 65)
                </h3>
              </div>
              <span className="px-2.5 py-1 rounded text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200/60">
                On Track
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-lg bg-zinc-50 border border-zinc-200/70 space-y-1">
                <span className="font-medium text-zinc-900 block">
                  Recommended Action:
                </span>
                <p className="text-zinc-600 leading-relaxed">
                  Apply 0:52:34 soluble spray (2 kg/acre in 150L water) for robust earhead development and spikelet fertility.
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-zinc-50 border border-zinc-200/70 space-y-1">
                <span className="font-medium text-zinc-900 block">
                  Watchout & Prevention:
                </span>
                <p className="text-zinc-600 leading-relaxed">
                  Inspect upper flag leaves for yellow powdery pustules (Yellow Rust). If detected early, apply recommended systemic fungicide per PAU bulletin.
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column (5 Cols): Observation Logs */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="p-5 border border-zinc-200/80 bg-white space-y-4 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-sm text-zinc-900">
                  Field Observations
                </h3>
                <p className="text-xs text-zinc-500">Record inspections and plot notes</p>
              </div>
              <button
                onClick={() => setShowObservationModal(true)}
                className="text-xs font-medium text-emerald-700 hover:text-emerald-800"
              >
                + Add Note
              </button>
            </div>

            <div className="space-y-2.5">
              {observations.map((obs) => (
                <div
                  key={obs.id}
                  className="p-3 rounded-lg bg-zinc-50 border border-zinc-100 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-zinc-900">{obs.stageName}</span>
                    <span className="text-[11px] text-zinc-400">{obs.dateDisplay}</span>
                  </div>
                  <p className="text-zinc-600 leading-relaxed">{obs.note}</p>
                  <span className="inline-block bg-zinc-200 text-zinc-700 text-[10px] font-medium px-2 py-0.5 rounded">
                    {obs.healthTag}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Observation Modal */}
      {showObservationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="max-w-md w-full p-5 space-y-4 bg-white rounded-xl border border-zinc-200 shadow-xl">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <h3 className="font-semibold text-sm text-zinc-900">
                Log Field Observation
              </h3>
              <button
                onClick={() => setShowObservationModal(false)}
                className="text-zinc-400 hover:text-zinc-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddObservation} className="space-y-3 text-xs">
              <div>
                <label className="font-medium text-zinc-700">Observation Notes</label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Flag leaves emerging evenly, no weed pressure observed..."
                  value={obsNote}
                  onChange={(e) => setObsNote(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-zinc-200 p-2.5 text-zinc-900 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="font-medium text-zinc-700">Condition Tag</label>
                <select
                  value={obsTag}
                  onChange={(e) => setObsTag(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-zinc-200 p-2.5 text-zinc-900 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                >
                  <option>Healthy / Vigorous</option>
                  <option>Moisture Deficit</option>
                  <option>Pest Treated</option>
                  <option>Nutrient Deficiency</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowObservationModal(false)}
                  className="px-3 py-1.5 text-xs font-medium text-zinc-600 hover:text-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-emerald-700 px-4 py-1.5 text-xs font-medium text-white hover:bg-emerald-800 transition-colors"
                >
                  Save Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Crop Modal */}
      {showAddCropModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="max-w-md w-full p-5 space-y-4 bg-white rounded-xl border border-zinc-200 shadow-xl">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <h3 className="font-semibold text-sm text-zinc-900">
                Register New Crop Season
              </h3>
              <button
                onClick={() => setShowAddCropModal(false)}
                className="text-zinc-400 hover:text-zinc-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCrop} className="space-y-3 text-xs">
              <div>
                <label className="font-medium text-zinc-700">Crop Commodity</label>
                <input
                  type="text"
                  required
                  value={newCropName}
                  onChange={(e) => setNewCropName(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-zinc-200 p-2 text-zinc-900 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="font-medium text-zinc-700">Cultivar / Variety</label>
                <input
                  type="text"
                  required
                  value={newVariety}
                  onChange={(e) => setNewVariety(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-zinc-200 p-2 text-zinc-900 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-zinc-700">Plot Area (Acres)</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={newPlotArea}
                    onChange={(e) => setNewPlotArea(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-zinc-200 p-2 text-zinc-900 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  />
                </div>
                <div>
                  <label className="font-medium text-zinc-700">Expected Yield</label>
                  <input
                    type="text"
                    required
                    value={newExpectedYield}
                    onChange={(e) => setNewExpectedYield(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-zinc-200 p-2 text-zinc-900 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddCropModal(false)}
                  className="px-3 py-1.5 text-xs font-medium text-zinc-600 hover:text-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-emerald-700 px-4 py-1.5 text-xs font-medium text-white hover:bg-emerald-800 transition-colors"
                >
                  Save Crop Cycle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CropGrowthTrackerScreen;
