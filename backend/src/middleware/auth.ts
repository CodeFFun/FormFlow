import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config";
import { UnauthorizedError } from "../errors/http-error";

interface JwtPayloadShape {
  userId?: string;
  id?: string;
  sub?: string;
}

export const authenticate = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    throw new UnauthorizedError("Authentication token is missing");
  }

  const token = header.slice("Bearer ".length).trim();

  let decoded: JwtPayloadShape;
  try {
    decoded = jwt.verify(token, JWT_SECRET) as JwtPayloadShape;
  } catch {
    throw new UnauthorizedError("Invalid or expired authentication token");
  }

  const userId = decoded.userId ?? decoded.id ?? decoded.sub;
  if (!userId) {
    throw new UnauthorizedError("Invalid authentication token");
  }

  req.userId = userId;
  next();
};
