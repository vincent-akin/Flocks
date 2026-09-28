const QRCode = require('qrcode');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const AttendanceSession = require('../models/AttendanceSession');
const AttendanceRecord = require('../models/AttendanceRecord');
const { randomToken, hashToken } = require('../utils/tokens');
const env = require('../config/env');
const { recordAudit } = require('../utils/audit');

function haversineMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Creates a session and its first dynamic QR token. */
const createAttendanceSession = catchAsync(async (req, res) => {
  const token = randomToken();
  const expiresAt = new Date(Date.now() + env.attendance.qrTtlSeconds * 1000);

  const session = await AttendanceSession.create({
    organization: req.organizationId,
    parish: req.body.parish,
    unit: req.body.unit,
    event: req.body.event,
    title: req.body.title,
    scheduledStart: req.body.scheduledStart,
    scheduledEnd: req.body.scheduledEnd,
    location: req.body.location,
    qrTokenHash: hashToken(token),
    qrTokenExpiresAt: expiresAt,
    createdBy: req.user._id,
  });

  await recordAudit({ req, action: 'CREATE_ATTENDANCE_SESSION', resource: 'AttendanceSession', resourceId: session._id });

  const qrDataUrl = await QRCode.toDataURL(JSON.stringify({ sessionId: session._id, token }));

  res.status(201).json({ success: true, data: { session, token, qrDataUrl, expiresAt } });
});

/**
 * Rotates the QR token for an existing, still-open session - this is
 * what keeps the code "dynamic" for the duration of a service, callable
 * on an interval by the client that displays the projector QR code.
 */
const rotateAttendanceToken = catchAsync(async (req, res) => {
  const session = await AttendanceSession.findOne({ _id: req.params.sessionId, organization: req.organizationId });
  if (!session) throw ApiError.notFound('Attendance session not found');
  if (session.isClosed) throw ApiError.badRequest('This attendance session is closed');

  const token = randomToken();
  session.qrTokenHash = hashToken(token);
  session.qrTokenIssuedAt = new Date();
  session.qrTokenExpiresAt = new Date(Date.now() + env.attendance.qrTtlSeconds * 1000);
  await session.save();

  const qrDataUrl = await QRCode.toDataURL(JSON.stringify({ sessionId: session._id, token }));
  res.json({ success: true, data: { token, qrDataUrl, expiresAt: session.qrTokenExpiresAt } });
});

const closeAttendanceSession = catchAsync(async (req, res) => {
  const session = await AttendanceSession.findOneAndUpdate(
    { _id: req.params.sessionId, organization: req.organizationId },
    { isClosed: true },
    { new: true }
  );
  if (!session) throw ApiError.notFound('Attendance session not found');
  res.json({ success: true, data: session });
});

/** Member-facing endpoint: scans the QR and marks their own attendance. */
const markAttendance = catchAsync(async (req, res) => {
  if (!req.user.member) throw ApiError.badRequest('Only a member profile can mark attendance');

  const session = await AttendanceSession.findOne({
    _id: req.params.sessionId,
    organization: req.organizationId,
  }).select('+qrTokenHash');
  if (!session) throw ApiError.notFound('Attendance session not found');
  if (session.isClosed) throw ApiError.badRequest('This attendance session has been closed');
  if (session.qrTokenExpiresAt < new Date()) throw ApiError.badRequest('This QR code has expired - ask for a fresh scan');
  if (hashToken(req.body.token) !== session.qrTokenHash) throw ApiError.badRequest('Invalid attendance token');

  if (session.location && session.location.radiusMeters && req.body.location) {
    const distance = haversineMeters(
      session.location.latitude,
      session.location.longitude,
      req.body.location.latitude,
      req.body.location.longitude
    );
    if (distance > session.location.radiusMeters) {
      throw ApiError.badRequest('You appear to be outside the service location');
    }
  }

  const existing = await AttendanceRecord.findOne({ session: session._id, member: req.user.member });
  if (existing) throw ApiError.conflict('Attendance already recorded for this session');

  const record = await AttendanceRecord.create({
    organization: req.organizationId,
    parish: session.parish,
    session: session._id,
    member: req.user.member,
    method: 'QR',
    location: req.body.location,
  });

  res.status(201).json({ success: true, data: record });
});

/** Admin correction: manually mark or amend a member's attendance. */
const markAttendanceManually = catchAsync(async (req, res) => {
  const session = await AttendanceSession.findOne({ _id: req.params.sessionId, organization: req.organizationId });
  if (!session) throw ApiError.notFound('Attendance session not found');

  const record = await AttendanceRecord.findOneAndUpdate(
    { session: session._id, member: req.body.memberId },
    {
      organization: req.organizationId,
      parish: session.parish,
      session: session._id,
      member: req.body.memberId,
      method: 'MANUAL',
      markedBy: req.user._id,
      isCorrection: true,
      markedAt: new Date(),
    },
    { new: true, upsert: true }
  );

  await recordAudit({ req, action: 'MANUAL_ATTENDANCE_CORRECTION', resource: 'AttendanceRecord', resourceId: record._id, newValue: record });

  res.status(201).json({ success: true, data: record });
});

const listAttendanceSessions = catchAsync(async (req, res) => {
  const filter = { organization: req.organizationId };
  if (req.query.parishId) filter.parish = req.query.parishId;
  if (req.query.unitId) filter.unit = req.query.unitId;

  const sessions = await AttendanceSession.find(filter).sort({ scheduledStart: -1 }).limit(100);
  res.json({ success: true, data: sessions });
});

const getSessionRecords = catchAsync(async (req, res) => {
  const records = await AttendanceRecord.find({ session: req.params.sessionId, organization: req.organizationId }).populate(
    'member',
    'firstName lastName'
  );
  res.json({ success: true, data: records });
});

module.exports = {
  createAttendanceSession,
  rotateAttendanceToken,
  closeAttendanceSession,
  markAttendance,
  markAttendanceManually,
  listAttendanceSessions,
  getSessionRecords,
};
