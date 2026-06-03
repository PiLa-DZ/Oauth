import type { Request, Response, NextFunction } from "express";
import db from "../lib/db.js";
import cache from "../lib/cache.js"; // 👈 Add Cache Import
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
    const rawSessionToken = req.signedCookies["sid"];

    if (!rawSessionToken) {
      throw new AppError(
        "Session container missing or cookie signature tampered",
        401,
      );
    }

    const hashedSessionId = crypto
      .createHash("sha256")
      .update(rawSessionToken)
      .digest("hex");

    let sessionUserId: string | null = null;
    let sessionUserAgent: string | null = null;

    // ⚡ 1. RUN IN-MEMORY CACHE LOOKUP CACHE-FIRST
    const cachedSession = await cache.get(`session:${hashedSessionId}`);

    if (cachedSession) {
      // 🎉 CACHE HIT: Parse RAM payload string instantly (< 1ms)
      const parsed = JSON.parse(cachedSession);
      sessionUserId = parsed.userId;
      sessionUserAgent = parsed.userAgent;
    } else {
      // 💾 CACHE MISS: Fall back to disk scan on MariaDB
      const dbSession = await db.session.findUnique({
        where: { id: hashedSessionId },
      });

      if (!dbSession) {
        throw new AppError("Invalid or revoked session context", 401);
      }

      if (new Date() > dbSession.expiresAt) {
        await db.session
          .delete({ where: { id: hashedSessionId } })
          .catch(() => {});
        throw new AppError(
          "Your session has expired. Please log in again.",
          401,
        );
      }

      sessionUserId = dbSession.userId;
      sessionUserAgent = dbSession.userAgent;

      // 🔄 Repopulate the cache array so the next request hits RAM
      await cache.setEx(
        `session:${hashedSessionId}`,
        24 * 60 * 60,
        JSON.stringify({ userId: sessionUserId, userAgent: sessionUserAgent }),
      );
    }

    // 🔒 TYPE GUARD: Ensure variables are strictly populated strings before continuing
    if (!sessionUserId || !sessionUserAgent) {
      throw new AppError(
        "Failed to parse or reconstruct valid session properties",
        401,
      );
    }

    // 📱 2. HIJACKING DEFENSE DETECTOR
    const currentDeviceAgent = req.headers["user-agent"] || "Unknown Engine";
    if (sessionUserAgent !== currentDeviceAgent) {
      await db.session
        .delete({ where: { id: hashedSessionId } })
        .catch(() => {});
      await cache.del(`session:${hashedSessionId}`).catch(() => {});

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

    // 🏎️ 3. ROLLING SLIDING SESSION LIFECYCLE
    const newSessionExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Asynchronously roll updates down to database and cache without blocking execution lines
    db.session
      .update({
        where: { id: hashedSessionId },
        data: { expiresAt: newSessionExpiry },
      })
      .catch(() => {});

    cache
      .setEx(
        `session:${hashedSessionId}`,
        24 * 60 * 60,
        JSON.stringify({ userId: sessionUserId, userAgent: sessionUserAgent }),
      )
      .catch(() => {});

    res.cookie("sid", rawSessionToken, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "strict",
      expires: newSessionExpiry,
      signed: true,
    });

    req.userId = sessionUserId;
    return next();
  } catch (err) {
    if (err instanceof AppError) return next(err);
    return next(new AppError("Internal session security failure", 500));
  }
};
