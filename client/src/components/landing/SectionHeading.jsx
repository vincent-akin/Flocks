import { cn } from '@/lib/utils';

export default function SectionHeading({ eyebrow, title, description, align = 'center', className }) {
  return (
    <div className={cn('max-w-2xl', align === 'center' && 'mx-auto text-center', className)}>
      {eyebrow && <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary">{eyebrow}</p>}
      <h2 className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-5xl">{title}</h2>
      {description && <p className="mt-4 text-balance text-base leading-relaxed text-foreground-secondary sm:text-lg">{description}</p>}
    </div>
  );
}
