// src/components/media/MediaProvider.tsx
// Local wrapper around the media plugin's provider, mirroring AuthProvider.
// Registers the fa-auth-backed adapter and pins the runtime config from the
// PUBLIC_FA_MEDIA_* env vars the faMedia integration defines at build time.
import { useMemo, type ReactNode } from "react";
import { MediaProvider as PluginMediaProvider } from "@mano8/astro-media-m8/react";
import { useAuth } from "../../hooks/auth/useAuth";
import { getMediaAdapter } from "../../lib/mediaAdapter";

export function MediaProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const adapter = useMemo(() => getMediaAdapter(() => user), [user]);

  return (
    <PluginMediaProvider
      adapter={adapter}
      config={{
        apiBase: import.meta.env.PUBLIC_FA_MEDIA_API_BASE ?? "/media",
        v1Base: import.meta.env.PUBLIC_FA_MEDIA_V1_BASE ?? "/v1",
        legacyBase: import.meta.env.PUBLIC_FA_MEDIA_LEGACY_BASE ?? "",
        adminRole: import.meta.env.PUBLIC_FA_MEDIA_ADMIN_ROLE ?? "is_superuser",
      }}
    >
      {children}
    </PluginMediaProvider>
  );
}
