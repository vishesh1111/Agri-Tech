'use client';

import React, { useState } from 'react';
import { 
  Plus, ArrowLeft, X, Heart, Radio, Check, 
  Sparkles, Tag, Shield
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { useKisanStore } from '@/stores/useKisanStore';

const ANIMAL_TYPES = ['Cow', 'Buffalo', 'Goat', 'Sheep', 'Poultry', 'Other'];

export const AddAnimalScreen: React.FC = () => {
  const { addAnimal, farms, navigateBack } = useKisanStore();

  const [name, setName] = useState('');
  const [type, setType] = useState('Cow');
  const [breed, setBreed] = useState('Gir Breed');
  const [ageYears, setAgeYears] = useState('3');
  const [tagId, setTagId] = useState('C-05');
  const [hasBleTracker, setHasBleTracker] = useState(true);
  const [bleDeviceName, setBleDeviceName] = useState('KisanTrack-BLE-05');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addAnimal({
      farmId: farms[0]?.id || 'farm_1',
      name: name.trim(),
      tagId: tagId.trim(),
      type,
      breed: breed.trim(),
      ageYears: parseInt(ageYears) || 3,
      healthScore: 95,
      dailyMilkYield: type === 'Cow' || type === 'Buffalo' ? 14.0 : 0,
      lastVaccineDaysAgo: 0,
      nextVaccineName: 'FMD Primary',
      nextVaccineInDays: 30,
      isInsideFence: true,
      distanceFromCenterM: 10,
      fenceRadiusM: 150,
      trackerBatteryPercent: 100,
      trackerDeviceId: hasBleTracker ? bleDeviceName : undefined,
      lastPingTime: 'Just now',
      barnSection: 'Barn 1',
      insight: 'New animal registered. Initial quarantine and vaccine baseline logged.'
    });

    navigateBack();
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* 1. Header Toolbar */}
      <div className="flex items-center justify-between bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-xs">
        <div>
          <h1 className="text-xl font-black text-gray-900 dark:text-zinc-100 flex items-center gap-2">
            <span>🐄</span>
            <span>Register New Livestock Animal</span>
          </h1>
          <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
            Add cattle, buffalo or flock record to the herd database with optional GPS collar
          </p>
        </div>

        <button
          onClick={navigateBack}
          className="rounded-xl bg-gray-100 dark:bg-zinc-800 px-3.5 py-1.5 text-xs font-bold text-gray-700 dark:text-zinc-300 hover:bg-gray-200"
        >
          Cancel
        </button>
      </div>

      <Card className="p-6 border border-gray-200 dark:border-zinc-800 space-y-5">
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Type Picker */}
          <div>
            <label className="font-bold text-gray-700 dark:text-zinc-300 block mb-1.5">
              Select Animal Category
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {ANIMAL_TYPES.map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                    type === t
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-white dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 border-gray-200 dark:border-zinc-700 hover:bg-gray-50'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-gray-700 dark:text-zinc-300">Animal Name</label>
              <input 
                type="text"
                required
                placeholder="e.g. Ganga"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white mt-1"
              />
            </div>

            <div>
              <label className="font-bold text-gray-700 dark:text-zinc-300">Ear Tag / Collar ID</label>
              <input 
                type="text"
                required
                placeholder="e.g. C-05"
                value={tagId}
                onChange={(e) => setTagId(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-gray-700 dark:text-zinc-300">Breed</label>
              <input 
                type="text"
                required
                placeholder="e.g. Sahiwal / Murrah"
                value={breed}
                onChange={(e) => setBreed(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white mt-1"
              />
            </div>

            <div>
              <label className="font-bold text-gray-700 dark:text-zinc-300">Age (Years)</label>
              <input 
                type="number"
                value={ageYears}
                onChange={(e) => setAgeYears(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white mt-1"
              />
            </div>
          </div>

          {/* GPS Collar Toggle */}
          <div className="pt-2 border-t border-gray-100 dark:border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-gray-900 dark:text-zinc-100 block">
                  Assign KisanTrack GPS Collar
                </span>
                <span className="text-[11px] text-gray-400">
                  Enables real-time geofence tracking and boundary alerts
                </span>
              </div>

              <button
                type="button"
                onClick={() => setHasBleTracker(!hasBleTracker)}
                className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                  hasBleTracker ? 'bg-emerald-600' : 'bg-gray-300 dark:bg-zinc-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    hasBleTracker ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {hasBleTracker && (
              <div>
                <label className="font-bold text-gray-700 dark:text-zinc-300">Collar Device ID</label>
                <input 
                  type="text"
                  value={bleDeviceName}
                  onChange={(e) => setBleDeviceName(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white mt-1"
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-emerald-600 py-3.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition-all active:scale-95"
          >
            Register Animal in Herd Database
          </button>
        </form>
      </Card>
    </div>
  );
};

export default AddAnimalScreen;
