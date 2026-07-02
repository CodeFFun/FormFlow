import mongoose, {  Schema, Model } from "mongoose";
import { UserType } from "../types/user.types";

const userSchema:Schema = new Schema<UserType>({
    username: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    avatarUrl: { type: String, required: false },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["admin", "user"], required: true, default: "user" },
},{
    timestamps: true,
});

export interface IUser extends UserType,Document {
    _id: mongoose.Types.ObjectId;
    createdAt:Date;
    updatedAt:Date;
} 


export const UserModel: Model<UserType> = mongoose.model<UserType>("User", userSchema);