'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronsLeft, ChevronsRight, Church } from 'lucide-react';
import { NAV_SECTIONS } from '@/lib/nav-config';
import { useAuth } from '@/context/AuthContext';
import { hasPermission } from '@/lib/permissions';
import { useApi } from '@/lib/hooks';
import { notificationApi } from '@/lib/api';
import Badge from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import Logo from './Logo';

export default function Sidebar({ mobile = false, onNavigate }) {
  const pathname = usePathname();
  const { roleAssignments } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const { data: unreadNotifications } = useApi(() => notificationApi.list({ unreadOnly: 'true' }), []);
  const dynamicBadgeValues = { notifications: unreadNotifications?.length || 0 };

  useEffect(() => {
    if (mobile) return;
    const stored = window.localStorage.getItem('flocks:sidebar-collapsed');
    if (stored) setCollapsed(stored === 'true');
  }, [mobile]);

  function toggleCollapsed() {
    setCollapsed((c) => {
      window.localStorage.setItem('flocks:sidebar-collapsed', String(!c));
      return !c;
    });
  }

  const visibleSections = NAV_SECTIONS.map((section) => ({
    ...section,
    items: section.items.filter((item) => !item.permission || hasPermission(roleAssignments, item.permission)),
  })).filter((section) => section.items.length > 0);

  return (
    <aside
      className={cn(
        'flex h-full flex-col border-r border-border-subtle bg-background-secondary transition-all duration-200',
        mobile ? 'w-full' : collapsed ? 'w-[80px]' : 'w-[260px]'
      )}
    >
      <div className={cn('flex h-16 items-center border-b border-border-subtle px-5', collapsed && !mobile && 'justify-center px-0')}>
        {collapsed && !mobile ? (
          <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-primary text-primary-foreground">
            <Church className="h-4 w-4" />
          </span>
        ) : (
          <Logo />
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Dashboard navigation">
        {visibleSections.map((section, idx) => (
          <div key={section.title || idx} className="mb-5">
            {section.title && !collapsed && (
              <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-disabled">{section.title}</p>
            )}
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const active = pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href));
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      aria-current={active ? 'page' : undefined}
                      className={cn(
                        'group flex items-center gap-3 rounded-control px-3 py-2.5 text-sm font-medium transition-colors',
                        active ? 'bg-primary/10 text-primary' : 'text-foreground-secondary hover:bg-surface-secondary hover:text-foreground',
                        collapsed && !mobile && 'justify-center px-0'
                      )}
                      title={collapsed && !mobile ? item.label : undefined}
                    >
                      <item.icon className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
                      {(!collapsed || mobile) && <span className="flex-1 truncate">{item.label}</span>}
                      {(!collapsed || mobile) && item.dynamicBadge && dynamicBadgeValues[item.dynamicBadge] > 0 && (
                        <Badge tone={active ? 'blue' : 'neutral'} className="px-1.5 py-0">
                          {dynamicBadgeValues[item.dynamicBadge]}
                        </Badge>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {!mobile && (
        <button
          type="button"
          onClick={toggleCollapsed}
          className="flex items-center justify-center gap-2 border-t border-border-subtle py-3.5 text-xs font-medium text-muted transition-colors hover:bg-surface-secondary hover:text-foreground"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
          {!collapsed && 'Collapse'}
        </button>
      )}
    </aside>
  );
}
