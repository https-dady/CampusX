import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const AuthContext = createContext(null);

const TOKEN_KEY = "campusx_token";
const USER_KEY = "campusx_user";

const getStoredUser = () => {
  try {
    const storedUser = localStorage.getItem(USER_KEY);

    if (!storedUser) {
      return null;
    }

    return JSON.parse(storedUser);
  } catch (error) {
    console.error(
      "Failed to read stored CampusX user:",
      error
    );

    localStorage.removeItem(USER_KEY);

    return null;
  }
};

const getStoredToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(
    getStoredToken
  );

  const [user, setUser] = useState(
    getStoredUser
  );

  const [isInitializing, setIsInitializing] =
    useState(true);

  const isAuthenticated = Boolean(token);

  useEffect(() => {
    const initializeAuth = () => {
      const storedToken = getStoredToken();
      const storedUser = getStoredUser();

      setToken(storedToken);
      setUser(storedUser);
      setIsInitializing(false);
    };

    initializeAuth();
  }, []);

  const setSession = useCallback(
    ({ token: nextToken, user: nextUser }) => {
      if (!nextToken) {
        return;
      }

      localStorage.setItem(
        TOKEN_KEY,
        nextToken
      );

      if (nextUser) {
        localStorage.setItem(
          USER_KEY,
          JSON.stringify(nextUser)
        );
      } else {
        localStorage.removeItem(USER_KEY);
      }

      setToken(nextToken);
      setUser(nextUser || null);
    },
    []
  );

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);

    setToken(null);
    setUser(null);
  }, []);

  const clearAuth = useCallback(() => {
    logout();
  }, [logout]);

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated,
      isInitializing,
      setSession,
      logout,
      clearAuth,
    }),
    [
      token,
      user,
      isAuthenticated,
      isInitializing,
      setSession,
      logout,
      clearAuth,
    ]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider."
    );
  }

  return context;
};

export default AuthContext;