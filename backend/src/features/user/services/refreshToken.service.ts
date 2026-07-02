import { IRefreshToken } from "../models/refreshToken.model";
import { RefreshTokenRepository } from "../repository/refreshToken.repository";
import { RefreshTokenType } from "../types/refreshToken.type";

const refreshRepo = new RefreshTokenRepository();

export class RefreshTokenService {
    async createRefreshToken(tokenData: Partial<IRefreshToken>): Promise<Partial<RefreshTokenType>> {
        return await refreshRepo.createRefreshToken(tokenData);
    }
    async getRefreshToken(token: string): Promise<IRefreshToken | null> {
        return await refreshRepo.getRefreshToken(token);
    }
    async deleteToken(token: string): Promise<void> {
        await refreshRepo.deleteToken(token);
    }
}