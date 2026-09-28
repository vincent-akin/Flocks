const mongoose = require('mongoose');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const env = require('../config/env');
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  randomToken,
  hashToken,
} = require('../utils/tokens');
const { ROLES, SCOPE_TYPES, ALL_PERMISSIONS } = require('../permissions/permissions');
const { sendMail } = require('../utils/mailer');

const User = require('../models/User');
const Member = require('../models/Member');
const ChurchOrganization = require('../models/ChurchOrganization');
const Parish = require('../models/Parish');
const ParishMembership = require('../models/ParishMembership');
const RoleAssignment = require('../models/RoleAssignment');
const MemberEvent = require('../models/MemberEvent');

const ACCESS_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.cookies.secure,
  sameSite: 'lax',
  domain: env.cookies.domain,
  maxAge: 15 * 60 * 1000,
};

const REFRESH_COOKIE_OPTIONS = {
  ...ACCESS_COOKIE_OPTIONS,
  maxAge: 30 * 24 * 60 * 60 * 1000,
  path: '/api/v1/auth',
};

function slugify(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

async function issueSession(res, user) {
  const accessToken = signAccessToken(String(user._id));
  const refreshTokenId = randomToken(16);
  const refreshToken = signRefreshToken(String(user._id), refreshTokenId);

  res.cookie('accessToken', accessToken, ACCESS_COOKIE_OPTIONS);
  res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);
  return { accessToken, refreshToken };
}

/**
 * Bootstraps a brand-new Church Organization: creates the organization,
 * its main parish, the Super Admin's User + Member records, and the
 * SUPER_ADMIN role assignment. This is the only place a Super Admin is
 * created without already being authenticated.
 */
const registerOrganization = catchAsync(async (req, res) => {
  const { organizationName, adminFirstName, adminLastName, adminEmail, password, adminPhone } = req.body;

  const existing = await User.findOne({ email: adminEmail.toLowerCase() });
  if (existing) {
    throw ApiError.conflict('An account with this email already exists');
  }

  const session = await mongoose.startSession();
  let organization;
  let user;

  try {
    await session.withTransaction(async () => {
      const baseSlug = slugify(organizationName);
      let slug = baseSlug;
      let suffix = 1;
      // eslint-disable-next-line no-await-in-loop
      while (await ChurchOrganization.findOne({ slug }).session(session)) {
        slug = `${baseSlug}-${suffix++}`;
      }

      organization = (
        await ChurchOrganization.create([{ name: organizationName, slug }], { session })
      )[0];

      const mainParish = (
        await Parish.create(
          [{ organization: organization._id, name: 'Main Parish', isMainParish: true }],
          { session }
        )
      )[0];

      organization.settings.defaultParish = mainParish._id;
      await organization.save({ session });

      const passwordHash = await User.hashPassword(password);
      user = (
        await User.create(
          [
            {
              organization: organization._id,
              email: adminEmail.toLowerCase(),
              passwordHash,
              isEmailVerified: false,
            },
          ],
          { session }
        )
      )[0];

      const member = (
        await Member.create(
          [
            {
              organization: organization._id,
              user: user._id,
              primaryParish: mainParish._id,
              firstName: adminFirstName,
              lastName: adminLastName,
              phone: adminPhone,
              email: adminEmail.toLowerCase(),
              membershipStatus: 'ACTIVE',
              createdBy: user._id,
            },
          ],
          { session }
        )
      )[0];

      user.member = member._id;
      await user.save({ session });

      await ParishMembership.create(
        [{ organization: organization._id, member: member._id, parish: mainParish._id, isCurrent: true }],
        { session }
      );

      await RoleAssignment.create(
        [
          {
            user: user._id,
            organization: organization._id,
            role: ROLES.SUPER_ADMIN,
            scopeType: SCOPE_TYPES.ORGANIZATION,
            scopeId: organization._id,
            permissions: ALL_PERMISSIONS,
            createdBy: user._id,
          },
        ],
        { session }
      );

      await MemberEvent.create(
        [
          {
            organization: organization._id,
            member: member._id,
            parish: mainParish._id,
            type: 'JOINED_CHURCH',
            title: 'Joined Church',
            recordedBy: user._id,
          },
        ],
        { session }
      );
    });
  } finally {
    session.endSession();
  }

  await sendVerificationEmail(user);

  const tokens = await issueSession(res, user);

  res.status(201).json({
    success: true,
    message: 'Church organization created successfully',
    data: {
      organization: { id: organization._id, name: organization.name, slug: organization.slug },
      user: { id: user._id, email: user.email },
      accessToken: tokens.accessToken,
    },
  });
});

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash +failedLoginAttempts +lockUntil');
  if (!user) throw ApiError.unauthorized('Invalid email or password');

  if (user.isLocked()) {
    throw ApiError.forbidden('Account temporarily locked due to too many failed login attempts. Try again later.');
  }

  const validPassword = await user.comparePassword(password);
  if (!validPassword) {
    user.failedLoginAttempts += 1;
    if (user.failedLoginAttempts >= 5) {
      user.lockUntil = new Date(Date.now() + 15 * 60 * 1000);
      user.failedLoginAttempts = 0;
    }
    await user.save();
    throw ApiError.unauthorized('Invalid email or password');
  }

  if (!user.isActive) throw ApiError.forbidden('Account is inactive');

  user.failedLoginAttempts = 0;
  user.lockUntil = undefined;
  user.lastLoginAt = new Date();
  await user.save();

  const tokens = await issueSession(res, user);
  const roleAssignments = await RoleAssignment.find({ user: user._id, status: 'ACTIVE' }).lean();

  res.json({
    success: true,
    data: {
      user: { id: user._id, email: user.email, member: user.member },
      roleAssignments,
      accessToken: tokens.accessToken,
    },
  });
});

