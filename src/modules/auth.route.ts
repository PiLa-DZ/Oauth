import express from "express";
import { facebookLogin, getProfile, logout } from "./auth.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/auth/facebook", facebookLogin); // 👈 Route renamed
router.get("/users/profile", requireAuth, getProfile);
router.post("/auth/logout", requireAuth, logout); // 👈 Added secure POST logout line

export default router;
