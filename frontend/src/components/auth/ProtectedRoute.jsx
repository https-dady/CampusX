import {
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";

import {
  useEffect,
  useState,
} from "react";

import {
  useAuth,
} from "../../context/AuthContext";

import {
  getOnboarding,
} from "../../services/onboarding.service";

const ProtectedRoute = ({
  children,
}) => {
  const {
    isAuthenticated,
    isInitializing,
  } = useAuth();

  const location =
    useLocation();

  const [
    onboardingState,
    setOnboardingState,
  ] = useState(null);

  const [
    isCheckingOnboarding,
    setIsCheckingOnboarding,
  ] = useState(false);

  useEffect(() => {
    if (
      !isAuthenticated ||
      isInitializing
    ) {
      return undefined;
    }

    let mounted = true;

    setIsCheckingOnboarding(true);

    getOnboarding()
      .then((result) => {
        if (!mounted) {
          return;
        }

        setOnboardingState(
          result?.data?.onboarding ||
            null
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
      })
      .finally(() => {
        if (mounted) {
          setIsCheckingOnboarding(
            false
          );
        }
      });

    return () => {
      mounted = false;
    };
  }, [
    isAuthenticated,
    isInitializing,
  ]);

  if (
    isInitializing ||
    (
      isAuthenticated &&
      isCheckingOnboarding &&
      !onboardingState
    )
  ) {
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
          from:
            location.pathname,
        }}
      />
    );
  }

  const isOnboardingRoute =
    location.pathname ===
    "/onboarding";

  const status =
    onboardingState?.status ||
    "profile_incomplete";

  const missingFields =
    onboardingState
      ?.profileCompletion
      ?.missingFields || [];

  const needsOnboarding =
    !isOnboardingRoute &&
    (
      (
        status ===
          "profile_incomplete" &&
        missingFields.length > 0
      ) ||
      status ===
        "profile_completed" ||
      status ===
        "career_analyzed"
    );

  if (needsOnboarding) {
    return (
      <Navigate
        to="/onboarding"
        replace
      />
    );
  }

  if (children) {
    return children;
  }

  return <Outlet />;
};

export default ProtectedRoute;