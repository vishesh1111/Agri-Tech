'use client';

import React, { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useKisanStore } from '@/stores/useKisanStore';
import { WebSidebar } from '@/components/layout/WebSidebar';
import { WebHeader } from '@/components/layout/WebHeader';
import { BottomNavBar } from '@/components/layout/BottomNavBar';
import { mlService } from '@/lib/ml/mlService';

// Core Tab Screens (Loaded dynamically to optimize bundle and SSR)
const HomeScreen = dynamic(() => import('@/components/screens/HomeScreen'), { ssr: false });
const FarmsScreen = dynamic(() => import('@/components/screens/FarmsScreen'), { ssr: false });
const AIAgentScreen = dynamic(() => import('@/components/screens/AIAgentScreen'), { ssr: false });
const MarketScreen = dynamic(() => import('@/components/screens/MarketScreen'), { ssr: false });
const MoreHubScreen = dynamic(() => import('@/components/screens/MoreHubScreen'), { ssr: false });

// Sub-Screens
const SoilReportScreen = dynamic(() => import('@/components/screens/SoilReportScreen'), { ssr: false });
const IrrigationScreen = dynamic(() => import('@/components/screens/IrrigationScreen'), { ssr: false });
const SetScheduleScreen = dynamic(() => import('@/components/screens/SetScheduleScreen'), { ssr: false });
const LivestockScreen = dynamic(() => import('@/components/screens/LivestockScreen'), { ssr: false });
const AnimalDetailScreen = dynamic(() => import('@/components/screens/AnimalDetailScreen'), { ssr: false });
const AddAnimalScreen = dynamic(() => import('@/components/screens/AddAnimalScreen'), { ssr: false });
const FinanceScreen = dynamic(() => import('@/components/screens/FinanceScreen'), { ssr: false });
const CropDoctorScreen = dynamic(() => import('@/components/screens/CropDoctorScreen'), { ssr: false });
const FarmActionPlanScreen = dynamic(() => import('@/components/screens/FarmActionPlanScreen'), { ssr: false });
const NotificationsScreen = dynamic(() => import('@/components/screens/NotificationsScreen'), { ssr: false });
const SettingsScreen = dynamic(() => import('@/components/screens/SettingsScreen'), { ssr: false });
const FarmerProfileScreen = dynamic(() => import('@/components/screens/FarmerProfileScreen'), { ssr: false });
const FarmWeatherScreen = dynamic(() => import('@/components/screens/FarmWeatherScreen'), { ssr: false });
const GovtSchemesScreen = dynamic(() => import('@/components/screens/GovtSchemesScreen'), { ssr: false });
const CropGrowthTrackerScreen = dynamic(() => import('@/components/screens/CropGrowthTrackerScreen'), { ssr: false });
const CctvMonitorScreen = dynamic(() => import('@/components/screens/CctvMonitorScreen'), { ssr: false });
const PoultryScannerScreen = dynamic(() => import('@/components/screens/PoultryScannerScreen'), { ssr: false });
const MastitisScannerScreen = dynamic(() => import('@/components/screens/MastitisScannerScreen'), { ssr: false });
const OfficerPortalScreen = dynamic(() => import('@/components/screens/OfficerPortalScreen'), { ssr: false });

export default function App() {
  const {
    currentTab,
    currentSubScreen,
    isDarkTheme,
    navigateBack,
    initialize,
  } = useKisanStore();

  useEffect(() => {
    initialize();
    mlService.preloadModels();
  }, [initialize]);

  // Sync dark theme class on document element
  useEffect(() => {
    if (isDarkTheme) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkTheme]);

  // Determine which sub-screen or tab to render
  const renderContent = () => {
    if (currentSubScreen !== 'none') {
      switch (currentSubScreen) {
        case 'soil_report':
          return <SoilReportScreen />;
        case 'irrigation_detail':
          return <IrrigationScreen />;
        case 'set_schedule':
        case 'irrigation_schedule':
          return <SetScheduleScreen />;
        case 'livestock_list':
          return <LivestockScreen />;
        case 'animal_detail':
          return <AnimalDetailScreen />;
        case 'add_animal':
          return <AddAnimalScreen />;
        case 'finance_dashboard':
          return <FinanceScreen />;
        case 'crop_doctor':
          return <CropDoctorScreen />;
        case 'tasks_list':
          return <FarmActionPlanScreen />;
        case 'notifications':
          return <NotificationsScreen />;
        case 'settings':
          return <SettingsScreen />;
        case 'user_profile':
        case 'farmer_profile':
          return <FarmerProfileScreen />;
        case 'weather_report':
          return <FarmWeatherScreen />;
        case 'govt_schemes':
          return <GovtSchemesScreen />;
        case 'crop_growth_tracker':
          return <CropGrowthTrackerScreen />;
        case 'cctv_monitor':
          return <CctvMonitorScreen />;
        case 'poultry_scanner':
          return <PoultryScannerScreen />;
        case 'mastitis_scanner':
          return <MastitisScannerScreen />;
        case 'officer_portal':
          return <OfficerPortalScreen />;
        case 'farms_manager':
          return <FarmsScreen />;
        case 'market_soil_testing':
          return <MarketScreen />;
        default:
          return <HomeScreen />;
      }
    }

    // Main 5-tab navigation
    switch (currentTab) {
      case 'home':
        return <HomeScreen />;
      case 'farms':
        return <FarmsScreen />;
      case 'ai_agent':
        return <AIAgentScreen />;
      case 'market':
        return <MarketScreen />;
      case 'more':
        return <MoreHubScreen />;
      default:
        return <HomeScreen />;
    }
  };

  const isSubScreenActive = currentSubScreen !== 'none';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex antialiased selection:bg-emerald-500 selection:text-white transition-colors">
      {/* Desktop Left Navigation Sidebar (Hidden on mobile) */}
      <WebSidebar />

      {/* Main Content Area (Offset by sidebar width on desktop) */}
      <div className="flex-1 md:pl-64 flex flex-col min-h-screen">
        {/* Sticky Web Header */}
        <WebHeader
          showBackButton={isSubScreenActive}
          onBackClick={navigateBack}
        />

        {/* Content Body - Expanded for Web & Responsive Screens */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-12">
          {renderContent()}
        </main>

        {/* Mobile Bottom Navigation Bar (Hidden on md+ desktop) */}
        {!isSubScreenActive && <BottomNavBar />}
      </div>
    </div>
  );
}
