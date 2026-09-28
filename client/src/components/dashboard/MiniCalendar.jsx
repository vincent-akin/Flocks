'use client';

import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/**
 * A real current-month calendar (not a hardcoded illustrative date).
 * When `events` (an array of { startsAt }) is supplied, days that have
 * at least one event get a small dot indicator.
 */
export default function MiniCalendar({ events = [] }) {
  const today = useMemo(() => new Date(), []);
  const [cursor, setCursor] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  const eventDayKeys = useMemo(() => {
    const set = new Set();
    events.forEach((e) => {
      if (!e.startsAt) return;
      const d = new Date(e.startsAt);
      set.add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`);
    });
    return set;
  }, [events]);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const cells = [];
  for (let i = firstWeekday - 1; i >= 0; i--) cells.push({ day: daysInPrevMonth - i, outside: true });
  for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, outside: false });
  while (cells.length % 7 !== 0) cells.push({ day: cells.length - (firstWeekday + daysInMonth) + 1, outside: true });

  const isToday = (day, outside) =>
    !outside && day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold text-foreground">
          {cursor.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </p>
        <div className="flex gap-1">
          <button
            type="button"
            aria-label="Previous month"
            onClick={() => setCursor(new Date(year, month - 1, 1))}
            className="rounded-control p-1 text-muted hover:bg-surface-secondary"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Next month"
            onClick={() => setCursor(new Date(year, month + 1, 1))}
            className="rounded-control p-1 text-muted hover:bg-surface-secondary"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-y-1 text-center text-[11px] font-medium text-muted">
        {DAYS.map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-1 text-center text-sm">
        {cells.map((cell, idx) => {
          const hasEvent = !cell.outside && eventDayKeys.has(`${year}-${month}-${cell.day}`);
          return (
            <div key={idx} className="relative mx-auto flex flex-col items-center">
              <span
                className={cn(
                  'flex h-7 w-7 items-center justify-center rounded-full transition-colors',
                  cell.outside && 'text-disabled',
                  !cell.outside && !isToday(cell.day, cell.outside) && 'text-foreground',
                  isToday(cell.day, cell.outside) && 'bg-primary text-primary-foreground'
                )}
              >
                {cell.day}
              </span>
              {hasEvent && <span className="absolute -bottom-0.5 h-1 w-1 rounded-full bg-accent-blue" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
