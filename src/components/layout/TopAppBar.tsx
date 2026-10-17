'use client';

import React from 'react';
import { ArrowLeft, Bell, Moon, Sun, ShieldCheck } from 'lucide-react';
import { useKisanStore } from '@/stores/useKisanStore';

interface TopAppBarProps {
  title?: string;
  showBackButton?: boolean;
  onBackClick?: () => void;
}

export function TopAppBar({ title, showBackButton, onBackClick }: TopAppBarProps) {
  const {
    userProfile,
    notifications,
    isDarkTheme,
    toggleTheme,
    navigateToSubScreen,
    currentSubScreen,
  } = useKisanStore();

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const initials = userProfile?.name
    ? userProfile.name
        .split(' ')
        .map((p) => p[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'RK';

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-emerald-800/20 bg-gradient-to-r from-emerald-700 via-emerald-800 to-green-900 px-4 text-white shadow-md">
      <div className="flex items-center gap-3">
        {showBackButton ? (
          <button
            onClick={onBackClick}
            className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-white/10 active:scale-95 transition-all"
            aria-label="Back"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
        ) : (
          <button
            onClick={() => navigateToSubScreen('user_profile')}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 font-bold text-white shadow ring-2 ring-emerald-300/40 hover:scale-105 active:scale-95 transition-all"
            aria-label="Profile"
          >
            {initials}
          </button>
        )}

        <div>
          <h1 className="text-lg font-bold tracking-tight flex items-center gap-1.5">
            {title || 'KisanAI'}
            {!title && <span className="text-base">🌾</span>}
          </h1>
          {!title && userProfile && (
            <p className="text-xs text-emerald-200">
              {userProfile.village}, {userProfile.state}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Officer Portal quick link */}
        {currentSubScreen !== 'officer_portal' && (
          <button
            onClick={() => navigateToSubScreen('officer_portal' as any)}
            className="hidden sm:flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold hover:bg-white/25 transition-all"
            title="Government Officer Verification Portal"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-200" />
            <span>Officer Portal</span>
          </button>
        )}

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-white/10 active:scale-95 transition-all"
          aria-label="Toggle Theme"
        >
          {isDarkTheme ? <Sun className="h-5 w-5 text-amber-300" /> : <Moon className="h-5 w-5 text-emerald-100" />}
        </button>

        {/* Notifications */}
        <button
          onClick={() => navigateToSubScreen('notifications')}
          className="relative flex h-9 w-9 items-center justify-center rounded-full hover:bg-white/10 active:scale-95 transition-all"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
