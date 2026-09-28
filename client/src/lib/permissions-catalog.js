/**
 * Mirrors src/permissions/permissions.js on the backend, grouped for the
 * Role & Permission assignment UI. The backend is the source of truth
 * and validates every value independently; this list only drives what
 * checkboxes render here.
 */
export const PERMISSION_GROUPS = [
  {
    label: 'Organization / Parish',
    permissions: ['view_organization', 'update_organization', 'create_parish', 'update_parish', 'delete_parish', 'view_parish', 'manage_parish_admins'],
  },
  {
    label: 'Members',
    permissions: ['view_members', 'create_member', 'update_member', 'delete_member', 'view_member_history', 'transfer_member'],
  },
  {
    label: 'Units',
    permissions: ['create_unit', 'update_unit', 'delete_unit', 'manage_unit_members', 'manage_unit_admins', 'view_unit_analytics'],
  },
  {
    label: 'Bible',
    permissions: ['create_bible_plan', 'update_bible_plan', 'publish_bible_plan', 'set_daily_verse', 'set_weekly_verse', 'set_yearly_verse'],
  },
  {
    label: 'Prayer',
    permissions: ['view_prayer_requests', 'manage_prayer_requests', 'assign_prayer_request', 'view_testimonies', 'moderate_testimonies'],
  },
  {
    label: 'Attendance',
    permissions: ['create_attendance_session', 'view_attendance', 'edit_attendance', 'view_attendance_analytics'],
  },
  {
    label: 'Analytics',
    permissions: ['view_organization_analytics', 'view_parish_analytics', 'view_unit_analytics', 'view_member_analytics'],
  },
  {
    label: 'Calendar',
    permissions: ['create_event', 'update_event', 'delete_event', 'view_events'],
  },
];

export function permissionLabel(permission) {
  return permission.replace(/_/g, ' ');
}
