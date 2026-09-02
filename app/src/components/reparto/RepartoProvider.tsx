// Local wrapper around the reparto plugin's provider, mirroring MediaProvider.
// Registers the fa-auth-backed adapter and pins the runtime config from the
// PUBLIC_FA_REPARTO_* env vars the faReparto integration defines at build time.
import { useMemo, type ReactNode } from "react";
import { RepartoProvider as PluginRepartoProvider } from "@mano8/astro-reparto-m8/react";
import { getRepartoAdapter } from "../../lib/repartoAdapter";

export function RepartoProvider({ children }: { children: ReactNode }) {
  const adapter = useMemo(() => getRepartoAdapter(), []);

  return (
    <PluginRepartoProvider
      adapter={adapter}
      config={{
        apiBase: import.meta.env.PUBLIC_FA_REPARTO_API_BASE ?? "/reparto",
        // Empty by default: reparto-docente-m8 mounts every route under its own
        // API_PREFIX (/reparto), which the base already addresses, and the
        // plugin declares the same empty default. The old "/fastapi" fallback
        // pointed at a segment the service never mounts — and it always applied,
        // because the var read here was never the one the integration defines.
        apiPrefix: import.meta.env.PUBLIC_FA_REPARTO_API_PREFIX ?? ""
      }}
    >
      {children}
    </PluginRepartoProvider>
  );
}
