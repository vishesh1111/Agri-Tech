import React, { useState } from 'react';
import { useStore, useTranslation, NavTab } from '../store/useStore';
import {
  Sprout,
  RotateCcw,
  Languages,
  PlayCircle,
  Menu,
  X,
  Gauge,
  Workflow,
  BarChart3,
  Split,
  CalendarDays,
  Settings,
  LayoutDashboard,
  ArrowLeft,
} from 'lucide-react';
import { useKisanStore } from '@/stores/useKisanStore';
import { SIMULATED_TODAY, formatDateShort } from '../lib/dates';

export const Navbar: React.FC = () => {
  const { lang, setLang, activeTab, setActiveTab, resetDemoData, setGuidedTourStep } = useStore();
  const t = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showResetNotice, setShowResetNotice] = useState(false);

  const navItems: { tab: NavTab; label: string; icon: React.ReactNode }[] = [
    { tab: 'dashboard', label: t.nav.dashboard, icon: <LayoutDashboard className="w-4 h-4" /> },
    { tab: 'lpi', label: t.nav.lpi, icon: <BarChart3 className="w-4 h-4" /> },
    { tab: 'overbooking', label: t.nav.overbooking, icon: <Gauge className="w-4 h-4" /> },
    { tab: 'relay', label: t.nav.relay, icon: <Workflow className="w-4 h-4" /> },
    { tab: 'microshift', label: t.nav.microshift, icon: <Split className="w-4 h-4" /> },
    { tab: 'festival', label: t.nav.festival, icon: <CalendarDays className="w-4 h-4" /> },
    { tab: 'settings', label: t.nav.settings, icon: <Settings className="w-4 h-4" /> },
  ];

  const handleReset = () => {
    resetDemoData();
    setShowResetNotice(true);
    setTimeout(() => setShowResetNotice(false), 3000);
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-2">
          {/* Brand Logo & Title */}
          <div
            className="flex items-center gap-3 cursor-pointer shrink-0"
            onClick={() => setActiveTab('dashboard')}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white shadow-md">
              <Sprout className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg text-slate-900 tracking-tight">
                  {t.app.title}
                </span>
                <span className="hidden sm:inline-block text-[11px] font-semibold bg-brand-50 text-brand-700 px-2 py-0.5 rounded-full border border-brand-200">
                  {formatDateShort(SIMULATED_TODAY)}
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden md:block">
                {t.app.subtitle}
              </p>
            </div>
          </div>

          {/* Action Tools */}
          <div className="flex items-center gap-2">
            {/* Back to KisanTech Button */}
            <button
              type="button"
              onClick={() => {
                try {
                  useKisanStore.getState().navigateBack();
                } catch {
                  window.location.href = '/';
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg shadow-2xs transition-colors min-h-touch cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Farm</span>
            </button>

            {/* Guided Demo Tour Button */}
            <button
              type="button"
              onClick={() => setGuidedTourStep(1)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-brand-600 hover:bg-brand-700 text-white rounded-lg shadow-sm transition-colors min-h-touch"
              aria-label="Start Guided 6-Step Demo Tour"
            >
              <PlayCircle className="w-4 h-4" />
              <span className="hidden sm:inline">{t.app.guidedTour}</span>
            </button>

            {/* Reset Demo Data Button */}
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-300 transition-colors min-h-touch"
              title={t.app.resetDemo}
              aria-label="Reset all demo data to seed 42 state"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden md:inline">{t.app.resetDemo}</span>
            </button>

            {/* Language Toggle (EN / HI) */}
            <button
              type="button"
              onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg min-h-touch"
              aria-label={`Toggle language. Current: ${lang === 'en' ? 'English' : 'हिंदी'}`}
            >
              <Languages className="w-4 h-4 text-brand-600" />
              <span>{lang === 'en' ? 'हिन्दी' : 'English'}</span>
            </button>

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 min-h-touch"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Desktop Navigation Tabs */}
        <nav className="hidden lg:flex items-center gap-1 overflow-x-auto border-t border-slate-100 py-1.5">
          {navItems.map((item) => {
            const isActive = activeTab === item.tab;
            return (
              <button
                key={item.tab}
                type="button"
                onClick={() => setActiveTab(item.tab)}
                className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg transition-all min-h-touch ${
                  isActive
                    ? 'bg-brand-50 text-brand-700 border border-brand-200 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-3 shadow-lg animate-in slide-in-from-top-2">
          <div className="flex flex-col gap-1.5">
            {navItems.map((item) => {
              const isActive = activeTab === item.tab;
              return (
                <button
                  key={item.tab}
                  type="button"
                  onClick={() => {
                    setActiveTab(item.tab);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-semibold text-left transition-colors min-h-touch ${
                    isActive
                      ? 'bg-brand-50 text-brand-700 border border-brand-200'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Reset Confirmation Banner */}
      {showResetNotice && (
        <div className="bg-emerald-600 text-white text-xs py-1.5 px-4 text-center font-medium shadow-inner transition-opacity">
          {t.app.resetSuccess}
        </div>
      )}
    </header>
  );
};
