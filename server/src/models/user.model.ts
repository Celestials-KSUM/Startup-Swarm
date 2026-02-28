import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
    email: string;
    password?: string;
    isVerified: boolean;
    otp?: string;
    otpExpiresAt?: Date;
    googleId?: string;
    avatar?: string;
    instagramAccountId?: string;
    instagramAccessToken?: string;
    subscriptionPlan: "free" | "pro" | "pro_plus";
    subscriptionExpiresAt?: Date;
    startupsCountThisMonth: number;
    cycleStartDate: Date;
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema: Schema = new Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
        },
        password: {
            type: String,
            required: function (this: IUser) {
                return !this.googleId;
            },
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
        otp: {
            type: String,
        },
        otpExpiresAt: {
            type: Date,
        },
        googleId: {
            type: String,
            unique: true,
            sparse: true,
        },
        avatar: {
            type: String,
        },
        instagramAccountId: {
            type: String,
        },
        instagramAccessToken: {
            type: String,
        },
        subscriptionPlan: {
            type: String,
            enum: ["free", "pro", "pro_plus"],
            default: "free",
        },
        subscriptionExpiresAt: {
            type: Date,
        },
        startupsCountThisMonth: {
            type: Number,
            default: 0,
        },
        cycleStartDate: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

export default mongoose.model<IUser>('User', UserSchema);
