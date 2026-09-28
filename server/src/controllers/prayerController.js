const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const PrayerRequest = require('../models/PrayerRequest');
const PrayerTestimony = require('../models/PrayerTestimony');
const { hasPermission } = require('../middleware/authorize');
const { PERMISSIONS } = require('../permissions/permissions');

const submitPrayerRequest = catchAsync(async (req, res) => {
  if (!req.user.member) throw ApiError.badRequest('Only a member profile can submit a prayer request');

  const Member = require('../models/Member');
  const member = await Member.findById(req.user.member);

  const request = await PrayerRequest.create({
    organization: req.organizationId,
    parish: member.primaryParish,
    member: member._id,
    title: req.body.title,
    description: req.body.description,
    category: req.body.category,
    visibility: req.body.visibility || 'PRIVATE',
  });

  res.status(201).json({ success: true, data: request });
});

/**
 * Prayer requests are pastorally sensitive: a caller sees their own
 * requests, plus (only if they hold VIEW_PRAYER_REQUESTS for the relevant
 * parish) requests visible at PASTOR_CARE_TEAM or CHURCH_WIDE level, plus
 * CHURCH_WIDE requests visible to any member of that parish.
 */
const listPrayerRequests = catchAsync(async (req, res) => {
  const canViewCareTeamRequests = hasPermission(req.roleAssignments || [], req.organizationId, PERMISSIONS.VIEW_PRAYER_REQUESTS, {
    parishId: req.query.parishId,
  });

  const orConditions = [{ member: req.user.member }, { visibility: 'CHURCH_WIDE', organization: req.organizationId }];
  if (canViewCareTeamRequests) {
    orConditions.push({ visibility: { $in: ['PASTOR_CARE_TEAM', 'CHURCH_WIDE', 'PRIVATE'] }, organization: req.organizationId });
  }

  const filter = { organization: req.organizationId, isArchived: false, $or: orConditions };
  if (req.query.parishId) filter.parish = req.query.parishId;
  if (req.query.status) filter.status = req.query.status;

  const requests = await PrayerRequest.find(filter)
    .populate('member', 'firstName lastName')
    .populate('assignedTo', 'email')
    .sort({ createdAt: -1 });

  res.json({ success: true, data: requests });
});

const getPrayerRequest = catchAsync(async (req, res) => {
  const request = await PrayerRequest.findOne({ _id: req.params.requestId, organization: req.organizationId }).populate(
    'member',
    'firstName lastName'
  );
  if (!request) throw ApiError.notFound('Prayer request not found');

  const isOwner = String(request.member._id) === String(req.user.member);
  const canViewCareTeamRequests = hasPermission(req.roleAssignments || [], req.organizationId, PERMISSIONS.VIEW_PRAYER_REQUESTS, {
    parishId: request.parish,
  });
  const isChurchWide = request.visibility === 'CHURCH_WIDE';

  if (!isOwner && !isChurchWide && !canViewCareTeamRequests) {
    throw ApiError.forbidden('You do not have access to this prayer request');
  }

  res.json({ success: true, data: request });
});

const updatePrayerRequestStatus = catchAsync(async (req, res) => {
  const request = await PrayerRequest.findOneAndUpdate(
    { _id: req.params.requestId, organization: req.organizationId },
    { status: req.body.status },
    { new: true, runValidators: true }
  );
  if (!request) throw ApiError.notFound('Prayer request not found');
  res.json({ success: true, data: request });
});

const assignPrayerRequest = catchAsync(async (req, res) => {
  const request = await PrayerRequest.findOneAndUpdate(
    { _id: req.params.requestId, organization: req.organizationId },
    { assignedTo: req.body.userId, assignedAt: new Date() },
    { new: true }
  );
  if (!request) throw ApiError.notFound('Prayer request not found');
  res.json({ success: true, data: request });
});

const addTestimony = catchAsync(async (req, res) => {
  const request = await PrayerRequest.findOne({ _id: req.params.requestId, organization: req.organizationId });
  if (!request) throw ApiError.notFound('Prayer request not found');
  if (String(request.member) !== String(req.user.member)) {
    throw ApiError.forbidden('Only the member who submitted the prayer request can add its testimony');
  }

  const testimony = await PrayerTestimony.create({
    organization: req.organizationId,
    prayerRequest: request._id,
    member: req.user.member,
    testimony: req.body.testimony,
    isPublicallyShareable: !!req.body.isPublicallyShareable,
  });

  request.status = 'ANSWERED';
  await request.save();

  res.status(201).json({ success: true, data: testimony });
});

const listTestimonies = catchAsync(async (req, res) => {
  const filter = { organization: req.organizationId };
  if (req.query.moderationStatus) filter.moderationStatus = req.query.moderationStatus;
  const testimonies = await PrayerTestimony.find(filter)
    .populate('member', 'firstName lastName')
    .populate('prayerRequest', 'title category')
    .sort({ createdAt: -1 });
  res.json({ success: true, data: testimonies });
});

const moderateTestimony = catchAsync(async (req, res) => {
  const { moderationStatus } = req.body;
  if (!['APPROVED', 'REJECTED'].includes(moderationStatus)) {
    throw ApiError.badRequest('moderationStatus must be APPROVED or REJECTED');
  }
  const testimony = await PrayerTestimony.findOneAndUpdate(
    { _id: req.params.testimonyId, organization: req.organizationId },
    { moderationStatus, moderatedBy: req.user._id, moderatedAt: new Date() },
    { new: true }
  );
  if (!testimony) throw ApiError.notFound('Testimony not found');
  res.json({ success: true, data: testimony });
});

module.exports = {
  submitPrayerRequest,
  listPrayerRequests,
  getPrayerRequest,
  updatePrayerRequestStatus,
  assignPrayerRequest,
  addTestimony,
  listTestimonies,
  moderateTestimony,
};
