// src/components/prompt/PromptProvider.tsx
// Local wrapper around the prompt plugin's provider, mirroring MediaProvider.
// Registers the fa-auth-backed adapter and pins the runtime config from the
// PUBLIC_FA_PROMPT_* env vars the faPrompt integration defines at build time.
import { useMemo, type ReactNode } from "react";
import { PromptProvider as PluginPromptProvider } from "@mano8/astro-prompt-m8/react";
import { useAuth } from "../../hooks/auth/useAuth";
import { getPromptAdapter } from "../../lib/promptAdapter";

export function PromptProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const adapter = useMemo(() => getPromptAdapter(() => user), [user]);

  return (
    <PluginPromptProvider
      adapter={adapter}
      config={{
        apiBase: import.meta.env.PUBLIC_FA_PROMPT_API_BASE ?? "/prompt",
        apiPrefix: import.meta.env.PUBLIC_FA_PROMPT_API_PREFIX ?? "/fastapi",
        adminRole: import.meta.env.PUBLIC_FA_PROMPT_ADMIN_ROLE ?? "is_superuser"
      }}
    >
      {children}
    </PluginPromptProvider>
  );
}