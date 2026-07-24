import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { getMeApi, loginApi } from "../api/auth";
import { AuthContext } from "./auth-context";

const TOKEN_KEY = "luckywallet_access_token";

export function AuthProvider({ children }) {
  const [initialToken] = useState(() =>
    sessionStorage.getItem(TOKEN_KEY),
  );
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(Boolean(initialToken));

  useEffect(() => {
    if (!initialToken) return;

    let ignore = false;

    async function restoreLogin() {
      try {
        const currentUser = await getMeApi(initialToken);
        if (!ignore) setUser(currentUser);
      } catch {
        sessionStorage.removeItem(TOKEN_KEY);
        if (!ignore) setUser(null);
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }

    void restoreLogin();

    return () => {
      ignore = true;
    };
  }, [initialToken]);

  const login = useCallback(async (data) => {
    const result = await loginApi(data);
    sessionStorage.setItem(TOKEN_KEY, result.access_token);
    setUser(result.user);
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem(TOKEN_KEY);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, isLoading, login, logout }),
    [user, isLoading, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
