import cron from "node-cron";
import mongoose from "mongoose";
import axios from "axios";
import config from "../config/env";
import User from "../models/user.model";
import { ChatGroq } from "@langchain/groq";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import cloudinary from "../config/cloudinary";

export const executeInstagramGrowthAgent = async () => {
    console.log("📸 Executing Instagram Growth Agent logic...");

    try {
        const users = await User.find({
            instagramAccountId: { $exists: true, $ne: "" },
            instagramAccessToken: { $exists: true, $ne: "" }
        });

        const db = mongoose.connection.db;
        if (!db) return;

        const apiKey = config.GROQ_API_KEY.trim();
        if (!apiKey) return;

        const llm = new ChatGroq({
            apiKey: apiKey,
            model: "llama-3.3-70b-versatile",
            temperature: 0.8, // Slightly higher for organic marketing creativity
        });

        for (const user of users) {
            try {
                // Find latest business structure
                const analysisDoc = await db.collection("analyses").findOne(
                    { $or: [{ user_id: user.id }, { user_id: user._id.toString() }], type: "blueprint" },
                    { sort: { _id: -1 } }
                );

                if (!analysisDoc || !analysisDoc.data) continue;

                const data = analysisDoc.data;
                const businessName = data.businessOverview?.name || "Our Startup";
                const industry = data.businessOverview?.industry || "Technology";
                const valueProp = data.businessOverview?.valueProposition || "Innovating the future.";

                console.log(`🤖 Marketing Agent formulating content for: ${businessName}`);

                // 1) Agent decides today's content theme & generates an image prompt
                const prompt = `
You are the elite Growth Marketing Agent for a startup named "${businessName}" working in "${industry}".
Value Proposition: "${valueProp}"

Your task is to craft ONE high-engagement Instagram post. 
Decide a specific, engaging core theme (e.g. informative tip, motivational visionary quote, aesthetic product highlight).

Output MUST be strictly JSON. No markdown wrappers. Nothing else.
Format:
{
  "image_prompt": "A highly detailed, aesthetic AI image generation prompt (e.g. minimalist modern office, neon cyberpunk technology, cinematic lighting, photorealistic). Needs to visually represent the theme without text.",
  "caption": "The instagram caption including compelling copywriting, spacing, emojis, and 5-10 targeted #hashtags."
}
`;

                const response = await llm.invoke([
                    new SystemMessage({ content: "You strictly output precise valid JSON. No backticks." }),
                    new HumanMessage({ content: prompt })
                ]);

                let rawRes = typeof response.content === "string" ? response.content.replace(/```json/gi, "").replace(/```/gi, "").trim() : "{}";
                let decision;
                try {
                    decision = JSON.parse(rawRes);
                } catch (e) {
                    console.error("Agent hallucinates invalid JSON:", rawRes);
                    continue; // Skip user if invalid JSON
                }

                // 2) Generate Image (Free via Pollinations AI)
                const safePrompt = encodeURIComponent(decision.image_prompt);
                const pollinationsUrl = `https://image.pollinations.ai/prompt/${safePrompt}?width=1080&height=1080&nologo=true`;

                console.log(`🎨 Polling image generator for prompt: ${decision.image_prompt}`);

                // 3) Host permanently on Cloudinary
                const cloudRes = await cloudinary.uploader.upload(pollinationsUrl, {
                    folder: "startup_swarm_marketing",
                    public_id: `${user._id}_${Date.now()}`
                });

                const hostedImageUrl = cloudRes.secure_url;
                console.log(`☁️ Image hosted on Cloudinary: ${hostedImageUrl}`);

                // 4) Post to Instagram Graph API
                const igAccountId = user.instagramAccountId;
                const igToken = user.instagramAccessToken;

                // 4.1 Create Media Container
                const mediaUrl = `https://graph.facebook.com/v19.0/${igAccountId}/media`;
                const containerRes = await axios.post(mediaUrl, null, {
                    params: {
                        image_url: hostedImageUrl,
                        caption: decision.caption,
                        access_token: igToken
                    }
                });

                const creationId = containerRes.data.id;

                // 4.2 Publish Media Container
                const publishUrl = `https://graph.facebook.com/v19.0/${igAccountId}/media_publish`;
                await axios.post(publishUrl, null, {
                    params: {
                        creation_id: creationId,
                        access_token: igToken
                    }
                });

                console.log(`✅ Successfully published Instagram post for ${businessName}!`);

            } catch (userErr: any) {
                console.error(`❌ Failed marketing flow for user ${user.email}:`, userErr.response?.data || userErr.message);
            }
        }

    } catch (error) {
        console.error("Instagram Cron massive failure:", error);
    }
};

export const startInstagramCron = () => {
    // Run daily at 12:00 PM for maximum engagement
    cron.schedule("0 12 * * *", async () => {
        await executeInstagramGrowthAgent();
    });

    console.log("📱 Autonomous Instagram Growth Agent scheduled.");
};
