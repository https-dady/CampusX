import express from "express";

import {
  signup,
  login,
  verifyOtp,
  resendOtp,
  googleAuth,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
} from "../controllers/auth.controller.js";

import validate from "../middleware/validation.middleware.js";

import {
  signupSchema,
  loginSchema,
  verifyOtpSchema,
  googleAuthSchema,
  forgotPasswordSchema,
  verifyResetOtpSchema,
  resetPasswordSchema,
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

router.post(
  "/resend-otp",
  validate(
    verifyOtpSchema.pick({
      email: true,
    })
  ),
  resendOtp
);

router.post(
  "/google",
  validate(googleAuthSchema),
  googleAuth
);

router.post(
  "/forgot-password",
  validate(forgotPasswordSchema),
  forgotPassword
);

router.post(
  "/verify-reset-otp",
  validate(verifyResetOtpSchema),
  verifyResetOtp
);

router.post(
  "/reset-password",
  validate(resetPasswordSchema),
  resetPassword
);

export default router;