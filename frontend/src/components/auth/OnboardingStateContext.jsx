import {
  createContext,
  useContext,
  useMemo,
} from "react";

const OnboardingStateContext =
  createContext(null);

export const OnboardingStateProvider = ({
  onboardingState,
  setOnboardingState,
  children,
}) => {
  const value = useMemo(
    () => ({
      onboardingState,
      setOnboardingState,
    }),
    [
      onboardingState,
      setOnboardingState,
    ]
  );

  return (
    <OnboardingStateContext.Provider
      value={value}
    >
      {children}
    </OnboardingStateContext.Provider>
  );
};

export const useOnboardingState = () => {
  const context = useContext(
    OnboardingStateContext
  );

  if (!context) {
    throw new Error(
      "useOnboardingState must be used inside OnboardingStateProvider."
    );
  }

  return context;
};

export default OnboardingStateContext;