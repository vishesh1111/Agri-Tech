'use client';

import React from 'react';
import { ArrowLeft, Bell } from 'lucide-react';
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
    navigateToSubScreen,
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
    <header className="sticky top-0 z-40 flex h-14 w-full items-center justify-between border-b border-zinc-200/80 bg-white/95 backdrop-blur-xs px-4 text-zinc-900 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
      <div className="flex items-center gap-3">
        {showBackButton ? (
          <button
            onClick={onBackClick}
            className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-zinc-100 transition-colors"
            aria-label="Back"
          >
            <ArrowLeft className="h-4 w-4 text-zinc-600" />
          </button>
        ) : (
          <button
            onClick={() => navigateToSubScreen('user_profile')}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 font-semibold text-xs text-zinc-800 hover:bg-zinc-200 transition-colors"
            aria-label="Profile"
          >
            {initials}
          </button>
        )}

        <div>
          <h1 className="text-sm font-semibold text-zinc-900">
            {title || 'KisanAI'}
          </h1>
          {!title && userProfile && (
            <p className="text-[11px] text-zinc-400">
              {userProfile.district}, {userProfile.state}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => navigateToSubScreen('notifications')}
          className="relative flex h-8 w-8 items-center justify-center rounded-lg hover:bg-zinc-100 text-zinc-600 transition-colors"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-emerald-600"></span>
          )}
        </button>
      </div>
    </header>
  );
}

export default TopAppBar;
