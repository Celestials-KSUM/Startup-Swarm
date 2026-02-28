import { Router, Response } from "express";
import { authMiddleware, AuthRequest } from "../middlewares/auth.middleware";
import User from "../models/user.model";

const router = Router();

router.post("/instagram", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const { instagramAccountId, instagramAccessToken } = req.body;

        if (!req.user || !req.user.id) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        if (!instagramAccountId || !instagramAccessToken) {
            return res.status(400).json({ error: "Instagram Account ID and Access Token are required." });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }

        if (user.subscriptionPlan !== "pro_plus") {
            return res.status(403).json({ error: "UPGRADE_REQUIRED", message: "Instagram Autonomous Marketing is a PRO+ exclusive feature. Please upgrade your plan." });
        }

        user.instagramAccountId = instagramAccountId;
        user.instagramAccessToken = instagramAccessToken;
        await user.save();

        res.json({ message: "Instagram connected successfully!" });
    } catch (error) {
        console.error("Failed to connect Instagram:", error);
        res.status(500).json({ error: "Internal server error connecting Instagram." });
    }
});

export default router;
