import dotenv from "dotenv"

dotenv.config()

export const PORT = process.env.PORT || "8080"
export const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/ux-project"
export const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key"
export const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
export const NODE_EMAIL = process.env.NODE_EMAIL || "";
export const NODE_PASS = process.env.NODE_PASS || "";
export const EMAIL_HOST = process.env.EMAIL_HOST || "";
export const EMAIL_PORT = process.env.EMAIL_PORT || 465;
export const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";
