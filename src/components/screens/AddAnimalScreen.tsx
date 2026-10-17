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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20">
      {/* Top Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={navigateBack}
              className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-base font-bold text-slate-800 dark:text-slate-100">
              Register New Animal
            </h1>
          </div>

          <button
            onClick={navigateBack}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type Picker */}
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
              Select Animal Category
            </label>
            <div className="grid grid-cols-3 gap-2">
              {ANIMAL_TYPES.map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                    type === t
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Name & Tag */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Animal Name</label>
              <input 
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Gauri"
                required
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white mt-1"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Ear Tag ID</label>
              <input 
                type="text"
                value={tagId}
                onChange={(e) => setTagId(e.target.value)}
                placeholder="e.g. C-05"
                required
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white mt-1"
              />
            </div>
          </div>

          {/* Breed & Age */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Breed</label>
              <input 
                type="text"
                value={breed}
                onChange={(e) => setBreed(e.target.value)}
                placeholder="e.g. Gir / Murrah"
                required
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white mt-1"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Age (Years)</label>
              <input 
                type="number"
                value={ageYears}
                onChange={(e) => setAgeYears(e.target.value)}
                min="0"
                max="25"
                required
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white mt-1"
              />
            </div>
          </div>

          {/* GPS Collar Toggle */}
          <Card className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                  Attach GPS Collar / Geofence
                </span>
              </div>

              <input 
                type="checkbox"
                checked={hasBleTracker}
                onChange={(e) => setHasBleTracker(e.target.checked)}
                className="accent-emerald-600 w-4 h-4 rounded"
              />
            </div>

            {hasBleTracker && (
              <div>
                <label className="text-[11px] text-slate-500 block mb-1">Tracker Device Identifier</label>
                <input 
                  type="text"
                  value={bleDeviceName}
                  onChange={(e) => setBleDeviceName(e.target.value)}
                  placeholder="e.g. KisanTrack-BLE-05"
                  className="w-full text-xs p-2 rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
            )}
          </Card>

          <button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl shadow-md transition-all active:scale-[0.99] text-sm mt-4"
          >
            Save Animal Profile
          </button>
        </form>
      </div>
    </div>
  );
};
export default AddAnimalScreen;
