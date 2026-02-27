import User, { IUser } from '../models/user.model';

export class AuthRepository {
    async findByEmail(email: string): Promise<IUser | null> {
        return await User.findOne({ email });
    }

    async findByGoogleId(googleId: string): Promise<IUser | null> {
        return await User.findOne({ googleId });
    }

    async createUser(userData: Partial<IUser>): Promise<IUser> {
        const user = new User(userData);
        return await user.save();
    }

    async updateUser(userId: string, updateData: Partial<IUser>): Promise<IUser | null> {
        return await User.findByIdAndUpdate(userId, updateData, { new: true });
    }

    async deleteUnverifiedUser(email: string) {
        return await User.deleteOne({ email, isVerified: false });
    }
}
