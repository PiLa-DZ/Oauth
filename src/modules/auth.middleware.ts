import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import env from "../lib/env.schema.js";
import { AppError } from "../errors/app.error.js";

export interface AuthenticatedRequest extends Request {
  userId?: string;
}

export const requireAuth = async (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AppError("Authorization credentials missing", 401);
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      throw new AppError("Malformed authorization token structure", 401);
    }

    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as {
      userId: string;
    };
    req.userId = decoded.userId;
    next();
  } catch (err) {
    next(new AppError("Invalid or expired authentication token context", 401));
  }
};
