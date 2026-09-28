'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Bell, MessageSquare, Menu, Search, LogOut, User, Settings, Loader2 } from 'lucide-react';
import Avatar from '@/components/ui/Avatar';
import ThemeSwitcher from './ThemeSwitcher';
import Dropdown, { DropdownItem } from '@/components/ui/Dropdown';
import Badge from '@/components/ui/Badge';
import { useAuth } from '@/context/AuthContext';
import { useApi } from '@/lib/hooks';
import { notificationApi } from '@/lib/api';
import MobileNav from './MobileNav';

export default function Topbar() {
  const { member, user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const { data: notifications, status } = useApi(() => notificationApi.list({ unreadOnly: 'true' }), []);
  const unreadCount = notifications?.length || 0;

  const displayName = member ? `${member.firstName} ${member.lastName}` : user?.email || 'Guest';

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border-subtle bg-background/90 px-4 backdrop-blur-md sm:px-6">
      <button
        type="button"
        className="rounded-control p-2 text-foreground lg:hidden"
        aria-label="Open navigation menu"
        onClick={() => setMobileOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="relative hidden max-w-md flex-1 md:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          type="search"
          placeholder="Search members, units, events, prayers, etc..."
          className="h-10 w-full rounded-control border border-border bg-surface pl-9 pr-14 text-sm text-foreground placeholder:text-disabled focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          aria-label="Search"
        />
        <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-[6px] border border-border bg-surface-secondary px-1.5 py-0.5 text-[11px] text-muted">
          ⌘K
        </kbd>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <Dropdown
          align="right"
          className="w-80"
          trigger={
            <span
              className="relative flex h-9 w-9 items-center justify-center rounded-control border border-border text-foreground-secondary transition-colors hover:bg-surface-secondary"
              aria-label={unreadCount ? `Notifications, ${unreadCount} unread` : 'Notifications'}
            >
              <Bell className="h-4 w-4" />
              {status === 'success' && unreadCount > 0 && (
                <Badge tone="red" className="absolute -right-1.5 -top-1.5 min-w-[18px] justify-center px-1 py-0 text-[10px]">
                  {unreadCount}
                </Badge>
              )}
              {status === 'loading' && <Loader2 className="absolute -right-1 -top-1 h-3 w-3 animate-spin text-muted" />}
            </span>
          }
        >
          <div className="px-2 py-1.5 text-xs font-semibold uppercase tracking-wide text-muted">Notifications</div>
          {status === 'success' && (!notifications || notifications.length === 0) && (
            <p className="px-3 py-4 text-center text-sm text-muted">You&apos;re all caught up.</p>
          )}
          {(notifications || []).slice(0, 5).map((n) => (
            <DropdownItem key={n._id} className="items-start">
              <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              <span className="flex-1">
                <span className="block text-foreground">{n.title}</span>
                {n.body && <span className="block text-xs text-muted">{n.body}</span>}
              </span>
            </DropdownItem>
          ))}
          <div className="my-1 h-px bg-border-subtle" />
          <Link href="/dashboard/notifications" className="block rounded-[8px] px-3 py-2 text-center text-sm font-medium text-primary hover:bg-surface-secondary">
            View all
          </Link>
        </Dropdown>

        <Link
          href="/dashboard/messages"
          className="flex h-9 w-9 items-center justify-center rounded-control border border-border text-foreground-secondary transition-colors hover:bg-surface-secondary"
          aria-label="Messages"
        >
          <MessageSquare className="h-4 w-4" />
        </Link>

        <ThemeSwitcher />

        <Dropdown
          align="right"
          trigger={
            <span className="flex items-center gap-2 rounded-control py-1 pl-1 pr-2 hover:bg-surface-secondary">
              <Avatar name={displayName} size={32} />
              <span className="hidden text-left sm:block">
                <span className="block text-sm font-medium leading-tight text-foreground">{displayName}</span>
                <span className="block text-xs leading-tight text-muted">{user?.email}</span>
              </span>
            </span>
          }
        >
          <DropdownItem>
            <User className="h-4 w-4 text-muted" /> My Profile
          </DropdownItem>
          <DropdownItem>
            <Settings className="h-4 w-4 text-muted" /> Account Settings
          </DropdownItem>
          <div className="my-1 h-px bg-border-subtle" />
          <DropdownItem onClick={logout} className="text-danger hover:bg-danger/10">
            <LogOut className="h-4 w-4" /> Sign Out
          </DropdownItem>
        </Dropdown>
      </div>

      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </header>
  );
}
