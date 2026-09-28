import { AlertTriangle, Lock } from 'lucide-react';
import Skeleton from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import Button from '@/components/ui/Button';

/**
 * Wraps a data-driven section with the standard loading/error/forbidden/
 * empty states so every page handles the backend consistently, per the
 * "every major component supports Loading/Empty/Success/Error/Permission
 * denied" convention.
 */
export default function DataState({ status, error, onRetry, isEmpty, emptyState, skeleton, children }) {
  if (status === 'loading') {
    return skeleton || <DefaultSkeleton />;
  }

  if (status === 'forbidden') {
    return (
      <EmptyState
        icon={Lock}
        title="You don't have permission to view this information."
        description="Ask an administrator to grant you access if you believe this is a mistake."
      />
    );
  }

  if (status === 'error') {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="Something went wrong"
        description={error || 'We could not load this information. Please try again.'}
        action={
          onRetry && (
            <Button variant="secondary" size="sm" onClick={onRetry}>
              Try again
            </Button>
          )
        }
      />
    );
  }

  if (isEmpty) {
    return emptyState || <EmptyState title="Nothing here yet" />;
  }

  return children;
}

function DefaultSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-14 w-full" />
      <Skeleton className="h-14 w-full" />
      <Skeleton className="h-14 w-full" />
    </div>
  );
}
