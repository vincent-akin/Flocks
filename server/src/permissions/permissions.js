/**
 * Central permission registry for Flocks.
 *
 * Permissions are never hard-coded into routes/UI logic directly; every
 * sensitive controller action requires one of these string constants via
 * the `authorize()` middleware, which checks it against the requesting
 * user's RoleAssignments for the resolved scope.
 */

const PERMISSIONS = Object.freeze({
  // Organization / Parish
  VIEW_ORGANIZATION: 'view_organization',
  UPDATE_ORGANIZATION: 'update_organization',
  CREATE_PARISH: 'create_parish',
  UPDATE_PARISH: 'update_parish',
  DELETE_PARISH: 'delete_parish',
  VIEW_PARISH: 'view_parish',
  MANAGE_PARISH_ADMINS: 'manage_parish_admins',

  // Members
  VIEW_MEMBERS: 'view_members',
  CREATE_MEMBER: 'create_member',
  UPDATE_MEMBER: 'update_member',
  DELETE_MEMBER: 'delete_member',
  VIEW_MEMBER_HISTORY: 'view_member_history',
  TRANSFER_MEMBER: 'transfer_member',

  // Units
  CREATE_UNIT: 'create_unit',
  UPDATE_UNIT: 'update_unit',
  DELETE_UNIT: 'delete_unit',
  MANAGE_UNIT_MEMBERS: 'manage_unit_members',
  MANAGE_UNIT_ADMINS: 'manage_unit_admins',
  VIEW_UNIT_ANALYTICS: 'view_unit_analytics',

  // Bible
  CREATE_BIBLE_PLAN: 'create_bible_plan',
  UPDATE_BIBLE_PLAN: 'update_bible_plan',
  PUBLISH_BIBLE_PLAN: 'publish_bible_plan',
  SET_DAILY_VERSE: 'set_daily_verse',
  SET_WEEKLY_VERSE: 'set_weekly_verse',
  SET_YEARLY_VERSE: 'set_yearly_verse',

  // Prayer
  VIEW_PRAYER_REQUESTS: 'view_prayer_requests',
  MANAGE_PRAYER_REQUESTS: 'manage_prayer_requests',
  ASSIGN_PRAYER_REQUEST: 'assign_prayer_request',
  VIEW_TESTIMONIES: 'view_testimonies',
  MODERATE_TESTIMONIES: 'moderate_testimonies',

  // Attendance
  CREATE_ATTENDANCE_SESSION: 'create_attendance_session',
  VIEW_ATTENDANCE: 'view_attendance',
  EDIT_ATTENDANCE: 'edit_attendance',
  VIEW_ATTENDANCE_ANALYTICS: 'view_attendance_analytics',

  // Analytics
  VIEW_ORGANIZATION_ANALYTICS: 'view_organization_analytics',
  VIEW_PARISH_ANALYTICS: 'view_parish_analytics',
  VIEW_UNIT_ANALYTICS_TOP: 'view_unit_analytics',
  VIEW_MEMBER_ANALYTICS: 'view_member_analytics',

  // Administration
  MANAGE_ADMINS: 'manage_admins',
  MANAGE_ROLES: 'manage_roles',
  MANAGE_PERMISSIONS: 'manage_permissions',
  MANAGE_CHURCH_SETTINGS: 'manage_church_settings',

  // Calendar / Events
  CREATE_EVENT: 'create_event',
  UPDATE_EVENT: 'update_event',
  DELETE_EVENT: 'delete_event',
  VIEW_EVENTS: 'view_events',
});

const ALL_PERMISSIONS = Object.values(PERMISSIONS);

const ROLES = Object.freeze({
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  UNIT_ADMIN: 'UNIT_ADMIN',
  MEMBER: 'MEMBER',
});

const SCOPE_TYPES = Object.freeze({
  ORGANIZATION: 'ORGANIZATION',
  PARISH: 'PARISH',
  UNIT: 'UNIT',
});

// A convenience default permission set granted to a Parish Admin created
// through the "Create Parish Admin" flow. Super Admins may customize this
// per assignment - this is only a sane starting point, not a hard rule.
const DEFAULT_PARISH_ADMIN_PERMISSIONS = [
  PERMISSIONS.VIEW_PARISH,
  PERMISSIONS.VIEW_MEMBERS,
  PERMISSIONS.CREATE_MEMBER,
  PERMISSIONS.UPDATE_MEMBER,
  PERMISSIONS.VIEW_MEMBER_HISTORY,
  PERMISSIONS.TRANSFER_MEMBER,
  PERMISSIONS.CREATE_UNIT,
  PERMISSIONS.UPDATE_UNIT,
  PERMISSIONS.MANAGE_UNIT_MEMBERS,
  PERMISSIONS.MANAGE_UNIT_ADMINS,
  PERMISSIONS.VIEW_UNIT_ANALYTICS,
  PERMISSIONS.VIEW_PRAYER_REQUESTS,
  PERMISSIONS.MANAGE_PRAYER_REQUESTS,
  PERMISSIONS.ASSIGN_PRAYER_REQUEST,
  PERMISSIONS.VIEW_TESTIMONIES,
  PERMISSIONS.MODERATE_TESTIMONIES,
  PERMISSIONS.CREATE_ATTENDANCE_SESSION,
  PERMISSIONS.VIEW_ATTENDANCE,
  PERMISSIONS.EDIT_ATTENDANCE,
  PERMISSIONS.VIEW_ATTENDANCE_ANALYTICS,
  PERMISSIONS.VIEW_PARISH_ANALYTICS,
  PERMISSIONS.VIEW_MEMBER_ANALYTICS,
  PERMISSIONS.CREATE_EVENT,
  PERMISSIONS.UPDATE_EVENT,
  PERMISSIONS.DELETE_EVENT,
  PERMISSIONS.VIEW_EVENTS,
  PERMISSIONS.CREATE_BIBLE_PLAN,
  PERMISSIONS.UPDATE_BIBLE_PLAN,
  PERMISSIONS.PUBLISH_BIBLE_PLAN,
];

const DEFAULT_UNIT_ADMIN_PERMISSIONS = [
  PERMISSIONS.MANAGE_UNIT_MEMBERS,
  PERMISSIONS.VIEW_UNIT_ANALYTICS,
  PERMISSIONS.VIEW_ATTENDANCE,
  PERMISSIONS.CREATE_ATTENDANCE_SESSION,
  PERMISSIONS.EDIT_ATTENDANCE,
  PERMISSIONS.CREATE_EVENT,
  PERMISSIONS.UPDATE_EVENT,
  PERMISSIONS.VIEW_EVENTS,
];

module.exports = {
  PERMISSIONS,
  ALL_PERMISSIONS,
  ROLES,
  SCOPE_TYPES,
  DEFAULT_PARISH_ADMIN_PERMISSIONS,
  DEFAULT_UNIT_ADMIN_PERMISSIONS,
};
