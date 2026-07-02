import { RefreshTokenService } from "../services/refreshToken.service";
import mongoose from "mongoose";
import { HttpError } from "../../../errors/http-error";
import { IRefreshToken } from "../models/refreshToken.model";
import { RefreshTokenType } from "../types/refreshToken.type";

const refreshService = new RefreshTokenService();

export class RefreshTokenController{
    async createRefreshToken(userId: string, token: string): Promise<Partial<RefreshTokenType>> {
        try{
            const user = new mongoose.Types.ObjectId(userId);
            return await refreshService.createRefreshToken({ userId: user, token: token });
        }catch(err){
            throw new HttpError(500, "Failed to create refresh token");
        }
    }

    async getRefreshToken(token: string) {
        try{
            return await refreshService.getRefreshToken(token);
        }catch(err){
            throw new HttpError(500, "Failed to get refresh token");
        }
    }

    async deleteToken(token: string): Promise<void> {
        try{
            await refreshService.deleteToken(token);
        }catch(err){
            throw new HttpError(500, "Failed to delete refresh token");
        }
    }
}