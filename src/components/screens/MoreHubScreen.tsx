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
} from 'lucide-react';
import { useKisanStore } from '@/stores/useKisanStore';
import { SubScreen } from '@/lib/types';
import { Card } from '@/components/ui/Card';

interface HubTile {
  id: SubScreen | 'officer_portal';
  title: string;
  subtitle: string;
  icon: React.ElementType;
  color: string;
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
      subtitle: 'Phenological stages & harvest predictor',
      icon: TrendingUp,
      color: 'bg-emerald-600',
      category: 'core',
    },
    {
      id: 'weather_report',
      title: 'Farm Weather & Spray Window',
      subtitle: 'Satellite telemetry & ET0 rate',
      icon: CloudSun,
      color: 'bg-sky-500',
      category: 'core',
    },
    {
      id: 'irrigation_detail',
      title: 'Water & Irrigation Engine',
      subtitle: 'Zone controls & smart schedules',
      icon: Droplets,
      color: 'bg-blue-600',
      category: 'core',
    },
    {
      id: 'soil_report',
      title: 'Soil Health & NPK Card',
      subtitle: 'Sensor telemetry & deficiency map',
      icon: FileText,
      color: 'bg-amber-600',
      category: 'core',
    },
    {
      id: 'livestock_list',
      title: 'Livestock & GPS Geofence',
      subtitle: 'Cattle records & milk yield logs',
      icon: Sparkles,
      color: 'bg-rose-500',
      category: 'core',
    },
    {
      id: 'tasks_list',
      title: 'Action Plan & Tasks',
      subtitle: 'Prioritized farm work schedule',
      icon: CheckCircle2,
      color: 'bg-purple-600',
      category: 'core',
    },

    // AI & Advanced Scanners
    {
      id: 'crop_doctor',
      title: 'Crop Doctor (Leaf Pathology)',
      subtitle: 'Instant vision disease diagnosis',
      icon: Stethoscope,
      color: 'bg-green-700',
      badge: 'AI Vision',
      category: 'ai',
    },
    {
      id: 'mastitis_scanner',
      title: 'Mastitis Udder Health Scanner',
      subtitle: 'Bovine udder scan & SCC estimate',
      icon: Activity,
      color: 'bg-rose-600',
      badge: 'Udder AI',
      category: 'ai',
    },
    {
      id: 'poultry_scanner',
      title: 'Poultry Flock Audio AI',
      subtitle: 'Acoustic cough & distress detector',
      icon: Mic,
      color: 'bg-indigo-600',
      badge: 'Audio ML',
      category: 'ai',
    },
    {
      id: 'cctv_monitor',
      title: 'CCTV Cattle Estrus Monitor',
      subtitle: 'Camera feed mounting behavior alert',
      icon: Video,
      color: 'bg-red-600',
      badge: 'Live CCTV',
      category: 'ai',
    },

    // Finance & Govt
    {
      id: 'finance_dashboard',
      title: 'Farm Finance & Ledger',
      subtitle: 'Profitability optimizer & cash accounts',
      icon: DollarSign,
      color: 'bg-emerald-600',
      category: 'finance',
    },
    {
      id: 'govt_schemes',
      title: 'Government Schemes & Subsidies',
      subtitle: 'PM-KISAN, PMFBY, KUSUM direct benefits',
      icon: Award,
      color: 'bg-amber-500',
      category: 'finance',
    },
    {
      id: 'officer_portal',
      title: 'Government Officer Verification',
      subtitle: 'Crop claims, pesticide review & audit desk',
      icon: ShieldCheck,
      color: 'bg-blue-700',
      badge: 'Officer Desk',
      category: 'admin',
    },

    // System
    {
      id: 'user_profile',
      title: 'Farmer Profile & Credentials',
      subtitle: 'Aadhaar, contact, farm holding details',
      icon: User,
      color: 'bg-gray-600',
      category: 'admin',
    },
    {
      id: 'notifications',
      title: 'Risk Alerts & Warnings',
      subtitle: 'Severe weather & scheme notices',
      icon: Bell,
      color: 'bg-amber-600',
      badge: unreadNotifs > 0 ? `${unreadNotifs} New` : undefined,
      category: 'admin',
    },
    {
      id: 'settings',
      title: 'App Settings & Regional Languages',
      subtitle: 'Hindi, Punjabi, Bengali, Marathi, Theme',
      icon: Settings,
      color: 'bg-gray-500',
      category: 'admin',
    },
  ];

  const categories = [
    { key: 'core', label: '🌾 Farm Operations & Agronomic Health' },
    { key: 'ai', label: '🤖 Autonomous AI & Vision Diagnostics' },
    { key: 'finance', label: '💰 Finance, Schemes & Direct Transfers' },
    { key: 'admin', label: '⚙️ Account, Officer Portal & Settings' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-xs">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-gray-900 dark:text-zinc-100 flex items-center gap-2">
            <span>🚜</span>
            <span>Comprehensive Farm Modules Directory</span>
          </h1>
          <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
            Access all 22 autonomous farm management capabilities across agronomy, livestock, finance and government portals
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
          <div key={cat.key} className="space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-gray-500 dark:text-zinc-400 px-1">
              {cat.label}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {catTiles.map((tile) => {
                const Icon = tile.icon;
                return (
                  <Card
                    key={tile.id}
                    onClick={() => navigateToSubScreen(tile.id as SubScreen)}
                    className="cursor-pointer hover:border-emerald-300 hover:shadow-md hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-between p-4 border border-gray-200 dark:border-zinc-800"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white shadow-sm ${tile.color}`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-bold text-gray-900 dark:text-zinc-100 truncate">
                            {tile.title}
                          </h4>
                          {tile.badge && (
                            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                              {tile.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-zinc-400 truncate mt-0.5">
                          {tile.subtitle}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400 shrink-0 ml-2" />
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
