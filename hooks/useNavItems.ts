import { useMemo } from "react";
import { type UserRole } from "../types";
import { getNavItemsForRole } from "../utils/constants";

export function useNavItems(role: UserRole) {
  return useMemo(() => getNavItemsForRole(role), [role]);
}
