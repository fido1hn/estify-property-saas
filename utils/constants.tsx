
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

export const PAGE_SIZE = 10;

export const NAV_ITEMS = [
  { 
    id: 'dashboard', 
    label: 'Dashboard', 
    icon: <LayoutDashboard size={20} />, 
    roles: [UserRole.PROPERTY_MANAGER, UserRole.COMPANY_ADMIN, UserRole.MAINTENANCE, UserRole.TENANT] 
  },
  { 
    id: 'properties', 
    label: 'Properties', 
    icon: <Building2 size={20} />, 
    roles: [UserRole.PROPERTY_MANAGER, UserRole.COMPANY_ADMIN] 
  },
  { 
    id: 'tenants', 
    label: 'Tenants', 
    icon: <Users size={20} />, 
    roles: [UserRole.PROPERTY_MANAGER, UserRole.COMPANY_ADMIN] 
  },
   { 
    id: 'staff', 
    label: 'Staff', 
    icon: <ShieldCheck size={20} />, 
    roles: [UserRole.PROPERTY_MANAGER, UserRole.COMPANY_ADMIN] 
  },
  { 
    id: 'maintenance', 
    label: 'Maintenance', 
    icon: <Wrench size={20} />, 
    roles: [UserRole.PROPERTY_MANAGER, UserRole.COMPANY_ADMIN, UserRole.MAINTENANCE, UserRole.TENANT] 
  },
  { 
    id: 'billing', 
    label: 'Billing', 
    icon: <CreditCard size={20} />, 
    roles: [UserRole.PROPERTY_MANAGER, UserRole.COMPANY_ADMIN, UserRole.TENANT] 
  },
  { 
    id: 'analytics', 
    label: 'Analytics', 
    icon: <BarChart3 size={20} />, 
    roles: [UserRole.PROPERTY_MANAGER, UserRole.COMPANY_ADMIN] 
  },
  { 
    id: 'messages', 
    label: 'Messages', 
    icon: <MessageSquare size={20} />, 
    roles: [UserRole.PROPERTY_MANAGER, UserRole.COMPANY_ADMIN, UserRole.MAINTENANCE, UserRole.TENANT] 
  },
  { 
    id: 'settings', 
    label: 'Settings', 
    icon: <Settings size={20} />, 
    roles: [UserRole.PROPERTY_MANAGER, UserRole.COMPANY_ADMIN, UserRole.MAINTENANCE, UserRole.TENANT] 
  },
];
