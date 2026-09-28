const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();

const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  registerOrganizationValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  verifyEmailValidator,
} = require('../validators/authValidators');

const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, standardHeaders: true, legacyHeaders: false });

router.post('/register-organization', validate(registerOrganizationValidator), authController.registerOrganization);
router.post('/login', loginLimiter, validate(loginValidator), authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);
router.get('/me', authenticate, authController.me);
router.post('/forgot-password', loginLimiter, validate(forgotPasswordValidator), authController.forgotPassword);
router.post('/reset-password', validate(resetPasswordValidator), authController.resetPassword);
router.post('/verify-email', validate(verifyEmailValidator), authController.verifyEmail);
router.post('/resend-verification', authenticate, authController.resendVerificationEmail);

module.exports = router;
