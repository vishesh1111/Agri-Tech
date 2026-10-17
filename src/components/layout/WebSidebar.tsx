'use client';

import React from 'react';
import { 
  Home, Sprout, Bot, Store, Droplets, CloudSun, 
  Stethoscope, Clock, ShieldCheck, Heart, Video, Activity, 
  Volume2, Building, DollarSign, Settings, ChevronDown, Globe,
  CheckCircle2, Sparkles
} from 'lucide-react';
import { useKisanStore } from '@/stores/useKisanStore';
import { MainTab, SubScreen, LANGUAGES } from '@/lib/types';

export const WebSidebar: React.FC = () => {
  const { 
    currentTab, 
    currentSubScreen, 
    setTab, 
    navigateToSubScreen,
    farms,
    selectedFarmId,
    selectFarm,
    userProfile,
    currentLanguage,
    setLanguage,
    notifications,
    sidebarOpen,
  } = useKisanStore();

  const activeFarm = farms.find(f => f.id === selectedFarmId) || farms[0];
  const unreadAlerts = notifications.filter(n => !n.isRead).length;

  const isNavActive = (tab?: MainTab, sub?: SubScreen) => {
    if (sub && currentSubScreen === sub) return true;
    if (!sub && currentSubScreen === 'none' && currentTab === tab) return true;
    return false;
  };

  interface SidebarNavItem {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    tab?: MainTab;
    sub?: SubScreen;
    badge?: string;
  }

  interface SidebarNavGroup {
    title: string;
    items: SidebarNavItem[];
  }

  const navGroups: SidebarNavGroup[] = [
    {
      title: 'Overview',
      items: [
        { label: 'Farm Dashboard', icon: Home, tab: 'home', sub: undefined },
        { label: 'Fields & Plots', icon: Sprout, tab: 'farms', sub: undefined },
        { label: 'AI Assistant', icon: Bot, tab: 'ai_agent', sub: undefined, badge: 'Copilot' },
        { label: 'Mandi & Market', icon: Store, tab: 'market', sub: undefined }
      ]
    },
    {
      title: 'Agronomy & Crops',
      items: [
        { label: 'Irrigation & Water', icon: Droplets, sub: 'irrigation_detail' },
        { label: 'Weather & Advisory', icon: CloudSun, sub: 'weather_report' },
        { label: 'Crop Doctor (Vision)', icon: Stethoscope, sub: 'crop_doctor' },
        { label: 'Crop Lifecycle', icon: Clock, sub: 'crop_growth_tracker' },
        { label: 'Farm Tasks', icon: CheckCircle2, sub: 'tasks_list' },
        { label: 'Soil Health Card', icon: Activity, sub: 'soil_report' }
      ]
    },
    {
      title: 'Livestock & Sensors',
      items: [
        { label: 'Herd & Cattle', icon: Heart, sub: 'livestock_list' },
        { label: 'Virtual Fencing AI', icon: Video, sub: 'cctv_monitor' },
        { label: 'Mastitis Scan', icon: Activity, sub: 'mastitis_scanner' },
        { label: 'Poultry Health', icon: Volume2, sub: 'poultry_scanner' }
      ]
    },
    {
      title: 'Finance & Schemes',
      items: [
        { label: 'Govt Schemes', icon: Building, sub: 'govt_schemes' },
        { label: 'Officer Verification', icon: ShieldCheck, sub: 'officer_portal', badge: 'Portal' },
        { label: 'Finance & Ledger', icon: DollarSign, sub: 'finance_dashboard' }
      ]
    }
  ];

  const handleNavigate = (tab?: MainTab, sub?: SubScreen) => {
    if (sub) {
      navigateToSubScreen(sub);
    } else if (tab) {
      navigateToSubScreen('none');
      setTab(tab);
    }
  };

  return (
    <aside
      className={`hidden md:flex flex-col w-64 fixed inset-y-0 left-0 bg-white border-r border-zinc-200/80 z-30 transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      {/* Brand Header */}
      <div className="h-14 px-4 flex items-center justify-between border-b border-zinc-200/80">
        <button 
          onClick={() => handleNavigate('home')}
          className="flex items-center gap-2.5 text-left hover:opacity-90 transition-opacity"
        >
          <div className="w-7 h-7 rounded-lg bg-emerald-700 text-white flex items-center justify-center text-sm shadow-xs">
            🌱
          </div>
          <div>
            <span className="font-semibold text-sm text-zinc-900 tracking-tight block">
              KisanTech
            </span>
            <span className="text-[11px] text-zinc-500 font-normal block -mt-0.5">
              Smart Farm Assistant
            </span>
          </div>
        </button>
      </div>

      {/* Farm Switcher */}
      <div className="px-3 pt-3 pb-2 border-b border-zinc-100">
        <div className="bg-zinc-50 border border-zinc-200/80 rounded-lg p-2">
          <div className="flex items-center justify-between text-[11px] text-zinc-500 mb-1">
            <span className="font-medium">Active Farm</span>
            <span className="text-zinc-400">
              {activeFarm?.totalArea || 12.5} {activeFarm?.unit || 'Acres'}
            </span>
          </div>

          <div className="relative flex items-center">
            <select
              value={selectedFarmId}
              onChange={(e) => selectFarm(e.target.value)}
              className="w-full text-xs font-medium text-zinc-800 bg-transparent pr-5 cursor-pointer outline-none truncate appearance-none"
            >
              {farms.map(f => (
                <option key={f.id} value={f.id} className="text-zinc-800">
                  {f.name} ({f.location})
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-0 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Navigation Links Scrollable Area */}
      <div className="flex-1 overflow-y-auto px-2.5 py-3 space-y-4">
        {navGroups.map((group, idx) => (
          <div key={idx} className="space-y-0.5">
            <div className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider px-2.5 py-1">
              {group.title}
            </div>
            <div className="space-y-0.5">
              {group.items.map((item, i) => {
                const Icon = item.icon;
                const active = isNavActive(item.tab, item.sub);
                return (
                  <button
                    key={i}
                    onClick={() => handleNavigate(item.tab, item.sub)}
                    className={`group w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition-all duration-200 hover:translate-x-1 active:scale-[0.98] cursor-pointer ${
                      active
                        ? 'bg-emerald-50 text-emerald-900 font-semibold shadow-2xs border-l-2 border-emerald-600'
                        : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100/80 font-normal'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon className={`w-4 h-4 shrink-0 transition-all duration-200 group-hover:scale-115 ${
                        active ? 'text-emerald-700' : 'text-zinc-400 group-hover:text-emerald-600'
                      }`} />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.badge && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium transition-all duration-200 group-hover:scale-105 ${
                        active 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : 'bg-zinc-100 text-zinc-500 group-hover:bg-zinc-200/80'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Minimal Footer */}
      <div className="p-3 border-t border-zinc-200/80 space-y-2 bg-white">
        {/* Language selector */}
        <div className="flex items-center px-1 text-[11px] text-zinc-500">
          <div className="flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-zinc-400" />
            <select
              value={currentLanguage?.code || 'en'}
              onChange={(e) => {
                const lang = LANGUAGES.find(l => l.code === e.target.value);
                if (lang) setLanguage(lang);
              }}
              className="text-[11px] font-medium text-zinc-700 bg-transparent outline-none cursor-pointer"
            >
              {LANGUAGES.map(l => (
                <option key={l.code} value={l.code}>
                  {l.displayName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Profile Card */}
        <button 
          onClick={() => navigateToSubScreen('farmer_profile')}
          className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-zinc-50 border border-transparent hover:border-zinc-200/90 hover:shadow-xs hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 text-left cursor-pointer group"
        >
          <div className="flex items-center gap-2 truncate">
            <div className="w-7 h-7 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold text-xs flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              {userProfile?.name?.split(' ').map(n => n[0]).join('') || 'RK'}
            </div>
            <div className="truncate">
              <span className="text-xs font-medium text-zinc-800 block truncate leading-tight group-hover:text-emerald-900 transition-colors">
                {userProfile?.name || 'Ramesh Kumar'}
              </span>
              <span className="text-[11px] text-zinc-400 truncate block">
                {userProfile?.village || 'Ludhiana'}, {userProfile?.state || 'Punjab'}
              </span>
            </div>
          </div>
          <Settings className="w-3.5 h-3.5 text-zinc-400 shrink-0 group-hover:rotate-45 transition-transform duration-300" />
        </button>
      </div>
    </aside>
  );
};

export default WebSidebar;
