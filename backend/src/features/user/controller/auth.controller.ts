import { HttpError } from "../../../errors/http-error";
import { LoginUserDto, RegisterUserDto } from "../dtos/auth.dtos";
import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import { UserService } from "../services/user.service";
import { RefreshTokenController } from "./refreshToken.controller";
import { JWT_SECRET } from "../../../config";
import jwt from "jsonwebtoken";

const userService = new UserService();
const authService = new AuthService();
const refreshTokenController = new RefreshTokenController();

export class AuthController {
  async register(req: Request, res: Response): Promise<Response> {
    try {
      const parsedUserData = RegisterUserDto.safeParse(req.body);
      if (!parsedUserData.success) {
        throw new HttpError(400, "All required fields are not filled");
      }
      const isUserExist = await userService.getUserByEmail(
        parsedUserData.data.email,
      );
      if (isUserExist !== null) {
        throw new HttpError(403, "Email already exists");
      }
      const newUser = await authService.register(parsedUserData.data);
      return res.status(201).json({
        success: true,
        message: "User Created",
        data: newUser,
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

  async login(req: Request, res: Response): Promise<Response> {
    try {
      const parsedData = LoginUserDto.safeParse(req.body);
      if (!parsedData.success) {
        throw new HttpError(400, "Email or Password is required");
      }
      const { payload } = await authService.login(
        parsedData.data.email,
        parsedData.data.password,
      );
      if (payload === null) {
        throw new HttpError(403, "Invalid email or password");
      }
      return res
        .status(200)
        .json({
          success: true,
          message:
            "Confirmation token has been sent to the email please check your inbox",
          data: {},
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

  async logout(req: Request, res: Response): Promise<Response> {
    try {
      const token = req.cookies.refreshToken;
      if (token) {
        await refreshTokenController.deleteToken(token);
        res.clearCookie("refreshToken");
      }
      return res
        .status(200)
        .json({ success: true, message: "Logout successful" });
    } catch (err) {
      console.error(err);
      return res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    }
  }

  async refreshToken(req: Request, res: Response): Promise<Response> {
    try {
      const token = req.cookies.refreshToken;
      if (!token) {
        throw new HttpError(400, "Refresh token is required");
      }
      const newToken = await authService.refreshToken(token);
      if (newToken === null) {
        throw new HttpError(403, "Invalid refresh token");
      }
      res.cookie("accessToken", newToken.token, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
      });
      return res.status(200).json({
        success: true,
        message: "Token refreshed successfully",
        data: { accessToken: newToken.token },
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

  async verifyToken(req: Request, res: Response): Promise<Response> {
    try {
      const { token } = req.body;
      if (!token) {
        throw new HttpError(400, "Token is required");
      }
      const { refreshToken, payload } = await authService.verifyToken(token);
      if (payload === null) {
        throw new HttpError(403, "Invalid token");
      }
      const newToken = jwt.sign(payload, JWT_SECRET, { expiresIn: "15m" });
      res.cookie("accessToken", newToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 15 * 60 * 1000,
      });
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });
      return res
        .status(200)
        .json({
          success: true,
          message: "Token verified successfully",
          data: { accessToken: newToken },
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
