// src/hooks/auth/useUser.ts
import { useAuth } from "./useAuth";
import type { RoleType } from "@fa-m8/astro-auth-m8/schemas";

export function useUser() {
  const { user } = useAuth();
  const isSuperuser = user?.is_superuser ?? false;
  const isAdmin = isSuperuser || user?.role === "admin" || user?.role === "superadmin";

  const hasRole = (role: RoleType) => {
    if (isSuperuser) return true;
    const roleHierarchy: Record<RoleType, number> = {
      user: 1,
      reader: 2,
      writer: 3,
      admin: 4,
      superadmin: 5,
    };
    const userLevel = user ? roleHierarchy[user.role] : 0;
    return userLevel >= roleHierarchy[role];
  };

  return { user, isSuperuser, isAdmin, hasRole };
}
