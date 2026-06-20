// src/components/auth/RequireAuth.tsx
import type { ReactNode } from "react";
import { useAuth } from "../../hooks/auth/useAuth";

interface RequireAuthProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function RequireAuth({ children, fallback = null }: RequireAuthProps) {
  const { status } = useAuth();

  if (status === "loading") return null; // Or a global spinner
  if (status === "unauthenticated") return <>{fallback}</>;

  return <>{children}</>;
}