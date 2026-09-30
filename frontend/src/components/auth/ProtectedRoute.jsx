import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const {
    isAuthenticated,
    isInitializing,
  } = useAuth();

  const location = useLocation();

  if (isInitializing) {
    return (
      <main
        className="
          flex min-h-screen
          items-center justify-center
          bg-[#faf7f0]
          px-5
        "
      >
        <p
          className="
            text-sm
            font-medium
            text-stone-500
          "
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

  if (children) {
    return children;
  }

  return <Outlet />;
};

export default ProtectedRoute;