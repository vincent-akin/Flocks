const { isNonEmptyString, makeResult } = require('./helpers');

function createEventValidator(body) {
  const errors = [];
  if (!isNonEmptyString(body.title)) errors.push('title is required');
  if (!body.startsAt || Number.isNaN(Date.parse(body.startsAt))) errors.push('A valid startsAt date is required');
  if (!['ORGANIZATION', 'PARISH', 'UNIT', 'ADMIN_ONLY'].includes(body.scopeType)) {
    errors.push('scopeType must be one of ORGANIZATION, PARISH, UNIT, ADMIN_ONLY');
  }
  if (body.scopeType === 'PARISH' && !body.parish) errors.push('parish is required for PARISH-scoped events');
  if (body.scopeType === 'UNIT' && !body.unit) errors.push('unit is required for UNIT-scoped events');
  return makeResult(body, errors);
}

module.exports = { createEventValidator };
