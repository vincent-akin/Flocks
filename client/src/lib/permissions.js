/**
 * Client-side permission helpers. These exist ONLY to decide what to
 * *show* (nav items, buttons) - they are never the security boundary.
 * The backend re-checks every permission and scope on every request; if
 * this file were deleted entirely, no unauthorized data would become
 * reachable, only visible affordances would change.
 */

export function hasPermission(roleAssignments = [], permission) {
  return roleAssignments.some((a) => a.role === 'SUPER_ADMIN' || a.permissions?.includes(permission));
}

export function isSuperAdmin(roleAssignments = []) {
  return roleAssignments.some((a) => a.role === 'SUPER_ADMIN' && a.scopeType === 'ORGANIZATION');
}

export function isAnyAdmin(roleAssignments = []) {
  return (roleAssignments || []).length > 0;
}
