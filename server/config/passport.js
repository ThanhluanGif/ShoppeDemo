const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const User = require('../models/User');

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
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
}

if (process.env.FACEBOOK_CLIENT_ID && process.env.FACEBOOK_CLIENT_SECRET) {
  passport.use(new FacebookStrategy({
      clientID: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
      callbackURL: "/api/users/auth/facebook/callback",
      profileFields: ['id', 'displayName', 'emails', 'photos'],
      proxy: true
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails ? profile.emails[0].value : `${profile.id}@facebook.com`;
        
        let user = await User.findOne({ 
          $or: [
            { facebookId: profile.id },
            { email: email }
          ]
        });

        if (user) {
          if (!user.facebookId) {
            user.facebookId = profile.id;
            user.authMethod = 'facebook';
            await user.save();
          }
          return done(null, user);
        }

        user = await User.create({
          username: profile.displayName.replace(/\s+/g, '').toLowerCase() + Math.floor(Math.random() * 1000),
          email: email,
          facebookId: profile.id,
          authMethod: 'facebook',
          avatar: profile.photos ? profile.photos[0].value : 'https://cdn-icons-png.flaticon.com/512/149/149071.png',
          isVerified: true
        });

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  ));
}

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
});
