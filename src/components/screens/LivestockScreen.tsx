'use client';

import React, { useState } from 'react';
import { 
  Heart, Search, Plus, Radio, Shield, MapPin, 
  Battery, AlertTriangle, ArrowLeft, ChevronRight, Activity, 
  Sparkles, CheckCircle2, X
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Livestock, PoultryBatch, CropRecord } from '@/lib/types';
import { useKisanStore } from '@/stores/useKisanStore';

const CATEGORIES = ['All', 'Cattle / Dairy', 'Poultry', 'Goat & Sheep', 'Crops'];

export const LivestockScreen: React.FC = () => {
  const { 
    livestock, 
    poultryBatches, 
    crops, 
    selectAnimal, 
    navigateToSubScreen, 
    navigateBack 
  } = useKisanStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredAnimals = livestock.filter(animal => {
    const matchesCat = 
      selectedCategory === 'All' ? true :
      selectedCategory === 'Cattle / Dairy' ? (animal.type.includes('Cow') || animal.type.includes('Buffalo')) :
      selectedCategory === 'Goat & Sheep' ? (animal.type.includes('Goat') || animal.type.includes('Sheep')) :
      selectedCategory === 'Poultry' ? false : true;

    const matchesSearch = 
      animal.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      animal.breed.toLowerCase().includes(searchQuery.toLowerCase()) ||
      animal.tagId.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCat && matchesSearch;
  });

  const handleOpenAnimal = (animalId: string) => {
    selectAnimal(animalId);
    navigateToSubScreen('animal_detail');
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
                <Heart className="w-5 h-5 text-rose-300" />
                Livestock & Cattle Manager
              </h1>
              <p className="text-xs text-emerald-100">
                {livestock.length} animals • GPS collars & milk telemetry
              </p>
            </div>
          </div>

          <button
            onClick={() => navigateToSubScreen('add_animal')}
            className="bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 backdrop-blur-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Animal
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-emerald-300" />
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search cow, buffalo, breed, ear-tag..."
            className="w-full bg-emerald-800/60 placeholder-emerald-200 text-white text-sm rounded-xl pl-9 pr-4 py-2.5 outline-none border border-emerald-600 focus:border-white transition-colors"
          />
        </div>
      </div>

      <div className="px-4 py-3 space-y-4">
        {/* Category Filters */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Animals List */}
        {(selectedCategory === 'All' || selectedCategory === 'Cattle / Dairy' || selectedCategory === 'Goat & Sheep') && (
          <div className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Cattle & Dairy Animals ({filteredAnimals.length})
            </h2>

            {filteredAnimals.map(animal => (
              <Card 
                key={animal.id} 
                onClick={() => handleOpenAnimal(animal.id)}
                className="p-4 cursor-pointer hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-2xl">
                      🐄
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">
                          {animal.name}
                        </h3>
                        <span className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded">
                          {animal.tagId}
                        </span>
                      </div>

                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {animal.breed} • {animal.ageYears} Years Old
                      </p>

                      <div className="flex items-center gap-3 mt-1 text-[11px]">
                        <span className="font-semibold text-emerald-600">
                          🥛 {animal.dailyMilkYield} L/day
                        </span>
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-500">
                          Health: <strong className="text-slate-700 dark:text-slate-300">{animal.healthScore}%</strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    {animal.isInsideFence ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        Safe In Fence
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-100 dark:bg-rose-950/60 px-2 py-0.5 rounded-full animate-pulse">
                        <AlertTriangle className="w-3 h-3 text-rose-600" />
                        Outside Fence!
                      </span>
                    )}

                    <div className="flex items-center justify-end gap-1 text-[10px] text-slate-400 mt-2">
                      <Battery className="w-3 h-3 text-emerald-500" />
                      <span>{animal.trackerBatteryPercent || 92}%</span>
                      <ChevronRight className="w-4 h-4 ml-1 text-slate-400" />
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Poultry Section */}
        {(selectedCategory === 'All' || selectedCategory === 'Poultry') && poultryBatches.length > 0 && (
          <div className="space-y-3 pt-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Poultry Batches ({poultryBatches.length})
            </h2>

            {poultryBatches.map(batch => (
              <Card key={batch.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-xl">
                      🐔
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">
                        {batch.batchName} ({batch.birdType})
                      </h3>
                      <p className="text-xs text-slate-500">
                        Bird Count: {batch.birdCount} • Age: {batch.ageWeeks} Weeks
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-bold text-amber-600 block">
                      🥚 {batch.dailyEggCount} Eggs/day
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Feed left: {batch.feedRemainingDays} days
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Quick Shortcuts */}
        <div className="pt-2 grid grid-cols-2 gap-2">
          <button
            onClick={() => navigateToSubScreen('cctv_monitor')}
            className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-left hover:border-emerald-500 transition-colors shadow-sm"
          >
            <div className="text-xl mb-1">📹</div>
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">CCTV Estrus Monitor</h4>
            <p className="text-[10px] text-slate-400">Heat detection & mounting camera</p>
          </button>

          <button
            onClick={() => navigateToSubScreen('mastitis_scanner')}
            className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-left hover:border-emerald-500 transition-colors shadow-sm"
          >
            <div className="text-xl mb-1">🩺</div>
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">Mastitis Udder Scanner</h4>
            <p className="text-[10px] text-slate-400">Early udder inflammation triage</p>
          </button>
        </div>
      </div>
    </div>
  );
};
export default LivestockScreen;
