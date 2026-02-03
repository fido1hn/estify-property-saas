
import { Database } from './database.types';

// Export Database type for direct usage if needed
export type { Database } from './database.types';

// Re-export specific Row/Insert/Update types for convenience
export type PropertyRow = Database['public']['Tables']['properties']['Row'];
export type PropertyInsert = Database['public']['Tables']['properties']['Insert'];
export type PropertyUpdate = Database['public']['Tables']['properties']['Update'];

export type TenantRow = Database['public']['Tables']['tenants']['Row'];
export type TenantInsert = Database['public']['Tables']['tenants']['Insert'];
export type TenantUpdate = Database['public']['Tables']['tenants']['Update'];

export type InvoiceRow = Database['public']['Tables']['invoices']['Row'];
export type MaintenanceRequestRow = Database['public']['Tables']['maintenance_requests']['Row'];
export type StaffRow = Database['public']['Tables']['staff']['Row'];
export type ProfileRow = Database['public']['Tables']['profiles']['Row'];

// Enums
export type UserRoleEnum = Database['public']['Enums']['user_role'];
export type StaffRoleEnum = Database['public']['Enums']['staff_role'];
export type BuildingTypeEnum = Database['public']['Enums']['buidling_type']; 
export type MaintenancePriorityEnum = Database['public']['Enums']['maintenance_requests_priority'];
export type MaintenanceStatusEnum = Database['public']['Enums']['maintenance_requests_status'];

// App Domain Types (extending DB types where necessary for UI)

// Property with computed fields
export interface Property extends PropertyRow {
  // DB has 'total_units', 'image_url'
  // We add UI specific computed fields
  occupancy: number; 
  // We keep the DB naming convention as the source of truth
}

// Tenant with profile expansion
export interface Tenant extends TenantRow {
  // Expanded fields from joins
  profiles?: {
    full_name: string;
    email: string;
  } | null;
  units?: {
    properties?: {
      name: string;
    } | null;
  } | null;
}

// Staff with profile expansion
export interface Staff extends StaffRow {
  profiles?: {
    full_name: string;
    email: string;
    avatar_url: string | null;
  } | null;
}

// Maintenance Request with expansion
export interface MaintenanceRequest extends MaintenanceRequestRow {
  // The DB uses 'status' and 'priority' enums which are lowercase.
  // We will respect that.
}

// Invoice with expansion
export interface Invoice extends InvoiceRow {
  profiles?: {
    full_name: string;
  } | null;
}

// UI Role Enum (mapping from DB UserRole if needed, or simply strictly using DB enum)
// The app uses UserRole enum in `App.tsx` for values like PROPERTY_MANAGER that map to 'owner'.
// We should arguably keep a UI helper enum, but the request emphasized DB truth.
// However, 'PROPERTY_MANAGER' is not in the DB. 'owner' is.
// I will keep the custom UserRole enum for the UI logic but ensure it maps cleanly.
export enum UserRole {
  PROPERTY_MANAGER = 'owner', // Map to DB value
  COMPANY_ADMIN = 'admin',
  MAINTENANCE = 'staff',
  TENANT = 'tenant'
}
