const { isNonEmptyString, makeResult } = require('./helpers');

function setFeaturedVerseValidator(body) {
  const errors = [];
  if (!isNonEmptyString(body.reference)) errors.push('reference is required');
  if (!isNonEmptyString(body.text)) errors.push('text is required');
  if (!['DAILY', 'WEEKLY', 'YEARLY'].includes(body.type)) errors.push('type must be DAILY, WEEKLY, or YEARLY');
  return makeResult(body, errors);
}

function createBiblePlanValidator(body) {
  const errors = [];
  if (!isNonEmptyString(body.title)) errors.push('title is required');
  if (!body.startDate || Number.isNaN(Date.parse(body.startDate))) errors.push('A valid startDate is required');
  if (!body.endDate || Number.isNaN(Date.parse(body.endDate))) errors.push('A valid endDate is required');
  if (!Array.isArray(body.dailyReadings) || body.dailyReadings.length === 0) {
    errors.push('dailyReadings must be a non-empty array');
  }
  return makeResult(body, errors);
}

module.exports = { setFeaturedVerseValidator, createBiblePlanValidator };
