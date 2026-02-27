import dotenv from "dotenv";
import path from "path";

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

export const config = {
    PORT: Number(process.env.PORT) || 5000,
    MONGO_URI: process.env.MONGO_URI || "",
    GROQ_API_KEY: process.env.GROQ_API_KEY || "",
    NODE_ENV: process.env.NODE_ENV || "development",
};

// Validation
if (!config.MONGO_URI) {
    console.error("❌ MONGO_URI is missing in .env file");
}

if (!config.GROQ_API_KEY) {
    console.warn("⚠️ GROQ_API_KEY is missing in .env file. AI features may fail.");
}

export default config;
