//passport.js
const passport = require('passport');
const SpotifyStrategy = require('passport-spotify').Strategy;
const mongoose = require('mongoose');
const { modelUser, connectdb } = require('./db.js');
const dotenv = require('dotenv');

dotenv.config()

function connectPassport() {
    const User = modelUser();
    connectdb();    
    passport.use(new SpotifyStrategy({
        clientID: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        callbackURL: process.env.CALLBACK_URL,
        authorizationURL: process.env.AUTH_URL,
        tokenURL: process.env.TOKEN_URL,
        userProfileURL: process.env.USER_PROFILE_URL,
        scope: [
            "user-read-email",
            "user-read-private",
            "user-top-read",
            "user-read-currently-playing",
            "user-read-recently-played",
            "user-follow-read",
            "user-read-playback-state",
            'playlist-modify-public',
            'playlist-modify-private',
        ],
        }, async (accessToken, refreshToken, profile, done) => {
        try {
            const existingUser = await User.findOne({ spotifyId: profile.id });
            if (existingUser) {
            existingUser.displayName = profile.displayName;
            existingUser.accessToken = accessToken;
            existingUser.refreshToken = refreshToken;
            existingUser.expiresIn = 3600; 
            await existingUser.save();
            return done(null, existingUser);
            } else {
            const newUser = new User({
            spotifyId: profile.id,
            displayName: profile.displayName,
            accessToken: accessToken,
            refreshToken: refreshToken,
            expiresIn: 3600,
            });
            await newUser.save();
            return done(null, newUser);
            }
        } catch (err) {
        console.error('Error en Passport Strategy:', err);
        return done(err);
        }
    }));
    passport.serializeUser((user, done) => done(null, user.id));
    passport.deserializeUser(async (id, done) => {
        try {
        const user = await User.findById(id);
        done(null, user);
        } catch (err) {
        done(err);
        }
    });
}

module.exports = {connectPassport};