import { cn } from '@/lib/utils';

const TONES = {
  neutral: 'bg-surface-secondary text-foreground-secondary border-border-subtle',
  blue: 'bg-accent-blue/10 text-accent-blue border-accent-blue/20',
  purple: 'bg-accent-purple/10 text-accent-purple border-accent-purple/20',
  green: 'bg-accent-green/10 text-accent-green border-accent-green/20',
  amber: 'bg-accent-amber/10 text-accent-amber border-accent-amber/20',
  red: 'bg-accent-red/10 text-accent-red border-accent-red/20',
};

export default function Badge({ tone = 'neutral', className, children, ...props }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium',
        TONES[tone] || TONES.neutral,
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
