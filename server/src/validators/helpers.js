const validator = require('validator');

function isNonEmptyString(v) {
  return typeof v === 'string' && v.trim().length > 0;
}

function isValidEmail(v) {
  return typeof v === 'string' && validator.isEmail(v);
}

function isObjectIdLike(v) {
  return typeof v === 'string' && /^[a-f\d]{24}$/i.test(v);
}

function makeResult(value, errors) {
  return errors.length ? { errors } : { value };
}

module.exports = { isNonEmptyString, isValidEmail, isObjectIdLike, makeResult };
