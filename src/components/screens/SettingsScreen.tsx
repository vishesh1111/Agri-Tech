'use client';

import React from 'react';
import { 
  Settings as SettingsIcon, Globe, Moon, Sun, Shield, 
  Smartphone, ArrowLeft, Check, Sparkles, User, Info, 
  HelpCircle, Database
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { useKisanStore } from '@/stores/useKisanStore';
import { AppLanguage, LANGUAGES } from '@/lib/types';

export const SettingsScreen: React.FC = () => {
  const { 
    currentLanguage, 
    setLanguage, 
    isDarkTheme, 
    toggleTheme, 
    userProfile,
    navigateBack,
    navigateToSubScreen 
  } = useKisanStore();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20">
      {/* Top Header */}
      <div className="bg-gradient-to-r from-emerald-700 to-green-700 text-white px-4 pt-4 pb-5 shadow-md">
        <div className="flex items-center gap-3">
          <button 
            onClick={navigateBack}
            className="p-1.5 rounded-full hover:bg-white/10 active:bg-white/20 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <SettingsIcon className="w-5 h-5 text-emerald-300" />
              Settings & Preferences
            </h1>
            <p className="text-xs text-emerald-100">Language, theme & offline synchronization</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4 max-w-lg mx-auto">
        {/* Profile Card shortcut */}
        <Card 
          onClick={() => navigateToSubScreen('farmer_profile')}
          className="p-4 cursor-pointer hover:shadow-md transition-shadow flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-extrabold text-base flex items-center justify-center">
              {userProfile?.name?.split(' ').map(n => n[0]).join('') || 'RK'}
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">
                {userProfile?.name || 'Ramesh Kumar'}
              </h3>
              <p className="text-xs text-slate-500">
                {userProfile?.district || 'Ludhiana'}, {userProfile?.state || 'Punjab'} • {userProfile?.phone || '+91 98765 43210'}
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold text-emerald-600">Edit</span>
        </Card>

        {/* Language Selection */}
        <Card className="p-4 space-y-3">
          <div className="flex items-center gap-2 text-slate-800 dark:text-slate-100 font-bold text-sm">
            <Globe className="w-4 h-4 text-emerald-600" />
            Display Language
          </div>

          <p className="text-xs text-slate-500">
            Select your preferred regional language for AI voice advice and farm reports.
          </p>

          <div className="space-y-1.5 pt-1">
            {LANGUAGES.map(lang => {
              const isSelected = currentLanguage?.code === lang.code;
              return (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-semibold transition-all ${
                    isSelected 
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700' 
                      : 'bg-slate-50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold">{lang.nativeName}</span>
                    <span className="text-slate-400 font-normal">({lang.displayName})</span>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-emerald-600" />}
                </button>
              );
            })}
          </div>
        </Card>

        {/* Dark Theme Switch */}
        <Card className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {isDarkTheme ? <Moon className="w-5 h-5 text-amber-400" /> : <Sun className="w-5 h-5 text-amber-500" />}
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">
                Dark Mode
              </h3>
              <p className="text-xs text-slate-500">
                Easier reading in bright daylight or night field work
              </p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              checked={isDarkTheme}
              onChange={toggleTheme}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
          </label>
        </Card>

        {/* Offline-First Storage Status */}
        <Card className="p-4 space-y-2">
          <div className="flex items-center gap-2 text-slate-800 dark:text-slate-100 font-bold text-sm">
            <Database className="w-4 h-4 text-emerald-600" />
            Offline-First Local Storage
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            All your farms, livestock health logs, soil telemetry, and market bids are indexed in your browser&apos;s IndexedDB database. Changes persist seamlessly without continuous internet.
          </p>

          <div className="flex items-center gap-2 pt-1 text-xs text-emerald-600 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            IndexedDB Database Synced (Dexie 4.0)
          </div>
        </Card>

        {/* About App */}
        <div className="text-center text-xs text-slate-400 pt-4 space-y-1">
          <p className="font-semibold text-slate-500">KisanAI Autonomous Farm Operating System</p>
          <p>Version 2.4.0 (Web Progressive Web App)</p>
          <p>Designed for Indian Agriculture • ICAR & PAU Calibrated</p>
        </div>
      </div>
    </div>
  );
};
export default SettingsScreen;
