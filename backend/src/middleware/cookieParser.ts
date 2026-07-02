import { Request, Response, NextFunction } from "express";

export const cookieParser = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const cookies: Record<string, string> = {};
  const header = req.headers.cookie;
  if (header) {
    for (const part of header.split(";")) {
      const index = part.indexOf("=");
      if (index === -1) continue;
      const key = part.slice(0, index).trim();
      const value = part.slice(index + 1).trim();
      if (key) {
        cookies[key] = decodeURIComponent(value);
      }
    }
  }
  req.cookies = cookies;
  next();
};
