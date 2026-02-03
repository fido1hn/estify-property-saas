import React, { useState } from 'react';
import { Search, Bell, Mail, ChevronDown, User as UserIcon, Menu, LogOut } from 'lucide-react';
import { User, UserRole } from '../types';

interface TopbarProps {
  user: User;
  toggleSidebar: () => void;
  setRole: (role: UserRole) => void;
  onLogout?: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ user, toggleSidebar, setRole, onLogout }) => {
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  return (
    <header className="h-20 bg-white border-b border-gray-100 px-4 md:px-8 flex items-center justify-between sticky top-0 z-10 shrink-0">
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <button 
          onClick={toggleSidebar}
          className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-all"
          aria-label="Toggle Sidebar"
        >
          <Menu size={24} />
        </button>

        <div className="relative w-full hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search property, units, tenants..." 
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-transparent rounded-2xl focus:outline-none focus:bg-white focus:border-gray-200 transition-all text-sm"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-6">
        <div className="flex items-center gap-1 md:gap-4 px-2 md:px-4 py-2 bg-gray-50 rounded-2xl border border-gray-100">
          <button className="p-2 text-gray-500 hover:text-gray-900 transition-colors relative">
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 rounded-full border-2 border-white"></span>
          </button>
          <button className="p-2 text-gray-500 hover:text-gray-900 transition-colors hidden xs:block">
            <Mail size={20} />
          </button>
        </div>

        <div className="relative">
          <button 
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center gap-2 md:gap-3 p-1.5 hover:bg-gray-50 rounded-2xl transition-all"
          >
            <img src={user.avatar_url || `https://ui-avatars.com/api/?name=${user.full_name}`} alt={user.full_name} className="w-8 h-8 md:w-10 md:h-10 rounded-xl object-cover" />
            <div className="hidden lg:block text-left">
              <p className="text-sm font-bold text-gray-900">{user.full_name}</p>
              <p className="text-xs text-gray-500">{user.role?.replace('_', ' ') || user.id}</p>
            </div>
            <ChevronDown size={16} className={`text-gray-400 transition-transform ${showRoleMenu ? 'rotate-180' : ''}`} />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-100 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-4 py-2 border-b border-gray-50 mb-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Switch Role (Dev Only)</span>
              </div>
              {Object.values(UserRole).map((role) => (
                <button
                  key={role}
                  onClick={() => {
                    setRole(role);
                    setShowRoleMenu(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm transition-colors hover:bg-gray-50 ${user.role === role ? 'text-orange-500 font-bold' : 'text-gray-600'}`}
                >
                  {role.replace('_', ' ')}
                </button>
              ))}
              <div className="border-t border-gray-50 mt-2 pt-2">
                <button className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-2">
                  <UserIcon size={16} /> My Profile
                </button>
                <button 
                  onClick={onLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <LogOut size={16} /> Log Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
