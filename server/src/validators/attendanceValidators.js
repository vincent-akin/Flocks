const { isNonEmptyString, makeResult } = require('./helpers');

function createAttendanceSessionValidator(body) {
  const errors = [];
  if (!isNonEmptyString(body.title)) errors.push('title is required');
  if (!body.scheduledStart || Number.isNaN(Date.parse(body.scheduledStart))) {
    errors.push('A valid scheduledStart date is required');
  }
  return makeResult(body, errors);
}

function markAttendanceValidator(body) {
  const errors = [];
  if (!isNonEmptyString(body.token)) errors.push('token is required');
  return makeResult(body, errors);
}

module.exports = { createAttendanceSessionValidator, markAttendanceValidator };
