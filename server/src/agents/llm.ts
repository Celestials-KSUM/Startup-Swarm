import { ChatGroq } from "@langchain/groq";
import config from "../config/env";

export const getStructuralLlm = () => {
    return new ChatGroq({
        apiKey: config.GROQ_API_KEY,
        model: "llama-3.3-70b-versatile",
        temperature: 0.1, // Low temperature for deterministic output
    });
};
