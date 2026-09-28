'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

/** Minimal accessible dropdown/popover: click or keyboard (Enter/Space) to open, Escape/outside-click to close. */
export default function Dropdown({ trigger, children, align = 'right', className }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function onClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    function onKey(e) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center"
      >
        {trigger}
      </button>
      {open && (
        <div
          role="menu"
          className={cn(
            'absolute z-40 mt-2 min-w-[12rem] rounded-control border border-border bg-surface-elevated p-1.5 shadow-elevated animate-scale-in',
            align === 'right' ? 'right-0' : 'left-0',
            className
          )}
          onClick={() => setOpen(false)}
        >
          {children}
        </div>
      )}
    </div>
  );
}

export function DropdownItem({ className, children, ...props }) {
  return (
    <button
      role="menuitem"
      type="button"
      className={cn(
        'flex w-full items-center gap-2 rounded-[8px] px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-surface-secondary',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
