const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const Event = require('../models/Event');
const UnitMembership = require('../models/UnitMembership');
const { recordAudit } = require('../utils/audit');

/**
 * Builds the visibility filter for the calendar: organization-wide events
 * are visible to everyone in the org; parish events to that parish
 * (approximated here as all org members, since simple members are
 * generally attached to one primary parish - refine with a parish filter
 * if the caller supplies one); unit events only to members of that unit;
 * admin-only events are excluded entirely for plain members.
 */
const listEvents = catchAsync(async (req, res) => {
  const { from, to, parishId, unitId } = req.query;

  const isAdmin = (req.roleAssignments || []).length > 0;
  const myUnitIds = req.user.member
    ? (await UnitMembership.find({ member: req.user.member, isActive: true }).distinct('unit'))
    : [];

  const visibilityOr = [{ scopeType: 'ORGANIZATION' }, { scopeType: 'UNIT', unit: { $in: myUnitIds } }];
  if (parishId) visibilityOr.push({ scopeType: 'PARISH', parish: parishId });
  else visibilityOr.push({ scopeType: 'PARISH' });

  if (isAdmin) visibilityOr.push({ scopeType: 'ADMIN_ONLY' });

  const filter = { organization: req.organizationId, isActive: true, $or: visibilityOr };
  if (from || to) {
    filter.startsAt = {};
    if (from) filter.startsAt.$gte = new Date(from);
    if (to) filter.startsAt.$lte = new Date(to);
  }
  if (unitId) filter.unit = unitId;

  const events = await Event.find(filter).sort({ startsAt: 1 });
  res.json({ success: true, data: events });
});

const createEvent = catchAsync(async (req, res) => {
  const event = await Event.create({
    organization: req.organizationId,
    scopeType: req.body.scopeType,
    parish: req.body.parish,
    unit: req.body.unit,
    title: req.body.title,
    description: req.body.description,
    type: req.body.type,
    startsAt: req.body.startsAt,
    endsAt: req.body.endsAt,
    location: req.body.location,
    createsAttendanceSession: !!req.body.createsAttendanceSession,
    createdBy: req.user._id,
  });

  await recordAudit({ req, action: 'CREATE_EVENT', resource: 'Event', resourceId: event._id, newValue: event });

  res.status(201).json({ success: true, data: event });
});

const updateEvent = catchAsync(async (req, res) => {
  const allowedFields = ['title', 'description', 'type', 'startsAt', 'endsAt', 'location', 'isActive'];
  const updates = {};
  allowedFields.forEach((f) => {
    if (req.body[f] !== undefined) updates[f] = req.body[f];
  });

  const event = await Event.findOneAndUpdate({ _id: req.params.eventId, organization: req.organizationId }, updates, {
    new: true,
    runValidators: true,
  });
  if (!event) throw ApiError.notFound('Event not found');

  await recordAudit({ req, action: 'UPDATE_EVENT', resource: 'Event', resourceId: event._id });

  res.json({ success: true, data: event });
});

const deleteEvent = catchAsync(async (req, res) => {
  const event = await Event.findOneAndUpdate(
    { _id: req.params.eventId, organization: req.organizationId },
    { isActive: false },
    { new: true }
  );
  if (!event) throw ApiError.notFound('Event not found');

  await recordAudit({ req, action: 'DELETE_EVENT', resource: 'Event', resourceId: event._id });

  res.json({ success: true, message: 'Event removed' });
});

module.exports = { listEvents, createEvent, updateEvent, deleteEvent };
