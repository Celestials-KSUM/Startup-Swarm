import { Router, Response } from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import { authMiddleware, AuthRequest } from "../middlewares/auth.middleware";
import User from "../models/user.model";
import config from "../config/env";

const router = Router();

// Pricing map (in INR rupees)
const PRICING = {
    pro: 149,
    pro_plus: 249
};

const getRazorpayInstance = () => {
    if (!config.RAZORPAY_KEY_ID || !config.RAZORPAY_KEY_SECRET) {
        throw new Error("Razorpay credentials missing");
    }
    return new Razorpay({
        key_id: config.RAZORPAY_KEY_ID,
        key_secret: config.RAZORPAY_KEY_SECRET
    });
};

/**
 * Creates a Razorpay Order
 */
router.post("/create-order", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const { planId } = req.body; // 'pro' or 'pro_plus'

        if (planId !== 'pro' && planId !== 'pro_plus') {
            return res.status(400).json({ error: "Invalid plan selected" });
        }

        const amount = PRICING[planId as keyof typeof PRICING] * 100; // Razorpay expects amount in paise (multiply by 100)

        const rzp = getRazorpayInstance();

        const options = {
            amount: amount,
            currency: "INR",
            receipt: `rcpt_${Date.now().toString().slice(-8)}_${req.user?.id?.substring(18)}`
        };

        const order = await rzp.orders.create(options);

        res.json({
            success: true,
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            keyId: config.RAZORPAY_KEY_ID
        });

    } catch (error: any) {
        console.error("Error creating Razorpay order:", error);
        res.status(500).json({ error: "Failed to create payment order" });
    }
});

/**
 * Verifies successful payment and upgrades user
 */
router.post("/verify", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planId } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !planId) {
            return res.status(400).json({ error: "Missing payment payload" });
        }

        // Verify Signature
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac("sha256", config.RAZORPAY_KEY_SECRET as string)
            .update(body.toString())
            .digest("hex");

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({ error: "Invalid payment signature" });
        }

        // Payment is valid! Upgrade the user.
        const user = await User.findById(req.user?.id);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        user.subscriptionPlan = planId as "pro" | "pro_plus";

        // Subscription lasts for 30 days
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        user.subscriptionExpiresAt = thirtyDaysFromNow;

        await user.save();

        res.json({ success: true, message: `Successfully upgraded to ${planId.toUpperCase()}!` });
    } catch (error: any) {
        console.error("Payment verification failed:", error);
        res.status(500).json({ error: "Payment verification failed" });
    }
});

/**
 * Gets the current user's subscription details
 */
router.get("/me", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const user = await User.findById(req.user?.id);
        if (!user) return res.status(404).json({ error: "User not found" });

        // Check if subscription expired
        let isExpired = false;
        if (user.subscriptionPlan !== "free" && user.subscriptionExpiresAt) {
            if (new Date() > user.subscriptionExpiresAt) {
                isExpired = true;
                // Downgrade back to free
                user.subscriptionPlan = "free";
                user.subscriptionExpiresAt = undefined;
                await user.save();
            }
        }

        res.json({
            plan: user.subscriptionPlan,
            expiresAt: user.subscriptionExpiresAt,
            startupsCountThisMonth: user.startupsCountThisMonth,
            cycleStartDate: user.cycleStartDate
        });

    } catch (error) {
        res.status(500).json({ error: "Server error checking subscription" });
    }
});

export default router;
