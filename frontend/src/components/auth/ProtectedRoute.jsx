import {
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useAuth,
} from "../../context/AuthContext";

import {
  getOnboarding,
} from "../../services/onboarding.service";

import {
  OnboardingStateProvider,
} from "./OnboardingStateContext";

const getJourneyDestination = (journeyType) => {
  switch (journeyType) {
    case "learn":
      return "/learning-goal";

    case "dream_job":
      return "/dream-job";

    case "profile_jobs":
      return "/jobs/profile";

    default:
      return "/onboarding";
  }
};

const ProtectedRoute = ({
  children,
}) => {
  const {
    isAuthenticated,
    isInitializing,
  } = useAuth();

  const location = useLocation();

  const [onboardingState, setOnboardingState] =
    useState(null);

  const [isCheckingOnboarding, setIsCheckingOnboarding] =
    useState(false);

  const [onboardingError, setOnboardingError] =
    useState("");

  useEffect(() => {
    if (
      !isAuthenticated ||
      isInitializing
    ) {
      return undefined;
    }

    let mounted = true;

    setIsCheckingOnboarding(true);
    setOnboardingError("");

    getOnboarding()
      .then((result) => {
        if (!mounted) {
          return;
        }

        setOnboardingState(
          result?.data || null
        );
      })
      .catch((error) => {
        if (!mounted) {
          return;
        }

        console.error(
          "Failed to check CampusX onboarding state:",
          error
        );

        setOnboardingState(null);
        setOnboardingError(
          error?.response?.data?.message ||
            error?.message ||
            "Unable to verify your onboarding state."
        );
      })
      .finally(() => {
        if (mounted) {
          setIsCheckingOnboarding(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [
    isAuthenticated,
    isInitializing,
  ]);

  const isOnboardingRoute =
    location.pathname === "/onboarding";

  const status =
    onboardingState?.onboarding?.status ||
    null;

  const journeyType =
    onboardingState?.onboarding?.journeyType ||
    null;

  const journeyDestination =
    getJourneyDestination(journeyType);

  const isJourneyRoute =
    location.pathname === "/learning-goal" ||
    location.pathname === "/dream-job" ||
    location.pathname === "/jobs/profile" ||
    location.pathname === "/learning-roadmap" ||
    location.pathname === "/courses-resources";

  const journeyRouteAllowed = useMemo(() => {
    if (!isJourneyRoute) {
      return true;
    }

    if (journeyType === "learn") {
      return (
        location.pathname === "/learning-goal" ||
        location.pathname === "/learning-roadmap" ||
        location.pathname === "/courses-resources"
      );
    }

    if (journeyType === "dream_job") {
      return location.pathname === "/dream-job";
    }

    if (journeyType === "profile_jobs") {
      return location.pathname === "/jobs/profile";
    }

    return false;
  }, [
    isJourneyRoute,
    journeyType,
    location.pathname,
  ]);

  if (isInitializing) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#faf7f0] px-5">
        <p
          className="text-sm font-medium text-stone-500"
          role="status"
          aria-live="polite"
        >
          Loading your workspace...
        </p>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location.pathname,
        }}
      />
    );
  }

  if (
    isCheckingOnboarding ||
    (!onboardingState && !onboardingError)
  ) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#faf7f0] px-5">
        <p
          className="text-sm font-medium text-stone-500"
          role="status"
          aria-live="polite"
        >
          Checking your career journey...
        </p>
      </main>
    );
  }

  if (onboardingError || !onboardingState) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#faf7f0] px-5">
        <section className="w-full max-w-xl rounded-2xl border border-red-200 bg-white p-7 text-center shadow-sm">
          <p className="text-sm font-semibold text-red-700">
            {onboardingError ||
              "Unable to verify your onboarding state."}
          </p>

          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-5 min-h-11 rounded-lg bg-teal-950 px-5 text-sm font-semibold text-white"
          >
            Try again
          </button>
        </section>
      </main>
    );
  }

  if (
    status === "profile_incomplete" &&
    !isOnboardingRoute
  ) {
    return (
      <Navigate
        to="/onboarding"
        replace
      />
    );
  }

  if (
    (
      status === "profile_completed" ||
      status === "career_analyzed"
    ) &&
    !isOnboardingRoute
  ) {
    return (
      <Navigate
        to="/onboarding"
        replace
      />
    );
  }

  if (
    status === "journey_selected" &&
    isOnboardingRoute
  ) {
    return (
      <Navigate
        to={journeyDestination}
        replace
      />
    );
  }

  if (
    status === "journey_selected" &&
    isJourneyRoute &&
    !journeyRouteAllowed
  ) {
    return (
      <Navigate
        to={journeyDestination}
        replace
      />
    );
  }

  if (
    status !== "profile_incomplete" &&
    status !== "profile_completed" &&
    status !== "career_analyzed" &&
    status !== "journey_selected"
  ) {
    return (
      <Navigate
        to="/onboarding"
        replace
      />
    );
  }

  if (children) {
    return (
      <OnboardingStateProvider
        onboardingState={onboardingState}
        setOnboardingState={setOnboardingState}
      >
        {children}
      </OnboardingStateProvider>
    );
  }

  return (
    <OnboardingStateProvider
      onboardingState={onboardingState}
      setOnboardingState={setOnboardingState}
    >
      <Outlet />
    </OnboardingStateProvider>
  );
};

export default ProtectedRoute;
