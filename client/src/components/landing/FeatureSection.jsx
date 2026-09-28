import { Users, BookOpen, HeartHandshake, ChartNoAxesCombined } from 'lucide-react';
import Card from '@/components/ui/Card';
import SectionHeading from './SectionHeading';

const FEATURES = [
  {
    icon: Users,
    title: 'Know Your Church',
    description: 'Manage members, parishes, units, relationships, membership history, and community engagement from one connected system.',
    tone: 'bg-accent-blue/10 text-accent-blue',
  },
  {
    icon: BookOpen,
    title: 'Help People Grow',
    description: 'Create Bible plans, track reading progress, encourage consistency, and support intentional discipleship.',
    tone: 'bg-accent-purple/10 text-accent-purple',
  },
  {
    icon: HeartHandshake,
    title: 'Care With Context',
    description: 'Organize prayer requests, pastoral follow-up, testimonies, and care activities while respecting sensitive information.',
    tone: 'bg-accent-green/10 text-accent-green',
  },
  {
    icon: ChartNoAxesCombined,
    title: 'Understand Your Church',
    description: 'Turn attendance, engagement, member consistency, and activity into useful pastoral insights.',
    tone: 'bg-accent-amber/10 text-accent-amber',
  },
];

export default function FeatureSection() {
  return (
    <section id="platform" className="py-24">
      <div className="container">
        <SectionHeading eyebrow="Platform" title="Everything Your Church Needs. Connected." />
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature) => (
            <Card key={feature.title} className="animate-fade-in">
              <span className={`mb-5 inline-flex h-12 w-12 items-center justify-center rounded-control ${feature.tone}`}>
                <feature.icon className="h-6 w-6" />
              </span>
              <h3 className="mb-2 text-lg font-semibold text-foreground">{feature.title}</h3>
              <p className="text-sm leading-relaxed text-foreground-secondary">{feature.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
