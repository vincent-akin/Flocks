const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const Parish = require('../models/Parish');
const { recordAudit } = require('../utils/audit');

const listParishes = catchAsync(async (req, res) => {
  const parishes = await Parish.find({ organization: req.organizationId, isActive: true }).sort({ createdAt: 1 });
  res.json({ success: true, data: parishes });
});

const getParish = catchAsync(async (req, res) => {
  const parish = await Parish.findOne({ _id: req.params.parishId, organization: req.organizationId });
  if (!parish) throw ApiError.notFound('Parish not found');
  res.json({ success: true, data: parish });
});

const createParish = catchAsync(async (req, res) => {
  const parish = await Parish.create({
    organization: req.organizationId,
    name: req.body.name,
    address: req.body.address,
    city: req.body.city,
    state: req.body.state,
    country: req.body.country,
    contactEmail: req.body.contactEmail,
    contactPhone: req.body.contactPhone,
    createdBy: req.user._id,
  });

  await recordAudit({ req, action: 'CREATE_PARISH', resource: 'Parish', resourceId: parish._id, newValue: parish });

  res.status(201).json({ success: true, data: parish });
});

const updateParish = catchAsync(async (req, res) => {
  const allowedFields = ['name', 'address', 'city', 'state', 'country', 'contactEmail', 'contactPhone', 'isActive'];
  const updates = {};
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  const before = await Parish.findOne({ _id: req.params.parishId, organization: req.organizationId });
  if (!before) throw ApiError.notFound('Parish not found');

  const parish = await Parish.findByIdAndUpdate(req.params.parishId, updates, { new: true, runValidators: true });

  await recordAudit({
    req,
    action: 'UPDATE_PARISH',
    resource: 'Parish',
    resourceId: parish._id,
    previousValue: before,
    newValue: parish,
  });

  res.json({ success: true, data: parish });
});

const deleteParish = catchAsync(async (req, res) => {
  const parish = await Parish.findOne({ _id: req.params.parishId, organization: req.organizationId });
  if (!parish) throw ApiError.notFound('Parish not found');
  if (parish.isMainParish) throw ApiError.badRequest('The main parish cannot be deleted');

  parish.isActive = false;
  await parish.save();

  await recordAudit({ req, action: 'DELETE_PARISH', resource: 'Parish', resourceId: parish._id, previousValue: parish });

  res.json({ success: true, message: 'Parish deactivated' });
});

module.exports = { listParishes, getParish, createParish, updateParish, deleteParish };
