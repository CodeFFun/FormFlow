import { Request, Response, NextFunction } from "express";
import { HttpError } from "../errors/http-error";

export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const where = `${req.method} ${req.originalUrl}`;

  if (err instanceof HttpError) {
    console.warn(`[${where}] ${err.statusCode} ${err.message}`);
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
    return;
  }

  console.error(`[${where}] Unhandled error:`, err);
  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
};
