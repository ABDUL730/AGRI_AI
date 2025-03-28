import React from "react";
import { Switch, Route, useLocation } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import Dashboard from "@/pages/dashboard";
import CropManagement from "@/pages/crop-management";
import Irrigation from "@/pages/irrigation";
import Loans from "@/pages/loans";
import Market from "@/pages/market";
import Assistant from "@/pages/assistant";
import CropWizard from "@/pages/crop-wizard";
import Settings from "@/pages/settings";
import Profile from "@/pages/profile";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { BuyerProvider, useBuyer } from "@/hooks/use-buyer";

// Interface for protected route props
interface ProtectedRouteProps {
  component: React.ComponentType<any>;
  requiresBuyer?: boolean;
  [key: string]: any;
}

// Protected route component
const ProtectedRoute = ({ component: Component, requiresBuyer = false, ...rest }: ProtectedRouteProps) => {
  const { isAuthenticated: isFarmerAuthenticated, isLoading: isFarmerLoading } = useAuth();
  const { isAuthenticated: isBuyerAuthenticated, isLoading: isBuyerLoading } = useBuyer();
  const [, navigate] = useLocation();

  // Determine authentication status based on requiresBuyer flag
  const isAuthenticated = requiresBuyer ? isBuyerAuthenticated : isFarmerAuthenticated;
  const isLoading = requiresBuyer ? isBuyerLoading : isFarmerLoading;

  // useEffect ensures this runs after render to avoid React warnings
  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <Component {...rest} />;
};

// Public route component
const PublicRoute = ({ component: Component, ...rest }: any) => {
  const { isAuthenticated: isFarmerAuthenticated, isLoading: isFarmerLoading } = useAuth();
  const { isAuthenticated: isBuyerAuthenticated, isLoading: isBuyerLoading } = useBuyer();
  const [, navigate] = useLocation();

  const isAuthenticated = isFarmerAuthenticated || isBuyerAuthenticated;
  const isLoading = isFarmerLoading || isBuyerLoading;

  // Redirect if already authenticated
  React.useEffect(() => {
    if (!isLoading && isAuthenticated && window.location.pathname === "/auth") {
      if (isFarmerAuthenticated) {
        navigate("/");
      } else if (isBuyerAuthenticated) {
        navigate("/market");
      }
    }
  }, [isLoading, isAuthenticated, isFarmerAuthenticated, isBuyerAuthenticated, navigate]);

  return <Component {...rest} />;
};

function Router() {
  return (
    <Switch>
      <Route path="/auth">
        {() => <PublicRoute component={AuthPage} />}
      </Route>
      <Route path="/">
        {() => <ProtectedRoute component={Dashboard} />}
      </Route>
      <Route path="/crop-management">
        {() => <ProtectedRoute component={CropManagement} />}
      </Route>
      <Route path="/irrigation">
        {() => <ProtectedRoute component={Irrigation} />}
      </Route>
      <Route path="/loans">
        {() => <ProtectedRoute component={Loans} />}
      </Route>
      <Route path="/market">
        {() => <ProtectedRoute component={Market} requiresBuyer={false} />}
      </Route>
      <Route path="/assistant">
        {() => <ProtectedRoute component={Assistant} />}
      </Route>
      <Route path="/crop-wizard">
        {() => <ProtectedRoute component={CropWizard} />}
      </Route>
      <Route path="/settings">
        {() => <ProtectedRoute component={Settings} />}
      </Route>
      <Route path="/profile">
        {() => <ProtectedRoute component={Profile} />}
      </Route>
      <Route path="/:rest*">
        {() => <PublicRoute component={NotFound} />}
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <AuthProvider>
      <BuyerProvider>
        <Router />
        <Toaster />
      </BuyerProvider>
    </AuthProvider>
  );
}

export default App;
