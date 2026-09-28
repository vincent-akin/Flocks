import { Church, Boxes, Users, Building2 } from 'lucide-react';
import SectionHeading from './SectionHeading';
import Card from '@/components/ui/Card';
import { parishes } from '@/lib/sample-data';

const HIERARCHY = [
  { icon: Building2, label: 'Church Organization' },
  { icon: Church, label: 'Parish' },
  { icon: Boxes, label: 'Unit' },
  { icon: Users, label: 'Members' },
];

export default function ParishSection() {
  return (
    <section id="parishes" className="py-24">
      <div className="container grid items-start gap-14 lg:grid-cols-2">
        <div>
          <SectionHeading
            align="left"
            eyebrow="Multi-Parish"
            title="One Organization. Many Parishes. Scoped Access."
            className="mx-0 text-left"
          />
          <ol className="mt-8 space-y-3">
            {HIERARCHY.map((step, idx) => (
              <li key={step.label} className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-control bg-primary/10 text-sm font-semibold text-primary">
                  {idx + 1}
                </span>
                <step.icon className="h-4 w-4 text-muted" />
                <span className="text-sm font-medium text-foreground">{step.label}</span>
              </li>
            ))}
          </ol>
          <p className="mt-6 max-w-lg text-sm leading-relaxed text-muted">
            The Church Organization is the tenant; a Parish is a subdivision within it, not a separate tenant. A
            single-parish church uses the same architecture without the added complexity.
          </p>
        </div>

        <div className="space-y-4">
          {parishes.map((parish) => (
            <Card key={parish.name} className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-foreground">{parish.name}</p>
                <p className="text-sm text-muted">{parish.members} members</p>
              </div>
              <span className="text-sm font-medium text-muted">{parish.units} units</span>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
