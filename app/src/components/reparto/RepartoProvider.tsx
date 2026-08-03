// Local wrapper around the reparto plugin's provider, mirroring MediaProvider.
// Registers the fa-auth-backed adapter and pins runtime config from env vars.
import { useMemo, type ReactNode } from "react";
import { RepartoProvider as PluginRepartoProvider } from "@mano8/astro-reparto-m8/react";
import { getRepartoAdapter } from "../../lib/repartoAdapter";

export function RepartoProvider({ children }: { children: ReactNode }) {
  const adapter = useMemo(() => getRepartoAdapter(), []);

  return (
    <PluginRepartoProvider
      adapter={adapter}
      config={{
        apiBase: import.meta.env.PUBLIC_REPARTO_API_BASE ?? "/reparto",
        apiPrefix: import.meta.env.PUBLIC_REPARTO_API_PREFIX ?? "/fastapi"
      }}
    >
      {children}
    </PluginRepartoProvider>
  );
}
