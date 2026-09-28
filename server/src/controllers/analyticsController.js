const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const mongoose = require('mongoose');
const Member = require('../models/Member');
const Unit = require('../models/Unit');
const UnitMembership = require('../models/UnitMembership');
const AttendanceRecord = require('../models/AttendanceRecord');
const AttendanceSession = require('../models/AttendanceSession');
const PrayerRequest = require('../models/PrayerRequest');
const PrayerTestimony = require('../models/PrayerTestimony');
const BibleReading = require('../models/BibleReading');
const Parish = require('../models/Parish');

const { ObjectId } = mongoose.Types;

async function memberStatusBreakdown(matchStage) {
  const [membership, baptism, discipleship, total] = await Promise.all([
    Member.aggregate([{ $match: matchStage }, { $group: { _id: '$membershipStatus', count: { $sum: 1 } } }]),
    Member.aggregate([{ $match: matchStage }, { $group: { _id: '$baptismStatus', count: { $sum: 1 } } }]),
    Member.aggregate([{ $match: matchStage }, { $group: { _id: '$discipleshipStatus', count: { $sum: 1 } } }]),
    Member.countDocuments(matchStage),
  ]);

  const toMap = (arr) => arr.reduce((acc, { _id, count }) => ({ ...acc, [_id]: count }), {});
  return { total, membershipStatus: toMap(membership), baptismStatus: toMap(baptism), discipleshipStatus: toMap(discipleship) };
}

/** Organization-wide dashboard for the Super Admin. */
const getOrganizationAnalytics = catchAsync(async (req, res) => {
  const orgId = new ObjectId(req.organizationId);
  const matchStage = { organization: orgId };

  const [statusBreakdown, byParish, activeUnits, prayerCount, testimonyCount, biblePlanParticipants] = await Promise.all([
    memberStatusBreakdown(matchStage),
    Member.aggregate([
      { $match: matchStage },
      { $group: { _id: '$primaryParish', total: { $sum: 1 } } },
      { $lookup: { from: 'parishes', localField: '_id', foreignField: '_id', as: 'parish' } },
      { $unwind: '$parish' },
      { $project: { _id: 0, parishId: '$_id', parishName: '$parish.name', total: 1 } },
    ]),
    Unit.countDocuments({ organization: orgId, isActive: true }),
    PrayerRequest.countDocuments({ organization: orgId, isArchived: false }),
    PrayerTestimony.countDocuments({ organization: orgId }),
    BibleReading.countDocuments({ organization: orgId }),
  ]);

  res.json({
    success: true,
    data: {
      members: statusBreakdown,
      membersByParish: byParish,
      activeUnits,
      prayerRequests: prayerCount,
      testimonies: testimonyCount,
      biblePlanParticipants,
    },
  });
});

const getParishAnalytics = catchAsync(async (req, res) => {
  const parish = await Parish.findOne({ _id: req.params.parishId, organization: req.organizationId });
  if (!parish) throw ApiError.notFound('Parish not found');

  const matchStage = { organization: new ObjectId(req.organizationId), primaryParish: parish._id };
  const [statusBreakdown, unitCount, prayerCount] = await Promise.all([
    memberStatusBreakdown(matchStage),
    Unit.countDocuments({ organization: req.organizationId, parish: parish._id, isActive: true }),
    PrayerRequest.countDocuments({ organization: req.organizationId, parish: parish._id, isArchived: false }),
  ]);

  res.json({ success: true, data: { parish: { id: parish._id, name: parish.name }, members: statusBreakdown, unitCount, prayerCount } });
});

