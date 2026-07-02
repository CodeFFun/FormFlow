import { UserSchema } from "../types/user.types";
import z from "zod"

export const RegisterUserDto = UserSchema.pick({
    username: true,
    firstName: true,
    lastName: true,
    avatarUrl: true,
    email: true,
    password: true,
})

export type RegisterUserDto = z.infer<typeof RegisterUserDto>;

export const LoginUserDto = UserSchema.pick({
    email: true,
    password: true,
})

export type LoginUserDto = z.infer<typeof LoginUserDto>;