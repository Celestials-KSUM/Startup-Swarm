import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
    email: string;
    password?: string;
    isVerified: boolean;
    otp?: string;
    otpExpiresAt?: Date;
    googleId?: string;
    avatar?: string;
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
    },
    { timestamps: true }
);

export default mongoose.model<IUser>('User', UserSchema);
