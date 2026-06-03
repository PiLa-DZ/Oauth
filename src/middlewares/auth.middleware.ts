import type { Request, Response, NextFunction } from "express";
import db from "../lib/db.js";
import { AppError } from "../errors/app.error.js";
import env from "../lib/env.schema.js";
import crypto from "crypto";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // 🛡️ Reading from signed cookies array container instead
    const rawSessionToken = req.signedCookies["sid"];

    if (!rawSessionToken) {
      throw new AppError(
        "Session container missing or cookie signature tampered",
        401,
      );
    }

    // 1. Re-hash the raw incoming token to see if we can locate its record
    const hashedSessionId = crypto
      .createHash("sha256")
      .update(rawSessionToken)
      .digest("hex");

    const session = await db.session.findUnique({
      where: { id: hashedSessionId },
    });

    if (!session) {
      throw new AppError("Invalid or revoked session context", 401);
    }

    // 2. Guard: Check if the session has expired
    if (new Date() > session.expiresAt) {
      await db.session
        .delete({ where: { id: hashedSessionId } })
        .catch(() => {});
      throw new AppError("Your session has expired. Please log in again.", 401);
    }

    // 3. 📱 SESSION HIJACKING DEFENSE: Validate that the User-Agent has not shifted
    const currentDeviceAgent = req.headers["user-agent"] || "Unknown Engine";
    if (session.userAgent !== currentDeviceAgent) {
      // High alert: Cookie stolen and used on an unauthorized device architecture!
      await db.session
        .delete({ where: { id: hashedSessionId } })
        .catch(() => {});

      res.clearCookie("sid", {
        httpOnly: true,
        secure: env.NODE_ENV === "production",
        sameSite: "strict",
      });

      throw new AppError(
        "Security alert: Device footprint shift detected. Session closed.",
        401,
      );
    }

    // 4. 🏎️ SLIDING SESSION MAINTENANCE
    const newSessionExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await db.session.update({
      where: { id: hashedSessionId },
      data: { expiresAt: newSessionExpiry },
    });

    res.cookie("sid", rawSessionToken, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "strict",
      expires: newSessionExpiry,
      signed: true, // 👈 Maintain signature wrapper through rolling updates
    });

    req.userId = session.userId;
    return next();
  } catch (err) {
    if (err instanceof AppError) return next(err);
    return next(new AppError("Internal session security failure", 500));
  }
};
