'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';
import Sidebar from './Sidebar';

export default function MobileNav({ open, onClose }) {
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="absolute inset-0 bg-black/50 animate-fade-in" onClick={onClose} aria-hidden="true" />
      <div className="relative z-10 h-full w-[280px] animate-slide-up">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close navigation menu"
          className="absolute -right-11 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-surface-elevated text-foreground shadow-elevated"
        >
          <X className="h-5 w-5" />
        </button>
        <Sidebar mobile onNavigate={onClose} />
      </div>
    </div>
  );
}
