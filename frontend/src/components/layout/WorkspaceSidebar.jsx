import {
  NavLink,
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  BarChart3,
  BookOpen,
  BriefcaseBusiness,
  ClipboardCheck,
  FileSearch,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Map,
  MessageCircle,
  MessageSquareText,
  Sparkles,
  UserRound,
  UsersRound,
  X,
  Target,
  ArrowLeftRight,
  LoaderCircle,
} from "lucide-react";

import {
  useState,
} from "react";

import {
  motion,
  useReducedMotion,
} from "framer-motion";

import {
  useAuth,
} from "../../context/AuthContext";

import {
  selectOnboardingJourney,
} from "../../services/onboarding.service";

/* -------------------------------------------------------------------------- */
/* Workspace navigation                                                       */
/* -------------------------------------------------------------------------- */

const navigation = [
  {
    label: "Overview",
    to: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "My profile",
    to: "/profile",
    icon: UserRound,
  },
  {
    label: "Skills & interests",
    to: "/skills-interests",
    icon: Sparkles,
  },
  {
    label: "Career insights",
    to: "/career-insights",
    icon: BarChart3,
  },
  {
    label: "Assessment",
    to: "/assessment",
    icon: ClipboardCheck,
  },
  {
    label: "Learning roadmap",
    to: "/learning-roadmap",
    icon: Map,
  },
  {
    label: "Courses & resources",
    to: "/courses-resources",
    icon: BookOpen,
  },
  {
    label: "Jobs",
    to: "/jobs",
    icon: BriefcaseBusiness,
  },
  {
    label: "Resume analysis",
    to: "/resume-analysis",
    icon: FileSearch,
  },
  {
    label: "Mock interview",
    to: "/interview/mock",
    icon: MessageCircle,
  },
  {
    label: "Community",
    to: "/community",
    icon: UsersRound,
  },
  {
    label: "Feedback",
    to: "/feedback",
    icon: MessageSquareText,
  },
];

/* -------------------------------------------------------------------------- */
/* Career journey options                                                     */
/* -------------------------------------------------------------------------- */

const careerJourneys = [
  {
    id: "learn",
    title: "I want to learn",
    description:
      "Build new skills and follow your personalized learning roadmap.",
    icon: GraduationCap,
    destination: "/learning-goal",
  },
  {
    id: "dream_job",
    title: "My dream job",
    description:
      "Prepare for your desired career and identify missing skills.",
    icon: Target,
    destination: "/dream-job",
  },
  {
    id: "profile_jobs",
    title: "Jobs based on my profile",
    description:
      "Discover opportunities using your existing profile skills.",
    icon: BriefcaseBusiness,
    destination: "/jobs/profile",
  },
];

/* -------------------------------------------------------------------------- */
/* Workspace sidebar                                                          */
/* -------------------------------------------------------------------------- */

