import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { getTokens, getUser, type StoredUser } from "@/Utils/tokenStorage";
import * as authService from "@/services/authService";

interface AuthContextType {
  user: StoredUser | null;
  isAuthenticated: boolean;
  isBootstrapping: boolean;
  login: (payload: authService.LoginPayload) => Promise<void>;
  logout: () => void;
  reloadUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<StoredUser | null>(() => getUser());
  const [isBootstrapping, setIsBootstrapping] = useState<boolean>(true);

  // On mount: if a token exists, hydrate user via get_auth
  useEffect(() => {
    const bootstrap = async () => {
      const { token } = getTokens();
      if (!token) {
        setIsBootstrapping(false);
        return;
      }
      try {
        const fresh = await authService.getAuth();
        setUser(fresh);
      } catch {
        authService.logout();
        setUser(null);
      } finally {
        setIsBootstrapping(false);
      }
    };
    void bootstrap();
  }, []);

  const handleLogin = async (payload: authService.LoginPayload) => {
    await authService.login(payload);
    const fresh = await authService.getAuth();
    setUser(fresh);
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
  };

  const reloadUser = async () => {
    const fresh = await authService.getAuth();
    setUser(fresh);
  };

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      isBootstrapping,
      login: handleLogin,
      logout: handleLogout,
      reloadUser,
    }),
    [user, isBootstrapping],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};
