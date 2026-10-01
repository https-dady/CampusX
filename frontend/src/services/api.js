import axios from "axios";

const TOKEN_KEY = "campusx_token";
const USER_KEY = "campusx_user";

const PUBLIC_AUTH_ENDPOINTS = [
  "/auth/login",
  "/auth/google",
  "/auth/signup",
  "/auth/verify-otp",
  "/auth/resend-otp",
  "/auth/forgot-password",
  "/auth/verify-reset-otp",
  "/auth/reset-password",
];

const isPublicAuthRequest = (url = "") =>
  PUBLIC_AUTH_ENDPOINTS.some((endpoint) =>
    url.includes(endpoint)
  );

const isInternalLearningCacheRequest = (url = "") =>
  url.includes("/learning/cache/");

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000/api",

  timeout: 15000,

  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,

  (error) => {
    const status = error?.response?.status;
    const requestUrl = error?.config?.url || "";

    const isCacheRequest =
      isInternalLearningCacheRequest(requestUrl);

    if (
      status === 401 &&
      !isPublicAuthRequest(requestUrl) &&
      !isCacheRequest
    ) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);

      const currentPath = window.location.pathname;

      if (currentPath !== "/login") {
        window.location.replace("/login");
      }
    }

    return Promise.reject(error);
  }
);

export default api;