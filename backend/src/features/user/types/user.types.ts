import z from "zod"

export const UserRole = z.enum(["admin", "user"]);

export const UserSchema = z.object({
    username: z.string().min(2).max(100),
    firstName: z.string().min(2).max(100),
    lastName: z.string().min(2).max(100),
    avatarUrl: z.string().url().optional(),
    email: z.email(),
    password: z.string().min(6).max(100),
    role: UserRole
})

export type UserType = z.infer<typeof UserSchema>;
