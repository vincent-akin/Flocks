import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';
import { CalendarDays } from 'lucide-react';

export default function EventListCard({ events = [] }) {
  if (!events.length) {
    return <EmptyState icon={CalendarDays} title="No upcoming events" description="Create an event to get started." />;
  }

  return (
    <ul className="space-y-4">
      {events.map((event, idx) => (
        <li key={idx} className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-control bg-surface-secondary text-center leading-none">
            <span className="text-[10px] font-semibold uppercase text-muted">{event.date.split(' ')[0]}</span>
            <span className="text-sm font-semibold text-foreground">{event.date.split(' ')[1]}</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">{event.title}</p>
            <p className="truncate text-xs text-muted">{event.location}</p>
          </div>
          <Badge tone="blue">{event.tag}</Badge>
        </li>
      ))}
    </ul>
  );
}
