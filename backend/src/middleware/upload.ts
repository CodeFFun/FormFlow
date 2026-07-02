import { Request, Response, NextFunction } from "express";
import path from "path";
import fs from "fs";
import multer from "multer";
import { randomUUID } from "crypto";
import { BadRequestError } from "../errors/http-error";

export const UPLOAD_DIR = path.join(__dirname, "..", "..", "uploads");

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_MIME_PREFIX = "image/";

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    cb(null, UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${randomUUID()}${ext}`);
  },
});

const fileFilter: multer.Options["fileFilter"] = (_req, file, cb) => {
  if (file.mimetype.startsWith(ALLOWED_MIME_PREFIX)) {
    cb(null, true);
  } else {
    cb(new BadRequestError("Only image uploads are allowed"));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
}).single("file");

export const uploadImage = (req: Request, res: Response, next: NextFunction): void => {
  upload(req, res, (err: unknown) => {
    if (err instanceof multer.MulterError) {
      next(new BadRequestError(err.message));
      return;
    }
    if (err) {
      next(err);
      return;
    }
    next();
  });
};
