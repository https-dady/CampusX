import { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
} from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Mail,
  ShieldCheck,
} from "lucide-react";

import {
  forgotPassword,
  verifyResetOtp,
  resetPassword,
} from "../../services/auth.service";

const ease = [0.22, 1, 0.36, 1];

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [resetToken, setResetToken] =
    useState("");

  const [passwordData, setPasswordData] =
    useState({
      password: "",
      confirmPassword: "",
    });

  const [showPassword, setShowPassword] =
    useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] =
    useState("");

  const [isLoading, setIsLoading] =
    useState(false);

  const [
    resendCooldown,
    setResendCooldown,
  ] = useState(0);

  /* ========================================================
     RESEND OTP COOLDOWN
  ======================================================== */

  useEffect(() => {
    if (resendCooldown <= 0) {
      return undefined;
    }

    const timer = setInterval(() => {
      setResendCooldown((previous) =>
        previous > 0 ? previous - 1 : 0
      );
    }, 1000);

    return () => clearInterval(timer);
  }, [resendCooldown]);

  /* ========================================================
     HELPERS
  ======================================================== */

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;

    setPasswordData((previous) => ({
      ...previous,
      [name]: value,
    }));

    clearMessages();
  };

  /* ========================================================
     STEP 1 — SEND RESET OTP
  ======================================================== */

  const handleEmailSubmit = async (event) => {
    event.preventDefault();

    clearMessages();

    const normalizedEmail =
      email.trim().toLowerCase();

    if (!normalizedEmail) {
      setError(
        "Please enter your account email."
      );
      return;
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        normalizedEmail
      )
    ) {
      setError(
        "Please enter a valid email address."
      );
      return;
    }

    setIsLoading(true);

    try {
      const result = await forgotPassword({
        email: normalizedEmail,
      });

      if (!result?.success) {
        throw new Error(
          result?.message ||
            "Unable to send reset OTP. Please try again."
        );
      }

      setEmail(normalizedEmail);

      // Clear any previous reset token.
      setResetToken("");

      setSuccess(
        result?.message ||
          "Reset OTP has been sent to your email."
      );

      setResendCooldown(60);
      setStep(2);
    } catch (submitError) {
      console.error(
        "Forgot password error:",
        submitError
      );

      const message =
        submitError?.response?.data?.message ||
        submitError?.response?.data?.error ||
        submitError?.message ||
        "Something went wrong. Please try again.";

      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  /* ========================================================
     RESEND RESET OTP

     Backend uses the existing forgot-password endpoint
     for generating/resending the reset OTP.
  ======================================================== */

  const handleResendOtp = async () => {
    if (
      isLoading ||
      resendCooldown > 0
    ) {
      return;
    }

    clearMessages();
    setIsLoading(true);

    try {
      const normalizedEmail =
        email.trim().toLowerCase();

      if (!normalizedEmail) {
        throw new Error(
          "Please enter your account email."
        );
      }

      const result = await forgotPassword({
        email: normalizedEmail,
      });

      if (!result?.success) {
        throw new Error(
          result?.message ||
            "Unable to resend reset OTP. Please try again."
        );
      }

      setOtp("");

      // Old reset token must not be reused.
      setResetToken("");

      setSuccess(
        result?.message ||
          "A new reset OTP has been sent to your email."
      );

      setResendCooldown(60);
    } catch (submitError) {
      console.error(
        "Resend reset OTP error:",
        submitError
      );

      const message =
        submitError?.response?.data?.message ||
        submitError?.response?.data?.error ||
        submitError?.message ||
        "Something went wrong. Please try again.";

      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  /* ========================================================
     STEP 2 — VERIFY RESET OTP
  ======================================================== */

  const handleOtpSubmit = async (event) => {
    event.preventDefault();

    clearMessages();

    const normalizedEmail =
      email.trim().toLowerCase();

    const normalizedOtp = otp.trim();

    if (!normalizedEmail) {
      setError(
        "Please enter your account email."
      );
      return;
    }

    if (!/^\d{6}$/.test(normalizedOtp)) {
      setError(
        "Please enter the 6-digit OTP."
      );
      return;
    }

    setIsLoading(true);

    try {
      const result = await verifyResetOtp({
        email: normalizedEmail,
        otp: normalizedOtp,
      });

      if (!result?.success) {
        throw new Error(
          result?.message ||
            "Invalid or expired OTP. Please try again."
        );
      }

      /*
       * Backend response:
       *
       * {
       *   success: true,
       *   message: "...",
       *   data: {
       *     resetToken,
       *     expiresAt
       *   }
       * }
       */

      const receivedResetToken =
        result?.data?.resetToken ||
        result?.resetToken;

      if (!receivedResetToken) {
        throw new Error(
          "Password reset token was not received. Please request a new OTP."
        );
      }

      setResetToken(
        receivedResetToken
      );

      setSuccess(
        result?.message ||
          "OTP verified successfully. You can now create a new password."
      );

      setStep(3);
    } catch (submitError) {
      console.error(
        "Verify reset OTP error:",
        submitError
      );

      const message =
        submitError?.response?.data?.message ||
        submitError?.response?.data?.error ||
        submitError?.message ||
        "Unable to verify OTP. Please try again.";

      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  /* ========================================================
     STEP 3 — RESET PASSWORD
  ======================================================== */

  const handlePasswordSubmit = async (
    event
  ) => {
    event.preventDefault();

    clearMessages();

    const newPassword =
      passwordData.password;

    const confirmPassword =
      passwordData.confirmPassword;

    if (!resetToken) {
      setError(
        "Your password reset session has expired. Please request a new OTP."
      );
      return;
    }

    if (newPassword.length < 8) {
      setError(
        "Password must be at least 8 characters long."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    try {
      /*
       * IMPORTANT:
       *
       * Backend resetPassword service expects:
       *
       * {
       *   resetToken,
       *   newPassword
       * }
       *
       * Email and OTP are NOT sent here.
       * They were already used during OTP verification.
       */

      const result = await resetPassword({
        resetToken,
        newPassword,
      });

      if (!result?.success) {
        throw new Error(
          result?.message ||
            "Unable to reset password. Please try again."
        );
      }

      navigate("/login", {
        replace: true,
        state: {
          passwordReset: true,
          email: email
            .trim()
            .toLowerCase(),
          message:
            result?.message ||
            "Password reset successfully. Please sign in.",
        },
      });
    } catch (submitError) {
      console.error(
        "Reset password error:",
        submitError
      );

      const message =
        submitError?.response?.data?.message ||
        submitError?.response?.data?.error ||
        submitError?.message ||
        "Something went wrong. Please try again.";

      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  /* ========================================================
     STEP DATA
  ======================================================== */

  const stepData = {
    1: {
      eyebrow: "ACCOUNT RECOVERY",
      title: "Forgot your password?",
      description:
        "Enter your account email and we'll send you a secure reset OTP.",
      icon: Mail,
    },

    2: {
      eyebrow: "VERIFY YOUR IDENTITY",
      title: "Check your email.",
      description:
        "Enter the 6-digit reset code sent to your registered email.",
      icon: KeyRound,
    },

    3: {
      eyebrow: "CREATE NEW PASSWORD",
      title: "Choose a new password.",
      description:
        "Your OTP is verified. Create a new password to continue.",
      icon: ShieldCheck,
    },
  };

  const CurrentIcon =
    stepData[step].icon;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#faf7f0] text-[#10231f]">
      {/* ====================================================
          AMBIENT BACKGROUND
      ==================================================== */}

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -left-32 top-[-180px] h-[420px] w-[420px] rounded-full bg-teal-700/[0.08] blur-[120px]" />

        <div className="absolute -right-32 bottom-[-160px] h-[400px] w-[400px] rounded-full bg-orange-400/[0.12] blur-[120px]" />

        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "radial-gradient(#073f33 0.8px, transparent 0.8px)",
            backgroundSize: "22px 22px",
          }}
        />
      </div>

      {/* ====================================================
          HEADER
      ==================================================== */}

      <header className="relative z-10 border-b border-stone-200/70 bg-[#faf7f0]/80 backdrop-blur-md">
        <div className="mx-auto flex h-20 w-full max-w-6xl items-center justify-between px-5 sm:px-8">
          <Link
            to="/"
            aria-label="CampusX home"
            className="text-xl font-semibold tracking-[-0.04em] text-[#073f33]"
          >
            campus
            <span className="text-orange-500">
              X
            </span>
          </Link>

          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-sm font-medium text-stone-600 transition-colors hover:text-[#073f33] focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-700/30"
          >
            <ArrowLeft size={15} />
            Back to login
          </Link>
        </div>
      </header>

      {/* ====================================================
          MAIN
      ==================================================== */}

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-6xl items-center px-5 py-10 sm:px-8 sm:py-14">
        <div className="grid w-full items-center gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          {/* ==================================================
              LEFT CONTENT
          ================================================== */}

          <motion.section
            initial={{
              opacity: 0,
              x: -18,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            transition={{
              duration: 0.55,
              ease,
            }}
            className="hidden lg:block"
          >
            <span className="inline-flex rounded-full border border-teal-800/10 bg-teal-800/[0.05] px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-teal-800">
              Account recovery
            </span>

            <h1 className="mt-6 max-w-lg font-serif text-5xl font-medium leading-[1.03] tracking-[-0.045em] text-[#10231f] xl:text-6xl">
              Find your way back to your
              <span className="text-orange-500">
                {" "}
                CampusX journey.
              </span>
            </h1>

            <p className="mt-6 max-w-md text-[15px] leading-7 text-stone-600">
              A forgotten password is only a
              small pause. Verify your account,
              choose a new password, and continue
              from where you left off.
            </p>

            <div className="mt-9 space-y-3">
              {[
                {
                  number: "01",
                  title: "Enter your email",
                  text: "Tell us which CampusX account you're recovering.",
                },
                {
                  number: "02",
                  title: "Verify the OTP",
                  text: "Use the 6-digit code sent to your email.",
                },
                {
                  number: "03",
                  title: "Create a new password",
                  text: "Set your new password and continue.",
                },
              ].map((item, index) => (
                <motion.div
                  key={item.number}
                  initial={{
                    opacity: 0,
                    y: 12,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    duration: 0.45,
                    delay:
                      0.15 + index * 0.08,
                    ease,
                  }}
                  className="flex items-center gap-4 rounded-xl border border-stone-200 bg-white/65 p-4 shadow-sm"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-950 text-[11px] font-semibold text-white">
                    {item.number}
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-[#10231f]">
                      {item.title}
                    </p>

                    <p className="mt-1 text-xs leading-5 text-stone-500">
                      {item.text}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* ==================================================
              CARD
          ================================================== */}

          <motion.section
            key={step}
            initial={{
              opacity: 0,
              y: 18,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.45,
              ease,
            }}
            className="mx-auto w-full max-w-xl"
          >
            <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-[0_20px_60px_rgba(16,35,31,0.08)] sm:p-8 lg:p-10">
              {/* Icon */}

              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-teal-950 text-white shadow-sm">
                <CurrentIcon
                  size={21}
                  strokeWidth={1.8}
                />
              </div>

              <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.16em] text-teal-700">
                {stepData[step].eyebrow}
              </p>

              <h2 className="mt-2 font-serif text-3xl font-medium leading-tight tracking-[-0.035em] text-[#10231f]">
                {stepData[step].title}
              </h2>

              <p className="mt-3 text-sm leading-6 text-stone-500">
                {stepData[step].description}
              </p>

              {/* Progress */}

              <div className="mt-7 grid grid-cols-3 gap-2">
                {[
                  "Email",
                  "Verify",
                  "Reset",
                ].map((label, index) => {
                  const number = index + 1;

                  return (
                    <div key={label}>
                      <div
                        className={`h-1 rounded-full transition-colors ${
                          number <= step
                            ? "bg-teal-800"
                            : "bg-stone-200"
                        }`}
                      />

                      <p
                        className={`mt-2 text-[10px] font-medium ${
                          number <= step
                            ? "text-teal-800"
                            : "text-stone-400"
                        }`}
                      >
                        {label}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Error */}

              {error && (
                <motion.div
                  initial={{
                    opacity: 0,
                    y: -6,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3"
                  role="alert"
                >
                  <p className="text-sm leading-5 text-red-700">
                    {error}
                  </p>
                </motion.div>
              )}

              {/* Success */}

              {success && (
                <motion.div
                  initial={{
                    opacity: 0,
                    y: -6,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  className="mt-6 rounded-lg border border-teal-200 bg-teal-50 px-4 py-3"
                  role="status"
                >
                  <p className="text-sm leading-5 text-teal-800">
                    {success}
                  </p>
                </motion.div>
              )}

              {/* ==================================================
                  STEP 1 — EMAIL
              ================================================== */}

              {step === 1 && (
                <form
                  onSubmit={handleEmailSubmit}
                  className="mt-7 space-y-5"
                >
                  <div>
                    <label
                      htmlFor="forgot-email"
                      className="mb-2 block text-xs font-semibold text-stone-600"
                    >
                      Email address
                    </label>

                    <div className="relative">
                      <Mail
                        aria-hidden="true"
                        size={17}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400"
                      />

                      <input
                        id="forgot-email"
                        type="email"
                        autoComplete="email"
                        value={email}
                        onChange={(event) => {
                          setEmail(
                            event.target.value
                          );
                          clearMessages();
                        }}
                        placeholder="you@college.edu"
                        required
                        className="min-h-12 w-full rounded-md border border-stone-200 bg-stone-50 pl-11 pr-4 text-sm text-[#10231f] outline-none transition focus:border-teal-700 focus:bg-white focus:ring-2 focus:ring-teal-700/10 placeholder:text-stone-400"
                      />
                    </div>
                  </div>

                  <motion.button
                    type="submit"
                    disabled={isLoading}
                    whileHover={
                      isLoading
                        ? undefined
                        : { y: -1 }
                    }
                    whileTap={
                      isLoading
                        ? undefined
                        : { scale: 0.99 }
                    }
                    className="group flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-teal-950 px-5 text-sm font-semibold text-white transition hover:bg-teal-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-700/40 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isLoading ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        Sending OTP...
                      </>
                    ) : (
                      <>
                        Send reset OTP

                        <ArrowRight
                          size={16}
                          className="transition-transform group-hover:translate-x-1"
                        />
                      </>
                    )}
                  </motion.button>
                </form>
              )}

              {/* ==================================================
                  STEP 2 — OTP
              ================================================== */}

              {step === 2 && (
                <form
                  onSubmit={handleOtpSubmit}
                  className="mt-7 space-y-5"
                >
                  <div>
                    <label
                      htmlFor="reset-otp"
                      className="mb-2 block text-xs font-semibold text-stone-600"
                    >
                      6-digit reset OTP
                    </label>

                    <input
                      id="reset-otp"
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={6}
                      value={otp}
                      onChange={(event) => {
                        const value =
                          event.target.value
                            .replace(/\D/g, "")
                            .slice(0, 6);

                        setOtp(value);
                        clearMessages();
                      }}
                      placeholder="Enter your OTP"
                      required
                      className="min-h-12 w-full rounded-md border border-stone-200 bg-stone-50 px-4 text-center text-lg font-semibold tracking-[0.35em] text-[#10231f] outline-none transition focus:border-teal-700 focus:bg-white focus:ring-2 focus:ring-teal-700/10 placeholder:text-stone-400 placeholder:tracking-normal"
                    />
                  </div>

                  <p className="text-center text-xs text-stone-500">
                    Code sent to{" "}
                    <span className="font-medium text-stone-700">
                      {email}
                    </span>
                  </p>

                  <motion.button
                    type="submit"
                    disabled={isLoading}
                    whileHover={
                      isLoading
                        ? undefined
                        : { y: -1 }
                    }
                    whileTap={
                      isLoading
                        ? undefined
                        : { scale: 0.99 }
                    }
                    className="group flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-teal-950 px-5 text-sm font-semibold text-white transition hover:bg-teal-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-700/40 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isLoading ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        Verify OTP

                        <ArrowRight
                          size={16}
                          className="transition-transform group-hover:translate-x-1"
                        />
                      </>
                    )}
                  </motion.button>

                  <div className="flex items-center justify-center gap-2 text-xs">
                    <span className="text-stone-500">
                      Didn't receive the code?
                    </span>

                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={
                        isLoading ||
                        resendCooldown > 0
                      }
                      className="font-semibold text-teal-700 transition hover:text-teal-900 disabled:cursor-not-allowed disabled:text-stone-400"
                    >
                      {resendCooldown > 0
                        ? `Resend in ${resendCooldown}s`
                        : "Resend OTP"}
                    </button>
                  </div>
                </form>
              )}

              {/* ==================================================
                  STEP 3 — NEW PASSWORD
              ================================================== */}

              {step === 3 && (
                <form
                  onSubmit={
                    handlePasswordSubmit
                  }
                  className="mt-7 space-y-5"
                >
                  <div>
                    <label
                      htmlFor="new-password"
                      className="mb-2 block text-xs font-semibold text-stone-600"
                    >
                      New password
                    </label>

                    <div className="relative">
                      <input
                        id="new-password"
                        name="password"
                        type={
                          showPassword
                            ? "text"
                            : "password"
                        }
                        autoComplete="new-password"
                        value={
                          passwordData.password
                        }
                        onChange={
                          handlePasswordChange
                        }
                        placeholder="At least 8 characters"
                        required
                        minLength={8}
                        className="min-h-12 w-full rounded-md border border-stone-200 bg-stone-50 px-4 pr-11 text-sm text-[#10231f] outline-none transition focus:border-teal-700 focus:bg-white focus:ring-2 focus:ring-teal-700/10 placeholder:text-stone-400"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowPassword(
                            (value) => !value
                          )
                        }
                        aria-label={
                          showPassword
                            ? "Hide password"
                            : "Show password"
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-stone-400 hover:text-teal-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-700/30"
                      >
                        {showPassword ? (
                          <EyeOff size={17} />
                        ) : (
                          <Eye size={17} />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="confirm-new-password"
                      className="mb-2 block text-xs font-semibold text-stone-600"
                    >
                      Confirm new password
                    </label>

                    <div className="relative">
                      <input
                        id="confirm-new-password"
                        name="confirmPassword"
                        type={
                          showConfirmPassword
                            ? "text"
                            : "password"
                        }
                        autoComplete="new-password"
                        value={
                          passwordData.confirmPassword
                        }
                        onChange={
                          handlePasswordChange
                        }
                        placeholder="Re-enter your password"
                        required
                        minLength={8}
                        className="min-h-12 w-full rounded-md border border-stone-200 bg-stone-50 px-4 pr-11 text-sm text-[#10231f] outline-none transition focus:border-teal-700 focus:bg-white focus:ring-2 focus:ring-teal-700/10 placeholder:text-stone-400"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(
                            (value) => !value
                          )
                        }
                        aria-label={
                          showConfirmPassword
                            ? "Hide password"
                            : "Show password"
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-stone-400 hover:text-teal-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-700/30"
                      >
                        {showConfirmPassword ? (
                          <EyeOff size={17} />
                        ) : (
                          <Eye size={17} />
                        )}
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-stone-400">
                    Password must be at least 8
                    characters long.
                  </p>

                  <motion.button
                    type="submit"
                    disabled={isLoading}
                    whileHover={
                      isLoading
                        ? undefined
                        : { y: -1 }
                    }
                    whileTap={
                      isLoading
                        ? undefined
                        : { scale: 0.99 }
                    }
                    className="group flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-teal-950 px-5 text-sm font-semibold text-white transition hover:bg-teal-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-700/40 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isLoading ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        Resetting password...
                      </>
                    ) : (
                      <>
                        Reset password

                        <CheckCircle2
                          size={16}
                          className="transition-transform group-hover:scale-110"
                        />
                      </>
                    )}
                  </motion.button>
                </form>
              )}

              {/* ==================================================
                  FOOTER
              ================================================== */}

              <div className="mt-7 border-t border-stone-100 pt-6">
                <Link
                  to="/login"
                  className="flex items-center justify-center gap-2 text-sm font-medium text-stone-500 transition hover:text-teal-800"
                >
                  <ArrowLeft size={15} />
                  Back to login
                </Link>

                <p className="mt-4 text-center text-xs text-stone-400">
                  Remembered your password?{" "}
                  <Link
                    to="/login"
                    className="font-semibold text-teal-700 hover:text-teal-900"
                  >
                    Sign in
                  </Link>
                </p>

                <div className="mt-5 flex items-center justify-center gap-2 text-[11px] text-stone-400">
                  <ShieldCheck size={14} />
                  Your account remains protected
                  throughout recovery.
                </div>
              </div>
            </div>
          </motion.section>
        </div>
      </div>
    </main>
  );
};

export default ForgotPassword;