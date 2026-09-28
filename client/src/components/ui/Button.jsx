'use client';

import { forwardRef } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const VARIANTS = {
  primary: 'bg-primary text-primary-foreground hover:bg-primary-hover shadow-subtle',
  secondary: 'bg-surface-elevated text-foreground border border-border hover:bg-surface-secondary',
  ghost: 'bg-transparent text-foreground hover:bg-surface-secondary',
  danger: 'bg-danger text-white hover:opacity-90',
  link: 'bg-transparent text-primary hover:text-primary-hover underline-offset-4 hover:underline p-0 h-auto',
};

const SIZES = {
  sm: 'h-9 px-3 text-sm rounded-control',
  md: 'h-11 px-5 text-sm rounded-control',
  lg: 'h-12 px-6 text-base rounded-control',
};

/**
 * Base button. Supports default/hover/active/focus/disabled/loading
 * states out of the box via Tailwind pseudo-classes + the `loading` prop.
 */
const Button = forwardRef(function Button(
  { className, variant = 'primary', size = 'md', loading = false, disabled, children, as: Comp = 'button', href, ...props },
  ref
) {
  const classes = cn(
    'inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-all duration-200',
    'active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100',
    VARIANTS[variant],
    SIZES[size],
    className
  );

  // `href` renders a Next.js Link internally (imported here, in this
  // Client Component, rather than accepted as a component reference via
  // props - a Server Component parent cannot pass a function/component
  // as a prop across the server/client boundary).
  if (href) {
    return (
      <Link ref={ref} href={href} className={classes} {...props}>
        {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
        {children}
      </Link>
    );
  }

  return (
    <Comp
      ref={ref}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={classes}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
      {children}
    </Comp>
  );
});

export default Button;
