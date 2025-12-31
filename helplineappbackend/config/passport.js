const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

// Only initialize Google OAuth if credentials are provided
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback'
      },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user exists with this email and Google auth provider
        let user = await User.findOne({ 
          email: profile.emails[0].value,
          authProvider: 'google'
        });

        if (user) {
          // Update avatar if available
          if (profile.photos && profile.photos[0]) {
            user.avatar = profile.photos[0].value;
            await user.save();
          }
          return done(null, user);
        }

        // Check if user exists with this email (might be email auth user)
        user = await User.findOne({ email: profile.emails[0].value });

        if (user) {
          // Link Google account to existing user by changing auth provider
          user.authProvider = 'google';
          // Remove password for Google auth users
          user.password = undefined;
          if (profile.photos && profile.photos[0]) {
            user.avatar = profile.photos[0].value;
          }
          await user.save();
          return done(null, user);
        }

        // Create new user
        user = await User.create({
          name: profile.displayName,
          email: profile.emails[0].value,
          authProvider: 'google',
          avatar: profile.photos && profile.photos[0] ? profile.photos[0].value : null
        });

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
  );
} else {
  console.log('Google OAuth not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to enable Google login.');
}

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id).select('-password');
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;

