export type UserRole = "admin" | "user";

export interface User {
  _id: string;
  username: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  email: string;
  role: UserRole;
}

export interface RegisterPayload {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  avatarUrl?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface VerifyTokenResponse {
  accessToken: string;
}
