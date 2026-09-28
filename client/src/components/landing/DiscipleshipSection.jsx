import { Flame, BookMarked } from 'lucide-react';
import SectionHeading from './SectionHeading';
import Card from '@/components/ui/Card';
import { biblePlanExample } from '@/lib/sample-data';

export default function DiscipleshipSection() {
  const p = biblePlanExample;

  return (
    <section id="discipleship" className="bg-background-secondary py-24">
      <div className="container grid items-center gap-14 lg:grid-cols-2">
        <Card className="order-2 mx-auto w-full max-w-sm border-accent-purple/20 lg:order-1">
          <div className="mb-5 flex items-center justify-between">
            <span className="flex h-11 w-11 items-center justify-center rounded-control bg-accent-purple/10 text-accent-purple">
              <BookMarked className="h-5 w-5" />
            </span>
            <span className="flex items-center gap-1.5 rounded-full bg-accent-amber/10 px-3 py-1 text-xs font-medium text-accent-amber">
              <Flame className="h-3.5 w-3.5" /> {p.streak}-day streak
            </span>
          </div>
          <h3 className="text-lg font-semibold text-foreground">{p.title}</h3>
          <p className="mt-1 text-sm text-muted">Day {p.day}</p>

          <div className="mt-5 rounded-control bg-surface-secondary p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted">Today&apos;s Reading</p>
            <p className="mt-1 text-base font-medium text-foreground">{p.reading}</p>
          </div>

          <div className="mt-5">
            <div className="mb-1.5 flex justify-between text-xs text-foreground-secondary">
              <span>Progress</span>
              <span className="font-medium text-foreground">{p.progress}%</span>
            </div>
            <div className="h-2 rounded-full bg-surface-secondary">
              <div className="h-full rounded-full bg-accent-purple transition-all" style={{ width: `${p.progress}%` }} />
            </div>
          </div>
        </Card>

        <div className="order-1 lg:order-2">
          <SectionHeading align="left" eyebrow="Discipleship" title="Turn Participation Into Growth." className="mx-0 text-left" />
          <p className="mt-6 max-w-lg text-sm leading-relaxed text-foreground-secondary">
            Bible plans of every length - from 7 days to a full year - with daily readings, progress tracking,
            streaks, and personal notes, so growth is visible and encouraged rather than assumed.
          </p>
        </div>
      </div>
    </section>
  );
}
