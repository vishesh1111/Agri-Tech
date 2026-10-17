'use client';

import React, { useState } from 'react';
import { 
  Clock, Calendar, Sparkles, Check, 
  Droplet, Sliders, AlertCircle
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { useKisanStore } from '@/stores/useKisanStore';

const DAYS = [
  { id: 'M', label: 'Mon' },
  { id: 'T', label: 'Tue' },
  { id: 'W', label: 'Wed' },
  { id: 'Th', label: 'Thu' },
  { id: 'F', label: 'Fri' },
  { id: 'Sa', label: 'Sat' },
  { id: 'Su', label: 'Sun' }
];

export const SetScheduleScreen: React.FC = () => {
  const { navigateBack, updateIrrigationSchedule, irrigationZones } = useKisanStore();

  const [startTime, setStartTime] = useState('05:30');
  const [duration, setDuration] = useState(45);
  const [selectedDays, setSelectedDays] = useState<string[]>(['M', 'W', 'F']);
  const [smartScheduling, setSmartScheduling] = useState(true);
  const [savedNotification, setSavedNotification] = useState(false);

  const toggleDay = (dayId: string) => {
    if (selectedDays.includes(dayId)) {
      setSelectedDays(selectedDays.filter(d => d !== dayId));
    } else {
      setSelectedDays([...selectedDays, dayId]);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (updateIrrigationSchedule) {
      const zoneId = irrigationZones[0]?.id || 'zone_1';
      updateIrrigationSchedule(zoneId, startTime, duration, selectedDays.join(', '), smartScheduling);
    }
    setSavedNotification(true);
    setTimeout(() => {
      setSavedNotification(false);
      navigateBack();
    }, 1200);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* 1. Header Toolbar */}
      <div className="flex items-center justify-between bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-xs">
        <div>
          <h1 className="text-xl font-black text-gray-900 dark:text-zinc-100 flex items-center gap-2">
            <span>⏱️</span>
            <span>Configure Smart Irrigation Schedule</span>
          </h1>
          <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
            Automated motorized valve timers with Open-Meteo satellite rain skip
          </p>
        </div>

        <button
          onClick={navigateBack}
          className="rounded-xl bg-gray-100 dark:bg-zinc-800 px-3.5 py-1.5 text-xs font-bold text-gray-700 dark:text-zinc-300 hover:bg-gray-200"
        >
          Cancel
        </button>
      </div>

      {savedNotification && (
        <div className="p-4 bg-emerald-100 text-emerald-800 rounded-2xl flex items-center gap-2 text-xs font-bold shadow-xs animate-fade-in border border-emerald-300">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>Irrigation automation schedule updated successfully!</span>
        </div>
      )}

      {/* 2. Smart AI Toggle */}
      <Card className="p-5 border-2 border-emerald-300 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-emerald-950 dark:text-emerald-200">
                Autonomous Satellite Rain Skip
              </h3>
              <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-0.5">
                Automatically skips watering cycle if forecast predicts rainfall &gt; 5mm in next 24 hours
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setSmartScheduling(!smartScheduling)}
            className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
              smartScheduling ? 'bg-emerald-600' : 'bg-gray-300 dark:bg-zinc-700'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                smartScheduling ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </Card>

      {/* 3. Schedule Form */}
      <Card className="p-6 border border-gray-200 dark:border-zinc-800 space-y-5">
        <form onSubmit={handleSave} className="space-y-5 text-xs">
          {/* Start Time */}
          <div>
            <label className="font-bold text-gray-700 dark:text-zinc-300 block mb-1.5">
              Cycle Start Time (Early morning recommended)
            </label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full text-base font-bold p-3 rounded-xl border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
            />
          </div>

          {/* Duration Slider */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="font-bold text-gray-700 dark:text-zinc-300">
                Watering Duration Per Zone
              </label>
              <span className="font-black text-emerald-600 text-sm">
                {duration} Minutes
              </span>
            </div>
            <input
              type="range"
              min="15"
              max="120"
              step="5"
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
          </div>

          {/* Active Days of Week */}
          <div className="space-y-2">
            <label className="font-bold text-gray-700 dark:text-zinc-300 block">
              Active Days of the Week
            </label>
            <div className="grid grid-cols-7 gap-2">
              {DAYS.map(d => {
                const isSelected = selectedDays.includes(d.id);
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => toggleDay(d.id)}
                    className={`py-3 rounded-xl font-bold text-xs transition-all ${
                      isSelected
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 hover:bg-gray-200'
                    }`}
                  >
                    {d.label}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-emerald-600 py-3.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition-all active:scale-95"
          >
            Save Irrigation Automation Schedule
          </button>
        </form>
      </Card>
    </div>
  );
};

export default SetScheduleScreen;
