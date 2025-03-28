import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useLocation } from "wouter";
import { Farmer } from "@shared/schema";
import { 
  loginUser, 
  logoutUser, 
  registerUser, 
  getCurrentUser,
  requestPasswordReset,
  resetPassword
} from "@/lib/api";

interface AuthContextType {
  user: Farmer | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (userData: any) => Promise<void>;
  requestPasswordReset: (username: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Farmer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [, setLocation] = useLocation();

  // Check if user is already logged in
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const userData = await getCurrentUser();
        setUser(userData);
      } catch (error) {
        console.error("Error checking authentication status:", error);
        // Clear any potential stale user data
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Login function
  async function login(username: string, password: string) {
    setIsLoading(true);
    try {
      const userData = await loginUser(username, password);
      setUser(userData);
      setLocation("/dashboard");
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  }

  // Logout function
  async function logout() {
    setIsLoading(true);
    try {
      await logoutUser();
      setUser(null);
      setLocation("/login");
    } catch (error) {
      console.error("Error during logout:", error);
    } finally {
      setIsLoading(false);
    }
  }

  // Register function
  async function register(userData: any) {
    setIsLoading(true);
    try {
      await registerUser(userData);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  }

  // Request password reset function
  async function handleRequestPasswordReset(username: string) {
    setIsLoading(true);
    try {
      await requestPasswordReset(username);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  }

  // Reset password function
  async function handleResetPassword(token: string, newPassword: string) {
    setIsLoading(true);
    try {
      await resetPassword(token, newPassword);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  }

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    register,
    requestPasswordReset: handleRequestPasswordReset,
    resetPassword: handleResetPassword
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}