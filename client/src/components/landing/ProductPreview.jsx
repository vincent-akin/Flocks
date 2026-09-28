'use client';

import { Users, Boxes, Church, CalendarCheck, BookOpen, HandHeart, CalendarDays, BarChart3, Bell } from 'lucide-react';
import { kpis, attendanceTrend, upcomingEvents, prayerRequests } from '@/lib/sample-data';
import AttendanceChart from '@/components/dashboard/AttendanceChart';
import Badge from '@/components/ui/Badge';

const SIDEBAR_ITEMS = [
  { icon: Church, label: 'Dashboard', active: true },
  { icon: Users, label: 'Members' },
  { icon: Boxes, label: 'Units' },
  { icon: CalendarCheck, label: 'Attendance' },
  { icon: BookOpen, label: 'Bible' },
  { icon: HandHeart, label: 'Prayer' },
  { icon: CalendarDays, label: 'Events' },
  { icon: BarChart3, label: 'Analytics' },
];

const ACCENT_ICON = { blue: Users, green: Boxes, purple: CalendarCheck, amber: HandHeart };
const ACCENT_TONE = {
  blue: 'bg-accent-blue/10 text-accent-blue',
  green: 'bg-accent-green/10 text-accent-green',
  purple: 'bg-accent-purple/10 text-accent-purple',
  amber: 'bg-accent-amber/10 text-accent-amber',
};

/**
 * A real, interactive-feeling representation of the Flocks product - not
 * a decorative screenshot. Built from the same design tokens/components
 * as the actual dashboard.
 */
export default function ProductPreview() {
  return (
    <div className="overflow-hidden rounded-card border border-border bg-surface-elevated shadow-elevated">
      <div className="flex">
        <div className="hidden w-[180px] shrink-0 border-r border-border-subtle bg-background-secondary p-3 sm:block">
          <div className="mb-4 flex items-center gap-2 px-2 py-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-danger/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-warning/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-success/70" />
          </div>
          <ul className="space-y-0.5">
            {SIDEBAR_ITEMS.map((item) => (
              <li
                key={item.label}
                className={`flex items-center gap-2.5 rounded-[8px] px-2.5 py-2 text-xs font-medium ${
                  item.active ? 'bg-primary/10 text-primary' : 'text-foreground-secondary'
                }`}
              >
                <item.icon className="h-3.5 w-3.5" /> {item.label}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex-1 p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground">Dashboard</p>
            <Bell className="h-4 w-4 text-muted" />
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {kpis.map((kpi) => {
              const Icon = ACCENT_ICON[kpi.accent];
              return (
                <div key={kpi.label} className="rounded-control border border-border-subtle bg-surface p-3">
                  <span className={`mb-2 inline-flex h-7 w-7 items-center justify-center rounded-[8px] ${ACCENT_TONE[kpi.accent]}`}>
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  <p className="text-[11px] text-muted">{kpi.label}</p>
                  <p className="text-lg font-semibold text-foreground">{kpi.value}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-4 grid gap-3 lg:grid-cols-5">
            <div className="rounded-control border border-border-subtle bg-surface p-4 lg:col-span-3">
              <p className="mb-2 text-xs font-semibold text-foreground">Sunday Attendance</p>
              <div className="h-32 sm:h-40">
                <AttendanceChart data={attendanceTrend} />
              </div>
            </div>
            <div className="rounded-control border border-border-subtle bg-surface p-4 lg:col-span-2">
              <p className="mb-2.5 text-xs font-semibold text-foreground">Prayer Requests</p>
              <ul className="space-y-2.5">
                {prayerRequests.slice(0, 3).map((r) => (
                  <li key={r.title} className="flex items-center justify-between gap-2">
                    <span className="truncate text-xs text-foreground-secondary">{r.title}</span>
                    <Badge tone={r.priority === 'High' ? 'red' : r.priority === 'Medium' ? 'amber' : 'green'} className="shrink-0 px-1.5 py-0 text-[10px]">
                      {r.priority}
                    </Badge>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-3 rounded-control border border-border-subtle bg-surface p-4">
            <p className="mb-2.5 text-xs font-semibold text-foreground">Upcoming Events</p>
            <ul className="flex flex-wrap gap-2">
              {upcomingEvents.slice(0, 3).map((e) => (
                <li key={e.title} className="flex items-center gap-2 rounded-full border border-border-subtle bg-background-secondary px-3 py-1.5 text-[11px] text-foreground-secondary">
                  <CalendarDays className="h-3 w-3 text-primary" /> {e.title}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
