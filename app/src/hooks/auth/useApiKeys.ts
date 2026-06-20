// src/hooks/auth/useApiKeys.ts
import { useApiKeys as usePluginApiKeys } from "@fa-m8/astro-auth-m8/hooks";

export function useApiKeys() {
  const apiKeys = usePluginApiKeys(false);

  return {
    keys: apiKeys.apiKeys,
    loading: apiKeys.loading,
    error: apiKeys.error,
    reload: apiKeys.reload,
    create: apiKeys.create,
    isCreating: apiKeys.loading,
    lastCreated: apiKeys.createdKey,
    revoke: apiKeys.revoke,
  };
}
