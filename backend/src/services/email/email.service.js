import axios from "axios";
import env from "../../config/env.js";

const BREVO_API_URL =
  "https://api.brevo.com/v3/smtp/email";

/* =========================================================
   SEND EMAIL THROUGH BREVO
========================================================= */

const sendBrevoEmail = async ({
  email,
  subject,
  textContent,
  htmlContent,
  errorMessage,
}) => {
  if (!env.BREVO_API_KEY) {
    throw new Error(
      "Brevo API key is not configured"
    );
  }

  if (!env.BREVO_SENDER_EMAIL) {
    throw new Error(
      "Brevo sender email is not configured"
    );
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

        subject,

        textContent,

        htmlContent,
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
      errorMessage;

    throw new Error(
      `${errorMessage}: ${message}`
    );
  }
};

/* =========================================================
   SIGNUP / EMAIL VERIFICATION OTP
========================================================= */

export const sendOtpEmail = async ({
  email,
  otp,
}) => {
  const subject =
    "Verify your CampusX account";

  const textContent =
    `Verify your CampusX account\n\n` +
    `Use the following OTP to verify your CampusX account email:\n\n` +
    `${otp}\n\n` +
    `This OTP will expire in 10 minutes.\n\n` +
    `If you did not create a CampusX account, ` +
    `you can safely ignore this email.\n\n` +
    `Regards,\n` +
    `CampusX Team`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta
          charset="UTF-8"
        />

        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0"
        />

        <title>
          Verify your CampusX account
        </title>
      </head>

      <body
        style="
          margin: 0;
          padding: 0;
          background-color: #f5f7f6;
          font-family: Arial, Helvetica, sans-serif;
          color: #17201d;
        "
      >
        <table
          width="100%"
          cellpadding="0"
          cellspacing="0"
          border="0"
          style="
            background-color: #f5f7f6;
            padding: 32px 16px;
          "
        >
          <tr>
            <td align="center">

              <table
                width="100%"
                cellpadding="0"
                cellspacing="0"
                border="0"
                style="
                  max-width: 620px;
                  background-color: #ffffff;
                  border-radius: 12px;
                  overflow: hidden;
                "
              >

                <!-- HEADER -->

                <tr>
                  <td
                    style="
                      padding: 32px 40px 18px;
                      border-bottom: 1px solid #eeeeee;
                    "
                  >
                    <div
                      style="
                        font-size: 22px;
                        font-weight: 700;
                        letter-spacing: -0.5px;
                        color: #073f33;
                      "
                    >
                      campus<span
                        style="
                          color: #f97316;
                        "
                      >X</span>
                    </div>
                  </td>
                </tr>

                <!-- CONTENT -->

                <tr>
                  <td
                    style="
                      padding: 42px 40px 40px;
                    "
                  >

                    <h1
                      style="
                        margin: 0 0 24px;
                        font-size: 34px;
                        line-height: 1.2;
                        font-weight: 700;
                        color: #17201d;
                      "
                    >
                      Verify your CampusX account
                    </h1>

                    <p
                      style="
                        margin: 0 0 28px;
                        font-size: 18px;
                        line-height: 1.7;
                        color: #3f4744;
                      "
                    >
                      Use the following OTP to
                      verify your CampusX account:
                    </p>

                    <!-- OTP -->

                    <div
                      style="
                        margin: 0 0 30px;
                        font-size: 48px;
                        line-height: 1;
                        font-weight: 700;
                        letter-spacing: 12px;
                        color: #111111;
                      "
                    >
                      ${otp}
                    </div>

                    <p
                      style="
                        margin: 0 0 24px;
                        font-size: 17px;
                        line-height: 1.7;
                        color: #3f4744;
                      "
                    >
                      This OTP will expire in
                      <strong>
                        10 minutes
                      </strong>.
                    </p>

                    <p
                      style="
                        margin: 0 0 28px;
                        font-size: 17px;
                        line-height: 1.7;
                        color: #3f4744;
                      "
                    >
                      If you did not create a
                      CampusX account, you can
                      safely ignore this email.
                    </p>

                    <p
                      style="
                        margin: 0;
                        font-size: 17px;
                        line-height: 1.7;
                        color: #3f4744;
                      "
                    >
                      Regards,<br />
                      <strong>
                        CampusX Team
                      </strong>
                    </p>

                  </td>
                </tr>

              </table>

            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  await sendBrevoEmail({
    email,
    subject,
    textContent,
    htmlContent,
    errorMessage:
      "Failed to send OTP email",
  });
};

