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
          classes: 'bg-rose-50 text-rose-700 border border-rose-200/60'
        };
      case 'WARNING':
        return {
          icon: AlertTriangle,
          classes: 'bg-amber-50 text-amber-700 border border-amber-200/60'
        };
      default:
        return {
          icon: Info,
          classes: 'bg-zinc-100 text-zinc-700 border border-zinc-200'
        };
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-zinc-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
              <Bell className="h-5 w-5" />
            </span>
            <h1 className="text-xl font-semibold text-zinc-900">
              Alerts & Notifications
            </h1>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Weather alerts, disease warnings, irrigation reminders, and official bulletins ({unreadCount} unread)
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllNotificationsRead}
            className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3.5 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-50 transition-colors shadow-xs"
          >
            <CheckCheck className="w-4 h-4 text-emerald-700" />
            <span>Mark All as Read</span>
          </button>
        )}
      </div>

      {/* 2. Severity Filters */}
      <div className="flex gap-1.5">
        {['ALL', 'CRITICAL', 'WARNING', 'INFO'].map(sev => (
          <button
            key={sev}
            onClick={() => setFilterSeverity(sev)}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              filterSeverity === sev
                ? 'bg-zinc-900 text-white'
                : 'bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-50'
            }`}
          >
            {sev === 'ALL' ? 'All Alerts' : sev.charAt(0) + sev.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* 3. Notifications List */}
      <div className="space-y-2.5">
        {filtered.length === 0 ? (
          <Card className="p-12 text-center border border-zinc-200/80 bg-white space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
            <h3 className="font-medium text-base text-zinc-900">All caught up</h3>
            <p className="text-xs text-zinc-400 max-w-xs mx-auto leading-relaxed">
              No pending weather warnings, livestock alerts, or farm action notifications.
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
                className={`p-4 transition-all border ${
                  notif.isRead 
                    ? 'bg-zinc-50/50 border-zinc-200/60' 
                    : 'bg-white border-zinc-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.03)] cursor-pointer'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${badge.classes} shrink-0 mt-0.5`}>
                      <Icon className="w-4 h-4" />
                    </div>

                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-medium text-sm text-zinc-900">
                          {notif.title}
                        </h4>
                        {!notif.isRead && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                        )}
                        <span className="text-[11px] text-zinc-400">
                          {notif.timeFormatted}
                        </span>
                      </div>

                      <p className="text-xs text-zinc-600 leading-relaxed">
                        {notif.message}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(notif.id);
                    }}
                    className="p-1 text-zinc-400 hover:text-rose-600 transition-colors"
                    title="Delete alert"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
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
