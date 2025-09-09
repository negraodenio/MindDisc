import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

// Pages
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Employees from "@/pages/Employees";
import DISCAssessments from "@/pages/DISCAssessments";
import MentalHealth from "@/pages/MentalHealth";
import PsychosocialRisks from "@/pages/PsychosocialRisks";
import RAPSModule from "@/pages/RAPSModule";
import INSSModule from "@/pages/INSSModule";
import LGPDModule from "@/pages/LGPDModule";
import InclusionModule from "@/pages/InclusionModule";
import Reports from "@/pages/Reports";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/not-found";

// Layout components
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/login" />;
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

function Router() {
  const { user } = useAuth();

  return (
    <Switch>
      <Route path="/login">
        {user ? <Redirect to="/" /> : <Login />}
      </Route>
      
      <Route path="/">
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      </Route>
      
      <Route path="/employees">
        <ProtectedRoute>
          <Employees />
        </ProtectedRoute>
      </Route>
      
      <Route path="/disc-assessments">
        <ProtectedRoute>
          <DISCAssessments />
        </ProtectedRoute>
      </Route>
      
      <Route path="/mental-health">
        <ProtectedRoute>
          <MentalHealth />
        </ProtectedRoute>
      </Route>
      
      <Route path="/psychosocial-risks">
        <ProtectedRoute>
          <PsychosocialRisks />
        </ProtectedRoute>
      </Route>
      
      <Route path="/raps">
        <ProtectedRoute>
          <RAPSModule />
        </ProtectedRoute>
      </Route>
      
      <Route path="/inss">
        <ProtectedRoute>
          <INSSModule />
        </ProtectedRoute>
      </Route>
      
      <Route path="/lgpd">
        <ProtectedRoute>
          <LGPDModule />
        </ProtectedRoute>
      </Route>
      
      <Route path="/inclusion">
        <ProtectedRoute>
          <InclusionModule />
        </ProtectedRoute>
      </Route>
      
      <Route path="/reports">
        <ProtectedRoute>
          <Reports />
        </ProtectedRoute>
      </Route>
      
      <Route path="/settings">
        <ProtectedRoute>
          <Settings />
        </ProtectedRoute>
      </Route>
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Router />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
