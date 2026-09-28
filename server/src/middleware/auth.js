const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const { verifyAccessToken } = require('../utils/tokens');
const User = require('../models/User');
const RoleAssignment = require('../models/RoleAssignment');

/**
 * Verifies the access token (from the HTTP-only cookie, or Authorization
 * header as a fallback for non-browser clients), loads the user, and
 * attaches `req.user` and `req.roleAssignments` (the user's currently
 * active RoleAssignments) for downstream authorization checks.
 */
const authenticate = catchAsync(async (req, res, next) => {
  const cookieToken = req.cookies && req.cookies.accessToken;
  const headerToken =
    req.headers.authorization && req.headers.authorization.startsWith('Bearer ')
      ? req.headers.authorization.split(' ')[1]
      : null;

  const token = cookieToken || headerToken;
  if (!token) {
    throw ApiError.unauthorized('Authentication required');
  }

  let payload;
  try {
    payload = verifyAccessToken(token);
  } catch (err) {
    throw ApiError.unauthorized('Invalid or expired session');
  }

  const user = await User.findById(payload.sub);
  if (!user || !user.isActive) {
    throw ApiError.unauthorized('Account not found or inactive');
  }

  const roleAssignments = await RoleAssignment.find({ user: user._id, status: 'ACTIVE' }).lean();

  req.user = user;
  req.roleAssignments = roleAssignments;
  req.organizationId = String(user.organization);

  next();
});

/**
 * Like `authenticate`, but does not fail the request if no valid session
 * is present. Used for endpoints that behave differently for anonymous
 * vs. authenticated callers.
 */
const authenticateOptional = catchAsync(async (req, res, next) => {
  const cookieToken = req.cookies && req.cookies.accessToken;
  if (!cookieToken) return next();

  try {
    const payload = verifyAccessToken(cookieToken);
    const user = await User.findById(payload.sub);
    if (user && user.isActive) {
      req.user = user;
      req.roleAssignments = await RoleAssignment.find({ user: user._id, status: 'ACTIVE' }).lean();
      req.organizationId = String(user.organization);
    }
  } catch (err) {
    // Ignore - treated as anonymous.
  }
  next();
});

module.exports = { authenticate, authenticateOptional };
