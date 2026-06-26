import { useCallback, useMemo, type ReactNode } from "react";
import {
  AuthProvider as PluginAuthProvider,
  useAuth as usePluginAuth,
  type AuthContextValue as PluginAuthContextValue,
} from "@fa-m8/astro-auth-m8/react";
import { AuthContext, type AuthContextValue } from "./authContext";

function AuthBridge({ children }: { children: ReactNode }) {
  const plugin = usePluginAuth();
  const login = useCallback<AuthContextValue["login"]>(
    async (creds) => {
      await plugin.login(creds.username, creds.password);
    },
    [plugin.login],
  );
  const refresh = useCallback<AuthContextValue["refresh"]>(
    async () => {
      await plugin.reload();
    },
    [plugin.reload],
  );
  const value = useMemo<AuthContextValue>(
    () => ({
      user: plugin.user,
      status: plugin.loading ? "loading" : plugin.user ? "authenticated" : "unauthenticated",
      login,
      logout: plugin.logout,
      refresh,
    }),
    [login, plugin.loading, plugin.logout, plugin.user, refresh],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <PluginAuthProvider config={{ apiBase: import.meta.env.PUBLIC_FA_AUTH_API_BASE ?? "/user" }}>
      <AuthBridge>{children}</AuthBridge>
    </PluginAuthProvider>
  );
}
