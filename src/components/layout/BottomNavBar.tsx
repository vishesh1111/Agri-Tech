'use client';

import React from 'react';
import { Home, Sprout, Bot, Store, LayoutGrid } from 'lucide-react';
import { useKisanStore } from '@/stores/useKisanStore';
import { MainTab } from '@/lib/types';

export function BottomNavBar() {
  const { currentTab, setTab } = useKisanStore();

  const tabs: { id: MainTab; label: string; icon: React.ElementType }[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'farms', label: 'Farms', icon: Sprout },
    { id: 'ai_agent', label: 'KisanAI', icon: Bot },
    { id: 'market', label: 'Market', icon: Store },
    { id: 'more', label: 'More Hub', icon: LayoutGrid },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white/95 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/95 shadow-lg">
      <div className="mx-auto flex h-16 max-w-lg items-center justify-around px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setTab(tab.id)}
              className={`flex flex-col items-center justify-center gap-1 rounded-xl px-3 py-1.5 transition-all ${
                isActive
                  ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                  : 'text-gray-500 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-zinc-200'
              }`}
            >
              <div
                className={`flex h-8 w-12 items-center justify-center rounded-full transition-all ${
                  isActive ? 'bg-emerald-100 dark:bg-emerald-950/60 scale-105' : ''
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.75]'}`} />
              </div>
              <span className="text-[11px] tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
