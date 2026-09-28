import { cn } from '@/lib/utils';

export function Card({ className, interactive = false, children, ...props }) {
  return (
    <div
      className={cn(
        'rounded-card border border-border bg-surface-elevated p-6',
        interactive && 'transition-colors duration-200 hover:border-primary/40 cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }) {
  return (
    <div className={cn('mb-4 flex items-center justify-between gap-3', className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }) {
  return (
    <h3 className={cn('text-lg font-semibold tracking-tight text-foreground', className)} {...props}>
      {children}
    </h3>
  );
}

export default Card;
