const { isNonEmptyString, isObjectIdLike, makeResult } = require('./helpers');

function createMemberValidator(body) {
  const errors = [];
  if (!isNonEmptyString(body.firstName)) errors.push('firstName is required');
  if (!isNonEmptyString(body.lastName)) errors.push('lastName is required');
  if (!isObjectIdLike(body.primaryParish)) errors.push('A valid primaryParish id is required');
  return makeResult(body, errors);
}

function transferMemberValidator(body) {
  const errors = [];
  if (!isObjectIdLike(body.newParishId)) errors.push('A valid newParishId is required');
  return makeResult(body, errors);
}

module.exports = { createMemberValidator, transferMemberValidator };
