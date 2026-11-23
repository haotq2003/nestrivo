"use client";

import React, { 
  createContext, 
  useContext, 
  useState, 
  useEffect, 
  useCallback 
} from "react";
import { 
  AuthUser, 
  LoginCredentials, 
  RegisterCredentials, 
  AuthResponse 
} from "@/types/auth";
import { 
  getStoredUser, 
  getStoredToken, 
  loginApi, 
  registerApi, 
  removeStoredAuth, 
  fetchMeApi 
} from "@/service/auth.service";

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLandlord: boolean;
  login: (credentials: LoginCredentials) => Promise<AuthResponse>;
  register: (credentials: RegisterCredentials) => Promise<AuthResponse>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,
  isAdmin: false,
  isLandlord: false,
  login: async () => { throw new Error("AuthProvider not mounted"); },
  register: async () => { throw new Error("AuthProvider not mounted"); },
  logout: () => {},
  refreshUser: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Sync state from storage
  const syncFromStorage = useCallback(() => {
    const storedUser = getStoredUser();
    const storedToken = getStoredToken();
    setUser(storedUser);
    setToken(storedToken);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    // Initial deferred load
    const timer = setTimeout(() => {
      syncFromStorage();
      fetchMeApi().then((fresh) => {
        if (fresh) setUser(fresh);
      });
    }, 0);

    const handleAuthChange = () => {
      syncFromStorage();
    };

    window.addEventListener("nestrivo_auth_change", handleAuthChange);
    window.addEventListener("storage", handleAuthChange);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("nestrivo_auth_change", handleAuthChange);
      window.removeEventListener("storage", handleAuthChange);
    };
  }, [syncFromStorage]);

  const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const res = await loginApi(credentials);
    setUser(res.user);
    setToken(res.token);
    return res;
  };

  const register = async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    const res = await registerApi(credentials);
    setUser(res.user);
    setToken(res.token);
    return res;
  };

  const logout = () => {
    removeStoredAuth();
    setUser(null);
    setToken(null);
  };

  const refreshUser = async () => {
    const fresh = await fetchMeApi();
    if (fresh) setUser(fresh);
  };

  const isAuthenticated = !!token && !!user;
  const isAdmin = !!user?.roles?.includes("ADMIN");
  const isLandlord = !!user?.roles?.includes("LANDLORD") || !!isAdmin;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated,
        isAdmin,
        isLandlord,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

