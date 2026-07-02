import { randomBytes, createHash } from "crypto";

export const generateToken = (bytes = 32): string =>
  randomBytes(bytes).toString("hex");

export const hashToken = (token: string): string =>
  createHash("sha256").update(token).digest("hex");
