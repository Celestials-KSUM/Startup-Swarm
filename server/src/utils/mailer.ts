import nodemailer from 'nodemailer';
import config from '../config/env';

const transporter = nodemailer.createTransport({
    host: config.SMTP_HOST,
    port: config.SMTP_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
        user: config.SMTP_USER,
        pass: config.SMTP_PASS,
    },
});


export const sendOtpEmail = async (email: string, otp: string) => {
    const mailOptions = {
        from: `"Startup Swarm" <${config.SMTP_USER}>`,
        to: email,
        subject: 'Your OTP Verification Code',
        text: `Your OTP is: ${otp}. It will expire in 10 minutes.`,
        html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee;">
        <h2 style="color: #4A90E2;">Startup Swarm Verification</h2>
        <p>Your OTP verification code is:</p>
        <h1 style="letter-spacing: 5px; color: #333;">${otp}</h1>
        <p>This code will expire in 10 minutes.</p>
        <p>If you did not request this code, please ignore this email.</p>
      </div>
    `,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: %s', info.messageId);
        console.log('OTP for debugging: ', otp); // Log to console as requested
        return info;
    } catch (error) {
        console.error('Error sending email:', error);
        // Even if email fails, we log OTP to console as fallback for development
        console.log('OTP (Email failed): ', otp);
        throw error;
    }
};
