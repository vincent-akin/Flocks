import { HandHeart } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';

const PRIORITY_TONE = { High: 'red', Medium: 'amber', Low: 'green' };

export default function PrayerListCard({ requests = [] }) {
  if (!requests.length) {
    return <EmptyState icon={HandHeart} title="No active prayer requests" description="Requests submitted by your church will appear here." />;
  }

  return (
    <ul className="space-y-4">
      {requests.map((req, idx) => (
        <li key={idx} className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-purple/10 text-accent-purple">
            <HandHeart className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">{req.title}</p>
            <p className="truncate text-xs text-muted">
              {req.name} • {req.time}
            </p>
          </div>
          <Badge tone={PRIORITY_TONE[req.priority] || 'neutral'}>{req.priority}</Badge>
        </li>
      ))}
    </ul>
  );
}
