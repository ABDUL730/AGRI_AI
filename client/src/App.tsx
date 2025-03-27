import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import CropManagement from "@/pages/crop-management";
import Irrigation from "@/pages/irrigation";
import Loans from "@/pages/loans";
import Market from "@/pages/market";
import Assistant from "@/pages/assistant";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/login" component={Login} />
      <Route path="/crop-management" component={CropManagement} />
      <Route path="/irrigation" component={Irrigation} />
      <Route path="/loans" component={Loans} />
      <Route path="/market" component={Market} />
      <Route path="/assistant" component={Assistant} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <>
      <Router />
      <Toaster />
    </>
  );
}

export default App;
