
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { UserRole } from '../types';
import { NAV_ITEMS } from '../utils/constants';
import { X, LogOut } from 'lucide-react';

interface SidebarProps {
  role: UserRole;
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ role, isOpen, setIsOpen }) => {
  const filteredNav = NAV_ITEMS.filter(item => item.roles.includes(role));
  const location = useLocation();

  // Close sidebar on navigation on mobile
  const handleNavClick = () => {
    if (window.innerWidth < 1024) {
      setIsOpen(false);
    }
  };

  return (
    <aside 
      className={`fixed lg:relative inset-y-0 left-0 z-50 bg-white border-r border-gray-200 transition-all duration-300 flex flex-col 
        ${isOpen ? 'w-72 translate-x-0' : 'w-0 -translate-x-full lg:translate-x-0 lg:w-0 overflow-hidden border-none'}
      `}
    >
      <div className="p-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="bg-black text-white p-1 rounded">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="text-xl font-bold text-gray-900 tracking-tight">Estify</span>
        </div>
        <button 
          onClick={() => setIsOpen(false)} 
          className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {filteredNav.map((item) => (
          <NavLink
            key={item.id}
            to={`/${item.id}`}
            onClick={handleNavClick}
            className={({ isActive }) => 
              `flex items-center gap-4 px-3 py-3 rounded-xl transition-all whitespace-nowrap ${
                isActive 
                  ? 'bg-black text-white shadow-lg shadow-black/20' 
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
              }`
            }
          >
            <div className="flex-shrink-0">{item.icon}</div>
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-100 shrink-0">
        <button className="flex items-center gap-4 px-3 py-3 w-full text-gray-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all whitespace-nowrap">
          <LogOut size={20} />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
