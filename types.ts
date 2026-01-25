
export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  COMPANY_ADMIN = 'COMPANY_ADMIN',
  PROPERTY_MANAGER = 'PROPERTY_MANAGER',
  ACCOUNTANT = 'ACCOUNTANT',
  MAINTENANCE = 'MAINTENANCE',
  TENANT = 'TENANT'
}

export enum StaffRole {
  SECURITY = 'Security',
  CLEANER = 'Cleaner',
  PLUMBER = 'Plumber',
  ELECTRICIAN = 'Electrician',
  GARDENER = 'Gardener',
  CONCIERGE = 'Concierge'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface Property {
  id: string;
  name: string;
  address: string;
  type: 'Residential' | 'Commercial' | 'Industrial';
  units: number;
  occupancy: number;
  image: string;
}

export interface Unit {
  id: string;
  propertyId: string;
  number: string;
  type: string;
  rent: number;
  status: 'Vacant' | 'Occupied' | 'Maintenance';
}

export interface Tenant {
  id: string;
  name: string;
  email: string;
  unitId: string;
  propertyName: string;
  leaseEnd: string;
  status: 'Active' | 'Delinquent' | 'Notice';
}

export interface Staff {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: StaffRole;
  assignedPropertyIds: string[];
  status: 'Active' | 'On Leave' | 'Inactive';
  avatar?: string;
}

export interface MaintenanceRequest {
  id: string;
  title: string;
  description: string;
  status: 'Pending' | 'In Progress' | 'Completed';
  priority: 'Low' | 'Medium' | 'High';
  unit: string;
  createdAt: string;
}

export interface Invoice {
  id: string;
  tenantName: string;
  amount: number;
  dueDate: string;
  status: 'Paid' | 'Unpaid' | 'Overdue';
}
