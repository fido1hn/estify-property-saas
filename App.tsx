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
import { UserRole } from "./types";
import { Properties } from "./pages/Properties";
import { PropertyDetails } from "./pages/PropertyDetails";
import { Tenants } from "./pages/Tenants";
import { TenantDetails } from "./pages/TenantDetails";
import { Staff } from "./pages/Staff";
import { StaffDetails } from "./pages/StaffDetails";
import { Maintenance } from "./pages/Maintenance";
import { Billing } from "./pages/Billing";
import { Messages } from "./pages/Messages";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0,
      refetchOnWindowFocus: false,
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

const RoleRoute = ({
  allowed,
  children,
}: {
  allowed: UserRole[];
  children: React.ReactNode;
}) => {
  const { role, loading } = useAuth();
  if (loading) return null;

  const userRole = mapDbRoleToUserRole(role);
  if (!userRole || !allowed.includes(userRole)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

const PublicOnlyRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const allowOnboarding =
    location.pathname.startsWith("/auth/signup") &&
    (searchParams.get("onboarding") === "1" ||
      sessionStorage.getItem("signup_onboarding") === "1" ||
      !!sessionStorage.getItem("signup_user_id"));

  if (isAuthenticated && !allowOnboarding) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
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
              <Route
                path="dashboard"
                element={
                  <RoleRoute
                    allowed={[
                      UserRole.Owner,
                      UserRole.Admin,
                      UserRole.Staff,
                      UserRole.Tenant,
                    ]}>
                    <Dashboard />
                  </RoleRoute>
                }
              />

              <Route
                path="properties"
                element={
                  <RoleRoute allowed={[UserRole.Owner, UserRole.Admin]}>
                    <Properties />
                  </RoleRoute>
                }
              />
              <Route
                path="properties/:id"
                element={
                  <RoleRoute allowed={[UserRole.Owner, UserRole.Admin]}>
                    <PropertyDetails />
                  </RoleRoute>
                }
              />

              <Route
                path="tenants"
                element={
                  <RoleRoute allowed={[UserRole.Owner, UserRole.Admin]}>
                    <Tenants />
                  </RoleRoute>
                }
              />
              <Route
                path="tenants/:id"
                element={
                  <RoleRoute allowed={[UserRole.Owner, UserRole.Admin]}>
                    <TenantDetails />
                  </RoleRoute>
                }
              />

              <Route
                path="staff"
                element={
                  <RoleRoute allowed={[UserRole.Owner, UserRole.Admin]}>
                    <Staff />
                  </RoleRoute>
                }
              />
              <Route
                path="staff/:id"
                element={
                  <RoleRoute allowed={[UserRole.Owner, UserRole.Admin]}>
                    <StaffDetails />
                  </RoleRoute>
                }
              />

              {/* Paused: RLS not configured yet for maintenance */}
              {/* <Route path="/maintenance/:id" element={<MaintenanceDetails />} /> */}

              {/* Paused: RLS not configured yet for analytics */}
              {/* <Route path="/analytics" element={<Analytics />} /> */}
              <Route
                path="maintenance"
                element={
                  <RoleRoute
                    allowed={[
                      UserRole.Owner,
                      UserRole.Admin,
                      UserRole.Staff,
                      UserRole.Tenant,
                    ]}>
                    <Maintenance />
                  </RoleRoute>
                }
              />
              <Route
                path="billing"
                element={
                  <RoleRoute
                    allowed={[UserRole.Owner, UserRole.Admin, UserRole.Tenant]}>
                    <Billing />
                  </RoleRoute>
                }
              />
              <Route
                path="messages"
                element={
                  <RoleRoute
                    allowed={[
                      UserRole.Owner,
                      UserRole.Admin,
                      UserRole.Staff,
                      UserRole.Tenant,
                    ]}>
                    <Messages />
                  </RoleRoute>
                }
              />
              <Route
                path="settings"
                element={
                  <RoleRoute
                    allowed={[
                      UserRole.Owner,
                      UserRole.Admin,
                      UserRole.Staff,
                      UserRole.Tenant,
                    ]}>
                    <Settings />
                  </RoleRoute>
                }
              />
              <Route
                path="*"
                element={
                  <div className="flex items-center justify-center h-full">
                    Coming soon
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
