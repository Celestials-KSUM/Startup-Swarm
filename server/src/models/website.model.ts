import mongoose, { Schema, Document } from "mongoose";

export interface IWebsite extends Document {
    slug: string;
    owner_thread_id: string;
    template: "service" | "saas" | "ecommerce" | "local" | "corporate";
    data: any;
    created_at: Date;
}

const WebsiteSchema: Schema = new Schema({
    slug: { type: String, required: true, unique: true },
    owner_thread_id: { type: String, required: true },
    template: { type: String, required: true },
    data: { type: Schema.Types.Mixed, required: true },
    created_at: { type: Date, default: Date.now }
});

export default mongoose.model<IWebsite>("Website", WebsiteSchema);
