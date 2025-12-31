const express = require('express');
const router = express.Router();
const passport = require('passport');
const { body } = require('express-validator');
const {
  login,
  googleLogin,
  googleCallback,
  getCurrentUser,
  logout
} = require('../controllers/userController');

// Login validation rules
const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Login route - placed first to ensure it's always available
router.post('/login', loginValidation, login);

// Google OAuth routes - only available if configured
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  // API endpoint for Google login with ID token (for mobile/frontend apps)
  router.post('/google', googleLogin);

  // Redirect flow for browser-based OAuth
  router.get(
    '/google/redirect',
    passport.authenticate('google', { scope: ['profile', 'email'] })
  );

  router.get(
    '/google/callback',
    passport.authenticate('google', { session: true }),
    googleCallback
  );
} else {
  // Return error if Google OAuth is not configured
  router.post('/google', (req, res) => {
    res.status(503).json({
      success: false,
      message: 'Google OAuth is not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in your environment variables.'
    });
  });

  router.get('/google/redirect', (req, res) => {
    res.status(503).json({
      success: false,
      message: 'Google OAuth is not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in your environment variables.'
    });
  });

  router.get('/google/callback', (req, res) => {
    res.status(503).json({
      success: false,
      message: 'Google OAuth is not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in your environment variables.'
    });
  });
}

router.get('/failure', (req, res) => {
  res.status(401).json({
    success: false,
    message: 'Google authentication failed'
  });
});

router.get('/me', getCurrentUser);

router.get('/logout', logout);

module.exports = router;

