import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import passport from 'passport';
import config from '../config/env';

const router = Router();
const authController = new AuthController();

router.post('/register', authController.register);
router.post('/verify-otp', authController.verifyOtp);
router.post('/login', authController.login);

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get(
    '/google/callback',
    passport.authenticate('google', { session: false }),
    (req: any, res) => {
        // Redirect with token or send it
        const { token } = req.user;
        res.redirect(`${config.CLIENT_URL}/auth-success?token=${token}`);
    }
);


export default router;
