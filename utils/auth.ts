import { UserRole } from "../types";

export function mapDbRoleToUserRole(dbRole: string | null): UserRole {
  switch (dbRole) {
    case "owner":
      return UserRole.PROPERTY_MANAGER;
    case "admin":
      return UserRole.COMPANY_ADMIN;
    case "staff":
      return UserRole.MAINTENANCE;
    case "tenant":
      return UserRole.TENANT;
    default:
      return UserRole.PROPERTY_MANAGER;
  }
}
