import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

// Pages
import Splash from "@/pages/Splash";
import Onboarding from "@/pages/Onboarding";
import CheckIn from "@/pages/CheckIn";
import Practice from "@/pages/Practice";
import PostPractice from "@/pages/PostPractice";
import NotFound from "@/pages/not-found";

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background text-primary">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Redirect to="/welcome" />;
  }

  return <Component />;
}

function PublicRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return null;

  if (isAuthenticated) {
    return <Redirect to="/" />;
  }

  return <Component />;
}

function Router() {
  return (
    <Switch>
      {/* Public Pages */}
      <Route path="/splash" component={Splash} />
      <Route path="/welcome">
        <PublicRoute component={Onboarding} />
      </Route>

      {/* Protected Pages */}
      <Route path="/">
        <ProtectedRoute component={CheckIn} />
      </Route>
      <Route path="/practice/:id">
        <ProtectedRoute component={Practice} />
      </Route>
      <Route path="/integration/:id">
        <ProtectedRoute component={PostPractice} />
      </Route>

      {/* Fallback */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* Splash screen renders on top initially, logic inside Splash handles redirect */}
      <Route path="/splash" component={Splash} />
      
      <Toaster />
      <Router />
    </QueryClientProvider>
  );
}

export default App;
