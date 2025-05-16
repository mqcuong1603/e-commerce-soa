import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as FacebookStrategy } from "passport-facebook";
import User from "../models/user.model.js";

// Serialize user into the session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from the session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || "google-client-id",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "google-client-secret",
      callbackURL: `${
        process.env.REACT_APP_API_URL || "http://localhost:3000/api"
      }/auth/google/callback`,
      proxy: true,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists
        let user = await User.findOne({
          socialMediaId: profile.id,
          socialMediaProvider: "google",
        });

        if (user) {
          return done(null, user);
        }

        // Check if user exists with same email
        if (profile.emails && profile.emails.length > 0) {
          user = await User.findOne({ email: profile.emails[0].value });

          if (user) {
            // Link social account to existing user
            user.socialMediaId = profile.id;
            user.socialMediaProvider = "google";
            await user.save();
            return done(null, user);
          }
        }

        // Create new user
        const email =
          profile.emails && profile.emails.length > 0
            ? profile.emails[0].value
            : `${profile.id}@google.com`;

        user = new User({
          email,
          fullName: profile.displayName || "Google User",
          socialMediaId: profile.id,
          socialMediaProvider: "google",
          status: "active",
        });

        await user.save();
        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

// Facebook OAuth Strategy
passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID || "facebook-app-id",
      clientSecret: process.env.FACEBOOK_APP_SECRET || "facebook-app-secret",
      callbackURL: `${
        process.env.REACT_APP_API_URL || "http://localhost:3000/api"
      }/auth/facebook/callback`,
      profileFields: ["id", "emails", "name"],
      proxy: true,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists
        let user = await User.findOne({
          socialMediaId: profile.id,
          socialMediaProvider: "facebook",
        });

        if (user) {
          return done(null, user);
        }

        // Facebook may not always provide an email
        const email =
          profile.emails && profile.emails[0]
            ? profile.emails[0].value
            : `${profile.id}@facebook.com`;

        // Check if user exists with same email
        if (profile.emails && profile.emails.length > 0) {
          user = await User.findOne({ email });

          if (user) {
            // Link social account to existing user
            user.socialMediaId = profile.id;
            user.socialMediaProvider = "facebook";
            await user.save();
            return done(null, user);
          }
        }

        // Create full name from profile
        const fullName = profile.name
          ? `${profile.name.givenName || ""} ${
              profile.name.familyName || ""
            }`.trim()
          : "Facebook User";

        // Create new user
        user = new User({
          email,
          fullName,
          socialMediaId: profile.id,
          socialMediaProvider: "facebook",
          status: "active",
        });

        await user.save();
        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

export default passport;
