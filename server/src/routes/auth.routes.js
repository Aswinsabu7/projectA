const express = require('express');
const authenticate = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');
const validate = require('../middleware/validate');
const authController = require('../controllers/auth.controller');
const authValidator = require('../validators/auth.validator');

const router = express.Router();

router.post('/login', authLimiter, validate(authValidator.login), authController.login);
router.post('/refresh-token', authLimiter, validate(authValidator.refreshToken), authController.refreshToken);
router.post('/logout', authenticate, authController.logout);
router.get('/me', authenticate, authController.me);
router.post(
  '/change-password',
  authenticate,
  validate(authValidator.changePassword),
  authController.changePassword
);
router.post(
  '/forgot-password',
  authLimiter,
  validate(authValidator.forgotPassword),
  authController.forgotPassword
);
router.post('/reset-password', authLimiter, validate(authValidator.resetPassword), authController.resetPassword);

module.exports = router;
