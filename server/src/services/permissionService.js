import { RoleAssignment } from '../models/RoleAssignment.js';
import { SCOPE_TYPES } from '../config/constants.js';
import { log } from '../utils/logger.js';

/**
 * Check if a user has a specific permission for a given scope
 */
export const checkPermission = async (userId, requiredPermission, scopeType, scopeId) => {
    try {
        // Get user's active role assignments for the scope
        const assignments = await RoleAssignment.find({
            user: userId,
            scopeType: scopeType,
            status: 'ACTIVE'
        }).populate('role');

        // Filter assignments that match the scope OR organization-level assignments
        const applicableAssignments = assignments.filter((assignment) => {
            if (assignment.scopeType === SCOPE_TYPES.ORGANIZATION) {
                // Organization scope applies to all resources within the organization
                return true;
            }
            return assignment.scopeId.toString() === scopeId.toString();
        });

        // Check if any assignment has the required permission
        for (const assignment of applicableAssignments) {
            if (assignment.role && assignment.role.permissions.includes(requiredPermission)) {
                log.debug('Permission granted', {
                    userId,
                    requiredPermission,
                    scopeType,
                    scopeId,
                    role: assignment.role.name
                });
                return true;
            }
        }

        log.debug('Permission denied', { userId, requiredPermission, scopeType, scopeId });
        return false;
    } catch (error) {
        log.error('Error checking permission:', error);
        throw error;
    }
};

/**
 * Get all permissions for a user within a scope
 */
export const getUserPermissionsForScope = async (userId, scopeType, scopeId) => {
    try {
        const assignments = await RoleAssignment.find({
            user: userId,
            scopeType: scopeType,
            status: 'ACTIVE'
        }).populate('role');

        const permissions = new Set();

        for (const assignment of assignments) {
            if (assignment.role && assignment.role.permissions) {
                assignment.role.permissions.forEach((p) => permissions.add(p));
            }
        }

        return Array.from(permissions);
    } catch (error) {
        log.error('Error getting user permissions:', error);
        throw error;
    }
};

/**
 * Check if a user has any admin role within a scope
 */
export const isAdminForScope = async (userId, scopeType, scopeId) => {
    try {
        const adminRoles = ['SUPER_ADMIN', 'ADMIN', 'PARISH_ADMIN', 'UNIT_ADMIN'];

        const assignments = await RoleAssignment.find({
            user: userId,
            scopeType: scopeType,
            status: 'ACTIVE'
        }).populate('role');

        for (const assignment of assignments) {
            if (adminRoles.includes(assignment.role.name)) {
                return true;
            }
        }

        return false;
    } catch (error) {
        log.error('Error checking admin status:', error);
        throw error;
    }
};

/**
 * Get scope IDs that a user has access to for a given scope type and permission
 */
export const getAccessibleScopeIds = async (userId, scopeType, requiredPermission) => {
    try {
        const assignments = await RoleAssignment.find({
            user: userId,
            scopeType: scopeType,
            status: 'ACTIVE'
        }).populate('role');

        const accessibleIds = new Set();

        for (const assignment of assignments) {
            if (assignment.role && assignment.role.permissions.includes(requiredPermission)) {
                // If organization scope, return 'ALL' to indicate all resources
                if (assignment.scopeType === SCOPE_TYPES.ORGANIZATION) {
                    return 'ALL';
                }
                accessibleIds.add(assignment.scopeId.toString());
            }
        }

        return Array.from(accessibleIds);
    } catch (error) {
        log.error('Error getting accessible scope IDs:', error);
        throw error;
    }
};

export default {
    checkPermission,
    getUserPermissionsForScope,
    isAdminForScope,
    getAccessibleScopeIds
};