import { Router, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import mongoose from "mongoose";
import { createStartupSwarm, getDiscoveryInsight } from "../agents/startup_swarm";
import { authMiddleware, AuthRequest, requireAuth } from "../middlewares/auth.middleware";
import User from "../models/user.model";

const aiRouter = Router();

aiRouter.use(authMiddleware);

aiRouter.post("/chat", async (req: AuthRequest, res: Response) => {
    try {
        const { message, threadId, structuredData } = req.body;

        if (!message && !structuredData) {
            res.status(400).json({ error: "message or structuredData is required" });
            return;
        }

        const id = threadId || uuidv4();
        const db = mongoose.connection.db;
        if (!db) {
            res.status(500).json({ error: "Database not initialized" });
            return;
        }

        const isBlueprintRequest = (message && message.toLowerCase().includes("blueprint")) || structuredData;

        // SUBSCRIPTION CHECK BEFORE GENERATION
        if (isBlueprintRequest) {
            if (!req.user || !req.user.id) {
                return res.status(401).json({ error: "Unauthorized" });
            }

            const userParams = await User.findById(req.user.id);
            if (!userParams) {
                return res.status(404).json({ error: "User not found" });
            }

            // Reset logic for new month
            const cycleStart = new Date(userParams.cycleStartDate);
            const now = new Date();
            const daysSinceStart = Math.floor((now.getTime() - cycleStart.getTime()) / (1000 * 60 * 60 * 24));

            if (daysSinceStart >= 30) {
                userParams.startupsCountThisMonth = 0;
                userParams.cycleStartDate = now;
                await userParams.save();
            }

            // Check limits based on plan
            const planLimits = {
                free: 1,
                pro: 3,
                pro_plus: 5
            };
            const userLimit = planLimits[userParams.subscriptionPlan || "free"];

            if (userParams.startupsCountThisMonth >= userLimit) {
                return res.status(403).json({
                    error: "LIMIT_REACHED",
                    message: `You have reached your ${userLimit} startup limit for the ${userParams.subscriptionPlan.toUpperCase()} plan this month. Please upgrade your plan.`
                });
            }
        }

        if (isBlueprintRequest) {
            // Run the full Agent Swarm
            const startupAgent = await createStartupSwarm();

            // If structuredData is provided, use it to build a rich context
            const businessIdea = structuredData
                ? `Structured Startup Data:\n${JSON.stringify(structuredData, null, 2)}`
                : message;

            const inputs = {
                business_idea: businessIdea,
                messages: [],
                analysis: {},
                blueprint: {},
                execution_results: {}
            };

            const result = await startupAgent.invoke(inputs);
            const blueprintData = result.blueprint || {};
            const executionData = result.execution_results || {};

            blueprintData.execution = executionData;

            // Save to MongoDB -> analyses collection
            await db.collection("analyses").insertOne({
                thread_id: id,
                user_id: req.user?.id || null, // Link to user if authenticated
                type: "blueprint",
                input_data: structuredData || message,
                data: blueprintData,
                created_at: new Date()
            });

            // If website_builder result exists, save to Websites collection
            if (executionData.website_builder && !executionData.website_builder.error) {
                const WebsiteModel = (await import("../models/website.model")).default;
                const websiteData = executionData.website_builder;

                await WebsiteModel.findOneAndUpdate(
                    { slug: websiteData.slug },
                    {
                        slug: websiteData.slug,
                        owner_thread_id: id,
                        user_id: req.user?.id || null, // Link to user
                        template: websiteData.template,
                        data: websiteData.config,
                        created_at: new Date()
                    },
                    { upsert: true, new: true }
                );
            }

            res.json({ response: JSON.stringify(blueprintData), thread_id: id });
        } else {
            // Discovery Phase
            const insight = await getDiscoveryInsight(message);

            await db.collection("chats").insertOne({
                thread_id: id,
                role: "assistant",
                content: insight,
                created_at: new Date()
            });

            res.json({ response: insight });
        }
    } catch (error) {
        console.error("Chat Error:", error);
        res.status(500).json({ error: "Internal Server Error", details: error instanceof Error ? error.message : "Unknown error" });
    }
});

aiRouter.post("/analyze", async (req: Request, res: Response) => {
    // Forward to chat backward compatible
    res.redirect(307, "/api/ai/chat");
});

aiRouter.get("/history/:thread_id", async (req: AuthRequest, res: Response) => {
    try {
        const threadId = req.params.thread_id;
        const db = mongoose.connection.db;

        if (!db) {
            res.status(500).json({ error: "Database not initialized" });
            return;
        }

        const cursor = db.collection("analyses").find({ thread_id: threadId }).sort({ created_at: -1 }).limit(10);
        const rows = await cursor.toArray();

        const analyses = rows.map(record => {
            const idStr = record._id.toString();
            const { _id, ...rest } = record;
            return {
                ...rest,
                id: idStr,
                created_at: record.created_at ? new Date(record.created_at).toISOString() : null
            };
        });

        res.json(analyses);
    } catch (error) {
        console.error("History Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

aiRouter.get("/my-history", requireAuth, async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const db = mongoose.connection.db;

        if (!db) {
            res.status(500).json({ error: "Database not initialized" });
            return;
        }

        const cursor = db.collection("analyses").find({ user_id: userId, type: "blueprint" }).sort({ created_at: -1 });
        const rows = await cursor.toArray();

        const analyses = rows.map(record => {
            const idStr = record._id.toString();
            const { _id, ...rest } = record;
            return {
                ...rest,
                id: idStr,
                created_at: record.created_at ? new Date(record.created_at).toISOString() : null
            };
        });

        res.json(analyses);
    } catch (error) {
        console.error("My History Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

export default aiRouter;
