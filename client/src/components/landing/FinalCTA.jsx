import { ArrowRight } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function FinalCTA() {
  return (
    <section className="relative overflow-hidden bg-glow py-24">
      <div className="container text-center">
        <h2 className="mx-auto max-w-2xl text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
          Build a Healthier, More Connected Church.
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-balance text-base leading-relaxed text-foreground-secondary sm:text-lg">
          Bring your people, discipleship, pastoral care, attendance, events, and insights into one connected
          platform.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button href="/register" size="lg" className="w-full sm:w-auto">
            Get Started <ArrowRight className="h-4 w-4" />
          </Button>
          <Button as="a" href="#platform" variant="secondary" size="lg" className="w-full sm:w-auto">
            Explore Flocks
          </Button>
        </div>
      </div>
    </section>
  );
}
