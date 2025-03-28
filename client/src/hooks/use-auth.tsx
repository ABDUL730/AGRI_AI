import { createContext, ReactNode, useContext } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Farmer type
export type Farmer = {
  id: number;
  username: string;
  fullName: string;
  location: string;
  phoneNumber: string;
  preferredLanguage: string | null;
};

type AuthContextType = {
  user: Farmer | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<Farmer, Error, LoginData>;
  registerMutation: UseMutationResult<Farmer, Error, RegisterData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  resetPasswordRequestMutation: UseMutationResult<void, Error, ResetRequestData>;
  resetPasswordMutation: UseMutationResult<void, Error, ResetPasswordData>;
};

type LoginData = {
  username: string;
  password: string;
};

type RegisterData = {
  username: string;
  password: string;
  fullName: string;
  location: string;
  phoneNumber: string;
  preferredLanguage?: string;
};

type ResetRequestData = {
  username: string;
};

type ResetPasswordData = {
  token: string;
  newPassword: string;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<Farmer | null, Error>({
    queryKey: ["/api/auth/check"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      const res = await apiRequest("POST", "/api/auth/login", credentials);
      return await res.json();
    },
    onSuccess: (user: Farmer) => {
      queryClient.setQueryData(["/api/auth/check"], user);
      toast({
        title: "Login successful",
        description: `Welcome back, ${user.fullName}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: "Invalid username or password",
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (userData: RegisterData) => {
      const res = await apiRequest("POST", "/api/auth/register", userData);
      return await res.json();
    },
    onSuccess: (user: Farmer) => {
      queryClient.setQueryData(["/api/auth/check"], user);
      toast({
        title: "Registration successful",
        description: `Welcome, ${user.fullName}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: "Username may already exist, or there was an error with the provided information",
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/auth/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/auth/check"], null);
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: "An error occurred during logout. Please try again.",
        variant: "destructive",
      });
    },
  });

  const resetPasswordRequestMutation = useMutation({
    mutationFn: async (data: ResetRequestData) => {
      await apiRequest("POST", "/api/auth/reset-password-request", data);
    },
    onSuccess: () => {
      toast({
        title: "Password reset requested",
        description: "If an account with that username exists, you will receive a reset token.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Request failed",
        description: "Could not request password reset. Please try again.",
        variant: "destructive",
      });
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async (data: ResetPasswordData) => {
      await apiRequest("POST", "/api/auth/reset-password", data);
    },
    onSuccess: () => {
      toast({
        title: "Password reset successful",
        description: "Your password has been updated. Please log in with your new password.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Reset failed",
        description: "Invalid or expired token. Please try again.",
        variant: "destructive",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user || null,
        isAuthenticated: !!user,
        isLoading,
        error,
        loginMutation,
        registerMutation,
        logoutMutation,
        resetPasswordRequestMutation,
        resetPasswordMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}