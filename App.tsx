import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "react-hot-toast";
import { Dashboard } from "./pages/Dashboard";
import { Settings } from "./pages/Settings";
import Login from "./pages/auth/login";
import Signup from "./pages/auth/signup";
import { AuthStateProvider, useAuth } from "./contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { AppLayout } from "./components/layouts/AppLayout";
import { mapDbRoleToUserRole } from "./utils/auth";
import { Properties } from "./pages/Properties";
import { PropertyDetails } from "./pages/PropertyDetails";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
    },
  },
});

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

const PublicOnlyRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const allowOnboarding =
    location.pathname.startsWith("/auth/signup") &&
    searchParams.get("onboarding") === "1";

  if (isAuthenticated && !allowOnboarding) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

const DashboardRoute = () => {
  const { role } = useAuth();
  return <Dashboard role={mapDbRoleToUserRole(role)} />;
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools initialIsOpen={false} />
      <Router>
        <AuthStateProvider>
          <Routes>
            <Route
              path="/auth/login"
              element={
                <PublicOnlyRoute>
                  <Login />
                </PublicOnlyRoute>
              }
            />
            <Route
              path="/auth/signup"
              element={
                <PublicOnlyRoute>
                  <Signup />
                </PublicOnlyRoute>
              }
            />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardRoute />} />

              <Route path="properties" element={<Properties />} />
              <Route path="properties/:id" element={<PropertyDetails />} />

              {/* Paused: RLS not configured yet for tenants */}
              {/* <Route path="/tenants" element={<Tenants />} /> */}
              {/* <Route path="/tenants/:id" element={<TenantDetails />} /> */}

              {/* Paused: RLS not configured yet for staff */}
              {/* <Route path="/staff" element={<Staff />} /> */}
              {/* <Route path="/staff/:id" element={<StaffDetails />} /> */}

              {/* Paused: RLS not configured yet for maintenance */}
              {/* <Route path="/maintenance/:id" element={<MaintenanceDetails />} /> */}

              {/* Paused: RLS not configured yet for billing/analytics/messages */}
              {/* <Route path="/billing" element={<Billing />} /> */}
              {/* <Route path="/analytics" element={<Analytics />} /> */}
              {/* <Route path="/messages" element={<Messages />} /> */}
              <Route path="settings" element={<Settings />} />
              <Route
                path="*"
                element={
                  <div className="flex items-center justify-center h-full">
                    Page Not Found
                  </div>
                }
              />
            </Route>
          </Routes>
        </AuthStateProvider>
      </Router>
      <Toaster
        position="top-right"
        gutter={12}
        containerStyle={{ margin: "8px" }}
        toastOptions={{
          success: { duration: 3000 },
          error: { duration: 5000 },
          style: {
            fontSize: "16px",
            maxWidth: "500px",
            padding: "16px 24px",
            backgroundColor: "#fff",
            color: "#374151",
          },
        }}
      />
    </QueryClientProvider>
  );
};

export default App;
