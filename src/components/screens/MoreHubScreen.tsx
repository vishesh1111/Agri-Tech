'use client';

import React from 'react';
import {
  TrendingUp,
  CloudSun,
  Award,
  Video,
  Sparkles,
  DollarSign,
  CheckCircle2,
  FileText,
  Stethoscope,
  Droplets,
  Activity,
  Mic,
  ShieldCheck,
  User,
  Settings,
  Bell,
  ChevronRight,
  LayoutGrid,
  Waves,
} from 'lucide-react';
import { useKisanStore } from '@/stores/useKisanStore';
import { SubScreen } from '@/lib/types';
import { Card } from '@/components/ui/Card';

interface HubTile {
  id: SubScreen | 'officer_portal';
  title: string;
  subtitle: string;
  icon: React.ElementType;
  badge?: string;
  category: 'core' | 'ai' | 'finance' | 'admin';
}

export function MoreHubScreen() {
  const { navigateToSubScreen, notifications } = useKisanStore();
  const unreadNotifs = notifications.filter((n) => !n.isRead).length;

  const tiles: HubTile[] = [
    // Core Farm
    {
      id: 'crop_growth_tracker',
      title: 'Crop Lifecycle Tracker',
      subtitle: 'Phenological stages and harvest outlook',
      icon: TrendingUp,
      category: 'core',
    },
    {
      id: 'weather_report',
      title: 'Weather & Spray Window',
      subtitle: 'Agro-meteorology and spray suitability',
      icon: CloudSun,
      category: 'core',
    },
    {
      id: 'irrigation_detail',
      title: 'Irrigation & Water Control',
      subtitle: 'Zone controls and automation schedule',
      icon: Droplets,
      category: 'core',
    },
    {
      id: 'crop_water_advisor',
      title: 'Crop Water & Level Advisor',
      subtitle: 'Minimum water level animation & root wetting depth',
      icon: Waves,
      badge: 'Visual Model',
      category: 'core',
    },
    {
      id: 'soil_report',
      title: 'Soil Health & NPK Card',
      subtitle: 'Nutrient tests and remediation guidelines',
      icon: FileText,
      category: 'core',
    },
    {
      id: 'livestock_list',
      title: 'Livestock & Geofence',
      subtitle: 'Cattle profiles, milk yield, and collars',
      icon: Sparkles,
      category: 'core',
    },
    {
      id: 'tasks_list',
      title: 'Action Plan & Field Tasks',
      subtitle: 'Prioritized farm operations checklist',
      icon: CheckCircle2,
      category: 'core',
    },

    // AI & Advanced Diagnostics
    {
      id: 'crop_doctor',
      title: 'Crop Doctor',
      subtitle: 'Camera disease scan and treatment steps',
      icon: Stethoscope,
      badge: 'Vision AI',
      category: 'ai',
    },
    {
      id: 'mastitis_scanner',
      title: 'Mastitis Udder Health Scanner',
      subtitle: 'Bovine udder scan and SCC estimation',
      icon: Activity,
      badge: 'Health AI',
      category: 'ai',
    },
    {
      id: 'poultry_scanner',
      title: 'Poultry Bioacoustics Scanner',
      subtitle: 'Audio cough and respiratory distress check',
      icon: Mic,
      badge: 'Audio AI',
      category: 'ai',
    },
    {
      id: 'cctv_monitor',
      title: 'Virtual Fencing AI (CCTV)',
      subtitle: 'Perimeter line crossing & livestock breach alerts',
      icon: Video,
      badge: 'Live CCTV',
      category: 'ai',
    },

    // Finance & Govt
    {
      id: 'finance_dashboard',
      title: 'Farm Financial Ledger',
      subtitle: 'Expense ledger and net operating margins',
      icon: DollarSign,
      category: 'finance',
    },
    {
      id: 'govt_schemes',
      title: 'Government Schemes & Subsidies',
      subtitle: 'PM-KISAN, PMFBY, and solar subsidies',
      icon: Award,
      category: 'finance',
    },
    {
      id: 'officer_portal',
      title: 'Inspection & Claims Portal',
      subtitle: 'Crop damage evidence and officer verification',
      icon: ShieldCheck,
      badge: 'Verification',
      category: 'admin',
    },

    // System
    {
      id: 'user_profile',
      title: 'Farmer Profile & Identity',
      subtitle: 'Aadhaar, contact, and holding records',
      icon: User,
      category: 'admin',
    },
    {
      id: 'notifications',
      title: 'Alerts & Notifications',
      subtitle: 'Weather warnings and scheme notices',
      icon: Bell,
      badge: unreadNotifs > 0 ? `${unreadNotifs} New` : undefined,
      category: 'admin',
    },
    {
      id: 'settings',
      title: 'Preferences & Regional Languages',
      subtitle: 'Language selection and offline storage',
      icon: Settings,
      category: 'admin',
    },
  ];

  const categories = [
    { key: 'core', label: 'Farm Operations & Agronomy' },
    { key: 'ai', label: 'AI Diagnostic Scanners' },
    { key: 'finance', label: 'Finance & Schemes' },
    { key: 'admin', label: 'Account & Verification' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-zinc-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
              <LayoutGrid className="h-5 w-5" />
            </span>
            <h1 className="text-xl font-semibold text-zinc-900">
              Farm Modules Directory
            </h1>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Access all modules across agronomy, livestock, finance, scanners, and government programs
          </p>
        </div>
      </div>

      {categories.map((cat) => {
        const catTiles = tiles.filter((t) =>
          cat.key === 'finance'
            ? t.category === 'finance'
            : cat.key === 'admin'
            ? t.category === 'admin'
            : t.category === cat.key
        );

        return (
          <div key={cat.key} className="space-y-2.5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 px-1">
              {cat.label}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {catTiles.map((tile) => {
                const Icon = tile.icon;
                return (
                  <Card
                    key={tile.id}
                    onClick={() => navigateToSubScreen(tile.id as SubScreen)}
                    className="cursor-pointer hover:border-emerald-300 hover:shadow-[0_8px_20px_rgba(0,0,0,0.06)] hover:-translate-y-1 active:scale-[0.99] transition-all duration-200 flex items-center justify-between p-3.5 border border-zinc-200/80 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.03)] group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-100 group-hover:bg-emerald-50 text-zinc-700 group-hover:text-emerald-700 group-hover:scale-110 transition-all duration-200">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="text-xs font-semibold text-zinc-900 group-hover:text-emerald-800 transition-colors truncate">
                            {tile.title}
                          </h4>
                          {tile.badge && (
                            <span className="rounded px-1.5 py-0.5 text-[10px] font-medium bg-zinc-100 group-hover:bg-emerald-100/70 text-zinc-700 group-hover:text-emerald-800 transition-colors">
                              {tile.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-zinc-500 truncate mt-0.5">
                          {tile.subtitle}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-zinc-400 group-hover:text-emerald-700 group-hover:translate-x-1 shrink-0 ml-2 transition-transform duration-200" />
                  </Card>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default MoreHubScreen;
