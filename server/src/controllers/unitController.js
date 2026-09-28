const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const Unit = require('../models/Unit');
const UnitMembership = require('../models/UnitMembership');
const Member = require('../models/Member');
const MemberEvent = require('../models/MemberEvent');
const RoleAssignment = require('../models/RoleAssignment');
const { ROLES, SCOPE_TYPES, DEFAULT_UNIT_ADMIN_PERMISSIONS } = require('../permissions/permissions');
const { recordAudit } = require('../utils/audit');

const listUnits = catchAsync(async (req, res) => {
  const filter = { organization: req.organizationId, isActive: true };
  if (req.query.parishId) filter.parish = req.query.parishId;
  const units = await Unit.find(filter).populate('parish', 'name').sort({ name: 1 });
  res.json({ success: true, data: units });
});

const getUnit = catchAsync(async (req, res) => {
  const unit = await Unit.findOne({ _id: req.params.unitId, organization: req.organizationId }).populate('parish', 'name');
  if (!unit) throw ApiError.notFound('Unit not found');
  res.json({ success: true, data: unit });
});

const createUnit = catchAsync(async (req, res) => {
  const unit = await Unit.create({
    organization: req.organizationId,
    parish: req.body.parish,
    name: req.body.name,
    description: req.body.description,
    category: req.body.category,
    isPrivate: req.body.isPrivate !== undefined ? req.body.isPrivate : true,
    createdBy: req.user._id,
  });

  await recordAudit({ req, action: 'CREATE_UNIT', resource: 'Unit', resourceId: unit._id, newValue: unit });

  res.status(201).json({ success: true, data: unit });
});

const updateUnit = catchAsync(async (req, res) => {
  const allowedFields = ['name', 'description', 'category', 'isPrivate', 'isActive'];
  const updates = {};
  allowedFields.forEach((f) => {
    if (req.body[f] !== undefined) updates[f] = req.body[f];
  });

  const unit = await Unit.findOneAndUpdate(
    { _id: req.params.unitId, organization: req.organizationId },
    updates,
    { new: true, runValidators: true }
  );
  if (!unit) throw ApiError.notFound('Unit not found');

  await recordAudit({ req, action: 'UPDATE_UNIT', resource: 'Unit', resourceId: unit._id, newValue: unit });

  res.json({ success: true, data: unit });
});

const deleteUnit = catchAsync(async (req, res) => {
  const unit = await Unit.findOne({ _id: req.params.unitId, organization: req.organizationId });
  if (!unit) throw ApiError.notFound('Unit not found');
  unit.isActive = false;
  await unit.save();

  await recordAudit({ req, action: 'DELETE_UNIT', resource: 'Unit', resourceId: unit._id });

  res.json({ success: true, message: 'Unit deactivated' });
});

const listUnitMembers = catchAsync(async (req, res) => {
  const unit = await Unit.findOne({ _id: req.params.unitId, organization: req.organizationId });
  if (!unit) throw ApiError.notFound('Unit not found');

  const memberships = await UnitMembership.find({ unit: unit._id, isActive: true }).populate(
    'member',
    'firstName lastName profilePhotoUrl'
  );
  res.json({ success: true, data: memberships });
});

const addUnitMember = catchAsync(async (req, res) => {
  const unit = await Unit.findOne({ _id: req.params.unitId, organization: req.organizationId });
  if (!unit) throw ApiError.notFound('Unit not found');

  const member = await Member.findOne({ _id: req.body.memberId, organization: req.organizationId });
  if (!member) throw ApiError.notFound('Member not found');

  const existing = await UnitMembership.findOne({ unit: unit._id, member: member._id });
  let membership;
  if (existing) {
    existing.isActive = true;
    existing.leftAt = undefined;
    membership = await existing.save();
  } else {
    membership = await UnitMembership.create({
      organization: req.organizationId,
      unit: unit._id,
      member: member._id,
      addedBy: req.user._id,
    });
  }

  await MemberEvent.create({
    organization: req.organizationId,
    member: member._id,
    parish: unit.parish,
    type: 'JOINED_UNIT',
    title: `Joined ${unit.name}`,
    recordedBy: req.user._id,
  });

  await recordAudit({ req, action: 'ADD_UNIT_MEMBER', resource: 'UnitMembership', resourceId: membership._id, newValue: membership });

  res.status(201).json({ success: true, data: membership });
});

const removeUnitMember = catchAsync(async (req, res) => {
  const membership = await UnitMembership.findOne({
    unit: req.params.unitId,
    member: req.params.memberId,
    organization: req.organizationId,
  });
  if (!membership) throw ApiError.notFound('Unit membership not found');

  membership.isActive = false;
  membership.leftAt = new Date();
  await membership.save();

  const unit = await Unit.findById(req.params.unitId);
  await MemberEvent.create({
    organization: req.organizationId,
    member: req.params.memberId,
    parish: unit ? unit.parish : undefined,
    type: 'LEFT_UNIT',
    title: `Left ${unit ? unit.name : 'unit'}`,
    recordedBy: req.user._id,
  });

  await recordAudit({ req, action: 'REMOVE_UNIT_MEMBER', resource: 'UnitMembership', resourceId: membership._id });

  res.json({ success: true, message: 'Member removed from unit' });
});

/**
 * Promotes a member to Unit Admin: marks the membership, ensures they
 * have a User login, and grants a UNIT_ADMIN RoleAssignment scoped to
 * this unit with the default Unit Admin permission set.
 */
const assignUnitAdmin = catchAsync(async (req, res) => {
  const unit = await Unit.findOne({ _id: req.params.unitId, organization: req.organizationId });
  if (!unit) throw ApiError.notFound('Unit not found');

  const member = await Member.findOne({ _id: req.body.memberId, organization: req.organizationId });
  if (!member) throw ApiError.notFound('Member not found');
  if (!member.user) {
    throw ApiError.badRequest('This member has no login yet. Create an admin login for them first via /admins.');
  }

  await UnitMembership.findOneAndUpdate(
    { unit: unit._id, member: member._id },
    { isUnitAdmin: true, isActive: true },
    { upsert: true, new: true }
  );

  const assignment = await RoleAssignment.create({
    user: member.user,
    organization: req.organizationId,
    role: ROLES.UNIT_ADMIN,
    scopeType: SCOPE_TYPES.UNIT,
    scopeId: unit._id,
    permissions: req.body.permissions && Array.isArray(req.body.permissions) ? req.body.permissions : DEFAULT_UNIT_ADMIN_PERMISSIONS,
    createdBy: req.user._id,
  });

  await recordAudit({ req, action: 'ASSIGN_UNIT_ADMIN', resource: 'RoleAssignment', resourceId: assignment._id, newValue: assignment });

  res.status(201).json({ success: true, data: assignment });
});

module.exports = {
  listUnits,
  getUnit,
  createUnit,
  updateUnit,
  deleteUnit,
  listUnitMembers,
  addUnitMember,
  removeUnitMember,
  assignUnitAdmin,
};
