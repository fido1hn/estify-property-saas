
import React from 'react';
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  Wrench, 
  CreditCard, 
  BarChart3, 
  Settings, 
  Bell,
  MessageSquare,
  ShieldCheck
} from 'lucide-react';
import { UserRole } from './types';

export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} />, roles: Object.values(UserRole) },
  { id: 'properties', label: 'Properties', icon: <Building2 size={20} />, roles: [UserRole.SUPER_ADMIN, UserRole.COMPANY_ADMIN, UserRole.PROPERTY_MANAGER] },
  { id: 'tenants', label: 'Tenants', icon: <Users size={20} />, roles: [UserRole.SUPER_ADMIN, UserRole.COMPANY_ADMIN, UserRole.PROPERTY_MANAGER, UserRole.ACCOUNTANT] },
  { id: 'staff', label: 'Staff', icon: <ShieldCheck size={20} />, roles: [UserRole.SUPER_ADMIN, UserRole.COMPANY_ADMIN, UserRole.PROPERTY_MANAGER] },
  { id: 'maintenance', label: 'Maintenance', icon: <Wrench size={20} />, roles: Object.values(UserRole) },
  { id: 'billing', label: 'Billing', icon: <CreditCard size={20} />, roles: [UserRole.COMPANY_ADMIN, UserRole.ACCOUNTANT, UserRole.TENANT] },
  { id: 'analytics', label: 'Analytics', icon: <BarChart3 size={20} />, roles: [UserRole.SUPER_ADMIN, UserRole.COMPANY_ADMIN] },
  { id: 'messages', label: 'Messages', icon: <MessageSquare size={20} />, roles: Object.values(UserRole) },
  { id: 'settings', label: 'Settings', icon: <Settings size={20} />, roles: Object.values(UserRole) },
];

export const MOCK_USER: any = {
  id: 'u1',
  name: 'Angel H.',
  email: 'angel@estify.io',
  role: UserRole.COMPANY_ADMIN,
  avatar: 'https://picsum.photos/seed/angel/200'
};
