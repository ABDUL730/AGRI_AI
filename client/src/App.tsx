import React from "react";
import { Switch, Route, useLocation } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import CropManagement from "@/pages/crop-management";
import Irrigation from "@/pages/irrigation";
import Loans from "@/pages/loans";
import Market from "@/pages/market";
import Assistant from "@/pages/assistant";
import CropWizard from "@/pages/crop-wizard";
import { AuthProvider, useAuth } from "@/hooks/use-auth";

// Protected route component
const ProtectedRoute = ({ component: Component, ...rest }: any) => {
  const { isAuthenticated, isLoading } = useAuth();
  const [, navigate] = useLocation();

  // useEffect ensures this runs after render to avoid React warnings
  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return <Component {...rest} />;
};

// Public route - accessible whether logged in or not
const PublicRoute = ({ component: Component, ...rest }: any) => {
  return <Component {...rest} />;
};

function Router() {
  return (
    <Switch>
      <Route path="/login">
        {() => <PublicRoute component={Login} />}
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
        {() => <ProtectedRoute component={Market} />}
      </Route>
      <Route path="/assistant">
        {() => <ProtectedRoute component={Assistant} />}
      </Route>
      <Route path="/crop-wizard">
        {() => <ProtectedRoute component={CropWizard} />}
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
      <Router />
      <Toaster />
    </AuthProvider>
  );
}

export default App;
