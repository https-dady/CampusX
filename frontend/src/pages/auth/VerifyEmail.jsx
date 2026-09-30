import { useEffect, useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Mail,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";

import {
  verifyEmail,
  resendVerificationOtp,
} from "../../services/auth.service";

const RESEND_COOLDOWN_SECONDS = 60;
const RESEND_COOLDOWN_STORAGE_KEY =
  "verification_resend_available_at";

const ease = [0.22, 1, 0.36, 1];

const VerifyEmail = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [email, setEmail] = useState(
    location.state?.email || ""
  );

  const [otp, setOtp] = useState("");

  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const [resendCooldown, setResendCooldown] =
    useState(0);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  /* -------------------------------------------------------
     RECOVER EMAIL + COOLDOWN
  ------------------------------------------------------- */

  useEffect(() => {
    if (!location.state?.email) {
      const pendingEmail = localStorage.getItem(
        "pending_signup_email"
      );

      if (pendingEmail) {
        setEmail(pendingEmail);
      }
    }

    const availableAt = Number(
      localStorage.getItem(
        RESEND_COOLDOWN_STORAGE_KEY
      )
    );

    if (availableAt) {
      const remainingSeconds = Math.max(
        0,
        Math.ceil(
          (availableAt - Date.now()) / 1000
        )
      );

      setResendCooldown(remainingSeconds);

      if (remainingSeconds === 0) {
        localStorage.removeItem(
          RESEND_COOLDOWN_STORAGE_KEY
        );
      }
    }
  }, [location.state]);

  /* -------------------------------------------------------
     COUNTDOWN
  ------------------------------------------------------- */

  useEffect(() => {
    if (resendCooldown <= 0) {
      return undefined;
    }

    const timer = setInterval(() => {
      setResendCooldown((previous) => {
        if (previous <= 1) {
          clearInterval(timer);

          localStorage.removeItem(
            RESEND_COOLDOWN_STORAGE_KEY
          );

          return 0;
        }

        return previous - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [resendCooldown]);

  /* -------------------------------------------------------
     HELPERS
  ------------------------------------------------------- */

  const clearMessages = () => {
    setError("");
    setMessage("");
  };

  const startResendCooldown = () => {
    const availableAt =
      Date.now() +
      RESEND_COOLDOWN_SECONDS * 1000;

    localStorage.setItem(
      RESEND_COOLDOWN_STORAGE_KEY,
      String(availableAt)
    );

    setResendCooldown(
      RESEND_COOLDOWN_SECONDS
    );
  };

  /* -------------------------------------------------------
     OTP CHANGE
  ------------------------------------------------------- */

  const handleOtpChange = (event) => {
    const value = event.target.value
      .replace(/\D/g, "")
      .slice(0, 6);

    setOtp(value);
    clearMessages();
  };

  /* -------------------------------------------------------
     VERIFY EMAIL
  ------------------------------------------------------- */

  const handleVerify = async (event) => {
  event.preventDefault();

  clearMessages();

  if (!email) {
    setError(
      "Signup email was not found. Please create your account again."
    );
    return;
  }

  if (!/^\d{6}$/.test(otp)) {
    setError(
      "Please enter the 6-digit verification code."
    );
    return;
  }

  try {
    setIsVerifying(true);

    const data = await verifyEmail({
      email,
      otp,
    });

    localStorage.removeItem(
      "pending_signup_email"
    );

    localStorage.removeItem(
      RESEND_COOLDOWN_STORAGE_KEY
    );

    setResendCooldown(0);

    setMessage(
      data?.message ||
        "Email verified successfully. Redirecting to login..."
    );

    setTimeout(() => {
      navigate("/login", {
        state: {
          email,
          message:
            "Email verified successfully. You can now log in.",
        },
      });
    }, 900);
  } catch (verificationError) {
    console.error(
      "Email verification error:",
      verificationError
    );

    const errorMessage =
      verificationError?.response?.data?.message ||
      verificationError?.response?.data?.error ||
      verificationError?.message ||
      "Unable to verify your email. Please try again.";

    setError(errorMessage);
  } finally {
    setIsVerifying(false);
  }
};

  /* -------------------------------------------------------
     RESEND VERIFICATION OTP
  ------------------------------------------------------- */

const handleResend = async () => {
  if (
    resendCooldown > 0 ||
    isResending ||
    isVerifying
  ) {
    return;
  }

  clearMessages();

  if (!email) {
    setError(
      "Signup email was not found. Please create your account again."
    );
    return;
  }

  try {
    setIsResending(true);

    const data = await resendVerificationOtp({
      email,
    });

    setOtp("");

    startResendCooldown();

    setMessage(
      data?.message ||
        "A new verification code has been sent to your email."
    );
  } catch (resendError) {
    console.error(
      "Resend verification OTP error:",
      resendError
    );

    const errorMessage =
      resendError?.response?.data?.message ||
      resendError?.response?.data?.error ||
      resendError?.message ||
      "Unable to resend the verification code.";

    setError(errorMessage);
  } finally {
    setIsResending(false);
  }
};

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#faf7f0] text-[#10231f]">
      {/* Ambient background */}

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

      {/* Header */}

      <header className="relative z-10 border-b border-stone-200/70 bg-[#faf7f0]/80 backdrop-blur-md">
        <div className="mx-auto flex h-20 w-full max-w-6xl items-center justify-between px-5 sm:px-8">
          <Link
            to="/"
            aria-label="CampusX home"
            className="text-xl font-semibold tracking-[-0.04em] text-[#073f33]"
          >
            campus<span className="text-orange-500">X</span>
          </Link>

          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-stone-600 transition-colors hover:text-[#073f33] focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-700/30"
          >
            <ArrowLeft size={15} />
            Back home
          </Link>
        </div>
      </header>

      {/* Main */}

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-6xl items-center px-5 py-10 sm:px-8 sm:py-14">
        <div className="grid w-full items-center gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          {/* Left */}

          <motion.section
            initial={{ opacity: 0, x: -18 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.55, ease }}
            className="hidden lg:block"
          >
            <span className="inline-flex rounded-full border border-teal-800/10 bg-teal-800/[0.05] px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-teal-800">
              Almost there
            </span>

            <h1 className="mt-6 max-w-lg font-serif text-5xl font-medium leading-[1.03] tracking-[-0.045em] text-[#10231f] xl:text-6xl">
              One small step before your
              <span className="text-orange-500">
                {" "}CampusX journey.
              </span>
            </h1>

            <p className="mt-6 max-w-md text-[15px] leading-7 text-stone-600">
              We sent a verification code to your email.
              Confirm it once and your account will be
              ready for the next step.
            </p>

            <div className="mt-9 space-y-3">
              {[
                {
                  number: "01",
                  title: "Check your inbox",
                  text: "Look for the verification email sent by CampusX.",
                },
                {
                  number: "02",
                  title: "Enter your code",
                  text: "Use the 6-digit verification code here.",
                },
                {
                  number: "03",
                  title: "Start your journey",
                  text: "After verification, continue to your login.",
                },
              ].map((item, index) => (
                <motion.div
                  key={item.number}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.45,
                    delay: 0.15 + index * 0.08,
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

          {/* Verification card */}

          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease }}
            className="mx-auto w-full max-w-xl"
          >
            <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-[0_20px_60px_rgba(16,35,31,0.08)] sm:p-8 lg:p-10">
              {/* Icon */}

              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.4, ease }}
                className="flex h-12 w-12 items-center justify-center rounded-lg bg-teal-950 text-white shadow-sm"
              >
                <Mail
                  size={21}
                  strokeWidth={1.8}
                />
              </motion.div>

              <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.16em] text-teal-700">
                VERIFY YOUR EMAIL
              </p>

              <h2 className="mt-2 font-serif text-3xl font-medium leading-tight tracking-[-0.035em] text-[#10231f]">
                Check your inbox.
              </h2>

              <p className="mt-3 text-sm leading-6 text-stone-500">
                Enter the 6-digit verification code we sent
                to your email to activate your account.
              </p>

              {/* Email */}

              <div className="mt-6 rounded-lg border border-teal-100 bg-teal-50/60 px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-teal-700">
                  Verification email
                </p>

                <p className="mt-1 break-all text-sm font-medium text-teal-950">
                  {email || "Your signup email"}
                </p>
              </div>

              {/* Error */}

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3"
                  role="alert"
                >
                  <p className="text-sm leading-5 text-red-700">
                    {error}
                  </p>
                </motion.div>
              )}

              {/* Success */}

              {message && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-5 rounded-lg border border-teal-200 bg-teal-50 px-4 py-3"
                  role="status"
                >
                  <p className="text-sm leading-5 text-teal-800">
                    {message}
                  </p>
                </motion.div>
              )}

              {/* Form */}

              <form
                onSubmit={handleVerify}
                className="mt-7 space-y-5"
              >
                <div>
                  <label
                    htmlFor="verification-otp"
                    className="mb-2 block text-xs font-semibold text-stone-600"
                  >
                    6-digit verification code
                  </label>

                  <input
                    id="verification-otp"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    value={otp}
                    onChange={handleOtpChange}
                    placeholder="Enter your code"
                    required
                    aria-describedby="otp-help"
                    className="min-h-14 w-full rounded-md border border-stone-200 bg-stone-50 px-4 text-center text-xl font-semibold tracking-[0.4em] text-[#10231f] outline-none transition focus:border-teal-700 focus:bg-white focus:ring-2 focus:ring-teal-700/10 placeholder:text-stone-400 placeholder:tracking-normal"
                  />

                  <p
                    id="otp-help"
                    className="mt-2 text-xs text-stone-400"
                  >
                    Enter all 6 digits from the email.
                  </p>
                </div>

                <motion.button
                  type="submit"
                  disabled={
                    isVerifying || isResending
                  }
                  whileHover={
                    isVerifying || isResending
                      ? undefined
                      : { y: -1 }
                  }
                  whileTap={
                    isVerifying || isResending
                      ? undefined
                      : { scale: 0.99 }
                  }
                  className="group flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-teal-950 px-5 text-sm font-semibold text-white transition hover:bg-teal-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-700/40 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isVerifying ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Verifying email...
                    </>
                  ) : (
                    <>
                      Verify email
                      <CheckCircle2
                        size={16}
                        className="transition-transform group-hover:scale-110"
                      />
                    </>
                  )}
                </motion.button>
              </form>

              {/* Resend */}

              <div className="mt-6 flex flex-col items-center justify-center gap-2 text-xs sm:flex-row">
                <span className="text-stone-500">
                  Didn't receive the code?
                </span>

                <button
                  type="button"
                  onClick={handleResend}
                  disabled={
                    resendCooldown > 0 ||
                    isResending ||
                    isVerifying
                  }
                  className="inline-flex items-center gap-1.5 font-semibold text-teal-700 transition hover:text-teal-900 disabled:cursor-not-allowed disabled:text-stone-400"
                >
                  <RefreshCw
                    size={13}
                    className={
                      isResending
                        ? "animate-spin"
                        : ""
                    }
                  />

                  {resendCooldown > 0
                    ? `Resend in ${resendCooldown}s`
                    : isResending
                    ? "Sending..."
                    : "Resend code"}
                </button>
              </div>

              {/* Footer */}

              <div className="mt-7 border-t border-stone-100 pt-6">
                <Link
                  to="/signup"
                  className="flex items-center justify-center gap-2 text-sm font-medium text-stone-500 transition hover:text-teal-800"
                >
                  <ArrowLeft size={15} />
                  Back to signup
                </Link>

                <p className="mt-4 text-center text-xs text-stone-400">
                  Already verified?{" "}
                  <Link
                    to="/login"
                    className="font-semibold text-teal-700 hover:text-teal-900"
                  >
                    Sign in
                  </Link>
                </p>

                <div className="mt-5 flex items-center justify-center gap-2 text-[11px] text-stone-400">
                  <ShieldCheck size={14} />
                  Your email helps keep your CampusX account secure.
                </div>
              </div>
            </div>
          </motion.section>
        </div>
      </div>
    </main>
  );
};

export default VerifyEmail;