/** Parish comparison for the Super Admin - aggregate metrics only, no individual pastoral data. */
const compareParishes = catchAsync(async (req, res) => {
  const orgId = new ObjectId(req.organizationId);

  const results = await Member.aggregate([
    { $match: { organization: orgId } },
    {
      $group: {
        _id: '$primaryParish',
        totalMembers: { $sum: 1 },
        activeMembers: { $sum: { $cond: [{ $eq: ['$membershipStatus', 'ACTIVE'] }, 1, 0] } },
        baptizedMembers: { $sum: { $cond: [{ $eq: ['$baptismStatus', 'BAPTIZED'] }, 1, 0] } },
        inDiscipleship: { $sum: { $cond: [{ $eq: ['$discipleshipStatus', 'IN_PROGRESS'] }, 1, 0] } },
        completedDiscipleship: { $sum: { $cond: [{ $eq: ['$discipleshipStatus', 'COMPLETED'] }, 1, 0] } },
      },
    },
    { $lookup: { from: 'parishes', localField: '_id', foreignField: '_id', as: 'parish' } },
    { $unwind: '$parish' },
    {
      $project: {
        _id: 0,
        parishId: '$_id',
        parishName: '$parish.name',
        totalMembers: 1,
        activeMembers: 1,
        baptizedMembers: 1,
        inDiscipleship: 1,
        completedDiscipleship: 1,
      },
    },
    { $sort: { totalMembers: -1 } },
  ]);

  res.json({ success: true, data: results });
});

const getUnitAnalytics = catchAsync(async (req, res) => {
  const unit = await Unit.findOne({ _id: req.params.unitId, organization: req.organizationId });
  if (!unit) throw ApiError.notFound('Unit not found');

  const [totalMembers, activeMembers] = await Promise.all([
    UnitMembership.countDocuments({ unit: unit._id }),
    UnitMembership.countDocuments({ unit: unit._id, isActive: true }),
  ]);

  const sessions = await AttendanceSession.find({ unit: unit._id }).select('_id').lean();
  const sessionIds = sessions.map((s) => s._id);
  const attendanceCount = sessionIds.length
    ? await AttendanceRecord.countDocuments({ session: { $in: sessionIds } })
    : 0;
  const possibleAttendances = sessionIds.length * activeMembers;
  const attendanceRate = possibleAttendances > 0 ? Math.round((attendanceCount / possibleAttendances) * 100) : null;

  res.json({
    success: true,
    data: {
      unit: { id: unit._id, name: unit.name },
      totalMembers,
      activeMembers,
      sessionsHeld: sessionIds.length,
      attendanceRate,
    },
  });
});

/**
 * Follow-Up Intelligence: surfaces recommendations, never automatic
 * judgments, per the PRD. Pastors act on these; the system does not.
 */
const getFollowUpRecommendations = catchAsync(async (req, res) => {
  const orgId = new ObjectId(req.organizationId);
  const fourWeeksAgo = new Date(Date.now() - 28 * 24 * 60 * 60 * 1000);

  const filter = { organization: orgId };
  if (req.query.parishId) filter.primaryParish = new ObjectId(req.query.parishId);

  const [recentAttendeeIds, activeMembers, newMembers, baptizedNotDiscipling, unfollowedPrayers] = await Promise.all([
    AttendanceRecord.distinct('member', { organization: orgId, markedAt: { $gte: fourWeeksAgo } }),
    Member.find({ ...filter, membershipStatus: 'ACTIVE' }).select('_id firstName lastName'),
    Member.find({ ...filter, membershipStatus: 'NEW' }).select('_id firstName lastName createdAt'),
    Member.find({ ...filter, baptismStatus: 'BAPTIZED', discipleshipStatus: 'NOT_STARTED' }).select('_id firstName lastName'),
    PrayerRequest.find({ organization: orgId, status: { $in: ['SUBMITTED', 'ACTIVE'] }, assignedTo: { $exists: false } }).select(
      '_id title createdAt'
    ),
  ]);

  const recentAttendeeSet = new Set(recentAttendeeIds.map(String));
  const noRecentAttendance = activeMembers.filter((m) => !recentAttendeeSet.has(String(m._id)));

  res.json({
    success: true,
    data: {
      membersNotAttendingIn4Weeks: { count: noRecentAttendance.length, members: noRecentAttendance },
      newMembersPendingFollowUp: { count: newMembers.length, members: newMembers },
      baptizedNotYetDiscipling: { count: baptizedNotDiscipling.length, members: baptizedNotDiscipling },
      prayerRequestsNeedingFollowUp: { count: unfollowedPrayers.length, requests: unfollowedPrayers },
    },
  });
});

module.exports = {
  getOrganizationAnalytics,
  getParishAnalytics,
  compareParishes,
  getUnitAnalytics,
  getFollowUpRecommendations,
};
