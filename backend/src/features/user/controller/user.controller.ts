import { Request, Response } from "express";
import { HttpError } from "../../../errors/http-error";
import { UserService } from "../services/user.service";

const userService = new UserService();

export class UserController {
  async updateAvatar(req: Request, res: Response): Promise<Response> {
    try {
      const userId = req.userId;
      if (!userId) {
        throw new HttpError(401, "Unauthorized");
      }
      const file = req.file;
      if (!file) {
        throw new HttpError(400, "An image file is required in the 'file' field");
      }

      const avatarUrl = `/uploads/${file.filename}`;
      const updated = await userService.updateAvatar(userId, avatarUrl);
      if (updated === null) {
        throw new HttpError(404, "User not found");
      }

      return res.status(200).json({
        success: true,
        message: "Avatar updated",
        data: updated,
      });
    } catch (err) {
      console.error(err);
      if (err instanceof HttpError) {
        return res
          .status(err.statusCode)
          .json({ success: false, message: err.message });
      }
      return res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    }
  }
}
