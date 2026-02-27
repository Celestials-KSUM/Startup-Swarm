import { Router, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import mongoose from "mongoose";
import { createStartupSwarm, getDiscoveryInsight } from "../agents/startup_swarm";

const aiRouter = Router();

aiRouter.post("/chat", async (req: Request, res: Response) => {
    try {
        const { message, threadId } = req.body;

        if (!message) {
            res.status(400).json({ error: "message is required" });
            return;
        }

        const id = threadId || uuidv4();
        const db = mongoose.connection.db;
        if (!db) {
            res.status(500).json({ error: "Database not initialized" });
            return;
        }

        const isBlueprintRequest = message.toLowerCase().includes("blueprint") &&
            message.toLowerCase().includes("structured data");

        if (isBlueprintRequest) {
            // Run the full Agent Swarm
            const startupAgent = await createStartupSwarm();
            const inputs = {
                business_idea: message,
                messages: [],
                analysis: {},
                blueprint: {},
                execution_results: {}
            };

            const result = await startupAgent.invoke(inputs);
            const blueprintData = result.blueprint || {};
            const executionData = result.execution_results || {};

            // Map execution insights onto blueprint mapping
            blueprintData.execution = executionData;

            // Save to MongoDB -> analyses collection
            await db.collection("analyses").insertOne({
                thread_id: id,
                type: "blueprint",
                data: blueprintData,
                created_at: new Date()
            });

            // Frontend expects JSON string inside 'response' field
            res.json({ response: JSON.stringify(blueprintData) });
        } else {
            // Discovery Phase
            const insight = await getDiscoveryInsight(message);

            // Save to MongoDB -> chats collection
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

aiRouter.get("/history/:thread_id", async (req: Request, res: Response) => {
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

export default aiRouter;
