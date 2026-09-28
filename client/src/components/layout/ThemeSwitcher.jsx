'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Moon, Sun, Monitor, Check } from 'lucide-react';
import Dropdown, { DropdownItem } from '@/components/ui/Dropdown';

const OPTIONS = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
];

export default function ThemeSwitcher({ compact = false }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const current = OPTIONS.find((o) => o.value === theme) || OPTIONS[2];
  const Icon = current.icon;

  return (
    <Dropdown
      trigger={
        <span
          className="flex h-9 w-9 items-center justify-center rounded-control border border-border text-foreground-secondary transition-colors hover:bg-surface-secondary"
          aria-label="Change theme"
        >
          {mounted ? <Icon className="h-4 w-4" /> : <span className="h-4 w-4" />}
        </span>
      }
    >
      {OPTIONS.map((opt) => (
        <DropdownItem key={opt.value} onClick={() => setTheme(opt.value)}>
          <opt.icon className="h-4 w-4 text-muted" />
          <span className="flex-1">{opt.label}</span>
          {mounted && theme === opt.value && <Check className="h-4 w-4 text-primary" />}
        </DropdownItem>
      ))}
    </Dropdown>
  );
}
