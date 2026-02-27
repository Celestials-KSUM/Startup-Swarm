import bcrypt from 'bcryptjs';
import { AuthRepository } from '../repositories/auth.repository';
import { generateToken } from '../utils/jwt';
import { sendOtpEmail } from '../utils/mailer';

const authRepository = new AuthRepository();

export class AuthService {
    async register(userData: any) {
        const { email, password } = userData;

        const existingUser = await authRepository.findByEmail(email);
        if (existingUser) {
            if (existingUser.isVerified) {
                throw new Error('User already exists');
            } else {
                // If user exists but not verified, delete and recreate OR update
                await authRepository.deleteUnverifiedUser(email);
            }
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        const user = await authRepository.createUser({
            email,
            password: hashedPassword,
            otp,
            otpExpiresAt,
            isVerified: false,
        });

        await sendOtpEmail(email, otp);

        return { message: 'OTP sent to email. Please verify.' };
    }

    async verifyOtp(email: string, otp: string) {
        const user = await authRepository.findByEmail(email);
        if (!user) throw new Error('User not found');

        if (user.otp !== otp) throw new Error('Invalid OTP');
        if (user.otpExpiresAt && new Date() > user.otpExpiresAt) throw new Error('OTP expired');

        user.isVerified = true;
        user.otp = undefined;
        user.otpExpiresAt = undefined;
        await user.save();

        const token = generateToken({ id: user._id, email: user.email });
        return { token, user: { id: user._id, email: user.email } };
    }

    async login(credentials: any) {
        const { email, password } = credentials;

        const user = await authRepository.findByEmail(email);
        if (!user) throw new Error('Invalid credentials');
        if (!user.isVerified) throw new Error('Please verify your email first');
        if (!user.password) throw new Error('Please login with social provider');

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) throw new Error('Invalid credentials');

        const token = generateToken({ id: user._id, email: user.email });
        return { token, user: { id: user._id, email: user.email } };
    }

    async googleAuth(profile: any) {
        const { id, emails, photos } = profile;
        const email = emails[0].value;
        const avatar = photos[0].value;

        let user = await authRepository.findByGoogleId(id);

        if (!user) {
            // Check if user exists with same email
            user = await authRepository.findByEmail(email);
            if (user) {
                user.googleId = id;
                user.avatar = avatar;
                user.isVerified = true; // Google users are verified
                await user.save();
            } else {
                user = await authRepository.createUser({
                    email,
                    googleId: id,
                    avatar,
                    isVerified: true,
                });
            }
        }

        const token = generateToken({ id: user._id, email: user.email });
        return { token, user: { id: user._id, email: user.email, avatar: user.avatar } };
    }
}
