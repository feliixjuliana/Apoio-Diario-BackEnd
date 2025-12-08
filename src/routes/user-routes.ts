import express from "express";
import { PostgresUserRepository } from "../repositories/postgres-user-repository";
import { createUserControllerHandlers } from "../controllers/user-controller";
import { UserService } from "../services/user-service";
import { authenticate } from "../shared/middlewares/authMiddlewares";

const router = express.Router();

const userRepository = new PostgresUserRepository();
const userService = new UserService(userRepository);
const userController = createUserControllerHandlers(userService);

router.post("/auth/register", userController.registerUser);
router.post("/auth/login", userController.loginUser);
router.post("/auth/google", userController.googleLogin);
router.post("/auth/forgot-password", userController.forgotPassword);
router.post("/auth/reset-password", userController.resetPassword);
router.post("/auth/validate-reset-token", userController.verifyResetToken);

router.get("/users", authenticate, userController.listUsers);
router.get("/users/:id", authenticate, userController.getUserById);

export default router;
