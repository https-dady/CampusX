import { useState } from "react";

import GoogleAuthButton from "./GoogleAuthButton.jsx";

const GoogleTest = () => {
  const [authResult, setAuthResult] = useState(null);
  const [error, setError] = useState("");

  const handleAuthenticated = (data) => {
    setError("");
    setAuthResult(data);
  };

  const handleError = (message) => {
    setAuthResult(null);
    setError(message);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <section
        className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg"
        aria-labelledby="google-test-title"
      >
        <div className="mb-6 text-center">
          <h1
            id="google-test-title"
            className="text-2xl font-bold text-gray-900"
          >
            CampusX Google Authentication
          </h1>

          <p className="mt-2 text-sm text-gray-600">
            Temporary Google authentication test
          </p>
        </div>

        <GoogleAuthButton
          onAuthenticated={handleAuthenticated}
          onError={handleError}
        />

        {error && (
          <div
            className="mt-6 rounded-lg bg-red-50 p-4 text-sm text-red-700"
            role="alert"
          >
            <p className="font-semibold">
              Authentication failed
            </p>

            <p className="mt-1">
              {error}
            </p>
          </div>
        )}

        {authResult && (
          <div
            className="mt-6 rounded-lg bg-green-50 p-4"
            role="status"
            aria-live="polite"
          >
            <p className="font-semibold text-green-800">
              Google authentication successful
            </p>

            <div className="mt-3 space-y-1 text-sm text-green-900">
              <p>
                <strong>Name:</strong>{" "}
                {authResult.user?.name}
              </p>

              <p>
                <strong>Email:</strong>{" "}
                {authResult.user?.email}
              </p>

              <p>
                <strong>Provider:</strong>{" "}
                {authResult.user?.authProvider}
              </p>

              <p>
                <strong>Email Verified:</strong>{" "}
                {String(
                  authResult.user?.isEmailVerified
                )}
              </p>

              <p>
                <strong>JWT:</strong> Received
              </p>
            </div>
          </div>
        )}
      </section>
    </main>
  );
};

export default GoogleTest;