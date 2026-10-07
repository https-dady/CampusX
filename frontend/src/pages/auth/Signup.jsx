import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import {
  signup,
  googleAuth,
} from "../../services/auth.service";

import GoogleAuthButton from "../../components/auth/GoogleAuthButton";
import { useAuth } from "../../context/AuthContext";

import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
  UserRound,
} from "lucide-react";

const pageEase = [0.22, 1, 0.36, 1];

function Signup() {
  const navigate = useNavigate();
  const { setSession } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [isLoading, setIsLoading] =
    useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] =
    useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const name = formData.name.trim();
    const email = formData.email.trim();

    if (
      !name ||
      !email ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      setError(
        "Please complete all the required fields."
      );
      return;
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      setError(
        "Please enter a valid email address."
      );
      return;
    }

    if (formData.password.length < 8) {
      setError(
        "Password must be at least 8 characters."
      );
      return;
    }

    if (
      formData.password !==
      formData.confirmPassword
    ) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setIsLoading(true);

      const result = await signup({
        name,
        email,
        password: formData.password,
      });

      const signupEmail =
        result?.data?.email ||
        result?.email ||
        email;

      localStorage.setItem(
        "pending_signup_email",
        signupEmail
      );

      setSuccess(
        result?.message ||
          "Account created. Please verify your email."
      );

      navigate("/verify-email", {
        state: {
          email: signupEmail,
        },
      });
    } catch (submitError) {
      console.error(
        "Signup error:",
        submitError
      );

      const message =
        submitError?.response?.data?.message ||
        submitError?.response?.data?.error ||
        submitError?.message ||
        "Unable to create your account. Please try again.";

      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (
    credentialResponse
  ) => {
    setError("");
    setSuccess("");

    const credential =
      credentialResponse?.credential;

    if (!credential) {
      setError(
        "Google authentication did not return a credential."
      );
      return;
    }

    try {
      setIsLoading(true);

      const result = await googleAuth(
        credential
      );

      if (!result?.success) {
        throw new Error(
          result?.message ||
            "Unable to continue with Google. Please try again."
        );
      }

      if (!result?.data?.token) {
        throw new Error(
          "Google authentication succeeded but no authentication token was received."
        );
      }

      setSession({
        token: result.data.token,
        user: result.data.user,
      });

      navigate("/dashboard", {
        replace: true,
      });
    } catch (googleError) {
      console.error(
        "Google signup error:",
        googleError
      );

      const message =
        googleError?.response?.data?.message ||
        googleError?.response?.data?.error ||
        googleError?.message ||
        "Unable to continue with Google. Please try again.";

      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError(
      "Google authentication was cancelled or failed. Please try again."
    );
  };

  return (
    <main
      className="
        relative min-h-screen
        overflow-hidden
        bg-[#faf7f0]
        text-[#10231f]
      "
    >
      {/* ====================================================== */}
      {/* BACKGROUND                                             */}
      {/* ====================================================== */}

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div
          className="
            absolute
            -left-32 top-[-120px]
            h-[420px] w-[420px]
            rounded-full
            bg-teal-800/[0.07]
            blur-[110px]
          "
        />

        <div
          className="
            absolute
            -right-40 bottom-[-150px]
            h-[500px] w-[500px]
            rounded-full
            bg-orange-400/[0.10]
            blur-[120px]
          "
        />

        <div
          className="
            absolute inset-0 opacity-[0.25]
          "
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(15,118,110,0.16) 1px, transparent 1px)",
            backgroundSize: "26px 26px",
          }}
        />
      </div>

      {/* ====================================================== */}
      {/* HEADER                                                  */}
      {/* ====================================================== */}

      <header
        className="
          relative z-20
          flex items-center justify-between
          px-5 py-5
          sm:px-8
          lg:px-12
        "
      >
        <Link
          to="/"
          aria-label="CampusX home"
          className="
            inline-flex items-center
            text-lg font-bold
            tracking-[-0.03em]
            text-[#10231f]
            focus-visible:outline-2
            focus-visible:outline-offset-4
            focus-visible:outline-teal-800
          "
        >
          campus
          <span className="text-orange-500">
            X
          </span>
        </Link>

        <p className="text-sm text-stone-500">
          Already have an account?{" "}
          <Link
            to="/login"
            className="
              font-semibold
              text-teal-900
              hover:text-teal-700
              focus-visible:outline-2
              focus-visible:outline-offset-2
              focus-visible:outline-teal-800
            "
          >
            Log In
          </Link>
        </p>
      </header>

      {/* ====================================================== */}
      {/* MAIN                                                    */}
      {/* ====================================================== */}

      <div
        className="
          relative z-10
          mx-auto flex
          min-h-[calc(100vh-80px)]
          w-full max-w-6xl
          items-center
          px-5 py-10
          sm:px-8
          lg:px-12
          lg:py-14
        "
      >
        <div
          className="
            grid w-full
            gap-10
            lg:grid-cols-[0.9fr_1.1fr]
            lg:items-center
            lg:gap-20
          "
        >
          {/* ================================================== */}
          {/* LEFT CONTENT                                       */}
          {/* ================================================== */}

          <motion.section
            initial={{
              opacity: 0,
              x: -20,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            transition={{
              duration: 0.65,
              ease: pageEase,
            }}
            className="hidden lg:block"
            aria-labelledby="signup-title"
          >
            <div className="max-w-md">
              <div
                className="
                  inline-flex items-center
                  gap-2 rounded-full
                  border border-teal-800/10
                  bg-white/70
                  px-3 py-1.5
                  text-[10px]
                  font-bold uppercase
                  tracking-[0.12em]
                  text-teal-950
                "
              >
                <span
                  className="
                    size-1.5 rounded-full
                    bg-orange-500
                  "
                  aria-hidden="true"
                />

                Career clarity, built around you
              </div>

              <h1
                id="signup-title"
                className="
                  mt-6
                  font-['Newsreader']
                  text-5xl
                  font-semibold
                  leading-[0.98]
                  tracking-[-0.04em]
                  text-[#10231f]
                  xl:text-6xl
                "
              >
                Start building
                <span className="block text-orange-500">
                  your direction.
                </span>
              </h1>

              <p
                className="
                  mt-6
                  max-w-md
                  text-[15px]
                  leading-7
                  text-stone-500
                "
              >
                Create your CampusX account and
                start turning your skills,
                interests, and career goals into
                a clearer next step.
              </p>

              <div className="mt-8 space-y-4">
                {[
                  "Personalized career direction",
                  "Skill and learning recommendations",
                  "Job and interview preparation",
                ].map((item, index) => (
                  <motion.div
                    key={item}
                    initial={{
                      opacity: 0,
                      y: 10,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    transition={{
                      duration: 0.45,
                      delay:
                        0.18 + index * 0.08,
                      ease: pageEase,
                    }}
                    className="
                      flex items-center gap-3
                      text-sm text-stone-600
                    "
                  >
                    <span
                      className="
                        flex size-7
                        shrink-0
                        items-center
                        justify-center
                        rounded-full
                        bg-[#eaf4f1]
                        text-teal-900
                      "
                    >
                      <CheckCircle2
                        size={15}
                        strokeWidth={1.8}
                        aria-hidden="true"
                      />
                    </span>

                    {item}
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.section>

          {/* ================================================== */}
          {/* SIGNUP CARD                                        */}
          {/* ================================================== */}

          <motion.section
            initial={{
              opacity: 0,
              y: 22,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.65,
              delay: 0.08,
              ease: pageEase,
            }}
            className="
              w-full
              rounded-xl
              border border-stone-200
              bg-white
              p-5
              shadow-[0_20px_60px_rgba(28,25,23,0.07)]
              sm:p-8
              lg:p-10
            "
          >
            <div>
              <p
                className="
                  text-[10px]
                  font-bold uppercase
                  tracking-[0.12em]
                  text-teal-950
                "
              >
                Create your account
              </p>

              <h2
                className="
                  mt-2
                  font-['Newsreader']
                  text-4xl
                  font-semibold
                  leading-none
                  tracking-[-0.035em]
                  text-[#10231f]
                "
              >
                Your next step starts here.
              </h2>

              <p
                className="
                  mt-3
                  text-sm leading-6
                  text-stone-500
                "
              >
                Create your account to begin
                your CampusX journey.
              </p>
            </div>

            {/* ================================================= */}
            {/* ERROR / SUCCESS                                   */}
            {/* ================================================= */}

            {error && (
              <motion.div
                initial={{
                  opacity: 0,
                  y: -5,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                role="alert"
                className="
                  mt-6
                  rounded-md
                  border border-red-200
                  bg-red-50
                  px-3.5 py-3
                  text-sm
                  leading-5
                  text-red-700
                "
              >
                {error}
              </motion.div>
            )}

            {success && (
              <motion.div
                initial={{
                  opacity: 0,
                  y: -5,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                role="status"
                className="
                  mt-6
                  rounded-md
                  border border-teal-200
                  bg-teal-50
                  px-3.5 py-3
                  text-sm
                  leading-5
                  text-teal-800
                "
              >
                {success}
              </motion.div>
            )}

            {/* ================================================= */}
            {/* FORM                                              */}
            {/* ================================================= */}

            <form
              onSubmit={handleSubmit}
              className="mt-7 space-y-5"
              noValidate
            >
              {/* NAME */}

              <div>
                <label
                  htmlFor="signup-name"
                  className="
                    mb-2 block
                    text-xs font-semibold
                    text-stone-600
                  "
                >
                  Full name
                </label>

                <div className="relative">
                  <UserRound
                    size={17}
                    strokeWidth={1.7}
                    aria-hidden="true"
                    className="
                      pointer-events-none
                      absolute left-3.5
                      top-1/2
                      -translate-y-1/2
                      text-stone-400
                    "
                  />

                  <input
                    id="signup-name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    className="
                      min-h-12 w-full
                      rounded-md
                      border border-stone-200
                      bg-stone-50
                      pl-11 pr-3
                      text-sm
                      text-stone-700
                      outline-none
                      transition-[border-color,background-color,box-shadow]
                      duration-200
                      placeholder:text-stone-400
                      focus:border-teal-800/40
                      focus:bg-white
                      focus:ring-4
                      focus:ring-teal-800/5
                    "
                  />
                </div>
              </div>

              {/* EMAIL */}

              <div>
                <label
                  htmlFor="signup-email"
                  className="
                    mb-2 block
                    text-xs font-semibold
                    text-stone-600
                  "
                >
                  Email address
                </label>

                <div className="relative">
                  <Mail
                    size={17}
                    strokeWidth={1.7}
                    aria-hidden="true"
                    className="
                      pointer-events-none
                      absolute left-3.5
                      top-1/2
                      -translate-y-1/2
                      text-stone-400
                    "
                  />

                  <input
                    id="signup-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className="
                      min-h-12 w-full
                      rounded-md
                      border border-stone-200
                      bg-stone-50
                      pl-11 pr-3
                      text-sm
                      text-stone-700
                      outline-none
                      transition-[border-color,background-color,box-shadow]
                      duration-200
                      placeholder:text-stone-400
                      focus:border-teal-800/40
                      focus:bg-white
                      focus:ring-4
                      focus:ring-teal-800/5
                    "
                  />
                </div>
              </div>

              {/* PASSWORD */}

              <div>
                <label
                  htmlFor="signup-password"
                  className="
                    mb-2 block
                    text-xs font-semibold
                    text-stone-600
                  "
                >
                  Create password
                </label>

                <div className="relative">
                  <LockKeyhole
                    size={17}
                    strokeWidth={1.7}
                    aria-hidden="true"
                    className="
                      pointer-events-none
                      absolute left-3.5
                      top-1/2
                      -translate-y-1/2
                      text-stone-400
                    "
                  />

                  <input
                    id="signup-password"
                    name="password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    autoComplete="new-password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create a password"
                    className="
                      min-h-12 w-full
                      rounded-md
                      border border-stone-200
                      bg-stone-50
                      pl-11 pr-11
                      text-sm
                      text-stone-700
                      outline-none
                      transition-[border-color,background-color,box-shadow]
                      duration-200
                      placeholder:text-stone-400
                      focus:border-teal-800/40
                      focus:bg-white
                      focus:ring-4
                      focus:ring-teal-800/5
                    "
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
                    className="
                      absolute right-3
                      top-1/2
                      -translate-y-1/2
                      rounded p-1
                      text-stone-400
                      transition-colors
                      hover:text-teal-900
                      focus-visible:outline-2
                      focus-visible:outline-offset-2
                      focus-visible:outline-teal-800
                    "
                  >
                    {showPassword ? (
                      <EyeOff
                        size={17}
                        aria-hidden="true"
                      />
                    ) : (
                      <Eye
                        size={17}
                        aria-hidden="true"
                      />
                    )}
                  </button>
                </div>

                <p
                  className="
                    mt-1.5
                    text-[11px]
                    text-stone-400
                  "
                >
                  Minimum 8 characters.
                </p>
              </div>

              {/* CONFIRM PASSWORD */}

              <div>
                <label
                  htmlFor="signup-confirm-password"
                  className="
                    mb-2 block
                    text-xs font-semibold
                    text-stone-600
                  "
                >
                  Confirm password
                </label>

                <div className="relative">
                  <LockKeyhole
                    size={17}
                    strokeWidth={1.7}
                    aria-hidden="true"
                    className="
                      pointer-events-none
                      absolute left-3.5
                      top-1/2
                      -translate-y-1/2
                      text-stone-400
                    "
                  />

                  <input
                    id="signup-confirm-password"
                    name="confirmPassword"
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    autoComplete="new-password"
                    value={
                      formData.confirmPassword
                    }
                    onChange={handleChange}
                    placeholder="Confirm your password"
                    className="
                      min-h-12 w-full
                      rounded-md
                      border border-stone-200
                      bg-stone-50
                      pl-11 pr-11
                      text-sm
                      text-stone-700
                      outline-none
                      transition-[border-color,background-color,box-shadow]
                      duration-200
                      placeholder:text-stone-400
                      focus:border-teal-800/40
                      focus:bg-white
                      focus:ring-4
                      focus:ring-teal-800/5
                    "
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
                        ? "Hide confirm password"
                        : "Show confirm password"
                    }
                    className="
                      absolute right-3
                      top-1/2
                      -translate-y-1/2
                      rounded p-1
                      text-stone-400
                      transition-colors
                      hover:text-teal-900
                      focus-visible:outline-2
                      focus-visible:outline-offset-2
                      focus-visible:outline-teal-800
                    "
                  >
                    {showConfirmPassword ? (
                      <EyeOff
                        size={17}
                        aria-hidden="true"
                      />
                    ) : (
                      <Eye
                        size={17}
                        aria-hidden="true"
                      />
                    )}
                  </button>
                </div>
              </div>

              {/* SUBMIT */}

              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={
                  isLoading
                    ? undefined
                    : { y: -2 }
                }
                whileTap={
                  isLoading
                    ? undefined
                    : { scale: 0.985 }
                }
                className="
                  mt-2
                  inline-flex min-h-12
                  w-full
                  items-center
                  justify-center
                  gap-2
                  rounded-md
                  bg-teal-950
                  px-5
                  text-sm
                  font-semibold
                  text-white
                  shadow-[0_10px_24px_rgba(6,78,59,0.12)]
                  transition-[background-color,box-shadow]
                  duration-200
                  hover:bg-teal-900
                  hover:shadow-[0_14px_30px_rgba(6,78,59,0.17)]
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                  focus-visible:outline-2
                  focus-visible:outline-offset-3
                  focus-visible:outline-teal-800
                "
              >
                {isLoading
                  ? "Creating account..."
                  : "Create account"}

                {!isLoading && (
                  <ArrowRight
                    size={16}
                    strokeWidth={1.9}
                    aria-hidden="true"
                  />
                )}
              </motion.button>
            </form>

            {/* ================================================= */}
            {/* GOOGLE AUTH                                      */}
            {/* ================================================= */}

            <div className="mt-6">
              <div className="relative flex items-center">
                <div className="h-px flex-1 bg-stone-200" />

                <span
                  className="
                    px-3
                    text-[11px]
                    font-medium
                    text-stone-400
                  "
                >
                  OR
                </span>

                <div className="h-px flex-1 bg-stone-200" />
              </div>

              <div className="mt-5">
                <GoogleAuthButton
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* ================================================= */}
            {/* TRUST                                             */}
            {/* ================================================= */}

            <div
              className="
                mt-6 flex
                items-start gap-2
                border-t border-stone-100
                pt-5
                text-[11px]
                leading-5
                text-stone-400
              "
            >
              <ShieldCheck
                size={15}
                strokeWidth={1.7}
                className="
                  mt-0.5 shrink-0
                  text-teal-800
                "
                aria-hidden="true"
              />

              <span>
                Your account will be verified
                through email before you continue.
              </span>
            </div>
          </motion.section>
        </div>
      </div>
    </main>
  );
}

export default Signup;