const WorkspaceSidebar = ({
  mobileOpen = false,
  onClose,
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  const prefersReducedMotion = useReducedMotion();

  const { logout } = useAuth();

  const [
    showJourneySelector,
    setShowJourneySelector,
  ] = useState(false);

  const [
    isChangingJourney,
    setIsChangingJourney,
  ] = useState(false);

  const [
    journeyError,
    setJourneyError,
  ] = useState("");

  /* ------------------------------------------------------------------------ */
  /* Logout                                                                   */
  /* ------------------------------------------------------------------------ */

  const handleLogout = () => {
    logout();

    navigate("/login", {
      replace: true,
    });

    onClose?.();
  };

  /* ------------------------------------------------------------------------ */
  /* Change career journey                                                    */
  /* ------------------------------------------------------------------------ */

  const handleJourneyChange = async (
    journeyType
  ) => {
    const selectedJourney =
      careerJourneys.find(
        (journey) =>
          journey.id === journeyType
      );

    if (
      !selectedJourney ||
      isChangingJourney
    ) {
      return;
    }

    setIsChangingJourney(true);
    setJourneyError("");

    try {
      await selectOnboardingJourney(
        journeyType
      );

      setShowJourneySelector(false);

      onClose?.();

      navigate(
        selectedJourney.destination,
        {
          replace: true,
        }
      );
    } catch (error) {
      console.error(
        "Career journey update failed:",
        error
      );

      setJourneyError(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to change your career goal. Please try again."
      );
    } finally {
      setIsChangingJourney(false);
    }
  };

  /* ------------------------------------------------------------------------ */
  /* Render                                                                   */
  /* ------------------------------------------------------------------------ */

  return (
    <>
      {/* Mobile backdrop */}

      {mobileOpen && (
        <button
          type="button"
          aria-label="Close workspace navigation"
          className="fixed inset-0 z-40 bg-teal-950/45 backdrop-blur-[2px] lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}

      <aside
        aria-label="Student workspace navigation"
        className={[
          "fixed inset-y-0 left-0 z-50 flex w-[250px] flex-col bg-[#073f33] text-stone-100",
          "border-r border-white/10 shadow-[12px_0_40px_rgba(5,45,36,0.08)]",
          "transition-transform duration-300 ease-out lg:translate-x-0",
          mobileOpen
            ? "translate-x-0"
            : "-translate-x-full",
        ].join(" ")}
      >
        {/* Brand */}

        <div className="flex h-20 shrink-0 items-center justify-between border-b border-white/10 px-5">
          <NavLink
            to="/dashboard"
            onClick={onClose}
            aria-label="CampusX dashboard"
            className="group inline-flex items-center gap-2.5 rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange-300"
          >
            <span className="flex size-9 items-center justify-center rounded-md bg-orange-300 text-teal-950 transition-transform duration-200 group-hover:scale-[1.03]">
              <Sparkles
                size={17}
                strokeWidth={2}
                aria-hidden="true"
              />
            </span>

            <span className="text-lg font-bold tracking-[-0.03em]">
              campus
              <span className="text-orange-300">
                X
              </span>
            </span>
          </NavLink>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex size-9 items-center justify-center rounded-md border border-white/10 text-white/70 hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-300 lg:hidden"
            aria-label="Close navigation"
          >
            <X
              size={18}
              aria-hidden="true"
            />
          </button>
        </div>

        {/* Navigation */}

        <nav
          className="min-h-0 flex-1 overflow-y-auto px-3 py-4 in-h-0 flex-1 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden px-3 py-4 "
          aria-label="Workspace"
          
        >
          <ul className="space-y-1">
            {navigation.map(
              ({
                label,
                to,
                icon: Icon,
              }) => {
                const isActive =
                  location.pathname === to ||
                  (
                    to !== "/dashboard" &&
                    location.pathname.startsWith(
                      `${to}/`
                    )
                  );

                return (
                  <li key={to}>
                    <NavLink
                      to={to}
                      onClick={onClose}
                      className={[
                        "group flex min-h-10 items-center gap-3 rounded-md px-3 text-[13px] font-medium",
                        "transition-[background-color,color,transform] duration-200",
                        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-300",
                        isActive
                          ? "bg-white/10 text-white shadow-[inset_3px_0_0_#fdad73]"
                          : "text-white/65 hover:bg-white/[0.07] hover:text-white",
                      ].join(" ")}
                    >
                      <Icon
                        size={17}
                        strokeWidth={1.7}
                        aria-hidden="true"
                        className={[
                          "shrink-0 transition-transform duration-200",
                          isActive
                            ? "text-orange-300"
                            : "text-white/60 group-hover:translate-x-0.5 group-hover:text-white/85",
                        ].join(" ")}
                      />

                      <span>{label}</span>
                    </NavLink>
                  </li>
                );
              }
            )}
          </ul>
        </nav>

        {/* Sidebar footer */}

        <div className="shrink-0 border-t border-white/10 px-3 py-3">

          {/* Change career goal */}

          <button
            type="button"
            onClick={() => {
              setJourneyError("");
              setShowJourneySelector(true);
            }}
            className="flex min-h-10 w-full items-center gap-3 rounded-md border border-orange-300/20 bg-orange-300/[0.08] px-3 text-[13px] font-semibold text-orange-200 transition-colors hover:bg-orange-300/[0.15] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-300"
          >
            <ArrowLeftRight
              size={17}
              aria-hidden="true"
            />

            <span>Change career goal</span>
          </button>

          {/* Existing student section */}

          <div className="mt-2 flex items-center gap-3 rounded-md px-2.5 py-2.5">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#d9eee8] text-sm font-semibold text-teal-950">
              L
            </div>

            <div className="min-w-0">
              <p className="truncate text-[13px] font-semibold text-white">
                Student
              </p>

              <p className="truncate text-[11px] text-white/45">
                Building your direction
              </p>
            </div>
          </div>

          {/* Logout */}

          <motion.button
            type="button"
            onClick={handleLogout}
            whileHover={
              prefersReducedMotion
                ? undefined
                : { x: 2 }
            }
            whileTap={
              prefersReducedMotion
                ? undefined
                : { scale: 0.98 }
            }
            className="mt-1 flex min-h-10 w-full items-center gap-3 rounded-md px-3 text-[13px] font-medium text-white/65 transition-colors duration-200 hover:bg-white/[0.07] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-300"
          >
            <LogOut
              size={17}
              strokeWidth={1.7}
              aria-hidden="true"
            />

            <span>Sign out</span>
          </motion.button>
        </div>
      </aside>

      {/* Career goal selector modal */}

      {showJourneySelector && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-teal-950/60 px-4 py-6 backdrop-blur-sm"
          role="presentation"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              !isChangingJourney
            ) {
              setShowJourneySelector(false);
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="career-journey-title"
            className="w-full max-w-lg overflow-hidden rounded-2xl border border-stone-200 bg-[#faf7f0] shadow-2xl"
          >
            <div className="flex items-start justify-between border-b border-stone-200 px-6 py-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-700">
                  Your career direction
                </p>

                <h2
                  id="career-journey-title"
                  className="mt-2 text-xl font-bold tracking-tight text-teal-950"
                >
                  Change your career goal
                </h2>

                <p className="mt-1 text-sm text-stone-500">
                  Choose what you want to focus on next.
                </p>
              </div>

              <button
                type="button"
                disabled={isChangingJourney}
                onClick={() =>
                  setShowJourneySelector(false)
                }
                aria-label="Close career goal selector"
                className="flex size-9 shrink-0 items-center justify-center rounded-lg text-stone-500 transition-colors hover:bg-stone-200 hover:text-teal-950 disabled:opacity-40"
              >
                <X size={19} />
              </button>
            </div>

            <div className="space-y-3 p-5">
              {careerJourneys.map(
                ({
                  id,
                  title,
                  description,
                  icon: Icon,
                }) => (
                  <button
                    key={id}
                    type="button"
                    disabled={isChangingJourney}
                    onClick={() =>
                      handleJourneyChange(id)
                    }
                    className="group flex w-full items-center gap-4 rounded-xl border border-stone-200 bg-white p-4 text-left transition-all hover:border-teal-700/40 hover:bg-[#f0f7f3] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-800 transition-colors group-hover:bg-teal-100">
                      <Icon size={21} />
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-bold text-teal-950">
                        {title}
                      </span>

                      <span className="mt-1 block text-xs leading-relaxed text-stone-500">
                        {description}
                      </span>
                    </span>

                    {isChangingJourney ? (
                      <LoaderCircle
                        size={18}
                        className="shrink-0 animate-spin text-teal-700"
                      />
                    ) : (
                      <ArrowLeftRight
                        size={17}
                        className="shrink-0 text-stone-400 transition-colors group-hover:text-teal-700"
                      />
                    )}
                  </button>
                )
              )}

              {journeyError && (
                <p
                  role="alert"
                  className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                  {journeyError}
                </p>
              )}
            </div>

            <div className="border-t border-stone-200 px-6 py-4">
              <p className="text-center text-xs text-stone-500">
                Your existing profile, resume and skills will be preserved.
              </p>
            </div>
          </section>
        </div>
      )}
    </>
  );
};

export default WorkspaceSidebar;