const { isNonEmptyString, isValidEmail, makeResult } = require('./helpers');

function registerOrganizationValidator(body) {
  const errors = [];
  if (!isNonEmptyString(body.organizationName)) errors.push('organizationName is required');
  if (!isNonEmptyString(body.adminFirstName)) errors.push('adminFirstName is required');
  if (!isNonEmptyString(body.adminLastName)) errors.push('adminLastName is required');
  if (!isValidEmail(body.adminEmail)) errors.push('A valid adminEmail is required');
  if (!isNonEmptyString(body.password) || body.password.length < 8) {
    errors.push('password is required and must be at least 8 characters');
  }
  return makeResult(body, errors);
}

function loginValidator(body) {
  const errors = [];
  if (!isValidEmail(body.email)) errors.push('A valid email is required');
  if (!isNonEmptyString(body.password)) errors.push('password is required');
  return makeResult(body, errors);
}

function forgotPasswordValidator(body) {
  const errors = [];
  if (!isValidEmail(body.email)) errors.push('A valid email is required');
  return makeResult(body, errors);
}

function resetPasswordValidator(body) {
  const errors = [];
  if (!isNonEmptyString(body.token)) errors.push('token is required');
  if (!isNonEmptyString(body.password) || body.password.length < 8) {
    errors.push('password is required and must be at least 8 characters');
  }
  return makeResult(body, errors);
}

function verifyEmailValidator(body) {
  const errors = [];
  if (!isNonEmptyString(body.token)) errors.push('token is required');
  return makeResult(body, errors);
}

module.exports = {
  registerOrganizationValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  verifyEmailValidator,
};
