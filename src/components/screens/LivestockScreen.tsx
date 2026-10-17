'use client';

import React, { useState } from 'react';
import { 
  Heart, Search, Plus, Radio, Shield, MapPin, 
  Battery, AlertTriangle, ArrowLeft, ChevronRight, Activity, 
  Sparkles, CheckCircle2, X, Video, Stethoscope
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useKisanStore } from '@/stores/useKisanStore';

const CATEGORIES = ['All', 'Cattle / Dairy', 'Poultry', 'Goat & Sheep'];

export const LivestockScreen: React.FC = () => {
  const { 
    livestock, 
    poultryBatches, 
    selectAnimal, 
    navigateToSubScreen, 
  } = useKisanStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredAnimals = livestock.filter((animal) => {
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
    <div className="space-y-6">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-xs">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-gray-900 dark:text-zinc-100 flex items-center gap-2">
            <span>🐄</span>
            <span>Livestock & Herd Health Manager</span>
          </h1>
          <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
            GPS geofence collars, daily milk telemetry, vaccination timeline & AI estrus detection
          </p>
        </div>

        <button
          onClick={() => navigateToSubScreen('add_animal')}
          className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition-all active:scale-95"
        >
          <Plus className="h-4 w-4" />
          <span>Register New Animal</span>
        </button>
      </div>

      {/* 2. Search & Category Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search cow, buffalo, breed, ear-tag..."
            className="w-full bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 text-xs rounded-xl pl-9 pr-4 py-2.5 border border-gray-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none w-full sm:w-auto">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 border border-gray-200 dark:border-zinc-700 hover:bg-gray-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Cattle & Dairy Animals Grid (3-Column Desktop Grid) */}
      {(selectedCategory === 'All' || selectedCategory === 'Cattle / Dairy' || selectedCategory === 'Goat & Sheep') && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Registered Cattle & Dairy Animals ({filteredAnimals.length})
            </h2>
            <span className="text-xs text-emerald-600 font-semibold">● GPS Gateway Active</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAnimals.map((animal) => (
              <Card 
                key={animal.id} 
                onClick={() => handleOpenAnimal(animal.id)}
                className="p-5 cursor-pointer hover:border-emerald-300 hover:shadow-md transition-all border border-gray-200 dark:border-zinc-800 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-2xl">
                      🐄
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-extrabold text-sm text-gray-900 dark:text-zinc-100">
                          {animal.name}
                        </h3>
                        <span className="text-[10px] font-bold bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300 px-2 py-0.5 rounded">
                          {animal.tagId}
                        </span>
                      </div>

                      <p className="text-xs text-gray-500 mt-0.5">
                        {animal.breed} • {animal.ageYears} Years Old
                      </p>
                    </div>
                  </div>

                  {animal.isInsideFence ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      Inside Fence
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-100 dark:bg-rose-950 px-2 py-0.5 rounded-full animate-pulse">
                      <AlertTriangle className="w-3 h-3 text-rose-600" />
                      Outside Fence!
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 text-center text-xs bg-gray-50 dark:bg-zinc-800/60 p-2.5 rounded-xl">
                  <div>
                    <span className="text-[10px] text-gray-400">Daily Milk</span>
                    <p className="font-black text-emerald-600 text-sm">{animal.dailyMilkYield} L/day</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400">Health Vigour</span>
                    <p className="font-black text-gray-900 dark:text-zinc-100 text-sm">{animal.healthScore}%</p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-400 pt-1 border-t border-gray-100 dark:border-zinc-800">
                  <div className="flex items-center gap-1 text-[11px]">
                    <Battery className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Collar Battery: {animal.trackerBatteryPercent || 92}%</span>
                  </div>
                  <span className="text-emerald-600 font-bold hover:underline">Profile & Milk Log →</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* 4. Poultry Batches Section (2-Column Desktop Grid) */}
      {(selectedCategory === 'All' || selectedCategory === 'Poultry') && poultryBatches.length > 0 && (
        <div className="space-y-3 pt-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500">
            Poultry Flocks & Egg Production ({poultryBatches.length})
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {poultryBatches.map((batch) => (
              <Card key={batch.id} className="p-4 border border-gray-200 dark:border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-xl">
                      🐔
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-gray-900 dark:text-zinc-100">
                        {batch.batchName} ({batch.birdType})
                      </h3>
                      <p className="text-xs text-gray-500">
                        Flock Count: {batch.birdCount} • Age: {batch.ageWeeks} Weeks
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-base font-black text-amber-600 block">
                      🥚 {batch.dailyEggCount} Eggs/day
                    </span>
                    <span className="text-[10px] text-gray-400">
                      Feed left: {batch.feedRemainingDays} days
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* 5. AI Vision & Bioacoustic Diagnostics Shortcuts (2 Columns) */}
      <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={() => navigateToSubScreen('cctv_monitor')}
          className="p-5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl text-left hover:border-emerald-500 hover:shadow-md transition-all flex items-start gap-4"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-100 text-red-600 dark:bg-red-950">
            <Video className="h-6 w-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-900 dark:text-zinc-100">CCTV Cattle Estrus Monitor</h4>
            <p className="text-xs text-gray-500 mt-1">Live camera stream with autonomous mounting behavior and heat window alerts</p>
          </div>
        </button>

        <button
          onClick={() => navigateToSubScreen('mastitis_scanner')}
          className="p-5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl text-left hover:border-emerald-500 hover:shadow-md transition-all flex items-start gap-4"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-950">
            <Stethoscope className="h-6 w-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-900 dark:text-zinc-100">Mastitis Udder Health Scanner</h4>
            <p className="text-xs text-gray-500 mt-1">Bovine udder photo analysis, somatic cell count (SCC) triage and treatment advice</p>
          </div>
        </button>
      </div>
    </div>
  );
};

export default LivestockScreen;
