import React, { useRef, useState } from "react";
import { Outlet } from "react-router-dom";

import { Sidebar } from "../Sidebar";
import { Topbar } from "../Topbar";
import { useAuth } from "../../contexts/AuthContext";
import { useNavItems } from "../../hooks/useNavItems";
import { User } from "../../types";
import { mapDbRoleToUserRole } from "../../utils/auth";
import { useOutsideClick } from "../../hooks/useOutsideClick";

export function AppLayout() {
  const { role, profile, signOut } = useAuth();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement | null>(null);

  const userRole = mapDbRoleToUserRole(role);

  // Transform auth profile to the shape Topbar expects
  const appUser = {
    ...(profile || {}),
    id: profile?.id || "temp-id",
    full_name: profile?.full_name || "User",
    role: userRole,
    avatar_url:
      profile?.avatar_url ||
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    email: profile?.email || "",
  } as User;

  const navItems = useNavItems(userRole);

  useOutsideClick(sidebarRef, () => setSidebarOpen(false), isSidebarOpen);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 relative">
      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div ref={sidebarRef} className="h-full">
        <Sidebar
          items={navItems}
          isOpen={isSidebarOpen}
          setIsOpen={setSidebarOpen}
        />
      </div>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar
          user={appUser}
          toggleSidebar={() => setSidebarOpen(!isSidebarOpen)}
          onLogout={signOut}
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
