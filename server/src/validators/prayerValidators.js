const { isNonEmptyString, makeResult } = require('./helpers');

const CATEGORIES = ['HEALTH', 'FAMILY', 'CAREER', 'FINANCE', 'SPIRITUAL', 'MARRIAGE', 'CHILDREN', 'THANKSGIVING', 'OTHER'];
const VISIBILITIES = ['PRIVATE', 'PASTOR_CARE_TEAM', 'CHURCH_WIDE'];

function createPrayerRequestValidator(body) {
  const errors = [];
  if (!isNonEmptyString(body.title)) errors.push('title is required');
  if (!isNonEmptyString(body.description)) errors.push('description is required');
  if (body.category && !CATEGORIES.includes(body.category)) errors.push('Invalid category');
  if (body.visibility && !VISIBILITIES.includes(body.visibility)) errors.push('Invalid visibility');
  return makeResult(body, errors);
}

function addTestimonyValidator(body) {
  const errors = [];
  if (!isNonEmptyString(body.testimony)) errors.push('testimony is required');
  return makeResult(body, errors);
}

module.exports = { createPrayerRequestValidator, addTestimonyValidator };
