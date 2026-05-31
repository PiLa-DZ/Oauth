import express from "express";
import {
  facebookLoginController,
  getProfileController,
} from "./auth.controller.js";
import { requireAuth } from "./auth.middleware.js";

const router = express.Router();

router.post("/auth/facebook", facebookLoginController);
router.get("/users/profile", requireAuth, getProfileController);

export default router;
