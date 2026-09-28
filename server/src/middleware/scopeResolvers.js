const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const Member = require('../models/Member');
const Unit = require('../models/Unit');
const PrayerRequest = require('../models/PrayerRequest');

/**
 * Loads the target Member (by :memberId) and attaches its scope
 * ({ parishId }) to req.scope, so that a PARISH-scoped RoleAssignment
 * matching the member's own parish is correctly recognized by
 * `authorize()`, not just an ORGANIZATION-scoped one.
 */
const loadMemberScope = catchAsync(async (req, res, next) => {
  const member = await Member.findOne({ _id: req.params.memberId, organization: req.organizationId });
  if (!member) throw ApiError.notFound('Member not found');
  req.targetMember = member;
  req.scope = { parishId: member.primaryParish };
  next();
});

/**
 * Loads the target Unit (by :unitId) and attaches its scope
 * ({ parishId, unitId }) to req.scope, so both PARISH-scoped and
 * UNIT-scoped RoleAssignments are correctly recognized.
 */
const loadUnitScope = catchAsync(async (req, res, next) => {
  const unit = await Unit.findOne({ _id: req.params.unitId, organization: req.organizationId });
  if (!unit) throw ApiError.notFound('Unit not found');
  req.targetUnit = unit;
  req.scope = { parishId: unit.parish, unitId: unit._id };
  next();
});

/** Loads the target PrayerRequest and attaches its parish as scope. */
const loadPrayerRequestScope = catchAsync(async (req, res, next) => {
  const request = await PrayerRequest.findOne({ _id: req.params.requestId, organization: req.organizationId });
  if (!request) throw ApiError.notFound('Prayer request not found');
  req.targetPrayerRequest = request;
  req.scope = { parishId: request.parish };
  next();
});

const fromReqScope = (req) => req.scope || {};

module.exports = { loadMemberScope, loadUnitScope, loadPrayerRequestScope, fromReqScope };
