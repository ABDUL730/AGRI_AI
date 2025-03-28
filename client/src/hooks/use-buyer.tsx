import { createContext, ReactNode, useContext } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Buyer type - can expand as needed
export type Buyer = {
  id: number;
  username: string;
  fullName: string;
  location: string;
  preferredLanguage: string | null;
  companyName: string | null;
  businessType: string;
  verificationStatus: string | null;
  email: string;
};

type BuyerContextType = {
  buyer: Buyer | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<Buyer, Error, LoginData>;
  registerMutation: UseMutationResult<Buyer, Error, RegisterData>;
  logoutMutation: UseMutationResult<void, Error, void>;
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
  email: string;
  businessType: string;
  companyName?: string;
  preferredLanguage?: string;
};

export const BuyerContext = createContext<BuyerContextType | null>(null);

export function BuyerProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const {
    data: buyer,
    error,
    isLoading,
  } = useQuery<Buyer | null, Error>({
    queryKey: ["/api/buyer/check"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      const res = await apiRequest("POST", "/api/buyer/login", credentials);
      return await res.json();
    },
    onSuccess: (user: Buyer) => {
      queryClient.setQueryData(["/api/buyer/check"], user);
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
    mutationFn: async (credentials: RegisterData) => {
      const res = await apiRequest("POST", "/api/buyer/register", credentials);
      return await res.json();
    },
    onSuccess: (user: Buyer) => {
      queryClient.setQueryData(["/api/buyer/check"], user);
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
      await apiRequest("POST", "/api/buyer/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/buyer/check"], null);
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

  return (
    <BuyerContext.Provider
      value={{
        buyer: buyer || null, // Handle undefined case
        isAuthenticated: !!buyer,
        isLoading,
        error,
        loginMutation,
        registerMutation,
        logoutMutation,
      }}
    >
      {children}
    </BuyerContext.Provider>
  );
}

export function useBuyer() {
  const context = useContext(BuyerContext);
  if (!context) {
    throw new Error("useBuyer must be used within a BuyerProvider");
  }
  return context;
}