const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/users/auth/google/callback",
    proxy: true
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user already exists in our DB
      let user = await User.findOne({ 
        $or: [
          { googleId: profile.id },
          { email: profile.emails[0].value }
        ]
      });

      if (user) {
        // If user exists but doesn't have googleId (registered locally), link it
        if (!user.googleId) {
          user.googleId = profile.id;
          user.authMethod = 'google';
          await user.save();
        }
        return done(null, user);
      }

      // If user doesn't exist, create a new one
      user = await User.create({
        username: profile.displayName.replace(/\s+/g, '').toLowerCase() + Math.floor(Math.random() * 1000),
        email: profile.emails[0].value,
        googleId: profile.id,
        authMethod: 'google',
        avatar: profile.photos[0].value,
        isVerified: true // Social login users are verified by default
      });

      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
});
