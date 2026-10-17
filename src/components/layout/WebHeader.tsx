'use client';

import React, { useState } from 'react';
import { 
  ArrowLeft, Search, Bell, ShieldCheck, CloudSun, 
  ChevronRight, CheckCheck, PanelLeftClose, PanelLeftOpen
} from 'lucide-react';
import { useKisanStore } from '@/stores/useKisanStore';
import { SubScreen } from '@/lib/types';

interface WebHeaderProps {
  showBackButton?: boolean;
  onBackClick?: () => void;
  onOpenMobileMenu?: () => void;
}

export const WebHeader: React.FC<WebHeaderProps> = ({
  showBackButton,
  onBackClick,
}) => {
  const { 
    currentTab, 
    currentSubScreen, 
    userProfile, 
    farms,
    selectedFarmId,
    farmWeather,
    notifications,
    navigateToSubScreen,
    markAllNotificationsRead,
    setTab,
    sidebarOpen,
    toggleSidebar
  } = useKisanStore();

  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');

  const activeFarm = farms.find(f => f.id === selectedFarmId) || farms[0];
  const unreadAlerts = notifications.filter(n => !n.isRead);

  const getPageTitle = () => {
    if (currentSubScreen !== 'none') {
      const titles: Record<SubScreen, string> = {
        'none': 'Overview',
        'soil_report': 'Soil Health Card',
        'irrigation_detail': 'Irrigation & Water',
        'set_schedule': 'Irrigation Schedule',
        'irrigation_schedule': 'Irrigation Schedule',
        'livestock_list': 'Livestock & Herd',
        'animal_detail': 'Animal Details',
        'add_animal': 'Register Livestock',
        'finance_dashboard': 'Farm Finances',
        'crop_doctor': 'Crop Doctor (Vision)',
        'tasks_list': 'Farm Tasks & Plan',
        'notifications': 'Alerts & Notices',
        'settings': 'Settings',
        'user_profile': 'Farmer Profile',
        'farmer_profile': 'Farmer Profile',
        'weather_report': 'Weather & Radar',
        'govt_schemes': 'Government Schemes',
        'crop_growth_tracker': 'Crop Lifecycle',
        'cctv_monitor': 'Virtual Fencing AI',
        'poultry_scanner': 'Poultry Health',
        'mastitis_scanner': 'Mastitis Scan',
        'officer_portal': 'Officer Verification',
        'farms_manager': 'Fields & Land Parcels',
        'market_soil_testing': 'Soil Testing Labs',
        'crop_water_advisor': 'Crop Water & Level Visualizer'
      };
      return titles[currentSubScreen] || 'Farm Management';
    }

    switch (currentTab) {
      case 'home': return 'Dashboard';
      case 'farms': return 'Fields & Plots';
      case 'ai_agent': return 'AI Assistant';
      case 'market': return 'Mandi & Market';
      case 'more': return 'Modules';
      default: return 'KisanTech';
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!globalSearch.trim()) return;
    const q = globalSearch.toLowerCase();

    if (q.includes('mandi') || q.includes('price') || q.includes('market') || q.includes('rate')) {
      navigateToSubScreen('none');
      setTab('market');
    } else if (q.includes('weather') || q.includes('rain') || q.includes('temp')) {
      navigateToSubScreen('weather_report');
    } else if (q.includes('doctor') || q.includes('disease') || q.includes('pest') || q.includes('rust')) {
      navigateToSubScreen('crop_doctor');
    } else if (q.includes('scheme') || q.includes('subsid') || q.includes('pm-kisan') || q.includes('kusum')) {
      navigateToSubScreen('govt_schemes');
    } else if (q.includes('cow') || q.includes('cattle') || q.includes('buffalo') || q.includes('animal')) {
      navigateToSubScreen('livestock_list');
    } else if (q.includes('water') || q.includes('irrigation')) {
      navigateToSubScreen('irrigation_detail');
    } else {
      navigateToSubScreen('none');
      setTab('ai_agent');
    }
    setGlobalSearch('');
  };

  return (
    <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-xs border-b border-zinc-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
        {/* Left Section: Sidebar Toggle, Back button & Title */}
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Sidebar Toggle Button (Desktop) */}
          <button
            onClick={toggleSidebar}
            className="hidden md:flex p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-colors cursor-pointer shrink-0"
            title={sidebarOpen ? "Close sidebar" : "Open sidebar"}
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? (
              <PanelLeftClose className="w-4 h-4" />
            ) : (
              <PanelLeftOpen className="w-4 h-4 text-emerald-700" />
            )}
          </button>

          {showBackButton ? (
            <button
              onClick={onBackClick}
              className="p-1.5 rounded-lg text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition-colors shrink-0"
              title="Go back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          ) : (
            <div className="md:hidden">
              <span className="text-lg">🌱</span>
            </div>
          )}

          <div>
            <div className="flex items-center gap-1 text-[11px] text-zinc-400">
              <span className="hidden sm:inline">Kisan</span>
              {showBackButton && (
                <>
                  <ChevronRight className="w-3 h-3 text-zinc-300" />
                  <span className="capitalize text-zinc-500">{currentTab}</span>
                </>
              )}
            </div>
            <h1 className="text-sm sm:text-base font-semibold text-zinc-900 truncate">
              {getPageTitle()}
            </h1>
          </div>
        </div>

        {/* Center: Global Search */}
        <div className="hidden lg:flex flex-1 max-w-sm mx-4">
          <form onSubmit={handleSearchSubmit} className="w-full relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-zinc-400" />
            <input 
              type="text"
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              placeholder="Search crops, mandis, diseases, schemes..."
              className="w-full text-xs bg-zinc-50 border border-zinc-200/90 rounded-lg pl-8 pr-3 py-1.5 outline-none focus:bg-white focus:border-zinc-300 text-zinc-800 placeholder:text-zinc-400 transition-colors"
            />
          </form>
        </div>

        {/* Right Section: Telemetry, Actions, Alerts, Avatar */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Weather Widget Pill */}
          <button 
            onClick={() => navigateToSubScreen('weather_report')}
            className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-lg border border-zinc-200/80 bg-zinc-50/60 hover:bg-zinc-100/70 text-xs text-zinc-700 transition-colors"
          >
            <CloudSun className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>
              {farmWeather ? `${farmWeather.currentTempC ?? farmWeather.currentTemp}°C` : '28°C'} · {activeFarm?.district || 'Ludhiana'}
            </span>
            <span className="text-[10px] text-emerald-700 font-medium">
              {farmWeather?.sprayingWindowStatus === 'OPTIMAL' ? 'Good spray window' : 'Caution'}
            </span>
          </button>

          {/* Quick Officer Portal Button */}
          <button
            onClick={() => navigateToSubScreen('officer_portal')}
            className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
              currentSubScreen === 'officer_portal'
                ? 'bg-zinc-900 text-white border-zinc-900'
                : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-zinc-500" />
            <span>Govt Portal</span>
          </button>

          {/* Notifications Dropdown Toggle */}
          <div className="relative">
            <button
              onClick={() => setShowNotifMenu(!showNotifMenu)}
              className="p-1.5 rounded-lg text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition-colors relative"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadAlerts.length > 0 && (
                <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-rose-500"></span>
              )}
            </button>

            {/* Notification Dropdown Panel */}
            {showNotifMenu && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-zinc-200 rounded-xl shadow-lg p-3 z-50 space-y-2">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-zinc-900">Notifications</span>
                    <span className="bg-zinc-100 text-zinc-600 text-[10px] font-medium px-1.5 py-0.5 rounded">
                      {unreadAlerts.length} new
                    </span>
                  </div>
                  {unreadAlerts.length > 0 && (
                    <button
                      onClick={markAllNotificationsRead}
                      className="text-[11px] text-emerald-700 hover:underline flex items-center gap-1"
                    >
                      <CheckCheck className="w-3 h-3" />
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-64 overflow-y-auto space-y-1.5">
                  {notifications.slice(0, 4).map(n => (
                    <div 
                      key={n.id}
                      className="p-2 rounded-lg border border-zinc-100 text-xs bg-zinc-50/50 space-y-0.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-zinc-800 text-[11px] truncate">{n.title}</span>
                        <span className="text-[10px] text-zinc-400">{n.timeFormatted || 'Today'}</span>
                      </div>
                      <p className="text-[11px] text-zinc-500 line-clamp-2">
                        {n.message}
                      </p>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => {
                    setShowNotifMenu(false);
                    navigateToSubScreen('notifications');
                  }}
                  className="w-full text-center py-1.5 text-xs text-zinc-600 hover:text-zinc-900 border-t border-zinc-100 block"
                >
                  View all alerts →
                </button>
              </div>
            )}
          </div>

          {/* User Profile Avatar Link */}
          <button 
            onClick={() => navigateToSubScreen('farmer_profile')}
            className="flex items-center gap-2 pl-2 border-l border-zinc-200 cursor-pointer"
          >
            <div className="w-7 h-7 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-700 font-medium text-xs flex items-center justify-center">
              {userProfile?.name?.split(' ').map(n => n[0]).join('') || 'RK'}
            </div>
            <div className="hidden xl:block text-left">
              <span className="text-xs font-medium text-zinc-800 block leading-tight">
                {userProfile?.name || 'Ramesh Kumar'}
              </span>
              <span className="text-[10px] text-zinc-400 block">
                {userProfile?.farmingType || 'Grain & Dairy'}
              </span>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};

export default WebHeader;
