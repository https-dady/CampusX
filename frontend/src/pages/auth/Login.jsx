import { useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";

import { login } from "../../services/auth.service";

const pageEase = [0.22, 1, 0.36, 1];

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    email: location.state?.email || "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(
    location.state?.message || ""
  );

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

    const email = formData.email.trim();

    if (!email || !formData.password) {
      setError(
        "Please enter your email and password."
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

    try {
      setIsLoading(true);

      const result = await login({
        email,
        password: formData.password,
      });

      if (!result?.success) {
        throw new Error(
          result?.message ||
            "Unable to sign in. Please try again."
        );
      }

      if (!result?.data?.token) {
        throw new Error(
          "Login succeeded but no authentication token was received."
        );
      }

      // Auth state / token storage will be wired
      // separately once the auth context flow is connected.
      localStorage.setItem(
        "campusx_token",
        result.data.token
      );

      if (result.data.user) {
        localStorage.setItem(
          "campusx_user",
          JSON.stringify(result.data.user)
        );
      }

      navigate("/dashboard", {
        replace: true,
      });
    } catch (submitError) {
      console.error(
        "Login error:",
        submitError
      );

      const message =
        submitError?.response?.data?.message ||
        submitError?.response?.data?.error ||
        submitError?.message ||
        "Unable to sign in. Please try again.";

      setError(message);
    } finally {
      setIsLoading(false);
    }
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
        className="
          pointer-events-none
          absolute inset-0
          overflow-hidden
        "
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
            absolute inset-0
            opacity-[0.25]
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
          New to CampusX?{" "}
          <Link
            to="/signup"
            className="
              font-semibold
              text-teal-900
              hover:text-teal-700
              focus-visible:outline-2
              focus-visible:outline-offset-2
              focus-visible:outline-teal-800
            "
          >
            Create account
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
            aria-labelledby="login-title"
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
                    size-1.5
                    rounded-full
                    bg-orange-500
                  "
                  aria-hidden="true"
                />

                Your journey continues
              </div>

              <h1
                id="login-title"
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
                Welcome back,
                <span className="block text-orange-500">
                  keep moving.
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
                Sign in to continue your CampusX
                journey and pick up your next career
                step exactly where you left off.
              </p>

              <div className="mt-8 space-y-4">
                {[
                  "Continue your personalized roadmap",
                  "Track your skills and learning progress",
                  "Prepare for jobs and interviews",
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
          {/* LOGIN CARD                                         */}
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
                Welcome back
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
                Continue your
                <span className="block">
                  CampusX journey.
                </span>
              </h2>

              <p
                className="
                  mt-3
                  text-sm leading-6
                  text-stone-500
                "
              >
                Sign in to continue your career
                roadmap and take your next step.
              </p>
            </div>

            {/* ERROR */}

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

            {/* SUCCESS */}

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

            {/* FORM */}

            <form
              onSubmit={handleSubmit}
              className="mt-7 space-y-5"
              noValidate
            >
              {/* EMAIL */}

              <motion.div
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
                  delay: 0.18,
                  ease: pageEase,
                }}
              >
                <label
                  htmlFor="login-email"
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
                    id="login-email"
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
              </motion.div>

              {/* PASSWORD */}

              <motion.div
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
                  delay: 0.25,
                  ease: pageEase,
                }}
              >
                <div className="mb-2 flex items-center justify-between gap-4">
                  <label
                    htmlFor="login-password"
                    className="
                      block
                      text-xs font-semibold
                      text-stone-600
                    "
                  >
                    Password
                  </label>

                  <Link
                    to="/forgot-password"
                    className="
                      text-xs
                      font-semibold
                      text-teal-900
                      transition-colors
                      hover:text-teal-700
                    "
                  >
                    Forgot password?
                  </Link>
                </div>

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
                    id="login-password"
                    name="password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    autoComplete="current-password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
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
              </motion.div>

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
                  ? "Signing in..."
                  : "Sign in"}

                {!isLoading && (
                  <ArrowRight
                    size={16}
                    strokeWidth={1.9}
                    aria-hidden="true"
                  />
                )}
              </motion.button>
            </form>

            {/* TRUST */}

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
                Your CampusX account keeps your
                career progress connected in one place.
              </span>
            </div>

            {/* SIGNUP */}

            <motion.div
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              transition={{
                duration: 0.45,
                delay: 0.5,
              }}
              className="mt-5 text-center"
            >
              <p className="text-xs text-stone-500">
                Don't have an account?{" "}
                <Link
                  to="/signup"
                  className="
                    font-semibold
                    text-teal-900
                    transition-colors
                    hover:text-orange-500
                  "
                >
                  Create your account
                </Link>
              </p>
            </motion.div>
          </motion.section>
        </div>
      </div>
    </main>
  );
}

export default Login;