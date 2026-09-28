import { UserPlus, CalendarPlus, HandHeart, QrCode, MessageSquarePlus, BarChart3 } from 'lucide-react';

const ACTIONS = [
  { label: 'Add Member', icon: UserPlus, accent: 'blue' },
  { label: 'Create Event', icon: CalendarPlus, accent: 'purple' },
  { label: 'New Prayer Request', icon: HandHeart, accent: 'green' },
  { label: 'Record Attendance', icon: QrCode, accent: 'amber' },
  { label: 'Post Message', icon: MessageSquarePlus, accent: 'red' },
  { label: 'View Analytics', icon: BarChart3, accent: 'blue' },
];

const TONE = {
  blue: 'bg-accent-blue/10 text-accent-blue',
  green: 'bg-accent-green/10 text-accent-green',
  purple: 'bg-accent-purple/10 text-accent-purple',
  amber: 'bg-accent-amber/10 text-accent-amber',
  red: 'bg-accent-red/10 text-accent-red',
};

export default function QuickActions() {
  return (
    <div className="grid grid-cols-3 gap-3">
      {ACTIONS.map((action) => (
        <button
          key={action.label}
          type="button"
          className="flex flex-col items-center gap-2 rounded-control border border-transparent p-3 text-center transition-colors hover:border-border hover:bg-surface-secondary"
        >
          <span className={`flex h-11 w-11 items-center justify-center rounded-full ${TONE[action.accent]}`}>
            <action.icon className="h-5 w-5" />
          </span>
          <span className="text-xs font-medium leading-tight text-foreground-secondary">{action.label}</span>
        </button>
      ))}
    </div>
  );
}
