'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import Logo from './Logo';
import ThemeSwitcher from './ThemeSwitcher';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/utils';

const LINKS = [
  { href: '#platform', label: 'Features' },
  { href: '#parishes', label: 'Platform' },
  { href: '#discipleship', label: 'For Churches' },
  { href: '#security', label: 'Resources' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 12);
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [drawerOpen]);

  return (
    <header
      className={cn(
        'sticky top-0 z-40 w-full transition-all duration-300',
        scrolled ? 'border-b border-border bg-background/80 backdrop-blur-md py-3' : 'border-b border-transparent py-5'
      )}
    >
      <nav className="container flex items-center justify-between" aria-label="Primary">
        <Logo />

        <div className="hidden items-center gap-8 md:flex">
          {LINKS.map((link) => (
            <a key={link.href} href={link.href} className="text-sm font-medium text-foreground-secondary transition-colors hover:text-foreground">
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <ThemeSwitcher />
          <Button href="/login" variant="ghost" size="sm">
            Sign In
          </Button>
          <Button href="/register" size="sm">
            Get Started
          </Button>
        </div>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-control p-2 text-foreground md:hidden"
          aria-label={drawerOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={drawerOpen}
          onClick={() => setDrawerOpen((o) => !o)}
        >
          {drawerOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {drawerOpen && (
        <div className="fixed inset-0 top-[64px] z-30 animate-fade-in bg-background md:hidden">
          <div className="container flex flex-col gap-1 py-6">
            {LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setDrawerOpen(false)}
                className="rounded-control px-3 py-3 text-base font-medium text-foreground hover:bg-surface-secondary"
              >
                {link.label}
              </a>
            ))}
            <div className="my-3 h-px bg-border" />
            <Link href="/login" onClick={() => setDrawerOpen(false)} className="rounded-control px-3 py-3 text-base font-medium text-foreground hover:bg-surface-secondary">
              Sign In
            </Link>
            <div className="px-3 pt-2">
              <Button href="/register" className="w-full" onClick={() => setDrawerOpen(false)}>
                Get Started
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
