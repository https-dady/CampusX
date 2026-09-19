import { useEffect, useState } from "react";
import { checkBackendHealth } from "./services/health.service";

function App() {
  const [status, setStatus] = useState("Checking backend...");
  const [error, setError] = useState("");

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const data = await checkBackendHealth();

        if (data.success) {
          setStatus(data.message);
        }
      } catch (err) {
        console.error("Backend connection error:", err);
        setError("Backend connection failed");
        setStatus("");
      }
    };

    checkHealth();
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <section
        className="w-full max-w-xl rounded-2xl border p-8 text-center"
        aria-labelledby="app-title"
      >
        <h1 id="app-title" className="text-3xl font-bold">
          Career Readiness Platform
        </h1>

        <div className="mt-6" aria-live="polite">
          {status && (
            <p className="text-lg">
              {status}
            </p>
          )}

          {error && (
            <p role="alert" className="mt-2">
              {error}
            </p>
          )}
        </div>
      </section>
    </main>
  );
}

export default App;