import { BrowserRouter, Route, Routes } from "react-router-dom";

import "./App.css";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ProtectedRoute from "./components/ProtectedRoute";
import UpdatePasswordPage from "./pages/UpdatePasswordPage";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import { AuthProvider } from "./context/AuthContext";
import Index from "./pages/Index";
import { Toaster } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import ApiKeys from "./pages/ApiKeys";
import Logs from "./pages/Logs";
import { DashboardLayout } from "./components/DashBoardLayout";
import Template from "./pages/Template";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Playground from "./pages/Playground";

function App() {
  // 1. Create a client
const queryClient = new QueryClient();
  return (
    <>
    <QueryClientProvider client={queryClient}>

      <TooltipProvider>
        <Toaster />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />

              {/* Protected Route: Update Password 
             This MUST be protected because the user needs to be logged in 
             (via the email link) to change their password.
          */}
              <Route path="/update-password" element={<UpdatePasswordPage />} />

              {/* Main App Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Dashboard />} />
                <Route path="logs" element={<Logs />} />
                <Route path="api-keys" element={<ApiKeys />} />
                <Route path="settings" element={<Settings />} />
                <Route path="templates" element={<Template />} />
                <Route path="playground" element={<Playground />} />

              </Route>

              {/* Default Redirect */}
              <Route path="/" element={<Index />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
    </>
  );
}

export default App;
