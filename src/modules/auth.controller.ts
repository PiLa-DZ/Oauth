import type { Request, Response, NextFunction } from "express";
import z from "zod";
import env from "../lib/env.schema.js";
import db from "../lib/db.js";
import { AppError } from "../errors/app.error.js";
import crypto from "crypto";
import { facebookLoginUtility } from "./facebook.login.utility.js";

export const facebookLogin = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { token } = z.object({ token: z.string() }).parse(req.body);
    const payload = await facebookLoginUtility(token);

    // 1. Find or create user
    let user = await db.user.findUnique({
      where: { facebookId: payload.id },
    });

    if (!user) {
      user = await db.user.create({
        data: {
          facebookId: payload.id,
          email: payload.email || null,
          firstName: payload.first_name,
          lastName: payload.last_name || null,
          avatarUrl: payload.picture?.data.url || null,
        },
      });
    }

    // 2. Generate cryptographically strong unique Session Token
    const rawSessionToken = crypto.randomBytes(32).toString("hex");

    // 3. 🛡️ HASH SESSION ID: One-way hash the token before it lands in MariaDB
    const hashedSessionId = crypto
      .createHash("sha256")
      .update(rawSessionToken)
      .digest("hex");

    const sessionExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 Hours

    // 4. 📱 SESSION HIJACKING DEFENSE: Extract user agent string
    const userAgentFingerprint = req.headers["user-agent"] || "Unknown Engine";

    // 5. Persist Hashed footprint to DB
    await db.session.create({
      data: {
        id: hashedSessionId, // Storing only the cryptographic hash
        userId: user.id,
        userAgent: userAgentFingerprint, // Anchoring the session to this device
        expiresAt: sessionExpiry,
      },
    });

    // 6. 🧼 IMPLEMENT SIGNED COOKIES: Send RAW token out, but sign it cryptographically
    res.cookie("sid", rawSessionToken, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "strict",
      expires: sessionExpiry,
      signed: true, // 👈 Tells express to append the HMAC signature automatically
    });

    return res.status(200).json({
      status: "success",
      message: "Secure hashed session array built successfully",
    });
  } catch (err) {
    return next(err);
  }
};

export const getProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const currentUserId = req.userId;

    if (!currentUserId) {
      throw new AppError("Authentication required context missing", 401);
    }

    const user = await db.user.findUnique({
      where: { id: currentUserId },
    });

    if (!user) {
      throw new AppError("Profile reference target not found", 404);
    }

    return res.status(200).json({ status: "success", data: user });
  } catch (err) {
    return next(err);
  }
};

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const rawSessionToken = req.signedCookies["sid"]; // 👈 Switch to signed container

    if (rawSessionToken) {
      const hashedSessionId = crypto
        .createHash("sha256")
        .update(rawSessionToken)
        .digest("hex");

      await db.session
        .delete({
          where: { id: hashedSessionId },
        })
        .catch(() => {});
    }

    res.clearCookie("sid", {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return res.status(200).json({
      status: "success",
      message: "Session terminated cleanly across infrastructure arrays",
    });
  } catch (err) {
    return next(err);
  }
};