/* =========================================================
   PASSWORD RESET OTP
========================================================= */

export const sendPasswordResetOtpEmail = async ({
  email,
  otp,
}) => {
  const subject =
    "Reset your CampusX password";

  const textContent =
    `Reset your CampusX password\n\n` +
    `Use the following OTP to reset your CampusX account password:\n\n` +
    `${otp}\n\n` +
    `This OTP will expire in 10 minutes.\n\n` +
    `If you did not request a password reset, ` +
    `you can safely ignore this email.\n\n` +
    `Regards,\n` +
    `CampusX Team`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta
          charset="UTF-8"
        />

        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0"
        />

        <title>
          Reset your CampusX password
        </title>
      </head>

      <body
        style="
          margin: 0;
          padding: 0;
          background-color: #f5f7f6;
          font-family: Arial, Helvetica, sans-serif;
          color: #17201d;
        "
      >
        <table
          width="100%"
          cellpadding="0"
          cellspacing="0"
          border="0"
          style="
            background-color: #f5f7f6;
            padding: 32px 16px;
          "
        >
          <tr>
            <td align="center">

              <table
                width="100%"
                cellpadding="0"
                cellspacing="0"
                border="0"
                style="
                  max-width: 620px;
                  background-color: #ffffff;
                  border-radius: 12px;
                  overflow: hidden;
                "
              >

                <!-- HEADER -->

                <tr>
                  <td
                    style="
                      padding: 32px 40px 18px;
                      border-bottom: 1px solid #eeeeee;
                    "
                  >
                    <div
                      style="
                        font-size: 22px;
                        font-weight: 700;
                        letter-spacing: -0.5px;
                        color: #073f33;
                      "
                    >
                      campus<span
                        style="
                          color: #f97316;
                        "
                      >X</span>
                    </div>
                  </td>
                </tr>

                <!-- CONTENT -->

                <tr>
                  <td
                    style="
                      padding: 42px 40px 40px;
                    "
                  >

                    <h1
                      style="
                        margin: 0 0 24px;
                        font-size: 34px;
                        line-height: 1.2;
                        font-weight: 700;
                        color: #17201d;
                      "
                    >
                      Reset your CampusX password
                    </h1>

                    <p
                      style="
                        margin: 0 0 28px;
                        font-size: 18px;
                        line-height: 1.7;
                        color: #3f4744;
                      "
                    >
                      Use the following OTP to
                      reset your CampusX account
                      password:
                    </p>

                    <!-- OTP -->

                    <div
                      style="
                        margin: 0 0 30px;
                        font-size: 48px;
                        line-height: 1;
                        font-weight: 700;
                        letter-spacing: 12px;
                        color: #111111;
                      "
                    >
                      ${otp}
                    </div>

                    <p
                      style="
                        margin: 0 0 24px;
                        font-size: 17px;
                        line-height: 1.7;
                        color: #3f4744;
                      "
                    >
                      This OTP will expire in
                      <strong>
                        10 minutes
                      </strong>.
                    </p>

                    <p
                      style="
                        margin: 0 0 28px;
                        font-size: 17px;
                        line-height: 1.7;
                        color: #3f4744;
                      "
                    >
                      If you did not request a
                      password reset, you can
                      safely ignore this email.
                    </p>

                    <p
                      style="
                        margin: 0;
                        font-size: 17px;
                        line-height: 1.7;
                        color: #3f4744;
                      "
                    >
                      Regards,<br />
                      <strong>
                        CampusX Team
                      </strong>
                    </p>

                  </td>
                </tr>

              </table>

            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  await sendBrevoEmail({
    email,
    subject,
    textContent,
    htmlContent,
    errorMessage:
      "Failed to send password reset OTP email",
  });
};