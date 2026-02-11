
import React from 'react';
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  Wrench, 
  CreditCard, 
  BarChart3, 
  MessageSquare, 
  Settings,
  ShieldCheck 
} from 'lucide-react';
import { UserRole } from '../types';

export type NavItem = {
  id: string;
  label: string;
  icon: React.ReactNode;
  roles: UserRole[];
};

export const PAGE_SIZE = 10;

export const NAV_ITEMS: NavItem[] = [
  { 
    id: 'dashboard', 
    label: 'Dashboard', 
    icon: <LayoutDashboard size={20} />, 
    roles: [UserRole.Owner, UserRole.Admin, UserRole.Staff, UserRole.Tenant] 
  },
  { 
    id: 'properties', 
    label: 'Properties', 
    icon: <Building2 size={20} />, 
    roles: [UserRole.Owner, UserRole.Admin] 
  },
  { 
    id: 'tenants', 
    label: 'Tenants', 
    icon: <Users size={20} />, 
    roles: [UserRole.Owner, UserRole.Admin] 
  },
   { 
    id: 'staff', 
    label: 'Staff', 
    icon: <ShieldCheck size={20} />, 
    roles: [UserRole.Owner, UserRole.Admin] 
  },
  { 
    id: 'maintenance', 
    label: 'Maintenance', 
    icon: <Wrench size={20} />, 
    roles: [UserRole.Owner, UserRole.Admin, UserRole.Staff, UserRole.Tenant] 
  },
  { 
    id: 'billing', 
    label: 'Billing', 
    icon: <CreditCard size={20} />, 
    roles: [UserRole.Owner, UserRole.Admin, UserRole.Tenant] 
  },
  { 
    id: 'analytics', 
    label: 'Analytics', 
    icon: <BarChart3 size={20} />, 
    roles: [UserRole.Owner, UserRole.Admin] 
  },
  { 
    id: 'messages', 
    label: 'Messages', 
    icon: <MessageSquare size={20} />, 
    roles: [UserRole.Owner, UserRole.Admin, UserRole.Staff, UserRole.Tenant] 
  },
  { 
    id: 'settings', 
    label: 'Settings', 
    icon: <Settings size={20} />, 
    roles: [UserRole.Owner, UserRole.Admin, UserRole.Staff, UserRole.Tenant] 
  },
];

export function getNavItemsForRole(role: UserRole) {
  return NAV_ITEMS.filter((item) => item.roles.includes(role));
}
