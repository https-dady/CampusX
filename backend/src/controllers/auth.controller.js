import {
  signupUser,
  loginUser,
  verifySignupOtp,
} from "../services/auth/auth.service.js";

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