'use client';

import React from 'react';
import { 
  Settings as SettingsIcon, Globe, Moon, Sun, Shield, 
  Smartphone, ArrowLeft, Check, Sparkles, User, Info, 
  HelpCircle, Database, CheckCircle2
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
    navigateToSubScreen 
  } = useKisanStore();

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-xs">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-gray-900 dark:text-zinc-100 flex items-center gap-2">
            <span>⚙️</span>
            <span>Settings & Regional Preferences</span>
          </h1>
          <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
            Display language, voice accent, dark/light theme & offline IndexedDB database synchronization
          </p>
        </div>
      </div>

      {/* 2. Profile Card shortcut */}
      <Card 
        onClick={() => navigateToSubScreen('farmer_profile')}
        className="p-5 cursor-pointer hover:border-emerald-300 hover:shadow-md transition-all flex items-center justify-between border border-gray-200 dark:border-zinc-800"
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-black text-lg flex items-center justify-center">
            {userProfile?.name?.split(' ').map(n => n[0]).join('') || 'RK'}
          </div>
          <div>
            <h3 className="font-extrabold text-base text-gray-900 dark:text-zinc-100">
              {userProfile?.name || 'Ramesh Kumar'}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {userProfile?.district || 'Ludhiana'}, {userProfile?.state || 'Punjab'} • {userProfile?.phone || '+91 98765 43210'}
            </p>
            <span className="text-[11px] text-emerald-600 font-bold block mt-1">
              Farmer ID: {userProfile?.id || 'PB-LDH-8841'} • Verified Landholder
            </span>
          </div>
        </div>
        <span className="text-xs font-bold text-emerald-600 hover:underline">
          View & Edit Profile →
        </span>
      </Card>

      {/* 3. Language Selection (2-Column Grid) */}
      <Card className="p-6 border border-gray-200 dark:border-zinc-800 space-y-4">
        <div>
          <h3 className="font-extrabold text-base text-gray-900 dark:text-zinc-100 flex items-center gap-2">
            <Globe className="w-4 h-4 text-emerald-600" />
            <span>Regional Indian Language</span>
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Select your preferred language for autonomous AI voice guidance, mandi reports and disease prescriptions
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {LANGUAGES.map(lang => {
            const isSelected = currentLanguage?.code === lang.code;
            return (
              <button
                key={lang.code}
                onClick={() => setLanguage(lang)}
                className={`flex items-center justify-between p-4 rounded-xl text-xs font-bold transition-all border ${
                  isSelected 
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-500 shadow-xs' 
                    : 'bg-white dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 border-gray-200 dark:border-zinc-700 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-sm font-extrabold">{lang.nativeName}</span>
                  <span className="text-gray-400 font-normal">({lang.displayName})</span>
                </div>
                {isSelected && <Check className="w-4 h-4 text-emerald-600" />}
              </button>
            );
          })}
        </div>
      </Card>

      {/* 4. Display Appearance & Theme */}
      <Card className="p-6 border border-gray-200 dark:border-zinc-800 space-y-4">
        <div>
          <h3 className="font-extrabold text-base text-gray-900 dark:text-zinc-100 flex items-center gap-2">
            {isDarkTheme ? <Moon className="w-4 h-4 text-emerald-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
            <span>Appearance & Theme</span>
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Switch between crisp daylight contrast and eye-comfort dark mode for nighttime farm monitoring
          </p>
        </div>

        <div className="flex items-center justify-between pt-1">
          <span className="text-xs font-bold text-gray-700 dark:text-zinc-300">Dark Mode</span>
          <button
            onClick={toggleTheme}
            className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
              isDarkTheme ? 'bg-emerald-600' : 'bg-gray-300'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                isDarkTheme ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </Card>

      {/* 5. Database & Offline Storage Telemetry */}
      <Card className="p-6 border border-gray-200 dark:border-zinc-800 space-y-4">
        <div>
          <h3 className="font-extrabold text-base text-gray-900 dark:text-zinc-100 flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-600" />
            <span>Offline-First Farm Storage (IndexedDB Dexie.js)</span>
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            All your farm records, crop lifecycles, and transactions are securely cached locally in your browser
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-gray-50 dark:bg-zinc-800/60 rounded-xl">
            <span className="text-gray-400 block text-[10px] font-bold uppercase">Database Engine</span>
            <strong className="text-gray-800 dark:text-zinc-200 text-sm mt-0.5 block">Dexie.js 4.0</strong>
          </div>
          <div className="p-3 bg-gray-50 dark:bg-zinc-800/60 rounded-xl">
            <span className="text-gray-400 block text-[10px] font-bold uppercase">Storage Status</span>
            <strong className="text-emerald-600 text-sm mt-0.5 block flex items-center gap-1">
              <CheckCircle2 className="h-4 w-4" />
              <span>Fully Synchronized</span>
            </strong>
          </div>
          <div className="p-3 bg-gray-50 dark:bg-zinc-800/60 rounded-xl">
            <span className="text-gray-400 block text-[10px] font-bold uppercase">PWA Offline Mode</span>
            <strong className="text-gray-800 dark:text-zinc-200 text-sm mt-0.5 block">Enabled</strong>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SettingsScreen;
