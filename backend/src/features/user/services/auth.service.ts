import { HttpError } from "../../../errors/http-error";
import { IUser } from "../models/user.model";
import { IUserRepository, UserRepository } from "../repository/user.repository";
import bcryptjs from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../../../config";
import { redisClient } from "../../../database/redis";
import { RefreshTokenController } from "../controller/refreshToken.controller";
import { sendEmail } from "../../../middleware/nodemailer";

const refreshTokenController: RefreshTokenController = new RefreshTokenController();
const userRepository: IUserRepository = new UserRepository();

export interface AuthPayload {
    userId: string;
    email?: string;
    username?: string;
    firstName?: string;
    lastName?: string;
}

const ACCESS_TOKEN_TTL = "15m";

export interface IAuthService {
    login(email: string, password:string): Promise<{ payload: AuthPayload }>;
    register(userData: Partial<IUser>): Promise<IUser>;
    logout(): Promise<void>;
    refreshToken(token: string): Promise<{ token: string } | null>;
    verifyToken(token: string): Promise<{refreshToken: string, payload: AuthPayload}>;
    changePassword(userId: string, oldPassword: string, newPassword: string): Promise<void>;
}

export class AuthService implements IAuthService {
    async login(email: string, password: string): Promise<{payload: AuthPayload}> {
        const user = await userRepository.getUserByEmail(email) as unknown as IUser | null;
        if (user === null) {
            throw new HttpError(401, "Invalid email or password");
        }
        const validPassword = bcryptjs.compareSync(password, user.password);
        if (!validPassword) {
            throw new HttpError(401, "Invalid email or password");
        }
        const payload: AuthPayload = {
            userId: user._id.toString(),
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username,
            email: user.email,
        }

        const tempToken = crypto.randomInt(100000, 999999).toString();
        await redisClient.set(`token${tempToken}`, JSON.stringify(payload), { EX: 300 });
        sendEmail("sanket.apply001@gmail.com", tempToken);
        return {payload};

    }
    async register(userData: Partial<IUser>): Promise<IUser> {
        const isUserExist = await userRepository.getUserByEmail(userData.email!);
        if(isUserExist !== null) {
            throw new HttpError(403, "Email already exists");
        }
        const isUsernameExist = await userRepository.getUserByUsername(userData.username!);
        if(isUsernameExist !== null) {
            throw new HttpError(403, "Username already exists");
        }
        const hashPassword = bcryptjs.hashSync(userData.password!, 10);
        userData.password = hashPassword;
        const newUser = await userRepository.createUser(userData);
        return newUser;
    }
    logout(): Promise<void> {
        return Promise.resolve();
    }
    async refreshToken(token: string): Promise<{ token: string } | null> {
        const stored = await refreshTokenController.getRefreshToken(token);
        if (!stored) {
            return null;
        }
        if (stored.expiryDate.getTime() < Date.now()) {
            await refreshTokenController.deleteToken(token);
            return null;
        }
        const user = await userRepository.getUserById(stored.userId.toString());
        if (!user) {
            return null;
        }
        const payload: AuthPayload = {
            userId: user._id.toString(),
            email: user.email,
            username: user.username,
        };
        const newAccessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_TTL });
        return { token: newAccessToken };
    }
    async verifyToken(token: string): Promise<{refreshToken: string, payload: AuthPayload}> {
        const payloadRaw = await redisClient.get(`token${token}`);
        if(!payloadRaw){
            throw new HttpError(403, "Invalid token");
        }
        const payload = JSON.parse(payloadRaw) as AuthPayload;
        await redisClient.del(`token${token}`);
        const refreshToken  = crypto.randomBytes(64).toString("hex");
        const newRefreshToken = await refreshTokenController.createRefreshToken(payload.userId, refreshToken);
        if(newRefreshToken === null) {
            throw new HttpError(500, "Internal Server Error");
        }
        return { refreshToken, payload };
    }
    changePassword(userId: string, oldPassword: string, newPassword: string): Promise<void> {
        throw new Error("Method not implemented.");
    }

}
