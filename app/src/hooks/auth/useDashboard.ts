// src/hooks/auth/useDashboard.ts
import { useDashboard as usePluginDashboard } from "@fa-m8/astro-auth-m8/hooks";

export function useDashboard() {
  const mine = usePluginDashboard("me", false);
  const all = usePluginDashboard("global", false);

  return {
    mine: mine.activity,
    reloadMine: mine.reload,
    all: all.activity,
    reloadAll: all.reload,
  };
}
