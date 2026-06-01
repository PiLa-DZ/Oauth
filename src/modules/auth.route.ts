import express from "express";
import { facebookLogin, getProfile } from "./auth.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/auth/facebook", facebookLogin); // 👈 Route renamed
router.get("/users/profile", requireAuth, getProfile);

export default router;
