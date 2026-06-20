// src/components/auth/RequireRole.tsx
import type { ReactNode } from "react";
import { useUser } from "../../hooks/auth/useUser";
import type { RoleType } from "@fa-m8/astro-auth-m8/schemas";

interface RequireRoleProps {
  role?: RoleType;
  superuser?: boolean;
  children: ReactNode;
  fallback?: ReactNode;
}

export function RequireRole({ role, superuser, children, fallback = null }: RequireRoleProps) {
  const { isSuperuser, hasRole } = useUser();

  let authorized = false;
  if (superuser && isSuperuser) authorized = true;
  if (role && hasRole(role)) authorized = true;

  if (!authorized) return <>{fallback}</>;

  return <>{children}</>;
}