import { Check } from 'lucide-react';
import SectionHeading from './SectionHeading';
import Card from '@/components/ui/Card';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import { memberJourneyExample } from '@/lib/sample-data';

const POINTS = ['Members', 'Parishes', 'Units', 'Relationships', 'Membership History', 'Journey'];

export default function CommunitySection() {
  const m = memberJourneyExample;

  return (
    <section id="community" className="py-24">
      <div className="container grid items-center gap-14 lg:grid-cols-2">
        <div>
          <SectionHeading align="left" eyebrow="Community" title="Your Church Is More Than a Database." className="mx-0 text-left" />
          <ul className="mt-8 grid grid-cols-2 gap-x-6 gap-y-3">
            {POINTS.map((point) => (
              <li key={point} className="flex items-center gap-2 text-sm text-foreground-secondary">
                <Check className="h-4 w-4 shrink-0 text-success" /> {point}
              </li>
            ))}
          </ul>
          <p className="mt-6 max-w-lg text-sm leading-relaxed text-muted">
            Flocks preserves a durable member identity across parish transfers, membership status, baptism status,
            discipleship status, and a full journey history - so nothing is lost as people move and grow.
          </p>
        </div>

        <Card className="mx-auto w-full max-w-sm animate-scale-in">
          <div className="flex items-center gap-3">
            <Avatar name={m.name} size={48} />
            <div>
              <p className="font-semibold text-foreground">{m.name}</p>
              <p className="text-xs text-muted">{m.parish}</p>
            </div>
            <Badge tone="green" className="ml-auto">
              {m.status}
            </Badge>
          </div>

          <div className="mt-6 space-y-4">
            <div>
              <div className="mb-1.5 flex justify-between text-xs text-foreground-secondary">
                <span>Discipleship</span>
                <span className="font-medium text-foreground">{m.discipleship}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-surface-secondary">
                <div className="h-full rounded-full bg-accent-purple" style={{ width: `${m.discipleship}%` }} />
              </div>
            </div>
            <div>
              <div className="mb-1.5 flex justify-between text-xs text-foreground-secondary">
                <span>Attendance</span>
                <span className="font-medium text-foreground">{m.attendance}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-surface-secondary">
                <div className="h-full rounded-full bg-accent-blue" style={{ width: `${m.attendance}%` }} />
              </div>
            </div>
            <div className="flex items-center justify-between rounded-control bg-surface-secondary px-3.5 py-2.5 text-sm">
              <span className="text-foreground-secondary">Bible Plan</span>
              <span className="font-medium text-foreground">
                Day {m.biblePlan.day} / {m.biblePlan.total}
              </span>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}
