
import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
import { UserRole } from './types';
import { MOCK_USER } from './constants';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState(MOCK_USER);
  const [isSidebarOpen, setSidebarOpen] = useState(false); // Default to closed on mobile

  return (
    <Router>
      <div className="flex h-screen overflow-hidden bg-gray-50 relative">
        {/* Sidebar Overlay for Mobile */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <Sidebar 
          role={currentUser.role} 
          isOpen={isSidebarOpen} 
          setIsOpen={setSidebarOpen} 
        />
        
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Topbar 
            user={currentUser} 
            toggleSidebar={() => setSidebarOpen(!isSidebarOpen)} 
            setRole={(role: UserRole) => setCurrentUser({ ...currentUser, role })}
          />
          
          <main className="flex-1 overflow-y-auto p-4 md:p-8">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard role={currentUser.role} />} />
              
              <Route path="/properties" element={<Properties />} />
              <Route path="/properties/:id" element={<PropertyDetails />} />
              
              <Route path="/tenants" element={<Tenants />} />
              <Route path="/tenants/:id" element={<TenantDetails />} />

              <Route path="/staff" element={<Staff />} />
              <Route path="/staff/:id" element={<StaffDetails />} />
              
              <Route path="/maintenance" element={<Maintenance role={currentUser.role} />} />
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
    </Router>
  );
};

export default App;
