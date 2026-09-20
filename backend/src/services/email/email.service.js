import axios from "axios";
import env from "../../config/env.js";

const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

export const sendOtpEmail = async ({ email, otp }) => {
  if (!env.BREVO_API_KEY) {
    throw new Error("Brevo API key is not configured");
  }

  if (!env.BREVO_SENDER_EMAIL) {
    throw new Error("Brevo sender email is not configured");
  }

  try {
    await axios.post(
      BREVO_API_URL,
      {
        sender: {
          name: env.BREVO_SENDER_NAME,
          email: env.BREVO_SENDER_EMAIL,
        },

        to: [
          {
            email,
          },
        ],

        subject: "Verify your CampusX account",

        textContent:
          `Your CampusX verification OTP is ${otp}. ` +
          `This OTP will expire in 10 minutes.`,

        htmlContent: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6;">
            <h2>Verify your CampusX account</h2>

            <p>
              Use the following OTP to verify your email address:
            </p>

            <div
              style="
                font-size: 32px;
                font-weight: bold;
                letter-spacing: 8px;
                margin: 20px 0;
              "
            >
              ${otp}
            </div>

            <p>
              This OTP will expire in <strong>10 minutes</strong>.
            </p>

            <p>
              If you did not create a CampusX account,
              you can safely ignore this email.
            </p>

            <p>
              Regards,<br />
              CampusX Team
            </p>
          </div>
        `,
      },
      {
        headers: {
          "api-key": env.BREVO_API_KEY,
          "Content-Type": "application/json",
          Accept: "application/json",
        },

        timeout: 10000,
      }
    );
  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.message ||
      "Failed to send OTP email";

    throw new Error(`Email delivery failed: ${message}`);
  }
};

export const sendPasswordResetOtpEmail = async ({
  email,
  otp,
}) => {
  if (!env.BREVO_API_KEY) {
    throw new Error("Brevo API key is not configured");
  }

  if (!env.BREVO_SENDER_EMAIL) {
    throw new Error("Brevo sender email is not configured");
  }

  try {
    await axios.post(
      BREVO_API_URL,
      {
        sender: {
          name: env.BREVO_SENDER_NAME,
          email: env.BREVO_SENDER_EMAIL,
        },

        to: [{ email }],

        subject: "Reset your CampusX password",

        textContent:
          `Your CampusX password reset OTP is ${otp}. ` +
          `This OTP will expire in 10 minutes.`,

        htmlContent: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6;">
            <h2>Reset your CampusX password</h2>

            <p>
              Use the following OTP to reset your CampusX account password:
            </p>

            <div
              style="
                font-size: 32px;
                font-weight: bold;
                letter-spacing: 8px;
                margin: 20px 0;
              "
            >
              ${otp}
            </div>

            <p>
              This OTP will expire in <strong>10 minutes</strong>.
            </p>

            <p>
              If you did not request a password reset,
              you can safely ignore this email.
            </p>

            <p>
              Regards,<br />
              CampusX Team
            </p>
          </div>
        `,
      },
      {
        headers: {
          "api-key": env.BREVO_API_KEY,
          "Content-Type": "application/json",
          Accept: "application/json",
        },

        timeout: 10000,
      }
    );
  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.message ||
      "Failed to send password reset OTP email";

    throw new Error(
      `Password reset email delivery failed: ${message}`
    );
  }
};