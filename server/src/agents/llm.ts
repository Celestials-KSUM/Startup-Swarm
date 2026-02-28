import { ChatGroq } from "@langchain/groq";
import config from "../config/env";

let currentKeyIndex = 0;

export const getStructuralLlm = () => {
    const keys = config.GROQ_API_KEYS;

    if (!keys || keys.length === 0) {
        throw new Error("GROQ_API_KEYS are missing. Please check your .env file.");
    }

    const apiKey = keys[currentKeyIndex];
    currentKeyIndex = (currentKeyIndex + 1) % keys.length;

    return new ChatGroq({
        apiKey: apiKey,
        model: "llama-3.3-70b-versatile",
        temperature: 0.1,
        maxRetries: 2,
        maxTokens: 1500, // Caps Groq's token footprint reservation
    });
};
