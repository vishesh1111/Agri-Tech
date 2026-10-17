'use client';

import React, { useState } from 'react';
import { 
  Clock, Calendar, Sparkles, Check, ArrowLeft, X, 
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
              Set Irrigation Schedule
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

      <div className="max-w-md mx-auto p-4 space-y-5">
        {savedNotification && (
          <div className="p-3 bg-emerald-100 text-emerald-800 rounded-xl flex items-center gap-2 text-sm font-semibold shadow-sm animate-fade-in">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Schedule updated successfully!</span>
          </div>
        )}

        {/* Smart AI Toggle */}
        <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-emerald-950 dark:text-emerald-200">
                  Autonomous Weather Skip
                </h3>
                <p className="text-xs text-emerald-700 dark:text-emerald-300">
                  Skip watering if rainfall &gt; 5mm predicted
                </p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={smartScheduling}
                onChange={(e) => setSmartScheduling(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>
        </div>

        {/* Start Time */}
        <Card className="p-4 space-y-3">
          <div className="flex items-center gap-2 text-slate-800 dark:text-slate-100 font-bold text-sm">
            <Clock className="w-4 h-4 text-emerald-600" />
            Irrigation Start Time
          </div>

          <p className="text-xs text-slate-500">
            Early morning watering minimizes evaporation loss and prevents fungal spores on leaves.
          </p>

          <input 
            type="time" 
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full text-base font-bold p-3 rounded-xl border border-slate-300 dark:border-slate-600 dark:bg-slate-800 text-slate-800 dark:text-white"
          />
        </Card>

        {/* Duration Slider */}
        <Card className="p-4 space-y-3">
          <div className="flex items-center justify-between text-slate-800 dark:text-slate-100 font-bold text-sm">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-600" />
              Duration Per Zone
            </div>
            <span className="text-emerald-600 font-extrabold text-base">{duration} mins</span>
          </div>

          <input 
            type="range"
            min="15"
            max="120"
            step="5"
            value={duration}
            onChange={(e) => setDuration(parseInt(e.target.value))}
            className="w-full accent-emerald-600 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
          />

          <div className="flex justify-between text-[11px] text-slate-400">
            <span>15 mins (Light drip)</span>
            <span>60 mins</span>
            <span>120 mins (Flood)</span>
          </div>
        </Card>

        {/* Day Selector */}
        <Card className="p-4 space-y-3">
          <div className="flex items-center gap-2 text-slate-800 dark:text-slate-100 font-bold text-sm">
            <Calendar className="w-4 h-4 text-emerald-600" />
            Repeat Days
          </div>

          <div className="grid grid-cols-7 gap-1.5 pt-1">
            {DAYS.map(day => {
              const isSelected = selectedDays.includes(day.id);
              return (
                <button
                  key={day.id}
                  type="button"
                  onClick={() => toggleDay(day.id)}
                  className={`py-2 rounded-xl text-xs font-bold transition-all ${
                    isSelected
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  {day.label}
                </button>
              );
            })}
          </div>
        </Card>

        {/* Save Button */}
        <button
          onClick={handleSave}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl shadow-md transition-all active:scale-[0.99] text-sm"
        >
          Save Irrigation Schedule
        </button>
      </div>
    </div>
  );
};
export default SetScheduleScreen;
