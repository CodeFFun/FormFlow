import { IUser } from "../models/user.model";
import { UserProfile, UserRepository } from "../repository/user.repository";

const userRepo = new UserRepository();

export class UserService {
    async getUserByEmail(email: string) {
        const user =  await userRepo.getUserByEmail(email);
        return user
    }

    async getProfilesByIds(ids: string[]): Promise<UserProfile[]> {
        return userRepo.getUsersByIds(ids);
    }

    async updateAvatar(userId: string, avatarUrl: string): Promise<IUser | null> {
        return userRepo.updateUser(userId, { avatarUrl });
    }
}
