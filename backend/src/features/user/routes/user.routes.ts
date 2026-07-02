import express, { Router } from "express";
import { authenticate } from "../../../middleware/auth";
import { uploadImage } from "../../../middleware/upload";
import { UserController } from "../controller/user.controller";

const router: Router = express.Router();
const userController = new UserController();


router.patch("/avatar", authenticate, uploadImage, userController.updateAvatar);

export default router;
