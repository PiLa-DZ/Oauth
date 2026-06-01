import type { Request, Response, NextFunction } from "express";
import z from "zod";
import env from "../lib/env.schema.js";
import db from "../lib/db.js";
import { AppError } from "../errors/app.error.js";
import { generateAuthTokens } from "../lib/tokens.js";
import type { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import { googleLoginUtility } from "./google.login.utility.js";

export const googleLogin = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { token } = z.object({ token: z.string() }).parse(req.body);

    const payload = await googleLoginUtility(token, env.GOOGLE_CLIENT_ID);

    if (!payload || !payload.email) {
      throw new AppError("Google authentication verification failed", 401);
    }

    // Upsert User profile data natively based on verified email signature
    let user = await db.user.findUnique({ where: { email: payload.email } });

    if (!user) {
      user = await db.user.create({
        data: {
          email: payload.email,
          firstName: payload.given_name || "Google",
          lastName: payload.family_name || "User",
          avatarUrl: payload.picture || null,
        },
      });
    }

    const tokens = generateAuthTokens(user.id);

    await db.refreshToken.create({
      data: {
        userId: user.id,
        hashRefreshToken: tokens.hashRefreshToken,
        expiresAt: tokens.expiresAt,
      },
    });

    res.cookie("refreshToken", tokens.rawRefreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      status: "success",
      accessToken: tokens.accessToken,
    });
  } catch (err) {
    next(err);
  }
};

export const getProfile = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    // req.userId = z.string().parse(req.userId);

    const user = await db.user.findUnique({
      where: { id: req.userId },
    });

    if (!user) {
      throw new AppError("Profile reference target not found", 404);
    }

    res.status(200).json({ status: "success", data: user });
  } catch (err) {
    next(err);
  }
};
