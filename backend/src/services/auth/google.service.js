import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";

import User from "../../models/user.model.js";
import env from "../../config/env.js";

const googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID);

const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
};

export const authenticateWithGoogle = async (credential) => {
  if (!credential) {
    throw new Error("Google credential is required");
  }

  if (!env.GOOGLE_CLIENT_ID) {
    throw new Error("Google authentication is not configured");
  }

  if (!env.JWT_SECRET) {
    throw new Error("JWT secret is not configured");
  }

  let ticket;

  try {
    ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: env.GOOGLE_CLIENT_ID,
    });
  } catch (error) {
    throw new Error("Invalid Google credential");
  }

  const payload = ticket.getPayload();

  if (!payload) {
    throw new Error("Invalid Google credential");
  }

  const {
    sub: googleId,
    email,
    name,
    email_verified: emailVerified,
  } = payload;

  if (!googleId || !email) {
    throw new Error("Google account information is incomplete");
  }

  if (!emailVerified) {
    throw new Error("Google email is not verified");
  }

  const normalizedEmail = email.toLowerCase();

  let user = await User.findOne({
    $or: [
      { googleId },
      { email: normalizedEmail },
    ],
  });

  if (!user) {
    user = await User.create({
      name: name?.trim() || "Google User",
      email: normalizedEmail,
      authProvider: "google",
      googleId,
      isEmailVerified: true,
    });
  } else {
    if (user.googleId && user.googleId !== googleId) {
      throw new Error(
        "This email is already linked to another Google account"
      );
    }

    if (!user.googleId) {
      user.googleId = googleId;
    }

    user.isEmailVerified = true;

    await user.save();
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