import express from "express";

import {
  signup,
  login,
  verifyOtp,
} from "../controllers/auth.controller.js";

import validate from "../middleware/validation.middleware.js";

import {
  signupSchema,
  loginSchema,
  verifyOtpSchema,
} from "../validators/auth.validator.js";

const router = express.Router();

router.post(
  "/signup",
  validate(signupSchema),
  signup
);

router.post(
  "/login",
  validate(loginSchema),
  login
);

router.post(
  "/verify-otp",
  validate(verifyOtpSchema),
  verifyOtp
);

export default router;