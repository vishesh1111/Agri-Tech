'use client';

import React, { useState } from 'react';
import { 
  Clock, Calendar, Sparkles, Check, 
  Droplet, Sliders, AlertCircle, ArrowLeft
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
      <div className="flex items-center justify-between bg-white p-5 rounded-xl border border-zinc-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
              <Clock className="h-5 w-5" />
            </span>
            <h1 className="text-xl font-semibold text-zinc-900">
              Configure Irrigation Schedule
            </h1>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Valve automation schedule with weather-based rain skip
          </p>
        </div>

        <button
          onClick={navigateBack}
          className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-100 hover:border-zinc-300 hover:scale-105 active:scale-95 transition-all shadow-xs cursor-pointer"
        >
          Cancel
        </button>
      </div>

      {savedNotification && (
        <div className="p-3 bg-emerald-50 text-emerald-800 rounded-lg flex items-center gap-2 text-xs font-medium border border-emerald-200 animate-slide-down">
          <Check className="w-4 h-4 text-emerald-700" />
          <span>Irrigation schedule saved successfully!</span>
        </div>
      )}

      {/* 2. Smart Toggle */}
      <Card className="p-5 border border-zinc-200/80 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-sm transition-all duration-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-900">
                Weather Rain Skip
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                Automatically skips cycle if rain forecast exceeds 5mm in the next 24 hours
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setSmartScheduling(!smartScheduling)}
            className={`w-11 h-6 rounded-full transition-all duration-200 relative p-0.5 hover:scale-105 active:scale-95 cursor-pointer ${
              smartScheduling ? 'bg-emerald-700' : 'bg-zinc-200'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform duration-200 ${
                smartScheduling ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </Card>

      {/* 3. Schedule Form */}
      <Card className="p-5 border border-zinc-200/80 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-sm transition-all duration-200">
        <form onSubmit={handleSave} className="space-y-5 text-xs">
          {/* Start Time */}
          <div>
            <label className="font-medium text-zinc-700 block mb-1">
              Start Time
            </label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="rounded-lg border border-zinc-200 bg-white p-2 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-all"
            />
            <span className="text-zinc-400 text-[11px] block mt-1">
              Early morning watering minimizes evaporation loss
            </span>
          </div>

          {/* Duration Slider */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="font-medium text-zinc-700">Duration per Zone</label>
              <span className="font-semibold text-zinc-900 text-sm">{duration} minutes</span>
            </div>
            <input
              type="range"
              min={15}
              max={120}
              step={5}
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value))}
              className="w-full h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-emerald-700 hover:bg-zinc-300 transition-all"
            />
            <div className="flex justify-between text-[11px] text-zinc-400 mt-1">
              <span>15 min</span>
              <span>60 min</span>
              <span>120 min</span>
            </div>
          </div>

          {/* Days Selection */}
          <div>
            <label className="font-medium text-zinc-700 block mb-2">
              Watering Days
            </label>
            <div className="flex gap-2">
              {DAYS.map((day) => {
                const isSelected = selectedDays.includes(day.id);
                return (
                  <button
                    key={day.id}
                    type="button"
                    onClick={() => toggleDay(day.id)}
                    className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all duration-200 hover:-translate-y-0.5 active:scale-95 cursor-pointer ${
                      isSelected
                        ? 'bg-zinc-900 text-white shadow-xs'
                        : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                    }`}
                  >
                    {day.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full rounded-lg bg-emerald-700 py-2.5 text-xs font-medium text-white hover:bg-emerald-800 hover:scale-102 active:scale-98 transition-all shadow-xs cursor-pointer"
            >
              Save Schedule
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default SetScheduleScreen;
