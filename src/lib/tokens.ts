import jwt from "jsonwebtoken";
import env from "./env.schema.js";
import crypto from "crypto";

export const generateAuthTokens = (userId: string) => {
  const accessToken = jwt.sign({ userId }, env.JWT_ACCESS_SECRET, {
    expiresIn: "15m",
  });

  const rawRefreshToken = crypto.randomUUID();
  const hashRefreshToken = crypto
    .createHash("sha256")
    .update(rawRefreshToken)
    .digest("hex");

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 Days

  return { accessToken, rawRefreshToken, hashRefreshToken, expiresAt };
};
