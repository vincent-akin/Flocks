const AuditLog = require('../models/AuditLog');

/**
 * Records an administrative action. Never throws - audit logging should
 * never break the primary request flow; failures only get logged.
 */
async function recordAudit({
  req,
  action,
  resource,
  resourceId,
  previousValue,
  newValue,
  organization,
}) {
  try {
    await AuditLog.create({
      actor: req.user ? req.user._id : undefined,
      action,
      resource,
      resourceId,
      previousValue,
      newValue,
      organization: organization || req.organizationId,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[audit] Failed to record audit log:', err.message);
  }
}

module.exports = { recordAudit };
