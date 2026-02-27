import { ChatGroq } from "@langchain/groq";
import config from "../config/env";

export const getStructuralLlm = () => {
    const apiKey = config.GROQ_API_KEY || process.env.GROQ_API_KEY;

    if (!apiKey) {
        throw new Error("GROQ_API_KEY is missing. Please check your .env file.");
    }

    return new ChatGroq({
        apiKey: apiKey.trim(),
        model: "llama-3.3-70b-versatile",
        temperature: 0.1,
    });
};
