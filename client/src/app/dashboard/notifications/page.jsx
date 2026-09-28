'use client';

import { Bell, CheckCheck } from 'lucide-react';
import PageHeader from '@/components/dashboard/PageHeader';
import DataState from '@/components/dashboard/DataState';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Skeleton from '@/components/ui/Skeleton';
import { notificationApi } from '@/lib/api';
import { useApi } from '@/lib/hooks';

const TYPE_LABEL = {
  CHURCH_ANNOUNCEMENT: 'Announcement',
  UNIT_ANNOUNCEMENT: 'Unit',
  PRAYER_UPDATE: 'Prayer',
  EVENT_REMINDER: 'Event',
  BIBLE_READING_REMINDER: 'Bible',
  DISCIPLESHIP_REMINDER: 'Discipleship',
  FOLLOW_UP_ASSIGNMENT: 'Follow-up',
  ATTENDANCE_REMINDER: 'Attendance',
};

export default function NotificationsPage() {
  const { data: notifications, status, error, reload } = useApi(() => notificationApi.list(), []);
  const isEmpty = status === 'success' && (!notifications || notifications.length === 0);

  async function markAllRead() {
    await notificationApi.markAllRead();
    reload();
  }

  async function markOneRead(id) {
    await notificationApi.markRead(id);
    reload();
  }

  return (
    <div>
      <PageHeader
        title="Notifications"
        description="Announcements, reminders, and follow-up assignments."
        actions={
          <Button variant="secondary" size="sm" onClick={markAllRead}>
            <CheckCheck className="h-4 w-4" /> Mark all as read
          </Button>
        }
      />

      <Card className="p-0">
        <DataState
          status={status}
          error={error}
          onRetry={reload}
          isEmpty={isEmpty}
          skeleton={
            <div className="space-y-2 p-5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          }
          emptyState={
            <div className="flex flex-col items-center justify-center gap-2 py-14 text-center">
              <Bell className="mb-1 h-8 w-8 text-muted" />
              <p className="text-sm font-medium text-foreground">You&apos;re all caught up</p>
              <p className="max-w-xs text-sm text-muted">New notifications will show up here.</p>
            </div>
          }
        >
          <ul className="divide-y divide-border-subtle">
            {(notifications || []).map((n) => (
              <li
                key={n._id}
                className={`flex items-start gap-3 px-5 py-4 ${!n.isRead ? 'bg-primary/[0.03]' : ''}`}
              >
                <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n.isRead ? 'bg-transparent' : 'bg-primary'}`} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground">{n.title}</p>
                    <span className="rounded-full bg-surface-secondary px-2 py-0.5 text-[11px] text-muted">
                      {TYPE_LABEL[n.type] || n.type}
                    </span>
                  </div>
                  {n.body && <p className="mt-0.5 text-sm text-muted">{n.body}</p>}
                  <p className="mt-1 text-xs text-disabled">{new Date(n.createdAt).toLocaleString()}</p>
                </div>
                {!n.isRead && (
                  <Button variant="link" size="sm" onClick={() => markOneRead(n._id)}>
                    Mark read
                  </Button>
                )}
              </li>
            ))}
          </ul>
        </DataState>
      </Card>
    </div>
  );
}
