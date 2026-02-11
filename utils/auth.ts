import { UserRole } from "../types";

export function mapDbRoleToUserRole(dbRole: string | null): UserRole {
  switch (dbRole) {
    case "owner":
      return UserRole.Owner;
    case "admin":
      return UserRole.Admin;
    case "staff":
      return UserRole.Staff;
    case "tenant":
      return UserRole.Tenant;
    default:
      return UserRole.Owner;
  }
}
