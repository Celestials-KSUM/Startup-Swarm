import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { registerSchema, loginSchema, verifyOtpSchema } from '../validations/auth.validation';

const authService = new AuthService();

export class AuthController {
    async register(req: Request, res: Response) {
        try {
            const validatedData = registerSchema.parse(req.body);
            const result = await authService.register(validatedData);
            res.status(201).json(result);
        } catch (error: any) {
            res.status(400).json({ message: error.message || 'Registration failed' });
        }
    }

    async verifyOtp(req: Request, res: Response) {
        try {
            const { email, otp } = verifyOtpSchema.parse(req.body);
            const result = await authService.verifyOtp(email, otp);
            res.status(200).json(result);
        } catch (error: any) {
            res.status(400).json({ message: error.message || 'OTP verification failed' });
        }
    }

    async login(req: Request, res: Response) {
        try {
            const validatedData = loginSchema.parse(req.body);
            const result = await authService.login(validatedData);
            res.status(200).json(result);
        } catch (error: any) {
            res.status(400).json({ message: error.message || 'Login failed' });
        }
    }

    async googleSuccess(req: Request, res: Response) {
        // This will be handled by passport and redirected to here or handled in service
        if (req.user) {
            res.status(200).json(req.user);
        } else {
            res.status(401).json({ message: 'Google authentication failed' });
        }
    }
}
