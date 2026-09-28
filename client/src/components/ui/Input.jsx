'use client';

import { forwardRef, useId } from 'react';
import { cn } from '@/lib/utils';

const Input = forwardRef(function Input(
  { label, error, success, hint, className, id, type = 'text', ...props },
  ref
) {
  const autoId = useId();
  const inputId = id || autoId;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-foreground">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        type={type}
        aria-invalid={!!error || undefined}
        aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
        className={cn(
          'h-11 w-full rounded-control border bg-surface px-3.5 text-sm text-foreground placeholder:text-disabled',
          'transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary/30',
          error ? 'border-danger focus:ring-danger/20' : success ? 'border-success' : 'border-border focus:border-primary',
          'disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        {...props}
      />
      {error && (
        <p id={`${inputId}-error`} className="mt-1.5 text-xs text-danger">
          {error}
        </p>
      )}
      {!error && hint && (
        <p id={`${inputId}-hint`} className="mt-1.5 text-xs text-muted">
          {hint}
        </p>
      )}
    </div>
  );
});

export default Input;