const refresh = catchAsync(async (req, res) => {
  const token = req.cookies && req.cookies.refreshToken;
  if (!token) throw ApiError.unauthorized('No refresh token provided');

  let payload;
  try {
    payload = verifyRefreshToken(token);
  } catch (err) {
    throw ApiError.unauthorized('Invalid or expired refresh token');
  }

  const user = await User.findById(payload.sub);
  if (!user || !user.isActive) throw ApiError.unauthorized('Invalid session');

  const tokens = await issueSession(res, user);
  res.json({ success: true, data: { accessToken: tokens.accessToken } });
});

const logout = catchAsync(async (req, res) => {
  res.clearCookie('accessToken', { domain: env.cookies.domain });
  res.clearCookie('refreshToken', { domain: env.cookies.domain, path: '/api/v1/auth' });
  res.json({ success: true, message: 'Logged out' });
});

const me = catchAsync(async (req, res) => {
  const member = req.user.member ? await Member.findById(req.user.member) : null;
  res.json({
    success: true,
    data: {
      user: { id: req.user._id, email: req.user.email, organization: req.user.organization },
      member,
      roleAssignments: req.roleAssignments,
    },
  });
});

const forgotPassword = catchAsync(async (req, res) => {
  const user = await User.findOne({ email: req.body.email.toLowerCase() });
  // Always respond the same way to avoid leaking which emails are registered.
  if (user) {
    const token = randomToken();
    user.passwordResetTokenHash = hashToken(token);
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();

    const resetUrl = `${env.clientUrl}/reset-password?token=${token}`;
    await sendMail({
      to: user.email,
      subject: 'Reset your Flocks password',
      text: `Reset your password by visiting: ${resetUrl}\n\nThis link expires in 1 hour. If you didn't request this, you can ignore this email.`,
      html: `<p>Reset your password by clicking the link below:</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>This link expires in 1 hour. If you didn't request this, you can ignore this email.</p>`,
    });
  }
  res.json({ success: true, message: 'If that email exists, a reset link has been sent.' });
});

const resetPassword = catchAsync(async (req, res) => {
  const tokenHash = hashToken(req.body.token);
  const user = await User.findOne({
    passwordResetTokenHash: tokenHash,
    passwordResetExpires: { $gt: new Date() },
  }).select('+passwordResetTokenHash +passwordResetExpires');

  if (!user) throw ApiError.badRequest('Invalid or expired reset token');

  user.passwordHash = await User.hashPassword(req.body.password);
  user.passwordResetTokenHash = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  res.json({ success: true, message: 'Password has been reset. You may now log in.' });
});

async function sendVerificationEmail(user) {
  const token = randomToken();
  user.emailVerificationTokenHash = hashToken(token);
  user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  await user.save();

  const verifyUrl = `${env.clientUrl}/verify-email?token=${token}`;
  await sendMail({
    to: user.email,
    subject: 'Verify your Flocks account',
    text: `Welcome to Flocks! Verify your email by visiting: ${verifyUrl}\n\nThis link expires in 24 hours.`,
    html: `<p>Welcome to Flocks! Verify your email by clicking the link below:</p><p><a href="${verifyUrl}">${verifyUrl}</a></p><p>This link expires in 24 hours.</p>`,
  });
}

const verifyEmail = catchAsync(async (req, res) => {
  const tokenHash = hashToken(req.body.token);
  const user = await User.findOne({
    emailVerificationTokenHash: tokenHash,
    emailVerificationExpires: { $gt: new Date() },
  }).select('+emailVerificationTokenHash +emailVerificationExpires');

  if (!user) throw ApiError.badRequest('This verification link is invalid or has expired.');

  user.isEmailVerified = true;
  user.emailVerificationTokenHash = undefined;
  user.emailVerificationExpires = undefined;
  await user.save();

  res.json({ success: true, message: 'Email verified successfully.' });
});

const resendVerificationEmail = catchAsync(async (req, res) => {
  if (req.user.isEmailVerified) {
    return res.json({ success: true, message: 'Your email is already verified.' });
  }
  await sendVerificationEmail(req.user);
  res.json({ success: true, message: 'Verification email sent.' });
});

module.exports = {
  registerOrganization,
  login,
  refresh,
  logout,
  me,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerificationEmail,
};
