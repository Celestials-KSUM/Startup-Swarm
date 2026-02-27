import { Router, Request, Response } from "express";
import Website from "../models/website.model";

const startupRouter = Router();

startupRouter.get("/:slug", async (req: Request, res: Response) => {
    try {
        const { slug } = req.params;
        const website = await Website.findOne({ slug });

        if (!website) {
            res.status(404).json({ error: "Website not found" });
            return;
        }

        res.json({
            template: website.template,
            data: website.data,
            slug: website.slug
        });
    } catch (error) {
        console.error("Error fetching website:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

export default startupRouter;
