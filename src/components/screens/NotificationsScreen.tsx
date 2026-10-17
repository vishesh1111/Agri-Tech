'use client';

import React, { useState } from 'react';
import { 
  Bell, CheckCircle2, Trash2, ArrowLeft, AlertTriangle, 
  Info, ShieldAlert, CheckCheck, Droplets, Bug, Sprout
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { AppNotification } from '@/lib/types';
import { useKisanStore } from '@/stores/useKisanStore';

export const NotificationsScreen: React.FC = () => {
  const { 
    notifications, 
    markNotificationRead, 
    markAllNotificationsRead, 
    deleteNotification, 
  } = useKisanStore();

  const [filterSeverity, setFilterSeverity] = useState('ALL');

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const filtered = notifications.filter(n => 
    filterSeverity === 'ALL' || n.severity === filterSeverity
  );

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'CRITICAL':
        return {
          icon: ShieldAlert,
          classes: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-300'
        };
      case 'WARNING':
        return {
          icon: AlertTriangle,
          classes: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300'
        };
      default:
        return {
          icon: Info,
          classes: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300'
        };
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-xs">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-gray-900 dark:text-zinc-100 flex items-center gap-2">
            <span>🔔</span>
            <span>Farm Alerts & Autonomous Risk Notifications</span>
          </h1>
          <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
            Real-time warnings on severe weather, pest risks, irrigation schedules & government announcements ({unreadCount} unread)
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllNotificationsRead}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition-all active:scale-95"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Mark All as Read</span>
          </button>
        )}
      </div>

      {/* 2. Severity Filters */}
      <div className="flex gap-2">
        {['ALL', 'CRITICAL', 'WARNING', 'INFO'].map(sev => (
          <button
            key={sev}
            onClick={() => setFilterSeverity(sev)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterSeverity === sev
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 border border-gray-200 dark:border-zinc-700 hover:bg-gray-50'
            }`}
          >
            {sev}
          </button>
        ))}
      </div>

      {/* 3. Notifications List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <Card className="p-12 text-center border border-gray-200 dark:border-zinc-800 space-y-2">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <h3 className="font-extrabold text-base text-gray-900 dark:text-zinc-100">All Caught Up!</h3>
            <p className="text-xs text-gray-400 max-w-xs mx-auto">
              No pending weather warnings, livestock alerts, or urgent farm action notifications.
            </p>
          </Card>
        ) : (
          filtered.map((notif) => {
            const badge = getSeverityBadge(notif.severity);
            const Icon = badge.icon;

            return (
              <Card 
                key={notif.id}
                onClick={() => !notif.isRead && markNotificationRead(notif.id)}
                className={`p-5 transition-all border ${
                  notif.isRead 
                    ? 'opacity-70 bg-white/80 dark:bg-zinc-900/60 border-gray-200 dark:border-zinc-800' 
                    : 'border-l-4 border-l-emerald-600 bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 shadow-sm cursor-pointer'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className={`p-2.5 rounded-xl border ${badge.classes} shrink-0 mt-0.5`}>
                      <Icon className="w-5 h-5" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-sm text-gray-900 dark:text-zinc-100">
                          {notif.title}
                        </h4>
                        {!notif.isRead && (
                          <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                        )}
                        <span className="text-[10px] text-gray-400 font-mono">
                          {notif.timeFormatted}
                        </span>
                      </div>

                      <p className="text-xs text-gray-600 dark:text-zinc-300 leading-relaxed">
                        {notif.message}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(notif.id);
                    }}
                    className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                    title="Delete Notification"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default NotificationsScreen;
