import "reflect-metadata";
import "./config/env"; // This loads the environment variables
import app from "./app";
import connectDB from "./config/db";
import logger from "./utils/logger";
import config from "./config/env";
import { startNewsletterCron } from "./cron/newsletter.cron";
import { startInstagramCron } from "./cron/instagram.cron";

const PORT = config.PORT;

const startServer = async (): Promise<void> => {
    try {
        await connectDB();

        // Start autonomous agents
        startNewsletterCron();
        startInstagramCron();

        app.listen(PORT, () => {
            logger.info(
                `🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`
            );
        });
    } catch (error) {
        logger.error("❌ Failed to start server", error);
        process.exit(1);
    }
};

startServer();
