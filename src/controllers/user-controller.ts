import { Request, Response } from "express";
import { UserService } from "../services/user-service";
import { generateToken } from "../shared/helpers/jwt";

export const createUserControllerHandlers = (service: UserService) => {
  const registerUser = async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;

    try {
      if (!email || !password) {
        res.status(400).json({ message: "Email and password are required" });
        return;
      }
      const user = await service.registerUser({ email, password });
      res.status(201).json({ id: user.id });
    } catch (error: any) {
      console.error("ERRO NO REGISTRO (TERMINAL):", error);

      const status = error.message === "Email already exists" ? 409 : 500;

      res.status(status).json({
        message: error.message || "Erro desconhecido no servidor",
        details: error instanceof Error ? error.toString() : String(error),
      });
    }
  };

  const loginUser = async (req: Request, res: Response) => {
    try {
      const user = await service.validateUserLogin(
        req.body.email,
        req.body.password
      );
      const token = generateToken({ id: user.id, email: user.email });
      res.status(200).json({ token });
    } catch (error: any) {
      res.status(401).json({ message: error.message });
    }
  };

  const googleLogin = async (req: Request, res: Response) => {
    try {
      const user = await service.loginWithGoogle(req.body.googleToken);
      const token = generateToken({ id: user.id, email: user.email });
      res.status(200).json({ token });
    } catch (error: any) {
      res.status(401).json({ message: "Authentication failed" });
    }
  };

  const forgotPassword = async (req: Request, res: Response) => {
    try {
      await service.sendForgotPasswordEmail(req.body.email);
      res.status(200).json({ message: "Code sent" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };

  const resetPassword = async (req: Request, res: Response) => {
    try {
      const { email, code, password } = req.body;
      await service.resetPassword(email, code, password);
      res.status(200).json({ message: "Password updated" });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  };

  const verifyResetToken = async (req: Request, res: Response) => {
    try {
      const { email, code } = req.body;
      const ok = await service.isResetTokenValid(email, code);

      if (!ok) {
        return res
          .status(400)
          .json({ message: "Código inválido ou expirado!" });
      }
      return res.status(200).json({ message: "Código válido" });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  };

  const listUsers = async (_req: Request, res: Response) => {
    const users = await service.getAllUsers();
    res.json(users);
  };

  const getUserById = async (req: Request, res: Response) => {
    const user = await service.getUserById(req.params.id);
    user
      ? res.status(200).json(user)
      : res.status(404).json({ message: "Not found" });
  };

  return {
    registerUser,
    loginUser,
    googleLogin,
    forgotPassword,
    resetPassword,
    verifyResetToken,
    listUsers,
    getUserById,
  };
};
