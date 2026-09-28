'use client';

import { useId, useState } from 'react';
import { cn } from '@/lib/utils';

export default function Tooltip({ content, children, side = 'top' }) {
  const [visible, setVisible] = useState(false);
  const id = useId();

  const sideClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {typeof children === 'string' ? <span aria-describedby={id}>{children}</span> : children}
      <span
        role="tooltip"
        id={id}
        className={cn(
          'pointer-events-none absolute z-50 whitespace-nowrap rounded-[8px] bg-foreground px-2.5 py-1.5 text-xs font-medium text-background transition-opacity duration-150',
          sideClasses[side],
          visible ? 'opacity-100' : 'opacity-0'
        )}
      >
        {content}
      </span>
    </span>
  );
}
