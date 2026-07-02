import mongoose from "mongoose";
import { z } from "zod";

const objectIdSchema = z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: "Invalid ObjectId format",
}).transform((val) => new mongoose.Types.ObjectId(val));

export const RefreshTokenSchema = z.object({
    token: z.string().min(1, "Token is required"),
    userId: objectIdSchema,
    expiryDate: z.date(),

})

export type RefreshTokenType = z.infer<typeof RefreshTokenSchema>;