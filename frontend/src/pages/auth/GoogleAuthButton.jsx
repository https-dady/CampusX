import { useEffect, useRef, useState } from "react";
import api from "../../services/api.js";

const GOOGLE_SCRIPT_URL =
  "https://accounts.google.com/gsi/client";

let googleScriptPromise = null;

const loadGoogleScript = () => {
  if (window.google?.accounts?.id) {
    return Promise.resolve();
  }

  if (googleScriptPromise) {
    return googleScriptPromise;
  }

  googleScriptPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector(
      `script[src="${GOOGLE_SCRIPT_URL}"]`
    );

    if (existingScript) {
      existingScript.addEventListener("load", resolve, {
        once: true,
      });

      existingScript.addEventListener("error", reject, {
        once: true,
      });

      return;
    }

    const script = document.createElement("script");

    script.src = GOOGLE_SCRIPT_URL;
    script.async = true;
    script.defer = true;

    script.onload = resolve;

    script.onerror = () => {
      googleScriptPromise = null;

      reject(
        new Error(
          "Unable to load Google authentication"
        )
      );
    };

    document.head.appendChild(script);
  });

  return googleScriptPromise;
};

const GoogleAuthButton = ({
  onAuthenticated,
  onError,
  text = "signin_with",
}) => {
  const buttonRef = useRef(null);
  const initializedRef = useRef(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const initializeGoogle = async () => {
      try {
        const clientId =
          import.meta.env.VITE_GOOGLE_CLIENT_ID;

        if (!clientId) {
          throw new Error(
            "Google Client ID is not configured"
          );
        }

        await loadGoogleScript();

        if (
          !mounted ||
          !window.google?.accounts?.id
        ) {
          return;
        }

        const handleCredentialResponse = async (
          response
        ) => {
          if (!response?.credential) {
            const message =
              "Google credential was not received";

            if (mounted) {
              setError(message);
            }

            onError?.(message);

            return;
          }

          try {
            if (mounted) {
              setLoading(true);
              setError("");
            }

            const result = await api.post(
              "/auth/google",
              {
                credential: response.credential,
              }
            );

            if (!result.data?.success) {
              throw new Error(
                result.data?.message ||
                  "Google authentication failed"
              );
            }

            onAuthenticated?.(result.data.data);
          } catch (error) {
            const message =
              error.response?.data?.message ||
              error.message ||
              "Google authentication failed";

            if (mounted) {
              setError(message);
            }

            onError?.(message);
          } finally {
            if (mounted) {
              setLoading(false);
            }
          }
        };

        if (!initializedRef.current) {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: handleCredentialResponse,
            ux_mode: "popup",
          });

          initializedRef.current = true;
        }

        if (buttonRef.current) {
          buttonRef.current.innerHTML = "";

          window.google.accounts.id.renderButton(
            buttonRef.current,
            {
              type: "standard",
              theme: "outline",
              size: "large",
              text,
              shape: "rectangular",
              logo_alignment: "left",
            }
          );
        }

        if (mounted) {
          setLoading(false);
        }
      } catch (error) {
        const message =
          error.message ||
          "Unable to initialize Google authentication";

        if (mounted) {
          setError(message);
          setLoading(false);
        }

        onError?.(message);
      }
    };

    initializeGoogle();

    return () => {
      mounted = false;

      if (buttonRef.current) {
        buttonRef.current.innerHTML = "";
      }
    };
  }, [onAuthenticated, onError, text]);

  return (
    <div className="w-full">
      <div
        ref={buttonRef}
        className="flex min-h-10 w-full justify-center"
        aria-label="Sign in with Google"
      />

      {loading && (
        <p
          className="mt-2 text-center text-sm text-gray-500"
          role="status"
          aria-live="polite"
        >
          Loading Google Sign-In...
        </p>
      )}

      {error && (
        <p
          className="mt-2 text-center text-sm text-red-600"
          role="alert"
          aria-live="assertive"
        >
          {error}
        </p>
      )}
    </div>
  );
};

export default GoogleAuthButton;