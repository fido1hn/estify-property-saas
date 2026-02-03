import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'react-hot-toast';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { Dashboard } from './pages/Dashboard';
import { Properties } from './pages/Properties';
import { PropertyDetails } from './pages/PropertyDetails';
import { Tenants } from './pages/Tenants';
import { TenantDetails } from './pages/TenantDetails';
import { Staff } from './pages/Staff';
import { StaffDetails } from './pages/StaffDetails';
import { Maintenance } from './pages/Maintenance';
import { MaintenanceDetails } from './pages/MaintenanceDetails';
import { Billing } from './pages/Billing';
import { Analytics } from './pages/Analytics';
import { Messages } from './pages/Messages';
import { Settings } from './pages/Settings';
import Login from './pages/auth/login';
import Signup from './pages/auth/signup';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { UserRole } from './types';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
    },
  },
});

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="h-screen w-full flex items-center justify-center bg-slate-50"><Loader2 className="w-8 h-8 animate-spin text-indigo-600"/></div>;
  }

  if (!session) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

const AppContent = () => {
  const { role, profile, signOut } = useAuth();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  
  // Map DB role to FE role
  const getUserRole = (dbRole: string | null): UserRole => {
    switch (dbRole) {
      case 'owner': return UserRole.PROPERTY_MANAGER;
      case 'admin': return UserRole.COMPANY_ADMIN;
      case 'staff': return UserRole.MAINTENANCE; // Using MAINTENANCE as default staff role for now
      case 'tenant': return UserRole.TENANT;
      default: return UserRole.PROPERTY_MANAGER; // Default fallback
    }
  };

  // Transform auth profile to the shape Topbar expects
  const appUser = {
    id: profile?.id || 'temp-id',
    name: profile?.full_name || 'User',
    role: getUserRole(role),
    avatar: profile?.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    email: profile?.email || ''
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 relative">
      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar 
        role={appUser.role} 
        isOpen={isSidebarOpen} 
        setIsOpen={setSidebarOpen} 
      />
      
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar 
          user={appUser} 
          toggleSidebar={() => setSidebarOpen(!isSidebarOpen)} 
          setRole={() => {}} 
          /* @ts-ignore - Topbar might not expect onLogout yet, need to check */
          onLogout={signOut}
        />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard role={appUser.role} />} />
            
            <Route path="/properties" element={<Properties />} />
            <Route path="/properties/:id" element={<PropertyDetails />} />
            
            <Route path="/tenants" element={<Tenants />} />
            <Route path="/tenants/:id" element={<TenantDetails />} />

            <Route path="/staff" element={<Staff />} />
            <Route path="/staff/:id" element={<StaffDetails />} />
            
            <Route path="/maintenance" element={<Maintenance role={appUser.role} />} />
            <Route path="/maintenance/:id" element={<MaintenanceDetails />} />
            
            <Route path="/billing" element={<Billing />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<div className="flex items-center justify-center h-full">Page Not Found</div>} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools initialIsOpen={false} />
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/signup" element={<Signup />} />
            <Route path="/*" element={
              <ProtectedRoute>
                <AppContent />
              </ProtectedRoute>
            } />
          </Routes>
        </AuthProvider>
      </Router>
      <Toaster 
        position="top-right"
        gutter={12}
        containerStyle={{ margin: '8px' }}
        toastOptions={{
          success: { duration: 3000 },
          error: { duration: 5000 },
          style: {
            fontSize: '16px',
            maxWidth: '500px',
            padding: '16px 24px',
            backgroundColor: '#fff',
            color: '#374151',
          }
        }} 
      />
    </QueryClientProvider>
  );
};

export default App;
