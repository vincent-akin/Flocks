import { cn } from '@/lib/utils';

export default function Skeleton({ className }) {
  return <div className={cn('animate-pulse rounded-[8px] bg-surface-secondary', className)} aria-hidden="true" />;
}
