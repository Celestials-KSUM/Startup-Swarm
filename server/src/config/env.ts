import dotenv from "dotenv";
import path from "path";

// Load environment variables from .env file
const envPath = path.resolve(__dirname, "../../.env");
dotenv.config({ path: envPath });

export const config = {
    PORT: Number(process.env.PORT) || 5000,
    MONGO_URI: process.env.MONGO_URI || "",
    GROQ_API_KEYS: [
        process.env.GROQ_API_KEY_1,
        process.env.GROQ_API_KEY_2,
        process.env.GROQ_API_KEY_3,
        process.env.GROQ_API_KEY_4,
        process.env.GROQ_API_KEY
    ].filter((key): key is string => !!key && key.trim() !== "").map(key => key.trim()),
    NODE_ENV: process.env.NODE_ENV || "development",
    CLIENT_URL: process.env.CLIENT_URL || "http://localhost:3000",
    JWT_SECRET: process.env.JWT_SECRET || "fallback_secret",
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
    SMTP_HOST: process.env.SMTP_HOST || "smtp.gmail.com",
    SMTP_PORT: Number(process.env.SMTP_PORT) || 587,
    SMTP_USER: process.env.SMTP_USER || "",
    SMTP_PASS: process.env.SMTP_PASS || "",
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || "",
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || "",
    NEWS_DATA_API_KEY: process.env.NEWS_DATA_API_KEY || "",
    OPEN_WEB_NINJA_API_KEY: process.env.OPEN_WEB_NINJA_API_KEY || "",
    GEMINI_API_KEY: process.env.GEMINI_API_KEY || "",
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || "",
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || "",
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || "",
    RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || "",
    RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || "",
    RAPIDAPI_KEY: process.env.RAPIDAPI_KEY || "",
};

// Validation
if (!config.MONGO_URI) {
    console.error("❌ MONGO_URI is missing in .env file");
}

if (config.GROQ_API_KEYS.length === 0) {
    console.warn("⚠️ GROQ_API_KEYS are missing in .env file. AI features may fail.");
}

export default config;
