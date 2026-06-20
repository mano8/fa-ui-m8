// src/hooks/auth/useSessions.ts
import { useSessions as usePluginSessions } from "@fa-m8/astro-auth-m8/hooks";

export function useSessions() {
  const sessions = usePluginSessions(false);

  return {
    current: sessions.current,
    reloadCurrent: sessions.reloadCurrent,
    sessions: sessions.sessions?.data ?? [],
    list: sessions.reload,
    remove: sessions.revoke,
    loading: sessions.loading,
    error: sessions.error,
  };
}
