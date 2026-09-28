import { ArrowRight, PlayCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import ProductPreview from './ProductPreview';

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-glow">
      <div className="container flex flex-col items-center gap-14 py-20 sm:py-28 lg:py-32">
        <div className="max-w-3xl text-center">
          <span className="mb-6 inline-flex animate-fade-in items-center gap-2 rounded-full border border-border bg-surface px-3.5 py-1.5 text-xs font-medium text-foreground-secondary">
            Church Community · Discipleship · Pastoral Care · Intelligence
          </span>
          <h1 className="animate-slide-up text-balance text-4xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-6xl lg:text-7xl">
            Know Your People.
            <br />
            Care For Them.
            <br />
            Help Them Grow.
          </h1>
          <p className="mx-auto mt-6 max-w-xl animate-slide-up text-balance text-base leading-relaxed text-foreground-secondary sm:text-lg" style={{ animationDelay: '80ms' }}>
            Flocks brings your church community, discipleship, pastoral care, attendance, prayer, events, and insights
            into one connected platform.
          </p>
          <div className="mt-8 flex animate-slide-up flex-col items-center justify-center gap-3 sm:flex-row" style={{ animationDelay: '140ms' }}>
            <Button href="/register" size="lg" className="w-full sm:w-auto">
              Get Started <ArrowRight className="h-4 w-4" />
            </Button>
            <Button as="a" href="#platform" variant="secondary" size="lg" className="w-full sm:w-auto">
              <PlayCircle className="h-4 w-4" /> Explore the Platform
            </Button>
          </div>
        </div>

        <div className="w-full max-w-5xl animate-slide-up" style={{ animationDelay: '200ms' }}>
          <ProductPreview />
        </div>
      </div>
    </section>
  );
}
