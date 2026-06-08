import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { lazy, Suspense } from "react";
import { MotionConfig } from "framer-motion";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { SupabaseAuthProvider } from "./contexts/SupabaseAuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Investors from "./pages/Investors";
import { ArrowLeft } from "lucide-react";

const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const SystemicThinking = lazy(() => import("./pages/concepts/SystemicThinking"));
const CognitiveBiases = lazy(() => import("./pages/concepts/CognitiveBiases"));
const DecisionIntelligence = lazy(() => import("./pages/concepts/DecisionIntelligence"));
const MentalModels = lazy(() => import("./pages/concepts/MentalModels"));
const BookingPage = lazy(() => import("./pages/BookingPage"));
const BookingAdmin = lazy(() => import("./pages/BookingAdmin"));

function SmartThinkerzHubLink() {
  return (
    <a
      href="https://smarhinkerz.com"
      className="fixed top-4 left-4 z-50 inline-flex items-center gap-1.5 text-sm font-medium text-gray-300 hover:text-[#7dd3fc] transition-colors duration-200"
      title="Back to SmarThinkerz Hub"
    >
      <ArrowLeft className="h-4 w-4" />
      <span className="hidden sm:inline">Back to SmarThinkerz Hub</span>
      <span className="sm:hidden">Hub</span>
    </a>
  );
}

function Router() {
  return (
    <Suspense fallback={null}>
      <Switch>
        <Route path={"/"} component={Home} />
        <Route path={"/investors"} component={Investors} />
        <Route path={"/login"} component={Login} />
        <Route path={"/register"} component={Register} />
        <Route path={"/forgot-password"} component={ForgotPassword} />
        <Route path={"/dashboard"}>
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        </Route>
        <Route path={"/admin"}>
          <AdminDashboard />
        </Route>
        <Route path={"/concepts/systemic-thinking"} component={SystemicThinking} />
        <Route path={"/concepts/cognitive-biases"} component={CognitiveBiases} />
        <Route path={"/concepts/decision-intelligence"} component={DecisionIntelligence} />
        <Route path={"/concepts/mental-models"} component={MentalModels} />
        <Route path={"/book"} component={BookingPage} />
        <Route path={"/booking-admin"} component={BookingAdmin} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <MotionConfig reducedMotion="user">
        <ThemeProvider
          defaultTheme="light"
        >
          <SupabaseAuthProvider>
            <TooltipProvider>
              <Toaster />
              <SmartThinkerzHubLink />
              <Router />
            </TooltipProvider>
          </SupabaseAuthProvider>
        </ThemeProvider>
      </MotionConfig>
    </ErrorBoundary>
  );
}

export default App;
