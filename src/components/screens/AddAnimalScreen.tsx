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
      <div className="flex items-center justify-between bg-white p-5 rounded-xl border border-zinc-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900">
            Register Livestock
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Add cattle, buffalo, or small ruminant record to the farm registry
          </p>
        </div>

        <button
          onClick={navigateBack}
          className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-100 hover:border-zinc-300 hover:scale-105 active:scale-95 transition-all shadow-xs cursor-pointer"
        >
          Cancel
        </button>
      </div>

      <Card className="p-5 border border-zinc-200/80 bg-white space-y-4 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-sm transition-all duration-200">
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Type Picker */}
          <div>
            <label className="font-medium text-zinc-700 block mb-1.5">
              Animal Type
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {ANIMAL_TYPES.map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`py-1.5 px-2.5 rounded-lg text-xs font-medium transition-all duration-200 hover:-translate-y-0.5 active:scale-95 border cursor-pointer ${
                    type === t
                      ? 'bg-zinc-900 text-white border-zinc-900 shadow-xs'
                      : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50 hover:border-zinc-300'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-medium text-zinc-700">Animal Name / Call Sign</label>
              <input 
                type="text"
                required
                placeholder="e.g. Ganga"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs p-2 rounded-lg border border-zinc-200 bg-white text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-all mt-1"
              />
            </div>

            <div>
              <label className="font-medium text-zinc-700">Ear Tag / ID</label>
              <input 
                type="text"
                required
                placeholder="e.g. C-05"
                value={tagId}
                onChange={(e) => setTagId(e.target.value)}
                className="w-full text-xs p-2 rounded-lg border border-zinc-200 bg-white text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-all mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-medium text-zinc-700">Breed</label>
              <input 
                type="text"
                required
                placeholder="e.g. Sahiwal / Murrah"
                value={breed}
                onChange={(e) => setBreed(e.target.value)}
                className="w-full text-xs p-2 rounded-lg border border-zinc-200 bg-white text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-all mt-1"
              />
            </div>

            <div>
              <label className="font-medium text-zinc-700">Age (Years)</label>
              <input 
                type="number"
                value={ageYears}
                onChange={(e) => setAgeYears(e.target.value)}
                className="w-full text-xs p-2 rounded-lg border border-zinc-200 bg-white text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-all mt-1"
              />
            </div>
          </div>

          {/* GPS Collar Toggle */}
          <div className="pt-2 border-t border-zinc-100 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium text-zinc-900 block">
                  Assign GPS / BLE Collar
                </span>
                <span className="text-[11px] text-zinc-400">
                  Enables real-time geofence tracking and boundary alerts
                </span>
              </div>

              <button
                type="button"
                onClick={() => setHasBleTracker(!hasBleTracker)}
                className={`w-11 h-6 rounded-full transition-all duration-200 relative p-0.5 hover:scale-105 active:scale-95 cursor-pointer ${
                  hasBleTracker ? 'bg-emerald-700' : 'bg-zinc-200'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform duration-200 ${
                    hasBleTracker ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {hasBleTracker && (
              <div className="animate-slide-down">
                <label className="font-medium text-zinc-700">Collar Device ID</label>
                <input 
                  type="text"
                  value={bleDeviceName}
                  onChange={(e) => setBleDeviceName(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-zinc-200 bg-white text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-all mt-1"
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-emerald-700 py-2.5 text-xs font-medium text-white hover:bg-emerald-800 hover:scale-102 active:scale-98 transition-all shadow-xs cursor-pointer"
          >
            Save Animal Record
          </button>
        </form>
      </Card>
    </div>
  );
};

export default AddAnimalScreen;
