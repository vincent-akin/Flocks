const { isNonEmptyString, isObjectIdLike, makeResult } = require('./helpers');

function createUnitValidator(body) {
  const errors = [];
  if (!isNonEmptyString(body.name)) errors.push('name is required');
  if (!isObjectIdLike(body.parish)) errors.push('A valid parish id is required');
  return makeResult(body, errors);
}

function addUnitMemberValidator(body) {
  const errors = [];
  if (!isObjectIdLike(body.memberId)) errors.push('A valid memberId is required');
  return makeResult(body, errors);
}

module.exports = { createUnitValidator, addUnitMemberValidator };
