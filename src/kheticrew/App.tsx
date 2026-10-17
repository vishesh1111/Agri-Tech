'use client';

import React from 'react';
import { useStore, useTranslation } from './store/useStore';
import { Navbar } from './components/Navbar';
import { GuidedTourModal } from './components/GuidedTourModal';
import { DashboardScreen } from './features/dashboard/DashboardScreen';
import { OverbookingScreen } from './features/overbooking/OverbookingScreen';
import { RelayScreen } from './features/relay/RelayScreen';
import { LpiScreen } from './features/lpi/LpiScreen';
import { MicroshiftScreen } from './features/microshift/MicroshiftScreen';
import { FestivalScreen } from './features/festival/FestivalScreen';
import { SettingsScreen } from './features/settings/SettingsScreen';
import { SIMULATED_TODAY, SIMULATED_HORIZON, formatDateShort } from './lib/dates';
import { Sparkles, Heart } from 'lucide-react';

export const App: React.FC = () => {
  const activeTab = useStore((state) => state.activeTab);
  const t = useTranslation();

  const renderActiveScreen = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardScreen />;
      case 'overbooking':
        return <OverbookingScreen />;
      case 'relay':
        return <RelayScreen />;
      case 'lpi':
        return <LpiScreen />;
      case 'microshift':
        return <MicroshiftScreen />;
      case 'festival':
        return <FestivalScreen />;
      case 'settings':
        return <SettingsScreen />;
      default:
        return <DashboardScreen />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans selection:bg-brand-500 selection:text-white">
      {/* Sticky Top Navbar */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8">
        {renderActiveScreen()}
      </main>

      {/* Guided Tour Modal Overlay */}
      <GuidedTourModal />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-black text-slate-800 text-sm tracking-tight">KhetiCrew</span>
            <span className="text-slate-300">|</span>
            <span>{t.app.tagline}</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-mono text-[11px]">
              Simulated: {formatDateShort(SIMULATED_TODAY)} → {formatDateShort(SIMULATED_HORIZON)}
            </span>
            <span className="text-slate-400">
              Built for Social & Climate Change Hackathon
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
