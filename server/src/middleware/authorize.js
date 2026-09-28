const ApiError = require('../utils/ApiError');
const { ROLES, SCOPE_TYPES } = require('../permissions/permissions');

/**
 * Core scope-aware permission check.
 *
 * A RoleAssignment "covers" a target resource if:
 *   - it belongs to the same organization as the target (tenant isolation
 *     is enforced separately/always, by never trusting a client-supplied
 *     organizationId - the organization is always derived server-side
 *     from the authenticated user), AND
 *   - its scope subsumes the target's scope (ORGANIZATION > PARISH > UNIT), AND
 *   - it is SUPER_ADMIN (implicitly all permissions), OR it explicitly
 *     grants the requested permission.
 *
 * @param {Array} roleAssignments - req.roleAssignments (already filtered to ACTIVE)
 * @param {String} organizationId - the tenant the target resource belongs to
 * @param {String} permission - the permission string being checked
 * @param {Object} target - { parishId, unitId } of the resource being accessed (optional)
 */
function hasPermission(roleAssignments, organizationId, permission, target = {}) {
  const { parishId, unitId } = target;

  return roleAssignments.some((assignment) => {
    if (String(assignment.organization) !== String(organizationId)) return false;

    // Super Admin, scoped to the organization itself, has all permissions
    // across every parish and unit within that organization.
    if (
      assignment.role === ROLES.SUPER_ADMIN &&
      assignment.scopeType === SCOPE_TYPES.ORGANIZATION &&
      String(assignment.scopeId) === String(organizationId)
    ) {
      return true;
    }

    if (!assignment.permissions.includes(permission)) return false;

    if (assignment.scopeType === SCOPE_TYPES.ORGANIZATION) {
      return String(assignment.scopeId) === String(organizationId);
    }

    if (assignment.scopeType === SCOPE_TYPES.PARISH) {
      if (!parishId) return false; // an org/unit-only resource can't be covered by a parish-scoped grant
      return String(assignment.scopeId) === String(parishId);
    }

    if (assignment.scopeType === SCOPE_TYPES.UNIT) {
      if (!unitId) return false;
      return String(assignment.scopeId) === String(unitId);
    }

    return false;
  });
}

/**
 * Express middleware factory. `resolveScope(req)` should return
 * `{ parishId, unitId }` (either may be undefined) describing the scope
 * of the resource being acted on. Defaults to reading `req.params.parishId`
 * / `req.params.unitId` when no resolver is supplied.
 */
function authorize(permission, resolveScope) {
  return function authorizeMiddleware(req, res, next) {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required'));
    }

    const target = resolveScope
      ? resolveScope(req)
      : { parishId: req.params.parishId, unitId: req.params.unitId };

    const allowed = hasPermission(req.roleAssignments || [], req.organizationId, permission, target);

    if (!allowed) {
      return next(ApiError.forbidden(`You do not have the '${permission}' permission for this resource`));
    }

    next();
  };
}

/** Convenience middleware: requires the caller to be a Super Admin of their organization. */
function requireSuperAdmin(req, res, next) {
  if (!req.user) return next(ApiError.unauthorized('Authentication required'));
  const isSuperAdmin = (req.roleAssignments || []).some(
    (a) =>
      a.role === ROLES.SUPER_ADMIN &&
      a.scopeType === SCOPE_TYPES.ORGANIZATION &&
      String(a.scopeId) === String(req.organizationId)
  );
  if (!isSuperAdmin) return next(ApiError.forbidden('Super Admin privileges required'));
  next();
}

/** Allows the request through if the caller is the member themself OR has the given permission. */
function authorizeSelfOrPermission(permission, getTargetMemberId, resolveScope) {
  return function middleware(req, res, next) {
    if (!req.user) return next(ApiError.unauthorized('Authentication required'));

    const targetMemberId = getTargetMemberId(req);
    if (req.user.member && String(req.user.member) === String(targetMemberId)) {
      return next();
    }
    return authorize(permission, resolveScope)(req, res, next);
  };
}

module.exports = { authorize, hasPermission, requireSuperAdmin, authorizeSelfOrPermission };
