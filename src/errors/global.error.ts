import type { Request, Response, NextFunction } from "express";
import { AppError } from "./app.error.js";
import { Prisma } from "../generated/prisma/client.js";

export const globalError = async (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  // 1. Contextual Mutation for Database Constraints (Prisma)
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      err = new AppError("Conflict Error: Data already exists", 409);
    } else {
      err = new AppError("Database operational transaction failure", 500);
    }
  }

  // 2. Extract standardized variables with clean operational fallbacks
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const status = err instanceof AppError ? err.status : "error";
  const message = err.message || "Internal Server Execution Exception";
  const structuralErrors = err?.errors || null;

  // 3. Log out critical bugs (500s) to your Arch terminal for easy tracing
  if (statusCode === 500) {
    // This catches raw unhandled syntax/type errors so you can debug them!
    console.error("SYSTEM CRITICAL FAILURE:", err);
  }

  // 4. Secure unified JSON delivery back to frontend application layers
  res.status(statusCode).json({
    status: status,
    message: message,
    ...(structuralErrors && { errors: structuralErrors }), // Only append if populated
    // Optional: Add stack traces during local coding runs
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
};

