import { Request, Response, RequestHandler } from "express";
import { asyncHandler } from "../../../utils/asyncHandler";
import * as commentService from "../services/comment.service";

const requireUserId = (req: Request): string => req.userId as string;

const param = (req: Request, name: string): string => {
  const value = req.params[name];
  return Array.isArray(value) ? value[0] : value;
};

export const addComment: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const comment = await commentService.addComment(
    requireUserId(req),
    param(req, "formId"),
    req.body
  );
  res.status(201).json({ success: true, data: comment });
});

export const listComments: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const comments = await commentService.listComments(
    requireUserId(req),
    param(req, "formId")
  );
  res.status(200).json({ success: true, data: comments });
});

export const resolveComment: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const comment = await commentService.resolveComment(
    requireUserId(req),
    param(req, "formId"),
    param(req, "commentId")
  );
  res.status(200).json({ success: true, data: comment });
});

export const deleteComment: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  await commentService.deleteComment(
    requireUserId(req),
    param(req, "formId"),
    param(req, "commentId")
  );
  res.status(200).json({ success: true, message: "Comment deleted" });
});
