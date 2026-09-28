const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const User = require('../models/User');
const Member = require('../models/Member');
const RoleAssignment = require('../models/RoleAssignment');
const { ROLES, SCOPE_TYPES, ALL_PERMISSIONS } = require('../permissions/permissions');
const { recordAudit } = require('../utils/audit');

/**
 * Creates (or re-uses) a User for an existing Member and grants them an
 * ADMIN, UNIT_ADMIN role assignment with an explicit permission set and
 * scope. This is how Pastor John, a Parish Admin, a Co-Admin (an Admin
 * with a restricted permission set), or a Unit Admin gets created -
 * they're all the same underlying model: Role + Permission + Scope.
 */
const createRoleAssignment = catchAsync(async (req, res) => {
  const { memberId, role, scopeType, scopeId, permissions, password } = req.body;

  if (!Object.values(ROLES).includes(role) || role === ROLES.MEMBER) {
    throw ApiError.badRequest('role must be one of ADMIN, UNIT_ADMIN, SUPER_ADMIN');
  }
  if (!Object.values(SCOPE_TYPES).includes(scopeType)) {
    throw ApiError.badRequest('scopeType must be one of ORGANIZATION, PARISH, UNIT');
  }
  if (!Array.isArray(permissions) || permissions.some((p) => !ALL_PERMISSIONS.includes(p))) {
    throw ApiError.badRequest('permissions must be an array of known permission strings');
  }

  const member = await Member.findOne({ _id: memberId, organization: req.organizationId });
  if (!member) throw ApiError.notFound('Member not found');

  let user;
  if (member.user) {
    user = await User.findById(member.user);
  } else {
    if (!member.email) throw ApiError.badRequest('Member has no email on file - cannot create a login for them');
    if (!password || password.length < 8) throw ApiError.badRequest('A password (min 8 chars) is required for a new admin login');

    const passwordHash = await User.hashPassword(password);
    user = await User.create({
      organization: req.organizationId,
      email: member.email.toLowerCase(),
      passwordHash,
      member: member._id,
    });
    member.user = user._id;
    await member.save();
  }

  const assignment = await RoleAssignment.create({
    user: user._id,
    organization: req.organizationId,
    role,
    scopeType,
    scopeId,
    permissions,
    createdBy: req.user._id,
  });

  await recordAudit({
    req,
    action: 'CREATE_ROLE_ASSIGNMENT',
    resource: 'RoleAssignment',
    resourceId: assignment._id,
    newValue: assignment,
  });

  res.status(201).json({ success: true, data: assignment });
});

const listRoleAssignments = catchAsync(async (req, res) => {
  const filter = { organization: req.organizationId };
  if (req.query.userId) filter.user = req.query.userId;
  if (req.query.scopeType) filter.scopeType = req.query.scopeType;
  if (req.query.scopeId) filter.scopeId = req.query.scopeId;
  if (req.query.status) filter.status = req.query.status;

  const assignments = await RoleAssignment.find(filter).populate('user', 'email').sort({ createdAt: -1 });
  res.json({ success: true, data: assignments });
});

const revokeRoleAssignment = catchAsync(async (req, res) => {
  const assignment = await RoleAssignment.findOne({ _id: req.params.assignmentId, organization: req.organizationId });
  if (!assignment) throw ApiError.notFound('Role assignment not found');

  assignment.status = 'REVOKED';
  assignment.revokedBy = req.user._id;
  assignment.revokedAt = new Date();
  await assignment.save();

  await recordAudit({
    req,
    action: 'REVOKE_ROLE_ASSIGNMENT',
    resource: 'RoleAssignment',
    resourceId: assignment._id,
    newValue: assignment,
  });

  res.json({ success: true, message: 'Role assignment revoked' });
});

const updateRoleAssignmentPermissions = catchAsync(async (req, res) => {
  const { permissions } = req.body;
  if (!Array.isArray(permissions) || permissions.some((p) => !ALL_PERMISSIONS.includes(p))) {
    throw ApiError.badRequest('permissions must be an array of known permission strings');
  }

  const assignment = await RoleAssignment.findOne({ _id: req.params.assignmentId, organization: req.organizationId });
  if (!assignment) throw ApiError.notFound('Role assignment not found');

  const before = assignment.permissions;
  assignment.permissions = permissions;
  await assignment.save();

  await recordAudit({
    req,
    action: 'UPDATE_ROLE_ASSIGNMENT_PERMISSIONS',
    resource: 'RoleAssignment',
    resourceId: assignment._id,
    previousValue: before,
    newValue: permissions,
  });

  res.json({ success: true, data: assignment });
});

module.exports = {
  createRoleAssignment,
  listRoleAssignments,
  revokeRoleAssignment,
  updateRoleAssignmentPermissions,
};
