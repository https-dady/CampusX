import api from "./api";

/**
 * Create a new CampusX account.
 *
 * Backend:
 * POST /api/auth/signup
 */
export const signup = async (payload) => {
  const response = await api.post(
    "/auth/signup",
    payload
  );

  return response.data;
};

/**
 * Login existing user.
 *
 * Backend:
 * POST /api/auth/login
 */
export const login = async (payload) => {
  const response = await api.post(
    "/auth/login",
    payload
  );

  return response.data;
};

/**
 * Authenticate user with Google.
 *
 * Backend:
 * POST /api/auth/google
 *
 * Backend expects:
 * {
 *   credential: string
 * }
 */
export const googleAuth = async (credential) => {
  const response = await api.post(
    "/auth/google",
    {
      credential,
    }
  );

  return response.data;
};

/**
 * Verify signup email using OTP.
 *
 * Backend:
 * POST /api/auth/verify-otp
 */
export const verifyEmail = async (payload) => {
  const response = await api.post(
    "/auth/verify-otp",
    payload
  );

  return response.data;
};

/**
 * Resend signup verification OTP.
 *
 * Backend:
 * POST /api/auth/resend-otp
 */
export const resendVerificationOtp = async (payload) => {
  const response = await api.post(
    "/auth/resend-otp",
    payload
  );

  return response.data;
};

/**
 * Request password-reset OTP.
 *
 * Backend:
 * POST /api/auth/forgot-password
 */
export const forgotPassword = async (payload) => {
  const response = await api.post(
    "/auth/forgot-password",
    payload
  );

  return response.data;
};

/**
 * Verify password-reset OTP.
 *
 * Backend:
 * POST /api/auth/verify-reset-otp
 */
export const verifyResetOtp = async (payload) => {
  const response = await api.post(
    "/auth/verify-reset-otp",
    payload
  );

  return response.data;
};

/**
 * Reset password after OTP verification.
 *
 * Backend:
 * POST /api/auth/reset-password
 */
export const resetPassword = async (payload) => {
  const response = await api.post(
    "/auth/reset-password",
    payload
  );

  return response.data;
};