import express from "express";
import { globalError } from "./errors/global.error.js";
import cookieParser from "cookie-parser";
import authRoutes from "./modules/auth.route.js";

const app = express();

app.use(express.json());
app.use(cookieParser());

// 🔌 Mount sub-module routing blocks
app.use("/api", authRoutes);

app.use(globalError);

export default app;
