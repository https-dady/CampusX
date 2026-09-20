import {
  signupUser,
  loginUser,
  verifySignupOtp,
  resendSignupOtp,
  forgotPassword as forgotPasswordService,
  verifyResetOtp as verifyResetOtpService,
  resetPassword as resetPasswordService,
} from "../services/auth/auth.service.js";

import {
  authenticateWithGoogle,
} from "../services/auth/google.service.js";

export const signup = async (req, res) => {
  try {
    const result = await signupUser(req.body);

    return res.status(201).json({
      success: true,
      message: "Account created successfully",
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const login = async (req, res) => {
  try {
    const result = await loginUser(req.body);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: result,
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.message,
    });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const user = await verifySignupOtp(req.body);

    return res.status(200).json({
      success: true,
      message: "Email verified successfully",
      data: {
        user,
      },
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const resendOtp = async (req, res) => {
  try {
    const result = await resendSignupOtp(req.body);

    return res.status(200).json({
      success: true,
      message: "OTP resent successfully",
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const googleAuth = async (req, res) => {
  try {
    const result = await authenticateWithGoogle(
      req.body.credential
    );

    return res.status(200).json({
      success: true,
      message: "Google authentication successful",
      data: result,
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.message,
    });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const result =
      await forgotPasswordService(req.body);

    return res.status(200).json({
      success: true,
      message:
        "Password reset OTP sent successfully",
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const verifyResetOtp = async (req, res) => {
  try {
    const result =
      await verifyResetOtpService(req.body);

    return res.status(200).json({
      success: true,
      message:
        "Password reset OTP verified successfully",
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const user =
      await resetPasswordService(req.body);

    return res.status(200).json({
      success: true,
      message: "Password reset successfully",
      data: {
        user,
      },
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};