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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-zinc-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
              <SettingsIcon className="h-5 w-5" />
            </span>
            <h1 className="text-xl font-semibold text-zinc-900">
              Preferences & System Settings
            </h1>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Display language, voice preferences, local offline database, and profile details
          </p>
        </div>
      </div>

      {/* 2. Profile Card shortcut */}
      <Card 
        onClick={() => navigateToSubScreen('farmer_profile')}
        className="p-5 cursor-pointer hover:border-zinc-300 transition-all flex items-center justify-between border border-zinc-200/80 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.03)]"
      >
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-zinc-100 text-zinc-800 font-semibold text-base flex items-center justify-center">
            {userProfile?.name?.split(' ').map(n => n[0]).join('') || 'RK'}
          </div>
          <div>
            <h3 className="font-semibold text-sm text-zinc-900">
              {userProfile?.name || 'Ramesh Kumar'}
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              {userProfile?.district || 'Ludhiana'}, {userProfile?.state || 'Punjab'} · {userProfile?.phone || '+91 98765 43210'}
            </p>
            <span className="text-[11px] text-emerald-700 font-medium block mt-0.5">
              Farmer ID: {userProfile?.id || 'PB-LDH-8841'} · Verified Landholder
            </span>
          </div>
        </div>
        <span className="text-xs font-medium text-emerald-700 hover:underline">
          View Profile →
        </span>
      </Card>

      {/* 3. Language Selection (2-Column Grid) */}
      <Card className="p-5 border border-zinc-200/80 bg-white space-y-4 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
        <div>
          <h3 className="font-semibold text-sm text-zinc-900 flex items-center gap-2">
            <Globe className="w-4 h-4 text-emerald-700" />
            <span>Application Language</span>
          </h3>
          <p className="text-xs text-zinc-500 mt-0.5">
            Select your preferred regional language for voice responses, mandi reports, and agronomy advice
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          {LANGUAGES.map(lang => {
            const isSelected = currentLanguage?.code === lang.code;
            return (
              <button
                key={lang.code}
                onClick={() => setLanguage(lang)}
                className={`flex items-center justify-between p-3.5 rounded-lg text-xs font-medium transition-colors border ${
                  isSelected 
                    ? 'bg-zinc-900 text-white border-zinc-900 shadow-xs' 
                    : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">{lang.nativeName}</span>
                  <span className="text-zinc-400 font-normal">({lang.displayName})</span>
                </div>
                {isSelected && <Check className="w-4 h-4 text-emerald-400" />}
              </button>
            );
          })}
        </div>
      </Card>

      {/* 4. Database & Offline Storage Telemetry */}
      <Card className="p-5 border border-zinc-200/80 bg-white space-y-4 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
        <div>
          <h3 className="font-semibold text-sm text-zinc-900 flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-700" />
            <span>Offline-First Storage Engine (IndexedDB)</span>
          </h3>
          <p className="text-xs text-zinc-500 mt-0.5">
            Your farm plots, livestock logs, and accounting transactions are safely cached directly on your device
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-zinc-50 border border-zinc-100 rounded-lg">
            <span className="text-zinc-400 block text-[10px] uppercase font-medium">Database Layer</span>
            <span className="text-zinc-800 text-sm mt-0.5 block font-semibold">Dexie.js (IndexedDB)</span>
          </div>
          <div className="p-3 bg-zinc-50 border border-zinc-100 rounded-lg">
            <span className="text-zinc-400 block text-[10px] uppercase font-medium">Sync State</span>
            <span className="text-emerald-700 text-sm mt-0.5 block font-semibold flex items-center gap-1">
              <CheckCircle2 className="h-4 w-4" />
              <span>Locally Cached</span>
            </span>
          </div>
          <div className="p-3 bg-zinc-50 border border-zinc-100 rounded-lg">
            <span className="text-zinc-400 block text-[10px] uppercase font-medium">Offline Operations</span>
            <span className="text-zinc-800 text-sm mt-0.5 block font-semibold">Fully Functional</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SettingsScreen;
