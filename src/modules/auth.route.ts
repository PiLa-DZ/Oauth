import express from "express";
import { googleLogin, getProfile } from "./auth.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/auth/google", googleLogin);
router.get("/users/profile", requireAuth, getProfile);

export default router;
