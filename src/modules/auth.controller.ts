import type { Request, Response, NextFunction } from "express";
import z from "zod";
import db from "../lib/db.js";
import { AppError } from "../errors/app.error.js";
import { generateAuthTokens } from "../lib/tokens.js";
import type { AuthenticatedRequest } from "./auth.middleware.js";

const fbSchema = z.object({ accessToken: z.string() });

export const facebookLoginController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { accessToken } = fbSchema.parse(req.body);

    // 🌐 Exchange client token directly with Facebook Graph API validation route
    const fbResponse = await fetch(
      `https://graph.facebook.com/me?fields=id,first_name,last_name,email,picture.type(large)&access_token=${accessToken}`,
    );

    const fbData = (await fbResponse.json()) as {
      email?: string;
      first_name?: string;
      last_name?: string;
      picture?: { data?: { url?: string } };
      error?: any;
    };

    if (fbData.error || !fbData.email) {
      throw new AppError("Facebook external validation authority failed", 401);
    }

    // Upsert Strategy: Find or create matching account
    let user = await db.user.findUnique({ where: { email: fbData.email } });

    if (!user) {
      user = await db.user.create({
        data: {
          email: fbData.email,
          profile: {
            create: {
              firstName: fbData.first_name || "Facebook",
              lastName: fbData.last_name || "User",
              avatarUrl: fbData.picture?.data?.url || null,
            },
          },
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
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "Authentication successful via Facebook identity token exchange",
      accessToken: tokens.accessToken,
    });
  } catch (err) {
    next(err);
  }
};

// 🔒 PROTECTED PROFILE ENDPOINT: Only opens if authentication check clears
export const getProfileController = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const profile = await db.profile.findUnique({
      where: { userId: req.userId },
      include: { user: { select: { email: true } } },
    });

    if (!profile) {
      throw new AppError(
        "Requested profile instance metadata target does not exist",
        404,
      );
    }

    res.status(200).json({
      status: "success",
      data: profile,
    });
  } catch (err) {
    next(err);
  }
};
