import { IRefreshToken, RefreshTokenModel } from "../models/refreshToken.model";
import { RefreshTokenType } from "../types/refreshToken.type";

export interface IRefreshTokenRepository {
    createRefreshToken(tokenData: Partial<IRefreshToken>): Promise<Partial<RefreshTokenType>>;
    getRefreshToken(token: string): Promise<IRefreshToken | null>;
    deleteToken(token: string): Promise<Boolean>;
}

export class RefreshTokenRepository implements IRefreshTokenRepository {
    async createRefreshToken(tokenData: Partial<IRefreshToken>): Promise<Partial<RefreshTokenType>> {
        const token = new RefreshTokenModel(tokenData);
        const newToken = await token.save();
        return {
            token: newToken.token,
        };
    }
    async getRefreshToken(token: string): Promise<IRefreshToken | null> {
        return await RefreshTokenModel.findOne({ token: token });
    }
    async deleteToken(token: string): Promise<Boolean> {
        await RefreshTokenModel.deleteOne({ "token": token });
        return true;
    }


}