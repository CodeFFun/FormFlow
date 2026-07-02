import { IUser, UserModel } from "../models/user.model";

export interface UserProfile {
    _id: string;
    username: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
    email: string;
}

export interface IUserRepository {
    getUserByEmail(email: string): Promise<IUser | null>;
    createUser(userData: Partial<IUser>): Promise<IUser>;
    getUserById(id: string): Promise<IUser | null>;
    getUserByUsername(username: string): Promise<IUser | null>;
    getUsersByIds(ids: string[]): Promise<UserProfile[]>;
    getAllUsers(): Promise<IUser[]>;
    updateUser(id: string, updateData: Partial<IUser>): Promise<IUser | null>;
    updateUserByAdmin(id: string, updateData: Partial<IUser>): Promise<IUser | null>;
    deleteUser(id: string): Promise<boolean>;
}

export class UserRepository implements IUserRepository {
   async getUserByEmail(email: string): Promise<IUser | null> {
        const user = await UserModel.findOne({"email": email });
        return user ? {
            _id: user._id,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            avatarUrl: user.avatarUrl,
            email: user.email,
            password: user.password,
            role: user.role,
        } as IUser : null;

    }
    async createUser(userData: Partial<IUser>): Promise<IUser> {
        const user = new UserModel(userData);
        const newUser = await user.save();
        return {
            _id: newUser._id,
            username: newUser.username,
            email: newUser.email,
        } as IUser;
    }
    async getUserById(id: string): Promise<IUser | null> {
        const user = await UserModel.findById(id);
        return user ? {
            _id: user._id,
            username: user.username,
            email: user.email,
            password: user.password,
        } as IUser : null;
    }
    async getUserByUsername(username: string): Promise<IUser | null> {
        const user = await UserModel.findOne({"username": username });
        return user ? {
            _id: user._id,
            username: user.username,
            email: user.email,
            password: user.password,
        } as IUser : null;
    }

    async getUsersByIds(ids: string[]): Promise<UserProfile[]> {
        if (ids.length === 0) return [];
        const valid = ids.filter((id) => /^[a-fA-F0-9]{24}$/.test(id));
        if (valid.length === 0) return [];
        const users = await UserModel.find({ _id: { $in: valid } });
        return users.map((user) => ({
            _id: user._id.toString(),
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            avatarUrl: user.avatarUrl,
            email: user.email,
        }));
    }

    async getAllUsers(): Promise<IUser[]> {
        const users = await UserModel.find();
        return users.map(user => ({
            _id: user._id,
            username: user.username,
            email: user.email,
        } as IUser));
    }
    async updateUser(id: string, updateData: Partial<IUser>): Promise<IUser | null> {
        const user = await UserModel.findByIdAndUpdate(id, updateData, { new: true });
        return user ? {
            _id: user._id,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            avatarUrl: user.avatarUrl,
            email: user.email,
            role: user.role,
        } as IUser : null;
    }
    async updateUserByAdmin(id: string, updateData: Partial<IUser>): Promise<IUser | null> {
        const user = await UserModel.findByIdAndUpdate(id, updateData, { new: true });
        return user ? {
            _id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
        } as IUser : null;
    }
    async deleteUser(id: string): Promise<boolean> {
        const result = await UserModel.findByIdAndDelete(id);
        return !!result;
    }

}
