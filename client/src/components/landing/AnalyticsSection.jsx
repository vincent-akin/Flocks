import { TrendingUp, Users, Boxes, AlertTriangle } from 'lucide-react';
import SectionHeading from './SectionHeading';
import Card from '@/components/ui/Card';

const METRICS = [
  { icon: TrendingUp, label: 'Member Growth', value: '+12.4%', tone: 'text-success' },
  { icon: Users, label: 'Attendance Consistency', value: '84%', tone: 'text-accent-blue' },
  { icon: Boxes, label: 'Active Units', value: '48', tone: 'text-accent-purple' },
  { icon: AlertTriangle, label: 'Members Needing Follow-up', value: '27', tone: 'text-accent-amber' },
];

export default function AnalyticsSection() {
  return (
    <section id="analytics" className="bg-background-secondary py-24">
      <div className="container">
        <SectionHeading
          eyebrow="Church Intelligence"
          title="See What's Happening Across Your Church."
          description="Pastoral indicators for leadership decisions - never a public ranking of members."
        />
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {METRICS.map((m) => (
            <Card key={m.label}>
              <m.icon className={`mb-4 h-6 w-6 ${m.tone}`} />
              <p className={`text-3xl font-semibold tracking-tight ${m.tone}`}>{m.value}</p>
              <p className="mt-1 text-sm text-muted">{m.label}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
