'use client';

import React from 'react';
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
    navigateBack 
  } = useKisanStore();

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'CRITICAL':
        return {
          icon: ShieldAlert,
          classes: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-300'
        };
      case 'WARNING':
        return {
          icon: AlertTriangle,
          classes: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300'
        };
      default:
        return {
          icon: Info,
          classes: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300'
        };
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20">
      {/* Top Header */}
      <div className="bg-gradient-to-r from-emerald-700 to-green-700 text-white px-4 pt-4 pb-5 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={navigateBack}
              className="p-1.5 rounded-full hover:bg-white/10 active:bg-white/20 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold flex items-center gap-2">
                <Bell className="w-5 h-5 text-amber-300" />
                Alerts & Notifications
              </h1>
              <p className="text-xs text-emerald-100">{unreadCount} unread notices</p>
            </div>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={markAllNotificationsRead}
              className="text-xs font-semibold bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <CheckCheck className="w-4 h-4" />
              Mark All Read
            </button>
          )}
        </div>
      </div>

      <div className="px-4 py-4 space-y-3">
        {notifications.length === 0 ? (
          <Card className="p-8 text-center shadow-sm">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <h3 className="font-bold text-base text-slate-800 dark:text-slate-100">All Caught Up!</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
              No pending weather warnings, livestock alerts, or urgent farm action notifications.
            </p>
          </Card>
        ) : (
          notifications.map(notif => {
            const badge = getSeverityBadge(notif.severity);
            const Icon = badge.icon;

            return (
              <Card 
                key={notif.id}
                className={`p-4 transition-all ${
                  notif.isRead 
                    ? 'opacity-70 bg-white/80 dark:bg-slate-800/60' 
                    : 'border-l-4 border-l-emerald-600 bg-white dark:bg-slate-800 shadow-md'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`p-2 rounded-xl mt-0.5 border ${badge.classes}`}>
                      <Icon className="w-4 h-4" />
                    </div>

                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${badge.classes}`}>
                          {notif.severity}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {notif.type}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {notif.timestamp || 'Today'}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                        {notif.title}
                      </h4>

                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        {notif.message}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1 items-end">
                    {!notif.isRead && (
                      <button
                        onClick={() => markNotificationRead(notif.id)}
                        className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold p-1"
                        title="Mark as read"
                      >
                        <CheckCheck className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(notif.id)}
                      className="text-xs text-slate-400 hover:text-rose-500 p-1 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
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
