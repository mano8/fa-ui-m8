import { useMemo, type ReactNode } from "react";
import {
  AuthProvider as PluginAuthProvider,
  useAuth as usePluginAuth,
  type AuthContextValue as PluginAuthContextValue,
} from "@fa-m8/astro-auth-m8/react";
import { AuthContext, type AuthContextValue } from "./authContext";

function toLocalAuth(plugin: PluginAuthContextValue): AuthContextValue {
  return {
    user: plugin.user,
    status: plugin.loading ? "loading" : plugin.user ? "authenticated" : "unauthenticated",
    login: async (creds) => {
      await plugin.login(creds.username, creds.password);
    },
    logout: plugin.logout,
    refresh: async () => {
      await plugin.reload();
    },
  };
}

function AuthBridge({ children }: { children: ReactNode }) {
  const plugin = usePluginAuth();
  const value = useMemo(() => toLocalAuth(plugin), [plugin]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <PluginAuthProvider config={{ apiBase: import.meta.env.PUBLIC_FA_AUTH_API_BASE ?? "/user" }}>
      <AuthBridge>{children}</AuthBridge>
    </PluginAuthProvider>
  );
}
