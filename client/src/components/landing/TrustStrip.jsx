import { Users, BookOpen, HandHeart, CalendarCheck, CalendarDays, BarChart3 } from 'lucide-react';

const ITEMS = [
  { icon: Users, label: 'Community' },
  { icon: BookOpen, label: 'Discipleship' },
  { icon: HandHeart, label: 'Pastoral Care' },
  { icon: CalendarCheck, label: 'Attendance' },
  { icon: CalendarDays, label: 'Events' },
  { icon: BarChart3, label: 'Insights' },
];

export default function TrustStrip() {
  return (
    <section className="border-y border-border-subtle bg-background-secondary py-10">
      <div className="container">
        <p className="mb-6 text-center text-sm font-medium text-muted">One connected platform for your church</p>
        <div className="grid grid-cols-3 gap-6 sm:grid-cols-6">
          {ITEMS.map((item) => (
            <div key={item.label} className="flex flex-col items-center gap-2 text-center">
              <item.icon className="h-5 w-5 text-foreground-secondary" />
              <span className="text-xs font-medium text-foreground-secondary">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
