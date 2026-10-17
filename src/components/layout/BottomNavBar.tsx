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
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-zinc-200/80 bg-white/95 backdrop-blur-md shadow-[0_-1px_3px_rgba(0,0,0,0.03)]">
      <div className="mx-auto flex h-16 max-w-lg items-center justify-around px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setTab(tab.id)}
              className={`flex flex-col items-center justify-center gap-1 rounded-lg px-3 py-1 transition-colors ${
                isActive
                  ? 'text-emerald-800 font-semibold'
                  : 'text-zinc-400 hover:text-zinc-800'
              }`}
            >
              <div
                className={`flex h-7 w-10 items-center justify-center rounded-lg transition-colors ${
                  isActive ? 'bg-emerald-50 text-emerald-800' : ''
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'stroke-[2.2]' : 'stroke-[1.7]'}`} />
              </div>
              <span className="text-[10px] tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export default BottomNavBar;
