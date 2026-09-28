import { ShieldCheck, Layers, Building, FileClock, Lock } from 'lucide-react';
import SectionHeading from './SectionHeading';
import Card from '@/components/ui/Card';

const ITEMS = [
  { icon: ShieldCheck, title: 'Role-Based Access', description: 'Every action is checked against explicit roles and permissions - server-side, always.' },
  { icon: Layers, title: 'Scoped Permissions', description: 'Access is scoped to an organization, parish, or unit - never broader than intended.' },
  { icon: Building, title: 'Tenant Isolation', description: 'Every request resolves your organization first; other tenants stay unreachable.' },
  { icon: FileClock, title: 'Audit Logging', description: 'Sensitive administrative actions are recorded with who, what, and when.' },
  { icon: Lock, title: 'Protected Pastoral Data', description: 'Prayer requests and pastoral notes carry explicit, member-controlled visibility.' },
];

export default function SecuritySection() {
  return (
    <section id="security" className="py-24">
      <div className="container">
        <SectionHeading eyebrow="Trust" title="Built Around Trust." />
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {ITEMS.map((item) => (
            <Card key={item.title} className="text-center">
              <span className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-control bg-primary/10 text-primary">
                <item.icon className="h-5 w-5" />
              </span>
              <h3 className="mb-1.5 text-sm font-semibold text-foreground">{item.title}</h3>
              <p className="text-xs leading-relaxed text-muted">{item.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
