const mongoose = require('mongoose');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const Member = require('../models/Member');
const Parish = require('../models/Parish');
const ParishMembership = require('../models/ParishMembership');
const MemberEvent = require('../models/MemberEvent');
const { recordAudit } = require('../utils/audit');

const listMembers = catchAsync(async (req, res) => {
  const { parishId, membershipStatus, baptismStatus, discipleshipStatus, search, page = 1, limit = 25 } = req.query;

  const filter = { organization: req.organizationId };
  if (parishId) filter.primaryParish = parishId;
  if (membershipStatus) filter.membershipStatus = membershipStatus;
  if (baptismStatus) filter.baptismStatus = baptismStatus;
  if (discipleshipStatus) filter.discipleshipStatus = discipleshipStatus;
  if (search) {
    filter.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.min(parseInt(limit, 10) || 25, 100);

  const [members, total] = await Promise.all([
    Member.find(filter)
      .populate('primaryParish', 'name')
      .sort({ lastName: 1, firstName: 1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Member.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: members,
    pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
  });
});

const getMember = catchAsync(async (req, res) => {
  const member = await Member.findOne({ _id: req.params.memberId, organization: req.organizationId }).populate(
    'primaryParish',
    'name'
  );
  if (!member) throw ApiError.notFound('Member not found');
  res.json({ success: true, data: member });
});

const createMember = catchAsync(async (req, res) => {
  const parish = await Parish.findOne({ _id: req.body.primaryParish, organization: req.organizationId });
  if (!parish) throw ApiError.badRequest('primaryParish does not belong to this organization');

  const session = await mongoose.startSession();
  let member;
  try {
    await session.withTransaction(async () => {
      member = (
        await Member.create(
          [
            {
              organization: req.organizationId,
              primaryParish: parish._id,
              firstName: req.body.firstName,
              lastName: req.body.lastName,
              preferredName: req.body.preferredName,
              gender: req.body.gender,
              dateOfBirth: req.body.dateOfBirth,
              phone: req.body.phone,
              email: req.body.email,
              address: req.body.address,
              emergencyContact: req.body.emergencyContact,
              membershipStatus: req.body.membershipStatus || 'NEW',
              createdBy: req.user._id,
            },
          ],
          { session }
        )
      )[0];

      await ParishMembership.create(
        [{ organization: req.organizationId, member: member._id, parish: parish._id, isCurrent: true, recordedBy: req.user._id }],
        { session }
      );

      await MemberEvent.create(
        [
          {
            organization: req.organizationId,
            member: member._id,
            parish: parish._id,
            type: 'JOINED_CHURCH',
            title: 'Joined Church',
            recordedBy: req.user._id,
          },
        ],
        { session }
      );
    });
  } finally {
    session.endSession();
  }

  await recordAudit({ req, action: 'CREATE_MEMBER', resource: 'Member', resourceId: member._id, newValue: member });

  res.status(201).json({ success: true, data: member });
});

const updateMember = catchAsync(async (req, res) => {
  const allowedFields = [
    'firstName', 'lastName', 'preferredName', 'profilePhotoUrl', 'gender', 'dateOfBirth',
    'phone', 'email', 'address', 'emergencyContact', 'isActive',
  ];
  const updates = {};
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  const before = await Member.findOne({ _id: req.params.memberId, organization: req.organizationId });
  if (!before) throw ApiError.notFound('Member not found');

  const member = await Member.findByIdAndUpdate(req.params.memberId, updates, { new: true, runValidators: true });

  await recordAudit({
    req,
    action: 'UPDATE_MEMBER',
    resource: 'Member',
    resourceId: member._id,
    previousValue: before,
    newValue: member,
  });

  res.json({ success: true, data: member });
});

/**
 * Updates membership/baptism/discipleship status as three independent
 * fields (never a single combined status) and records the change as a
 * MemberEvent for the journey timeline.
 */
const updateMemberStatus = catchAsync(async (req, res) => {
  const { membershipStatus, baptismStatus, discipleshipStatus } = req.body;
  const member = await Member.findOne({ _id: req.params.memberId, organization: req.organizationId });
  if (!member) throw ApiError.notFound('Member not found');

  const events = [];

  if (membershipStatus && membershipStatus !== member.membershipStatus) {
    events.push({
      type: 'MEMBERSHIP_STATUS_CHANGED',
      title: `Membership status changed to ${membershipStatus}`,
      metadata: { from: member.membershipStatus, to: membershipStatus },
    });
    member.membershipStatus = membershipStatus;
  }

  if (baptismStatus && baptismStatus !== member.baptismStatus) {
    if (baptismStatus === 'BAPTIZED') {
      events.push({ type: 'BAPTIZED', title: 'Baptized' });
    }
    member.baptismStatus = baptismStatus;
  }

  if (discipleshipStatus && discipleshipStatus !== member.discipleshipStatus) {
    if (discipleshipStatus === 'IN_PROGRESS') events.push({ type: 'DISCIPLESHIP_STARTED', title: 'Started Discipleship' });
    if (discipleshipStatus === 'COMPLETED') events.push({ type: 'DISCIPLESHIP_COMPLETED', title: 'Completed Discipleship' });
    member.discipleshipStatus = discipleshipStatus;
  }

  await member.save();

  if (events.length) {
    await MemberEvent.insertMany(
      events.map((e) => ({
        organization: req.organizationId,
        member: member._id,
        parish: member.primaryParish,
        recordedBy: req.user._id,
        ...e,
      }))
    );
  }

  await recordAudit({ req, action: 'UPDATE_MEMBER_STATUS', resource: 'Member', resourceId: member._id, newValue: { membershipStatus, baptismStatus, discipleshipStatus } });

  res.json({ success: true, data: member });
});

/**
 * Transfers a member to a new parish. Never overwrites history: closes
 * out the current ParishMembership record and opens a new one, updates
 * the member's primaryParish, and logs a PARISH_TRANSFER MemberEvent.
 */
const transferMember = catchAsync(async (req, res) => {
  const { newParishId, transferReason } = req.body;

  const [member, newParish] = await Promise.all([
    Member.findOne({ _id: req.params.memberId, organization: req.organizationId }),
    Parish.findOne({ _id: newParishId, organization: req.organizationId }),
  ]);
  if (!member) throw ApiError.notFound('Member not found');
  if (!newParish) throw ApiError.badRequest('Target parish does not belong to this organization');
  if (String(member.primaryParish) === String(newParish._id)) {
    throw ApiError.badRequest('Member already belongs to this parish');
  }

  const oldParishId = member.primaryParish;

  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      await ParishMembership.findOneAndUpdate(
        { member: member._id, isCurrent: true },
        { isCurrent: false, leftAt: new Date(), transferReason },
        { session }
      );

      await ParishMembership.create(
        [{ organization: req.organizationId, member: member._id, parish: newParish._id, isCurrent: true, recordedBy: req.user._id }],
        { session }
      );

      member.primaryParish = newParish._id;
      member.membershipStatus = 'TRANSFERRED';
      await member.save({ session });

      await MemberEvent.create(
        [
          {
            organization: req.organizationId,
            member: member._id,
            parish: newParish._id,
            type: 'PARISH_TRANSFER',
            title: 'Transferred parish',
            metadata: { from: oldParishId, to: newParish._id, reason: transferReason },
            recordedBy: req.user._id,
          },
        ],
        { session }
      );
    });
  } finally {
    session.endSession();
  }

  await recordAudit({
    req,
    action: 'TRANSFER_MEMBER',
    resource: 'Member',
    resourceId: member._id,
    previousValue: { parish: oldParishId },
    newValue: { parish: newParish._id },
  });

  res.json({ success: true, data: member });
});

const getMemberHistory = catchAsync(async (req, res) => {
  const member = await Member.findOne({ _id: req.params.memberId, organization: req.organizationId });
  if (!member) throw ApiError.notFound('Member not found');

  const [events, parishHistory] = await Promise.all([
    MemberEvent.find({ member: member._id }).sort({ occurredAt: -1 }),
    ParishMembership.find({ member: member._id }).populate('parish', 'name').sort({ joinedAt: -1 }),
  ]);

  res.json({ success: true, data: { events, parishHistory } });
});

module.exports = {
  listMembers,
  getMember,
  createMember,
  updateMember,
  updateMemberStatus,
  transferMember,
  getMemberHistory,
};
