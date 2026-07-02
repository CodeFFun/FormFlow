import mongoose, {Schema, Model} from "mongoose";
import { RefreshTokenType } from "../types/refreshToken.type";

const RefreshTokenSchema = new Schema<RefreshTokenType>({
    token: { type: String, required: true },
    userId: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
    expiryDate: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    required: true
    },
});

RefreshTokenSchema.index({ expiryDate: 1 }, { expireAfterSeconds: 0 });

export interface IRefreshToken extends RefreshTokenType, Document {
    _id: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

export const RefreshTokenModel: Model<RefreshTokenType> = mongoose.model<RefreshTokenType>("RefreshToken", RefreshTokenSchema);
