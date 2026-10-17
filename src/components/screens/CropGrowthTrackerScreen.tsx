'use client';

import React, { useState } from 'react';
import { 
  Sprout, Calendar, Clock, AlertTriangle, CheckCircle2, 
  ArrowLeft, Plus, FileText, ChevronRight, Activity, X, Droplet
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
    stageName: 'Maturity & Golden Harvest',
    dayRange: 'Day 100 - 120',
    description: 'Stems and spikes turn golden yellow. Grain moisture drops below 14%.',
    isCompleted: false,
    isCurrent: false,
    requiredAction: 'Cease irrigation 10-14 days before combining.',
    keyWatchout: 'Lodging risk if irrigated during strong winds close to harvest.'
  }
];

export const CropGrowthTrackerScreen: React.FC = () => {
  const { crops, farms, navigateBack, addCrop } = useKisanStore();

  const [selectedCropId, setSelectedCropId] = useState<string>(crops[0]?.id || 'crop_1');
  const [showAddCropModal, setShowAddCropModal] = useState(false);
  const [showObservationModal, setShowObservationModal] = useState(false);

  // New crop modal state
  const [newCropName, setNewCropName] = useState('Wheat');
  const [newVariety, setNewVariety] = useState('HD-3086');
  const [newGrowthStage, setNewGrowthStage] = useState('Flowering & Booting');
  const [newExpectedYield, setNewExpectedYield] = useState('22.5');

  // Observation state
  const [obsNote, setObsNote] = useState('');
  const [observations, setObservations] = useState<FieldObservationLog[]>([
    {
      id: 'obs_1',
      dateDisplay: 'Yesterday, 4:00 PM',
      stageName: 'Flowering & Booting',
      note: 'Canopy height 78cm. Excellent earhead emergence. No rust pustules observed.',
      healthTag: 'Excellent (92%)'
    },
    {
      id: 'obs_2',
      dateDisplay: '5 days ago',
      stageName: 'Tillering',
      note: '2nd irrigation given with 35kg Urea top-dress.',
      healthTag: 'Normal'
    }
  ]);

  const selectedCrop = crops.find(c => c.id === selectedCropId) || crops[0] || {
    id: 'crop_1',
    farmId: 'farm_1',
    parcelId: 'p_1',
    cropName: 'Wheat (Gehun)',
    variety: 'HD-3086 (Pusa Gautami)',
    growthStage: 'Flowering & Booting',
    healthScore: 92,
    sowingDate: '2024-11-10',
    expectedHarvest: '2025-03-25',
    expectedYieldPerAcre: 22.5,
    notes: '2nd irrigation completed, healthy canopy.',
    isNewCrop: false,
    daysElapsed: 48
  };

  const handleAddCropSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addCrop({
      farmId: farms[0]?.id || 'farm_1',
      parcelId: 'p_1',
      cropName: newCropName,
      variety: newVariety,
      growthStage: newGrowthStage,
      healthScore: 95,
      sowingDate: new Date().toISOString().split('T')[0],
      expectedHarvest: 'In 90-120 days',
      expectedYieldPerAcre: parseFloat(newExpectedYield) || 20,
      notes: 'Newly added crop lifecycle tracking.',
      isNewCrop: true,
      daysElapsed: 0
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
        stageName: selectedCrop.growthStage,
        note: obsNote,
        healthTag: 'Good'
      },
      ...observations
    ]);
    setObsNote('');
    setShowObservationModal(false);
  };

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
                <Sprout className="w-5 h-5 text-emerald-300" />
                Crop Lifecycle Tracker
              </h1>
              <p className="text-xs text-emerald-100">Stage progress, required actions & harvest forecasts</p>
            </div>
          </div>

          <button
            onClick={() => setShowAddCropModal(true)}
            className="bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 backdrop-blur-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Crop
          </button>
        </div>

        {/* Crop Selector Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {crops.map(crop => (
            <button
              key={crop.id}
              onClick={() => setSelectedCropId(crop.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCrop.id === crop.id
                  ? 'bg-white text-emerald-800 shadow-sm'
                  : 'bg-emerald-800/60 text-emerald-100 hover:bg-emerald-800'
              }`}
            >
              {crop.cropName} ({crop.variety})
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Selected Crop Overview Card */}
        <Card className="p-4 border-l-4 border-l-emerald-600">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded">
                Active Crop
              </span>
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mt-1">
                {selectedCrop.cropName}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Variety: {selectedCrop.variety}
              </p>
            </div>

            <div className="text-right">
              <span className="text-xs font-semibold text-slate-500">Health Index</span>
              <div className="text-xl font-black text-emerald-600">
                {selectedCrop.healthScore}%
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
            <div className="bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg">
              <span className="text-[10px] text-slate-400 block">Sowing Date</span>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{selectedCrop.sowingDate}</span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg">
              <span className="text-[10px] text-slate-400 block">Days Elapsed</span>
              <span className="text-xs font-bold text-emerald-600">{selectedCrop.daysElapsed || 48} Days</span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg">
              <span className="text-[10px] text-slate-400 block">Target Yield</span>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{selectedCrop.expectedYieldPerAcre} Q/Acre</span>
            </div>
          </div>
        </Card>

        {/* Growth Timeline Stages */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-emerald-600" />
              Growth Stage Roadmap
            </h3>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              Stage 4 of 6 (Active)
            </span>
          </div>

          <div className="space-y-3">
            {WHEAT_STAGES.map((stage) => (
              <div 
                key={stage.stageNumber}
                className={`p-3.5 rounded-xl border transition-all ${
                  stage.isCurrent
                    ? 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-500 shadow-sm'
                    : stage.isCompleted
                    ? 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 opacity-90'
                    : 'bg-slate-50/50 dark:bg-slate-800/30 border-dashed border-slate-200 dark:border-slate-700 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      stage.isCompleted
                        ? 'bg-emerald-600 text-white'
                        : stage.isCurrent
                        ? 'bg-emerald-500 text-white ring-4 ring-emerald-100 dark:ring-emerald-900/50 animate-pulse'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                    }`}>
                      {stage.isCompleted ? <CheckCircle2 className="w-4 h-4" /> : stage.stageNumber}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">
                        {stage.stageName}
                      </h4>
                      <span className="text-[10px] text-slate-500">{stage.dayRange}</span>
                    </div>
                  </div>

                  {stage.isCurrent && (
                    <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Current Stage
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 mb-2 pl-8">
                  {stage.description}
                </p>

                {/* Actions & Watchouts */}
                <div className="pl-8 space-y-1.5">
                  <div className="bg-white/80 dark:bg-slate-800 p-2 rounded-lg text-[11px] border border-emerald-100 dark:border-emerald-900/40">
                    <span className="font-bold text-emerald-800 dark:text-emerald-300">Action Required: </span>
                    <span className="text-slate-700 dark:text-slate-300">{stage.requiredAction}</span>
                  </div>
                  <div className="bg-amber-50/80 dark:bg-amber-950/30 p-2 rounded-lg text-[11px] border border-amber-200 dark:border-amber-900/40 text-amber-900 dark:text-amber-200">
                    <span className="font-bold text-amber-800 dark:text-amber-400">Critical Watchout: </span>
                    <span>{stage.keyWatchout}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Field Observation Log Section */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-emerald-600" />
              Field Observation Log
            </h3>
            <button
              onClick={() => setShowObservationModal(true)}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              Log Inspection
            </button>
          </div>

          <div className="space-y-2">
            {observations.map(obs => (
              <div 
                key={obs.id}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs"
              >
                <div className="flex items-center justify-between text-slate-500 mb-1">
                  <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded">
                    {obs.stageName}
                  </span>
                  <span className="text-[10px]">{obs.dateDisplay}</span>
                </div>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{obs.note}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Crop Modal */}
      {showAddCropModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
          <form 
            onSubmit={handleAddCropSubmit}
            className="bg-white dark:bg-slate-900 w-full max-w-md rounded-t-2xl sm:rounded-2xl p-5 shadow-2xl space-y-3"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-800 dark:text-slate-100">Add Crop for Tracking</h3>
              <button 
                type="button" 
                onClick={() => setShowAddCropModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Crop Name</label>
              <input 
                type="text"
                value={newCropName}
                onChange={(e) => setNewCropName(e.target.value)}
                placeholder="e.g. Mustard, Gram, Cotton"
                required
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white mt-1"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Crop Variety</label>
              <input 
                type="text"
                value={newVariety}
                onChange={(e) => setNewVariety(e.target.value)}
                placeholder="e.g. Pusa Bold, JG 14"
                required
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Initial Stage</label>
                <select
                  value={newGrowthStage}
                  onChange={(e) => setNewGrowthStage(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white mt-1"
                >
                  <option value="Sowing & Germination">Sowing & Germination</option>
                  <option value="Tillering & Vegetative">Tillering & Vegetative</option>
                  <option value="Flowering & Booting">Flowering & Booting</option>
                  <option value="Grain Filling">Grain Filling</option>
                  <option value="Harvesting">Harvesting</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Target Yield (Q/Acre)</label>
                <input 
                  type="number"
                  step="0.5"
                  value={newExpectedYield}
                  onChange={(e) => setNewExpectedYield(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white mt-1"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddCropModal(false)}
                className="flex-1 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm"
              >
                Save Crop
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Observation Modal */}
      {showObservationModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
          <form 
            onSubmit={handleAddObservation}
            className="bg-white dark:bg-slate-900 w-full max-w-md rounded-t-2xl sm:rounded-2xl p-5 shadow-2xl space-y-3"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-800 dark:text-slate-100">Log Field Observation</h3>
              <button 
                type="button" 
                onClick={() => setShowObservationModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Observation Notes</label>
              <textarea 
                value={obsNote}
                onChange={(e) => setObsNote(e.target.value)}
                placeholder="Note down plant height, color, weed presence, irrigation response..."
                rows={4}
                required
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white mt-1"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowObservationModal(false)}
                className="flex-1 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm"
              >
                Record Observation
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
export default CropGrowthTrackerScreen;
