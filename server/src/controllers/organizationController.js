const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const ChurchOrganization = require('../models/ChurchOrganization');
const { recordAudit } = require('../utils/audit');

const getOrganization = catchAsync(async (req, res) => {
  const organization = await ChurchOrganization.findById(req.organizationId);
  if (!organization) throw ApiError.notFound('Organization not found');
  res.json({ success: true, data: organization });
});

const updateOrganization = catchAsync(async (req, res) => {
  const allowedFields = ['name', 'description', 'logoUrl', 'contactEmail', 'contactPhone', 'address', 'timezone', 'settings'];
  const updates = {};
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  const before = await ChurchOrganization.findById(req.organizationId);
  const organization = await ChurchOrganization.findByIdAndUpdate(req.organizationId, updates, {
    new: true,
    runValidators: true,
  });
  if (!organization) throw ApiError.notFound('Organization not found');

  await recordAudit({
    req,
    action: 'UPDATE_ORGANIZATION',
    resource: 'ChurchOrganization',
    resourceId: organization._id,
    previousValue: before,
    newValue: organization,
  });

  res.json({ success: true, data: organization });
});

module.exports = { getOrganization, updateOrganization };
