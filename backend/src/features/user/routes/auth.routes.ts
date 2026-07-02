import express, { Router } from "express";
import { AuthController } from "../controller/auth.controller";

const router:Router = express.Router();
const authController = new AuthController();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/logout", authController.logout);
router.post("/refresh-token", authController.refreshToken);
router.post("/verify-token", authController.verifyToken);

export default router;