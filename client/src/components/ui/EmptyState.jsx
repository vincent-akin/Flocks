import { cn } from '@/lib/utils';

/**
 * Standard empty/error/permission-denied state for any panel that has no
 * data yet, per the "friendly, never a blank box" rule.
 */
export default function EmptyState({ icon: Icon, title, description, action, className }) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-2 rounded-control border border-dashed border-border py-10 text-center', className)}>
      {Icon && (
        <div className="mb-1 flex h-10 w-10 items-center justify-center rounded-full bg-surface-secondary text-muted">
          <Icon className="h-5 w-5" />
        </div>
      )}
      <p className="text-sm font-medium text-foreground">{title}</p>
      {description && <p className="max-w-xs text-sm text-muted">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
