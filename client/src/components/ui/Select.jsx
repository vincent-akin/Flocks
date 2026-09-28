'use client';

import { forwardRef, useId } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const Select = forwardRef(function Select({ label, error, className, id, children, ...props }, ref) {
  const autoId = useId();
  const selectId = id || autoId;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={selectId} className="mb-1.5 block text-sm font-medium text-foreground">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          aria-invalid={!!error || undefined}
          className={cn(
            'h-11 w-full appearance-none rounded-control border bg-surface px-3.5 pr-9 text-sm text-foreground',
            'transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary/30',
            error ? 'border-danger' : 'border-border focus:border-primary',
            className
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />
      </div>
      {error && <p className="mt-1.5 text-xs text-danger">{error}</p>}
    </div>
  );
});

export default Select;
