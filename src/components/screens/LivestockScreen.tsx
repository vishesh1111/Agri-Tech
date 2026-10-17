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

const CATEGORIES = ['All', 'Cattle & Dairy', 'Poultry', 'Goat & Sheep'];

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
      selectedCategory === 'Cattle & Dairy' ? (animal.type.includes('Cow') || animal.type.includes('Buffalo')) :
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-zinc-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
              <Activity className="h-5 w-5" />
            </span>
            <h1 className="text-xl font-semibold text-zinc-900">
              Livestock & Herd Health
            </h1>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Animal records, GPS geofencing, milk logs, vaccination reminders & health scans
          </p>
        </div>

        <button
          onClick={() => navigateToSubScreen('add_animal')}
          className="flex items-center gap-2 rounded-lg bg-emerald-700 px-3.5 py-2 text-xs font-medium text-white hover:bg-emerald-800 transition-colors shadow-xs"
        >
          <Plus className="h-4 w-4" />
          <span>Register Animal</span>
        </button>
      </div>

      {/* 2. Search & Category Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-zinc-400" />
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search cow, breed, tag..."
            className="w-full bg-white text-zinc-900 text-xs rounded-lg pl-8 pr-3 py-1.5 border border-zinc-200 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-emerald-600"
          />
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none w-full sm:w-auto">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-zinc-900 text-white'
                  : 'bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Cattle & Dairy Animals Grid (3-Column Desktop Grid) */}
      {(selectedCategory === 'All' || selectedCategory === 'Cattle & Dairy' || selectedCategory === 'Goat & Sheep') && (
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping"></span>
                <span className="text-xs font-semibold text-emerald-950">
                  Virtual Pasture Geofence & CCTV Boundary Monitoring Active
                </span>
              </div>
              <p className="text-[11px] text-emerald-800 mt-0.5">
                BLE collar radar tracking active (150m boundary). Switch to live CCTV footage to draw virtual fence lines and get alerts.
              </p>
            </div>
            <button
              onClick={() => navigateToSubScreen('cctv_monitor')}
              className="shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-700 text-white text-xs font-semibold hover:bg-emerald-800 transition-all shadow-xs"
            >
              <Video className="w-3.5 h-3.5" />
              <span>Live CCTV Fence →</span>
            </button>
          </div>

          <div className="flex items-center justify-between pt-1">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-600">
              Registered Cattle ({filteredAnimals.length})
            </h2>
            <span className="text-xs text-zinc-500 font-medium">3 of 3 Inside Perimeter</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAnimals.map((animal) => (
              <Card 
                key={animal.id} 
                onClick={() => handleOpenAnimal(animal.id)}
                className="p-4 cursor-pointer hover:border-emerald-300 hover:shadow-lg hover:-translate-y-1 active:scale-[0.99] transition-all duration-200 border border-zinc-200/80 bg-white space-y-3 shadow-[0_1px_3px_rgba(0,0,0,0.03)] group"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-sm text-zinc-900 group-hover:text-emerald-900 transition-colors">
                        {animal.name}
                      </h3>
                      <span className="text-[10px] font-medium bg-zinc-100 text-zinc-700 px-1.5 py-0.5 rounded">
                        {animal.tagId}
                      </span>
                    </div>

                    <p className="text-xs text-zinc-500 mt-0.5">
                      {animal.breed} · {animal.ageYears} yrs
                    </p>
                  </div>

                  {animal.isInsideFence ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-800 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded transition-transform group-hover:scale-105">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                      Inside Perimeter
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-rose-800 bg-rose-50 border border-rose-200/60 px-2 py-0.5 rounded animate-bounce">
                      <AlertTriangle className="w-3 h-3 text-rose-600" />
                      Outside Perimeter
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 text-center text-xs bg-zinc-50 p-2 rounded-lg border border-zinc-100 group-hover:bg-emerald-50/30 transition-colors">
                  <div>
                    <span className="text-[10px] text-zinc-400">Daily Milk</span>
                    <p className="font-semibold text-zinc-900 text-sm">{animal.dailyMilkYield} L</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-400">Health Index</span>
                    <p className="font-semibold text-zinc-900 text-sm">{animal.healthScore}%</p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-zinc-400 pt-1 border-t border-zinc-100 font-normal">
                  <div className="flex items-center gap-1 text-[11px]">
                    <Battery className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Battery: {animal.trackerBatteryPercent || 92}%</span>
                  </div>
                  <span className="text-emerald-700 font-medium group-hover:translate-x-0.5 transition-transform">View Profile →</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* 4. Poultry Batches Section (2-Column Desktop Grid) */}
      {(selectedCategory === 'All' || selectedCategory === 'Poultry') && poultryBatches.length > 0 && (
        <div className="space-y-3 pt-2">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-600">
            Poultry Flocks ({poultryBatches.length})
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {poultryBatches.map((batch) => (
              <Card key={batch.id} className="p-4 border border-zinc-200/80 bg-white space-y-3 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:border-amber-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-sm text-zinc-900">
                      {batch.batchName} ({batch.birdType})
                    </h3>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      Flock: {batch.birdCount} birds · Age: {batch.ageWeeks} weeks
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-semibold text-zinc-900 block">
                      {batch.dailyEggCount} eggs/day
                    </span>
                    <span className="text-[10px] text-zinc-400">
                      Feed: {batch.feedRemainingDays} days left
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* 5. Health Diagnostic Shortcuts */}
      <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={() => navigateToSubScreen('cctv_monitor')}
          className="p-4 bg-white border border-zinc-200/80 rounded-xl text-left hover:border-emerald-300 hover:shadow-lg hover:-translate-y-1 active:scale-[0.99] transition-all duration-200 flex items-start gap-3.5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] cursor-pointer group"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-100 group-hover:bg-emerald-50 text-zinc-700 group-hover:text-emerald-700 group-hover:scale-110 transition-all duration-200">
            <Video className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-zinc-900 group-hover:text-emerald-900 transition-colors">Virtual Fencing AI (CCTV Camera)</h4>
            <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">Live pasture video monitoring, interactive boundary lines, and instant perimeter breach alarms</p>
          </div>
        </button>

        <button
          onClick={() => navigateToSubScreen('mastitis_scanner')}
          className="p-4 bg-white border border-zinc-200/80 rounded-xl text-left hover:border-emerald-300 hover:shadow-lg hover:-translate-y-1 active:scale-[0.99] transition-all duration-200 flex items-start gap-3.5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] cursor-pointer group"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-100 group-hover:bg-emerald-50 text-zinc-700 group-hover:text-emerald-700 group-hover:scale-110 transition-all duration-200">
            <Stethoscope className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-zinc-900 group-hover:text-emerald-900 transition-colors">Mastitis Udder Health Scan</h4>
            <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">Early subclinical infection detection with on-device ONNX vision models</p>
          </div>
        </button>
      </div>
    </div>
  );
};

export default LivestockScreen;
