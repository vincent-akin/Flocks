import {
  LayoutDashboard,
  Users,
  Boxes,
  Church,
  CalendarCheck,
  BookOpen,
  HandHeart,
  CalendarDays,
  BarChart3,
  MessageSquare,
  Bell,
  Building2,
  UserCog,
  ShieldCheck,
  Settings,
} from 'lucide-react';

/**
 * Single source of truth for the app sidebar. Each item's `permission`
 * is checked client-side ONLY to decide whether to render it - hiding a
 * link is a UX nicety, not a security boundary. The backend independently
 * re-checks every permission on every request.
 */
export const NAV_SECTIONS = [
  {
    title: null,
    items: [{ href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, permission: null }],
  },
  {
    title: 'Community',
    items: [
      { href: '/dashboard/members', label: 'Members', icon: Users, permission: 'view_members' },
      { href: '/dashboard/units', label: 'Units', icon: Boxes, permission: 'view_members' },
      { href: '/dashboard/parishes', label: 'Parishes', icon: Church, permission: 'view_parish' },
    ],
  },
  {
    title: 'Engagement',
    items: [
      { href: '/dashboard/attendance', label: 'Attendance', icon: CalendarCheck, permission: 'view_attendance' },
      { href: '/dashboard/bible', label: 'Bible', icon: BookOpen, permission: null },
      { href: '/dashboard/prayer', label: 'Prayer', icon: HandHeart, permission: null },
      { href: '/dashboard/events', label: 'Events', icon: CalendarDays, permission: null },
    ],
  },
  {
    title: 'Insights',
    items: [{ href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3, permission: 'view_organization_analytics' }],
  },
  {
    title: 'Communication',
    items: [
      { href: '/dashboard/messages', label: 'Messages', icon: MessageSquare, permission: null },
      { href: '/dashboard/notifications', label: 'Notifications', icon: Bell, permission: null, dynamicBadge: 'notifications' },
    ],
  },
  {
    title: 'Administration',
    items: [
      { href: '/dashboard/organization', label: 'Organization', icon: Building2, permission: 'view_organization' },
      { href: '/dashboard/users', label: 'Users', icon: UserCog, permission: 'manage_admins' },
      { href: '/dashboard/roles', label: 'Roles & Permissions', icon: ShieldCheck, permission: 'manage_roles' },
      { href: '/dashboard/settings', label: 'Settings', icon: Settings, permission: null },
    ],
  },
];
