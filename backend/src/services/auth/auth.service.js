import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../../models/user.model.js";
import env from "../../config/env.js";

import {
  generateOtp,
  hashOtp,
  getOtpExpiry,
} from "../../utils/otp.util.js";


const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

export const signupUser = async ({ name, email, password }) => {
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new Error("An account with this email already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const otp = generateOtp();
  const otpHash = hashOtp(otp);
  const otpExpiresAt = getOtpExpiry();

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    authProvider: "local",
    isEmailVerified: false,
    otpHash,
    otpExpiresAt,
  });

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      authProvider: user.authProvider,
      isEmailVerified: user.isEmailVerified,
    },
    token: generateToken(user._id.toString()),
    otp,
  };
};

export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email }).select("+password");

  if (!user || !user.password) {
    throw new Error("Invalid email or password");
  }

  const isPasswordValid = await bcrypt.compare(
    password,
    user.password
  );

  if (!isPasswordValid) {
    throw new Error("Invalid email or password");
  }

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      authProvider: user.authProvider,
      isEmailVerified: user.isEmailVerified,
    },
    token: generateToken(user._id.toString()),
  };
};