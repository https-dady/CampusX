import { useEffect, useState } from "react";

import {
  Loader2,
} from "lucide-react";

import {
  Navigate,
} from "react-router-dom";

import Onboarding from "./Onboarding.jsx";

import {
  getOnboarding,
} from "../../services/onboarding.service";

const OnboardingRouteGate = () => {
  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    redirectTo,
    setRedirectTo,
  ] = useState("");

  useEffect(() => {
    let mounted = true;

    const checkJourney = async () => {
      try {
        const result =
          await getOnboarding();

        const onboarding =
          result?.data?.onboarding;

        if (
          mounted &&
          onboarding?.status ===
            "journey_selected" &&
          onboarding?.journeyType ===
            "learn"
        ) {
          setRedirectTo(
            "/learning-goal"
          );
        }
      } catch (error) {
        if (mounted) {
          console.error(
            "Failed to check onboarding journey route:",
            error
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    checkJourney();

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#faf7f0] px-5">
        <div
          className="flex items-center gap-2 text-sm font-medium text-stone-500"
          role="status"
          aria-live="polite"
        >
          <Loader2
            size={16}
            className="animate-spin"
          />

          Preparing your career journey...
        </div>
      </main>
    );
  }

  if (redirectTo) {
    return (
      <Navigate
        to={redirectTo}
        replace
      />
    );
  }

  return <Onboarding />;
};

export default OnboardingRouteGate;