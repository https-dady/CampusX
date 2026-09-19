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
    {
      expiresIn: "7d",
    }
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
  const otpLastSentAt = new Date();

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    authProvider: "local",
    isEmailVerified: false,
    otpHash,
    otpExpiresAt,
    otpLastSentAt,
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

    // Temporary for OTP testing.
    // Remove when email delivery is integrated.
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

export const verifySignupOtp = async ({ email, otp }) => {
  const user = await User.findOne({ email }).select(
    "+otpHash +otpExpiresAt"
  );

  if (!user) {
    throw new Error("User not found");
  }

  if (user.isEmailVerified) {
    throw new Error("Email is already verified");
  }

  if (!user.otpHash || !user.otpExpiresAt) {
    throw new Error("OTP is not available");
  }

  if (user.otpExpiresAt < new Date()) {
    throw new Error("OTP has expired");
  }

  const hashedOtp = hashOtp(otp);

  if (hashedOtp !== user.otpHash) {
    throw new Error("Invalid OTP");
  }

  user.isEmailVerified = true;
  user.otpHash = undefined;
  user.otpExpiresAt = undefined;
  user.otpLastSentAt = undefined;

  await user.save();

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    authProvider: user.authProvider,
    isEmailVerified: user.isEmailVerified,
  };
};

export const resendSignupOtp = async ({ email }) => {
  const user = await User.findOne({ email }).select(
    "+otpHash +otpExpiresAt +otpLastSentAt"
  );

  if (!user) {
    throw new Error("User not found");
  }

  if (user.isEmailVerified) {
    throw new Error("Email is already verified");
  }

  const now = new Date();

  if (user.otpLastSentAt) {
    const elapsedTime = now.getTime() - user.otpLastSentAt.getTime();
    const cooldownMs = 60 * 1000;

    if (elapsedTime < cooldownMs) {
      const remainingSeconds = Math.ceil(
        (cooldownMs - elapsedTime) / 1000
      );

      throw new Error(
        `Please wait ${remainingSeconds} seconds before requesting a new OTP`
      );
    }
  }

  const otp = generateOtp();
  const otpHash = hashOtp(otp);
  const otpExpiresAt = getOtpExpiry();

  user.otpHash = otpHash;
  user.otpExpiresAt = otpExpiresAt;
  user.otpLastSentAt = now;

  await user.save();

  return {
    email: user.email,

    // Temporary for OTP testing.
    // Remove when email delivery is integrated.
    otp,
  };
};