'use client';

import { TrendingUp, Users, Boxes, CalendarCheck, HandHeart } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import Card from '@/components/ui/Card';
import { cn } from '@/lib/utils';

const ACCENTS = {
  blue: { bg: 'bg-accent-blue/10', text: 'text-accent-blue', stroke: 'var(--accent-blue)', icon: Users },
  green: { bg: 'bg-accent-green/10', text: 'text-accent-green', stroke: 'var(--accent-green)', icon: Boxes },
  purple: { bg: 'bg-accent-purple/10', text: 'text-accent-purple', stroke: 'var(--accent-purple)', icon: CalendarCheck },
  amber: { bg: 'bg-accent-amber/10', text: 'text-accent-amber', stroke: 'var(--accent-amber)', icon: HandHeart },
};

const SPARKLINE = [{ v: 4 }, { v: 7 }, { v: 5 }, { v: 9 }, { v: 8 }, { v: 12 }, { v: 10 }];

/**
 * The icon is resolved internally from `accent` (rather than accepted as
 * a component prop) because StatCard is a Client Component: a Server
 * Component parent cannot pass a component/function reference as a prop
 * across that boundary, only serializable values like this string.
 */
export default function StatCard({ label, value, delta, note, accent = 'blue' }) {
  const tone = ACCENTS[accent] || ACCENTS.blue;
  const Icon = tone.icon;

  return (
    <Card className="relative overflow-hidden">
      <div className="flex items-start justify-between">
        <div className={cn('flex h-11 w-11 items-center justify-center rounded-control', tone.bg, tone.text)}>
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="h-8 w-20 opacity-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={SPARKLINE}>
              <Line type="monotone" dataKey="v" stroke={tone.stroke} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      <p className="mt-4 text-sm text-muted">{label}</p>
      <p className="mt-1 text-3xl font-semibold tracking-tight text-foreground">{value}</p>
      <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-success">
        <TrendingUp className="h-3.5 w-3.5" /> {delta} <span className="font-normal text-muted">{note}</span>
      </p>
    </Card>
  );
}
