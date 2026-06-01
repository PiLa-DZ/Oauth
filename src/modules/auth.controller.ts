import type { Request, Response, NextFunction } from "express";
import z from "zod";
import env from "../lib/env.schema.js";
import db from "../lib/db.js";
import { AppError } from "../errors/app.error.js";
import { generateAuthTokens } from "../lib/tokens.js";
import type { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import { facebookLoginUtility } from "./facebook.login.utility.js";

export const facebookLogin = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { token } = z.object({ token: z.string() }).parse(req.body);

    const payload = await facebookLoginUtility(token);

    // 🛡️ Query uniquely using the immutable facebookId string
    let user = await db.user.findUnique({
      where: { facebookId: payload.id },
    });

    if (!user) {
      user = await db.user.create({
        data: {
          facebookId: payload.id,
          email: payload.email || null, // Gracefully fallback if phone-registered account
          firstName: payload.first_name,
          lastName: payload.last_name || null,
          avatarUrl: payload.picture?.data.url || null,
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

    return res.status(200).json({
      status: "success",
      accessToken: tokens.accessToken,
    });
  } catch (err) {
    return next(err);
  }
};

export const getProfile = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = await db.user.findUnique({
      where: { id: req.userId },
    });

    if (!user) {
      throw new AppError("Profile reference target not found", 404);
    }

    return res.status(200).json({ status: "success", data: user });
  } catch (err) {
    return next(err);
  }
};
