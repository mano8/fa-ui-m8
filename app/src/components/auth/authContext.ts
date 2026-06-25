import { createContext } from "react";
import type { LoginForm, UserPublic } from "@fa-m8/astro-auth-m8/schemas";

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

export interface AuthContextValue {
  user: UserPublic | null;
  status: AuthStatus;
  login: (creds: LoginForm) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
