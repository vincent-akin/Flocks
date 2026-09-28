import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';
import { Activity } from 'lucide-react';

export default function ActivityFeed({ items = [] }) {
  if (!items.length) {
    return <EmptyState icon={Activity} title="No recent activity" description="Activity across your church will show up here." />;
  }

  return (
    <ul className="space-y-4">
      {items.map((item, idx) => (
        <li key={idx} className="flex items-center gap-3">
          <Avatar name={item.name} size={38} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm text-foreground">
              <span className="font-medium">{item.name}</span> <span className="text-foreground-secondary">{item.action}</span>
            </p>
            <p className="text-xs text-muted">{item.time}</p>
          </div>
          <Badge tone={item.accent}>{item.tag}</Badge>
        </li>
      ))}
    </ul>
  );
}
