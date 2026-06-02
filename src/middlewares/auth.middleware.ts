import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import env from "../lib/env.schema.js";
import { AppError } from "../errors/app.error.js";
import z from "zod";

// 🌐 Global Declaration Merging: Injects userId directly into the Express ecosystem
declare global {
  namespace Express {
    interface Request {
      userId?: string; // Optional because not all server routes are authenticated
    }
  }
}

const jwtPayloadSchema = z.object({
  userId: z.string(),
});

export const requireAuth = async (
  req: Request,
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

    const rowPayload = jwt.verify(token, env.JWT_ACCESS_SECRET);
    const decoded = jwtPayloadSchema.parse(rowPayload);

    req.userId = decoded.userId;

    return next();
  } catch (err) {
    if (err instanceof AppError) {
      return next(err);
    }

    if (err instanceof z.ZodError) {
      return next(
        new AppError("Invalid token structure parameters", 400, err.issues),
      );
    }

    if (err instanceof jwt.TokenExpiredError) {
      return next(
        new AppError("Your session has expired. Please log in again.", 401),
      );
    }

    if (err instanceof jwt.JsonWebTokenError) {
      return next(new AppError("Authentication token tampering detected", 401));
    }

    return next(new AppError("Internal security subsystem failure", 500));
  }
};
