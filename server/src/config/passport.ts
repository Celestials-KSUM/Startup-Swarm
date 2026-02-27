import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { AuthService } from '../services/auth.service';
import config from './env';

const authService = new AuthService();

passport.use(
    new GoogleStrategy(
        {
            clientID: config.GOOGLE_CLIENT_ID,
            clientSecret: config.GOOGLE_CLIENT_SECRET,
            callbackURL: '/api/auth/google/callback',
        },

        async (accessToken, refreshToken, profile, done) => {
            try {
                const result = await authService.googleAuth(profile);
                return done(null, result);
            } catch (error) {
                return done(error as Error, undefined);
            }
        }
    )
);

passport.serializeUser((user: any, done) => {
    done(null, user);
});

passport.deserializeUser((user: any, done) => {
    done(null, user);
});
