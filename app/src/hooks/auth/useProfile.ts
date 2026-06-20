// src/hooks/auth/useProfile.ts
import { useCallback } from "react";
import { useProfile as usePluginProfile } from "@fa-m8/astro-auth-m8/hooks";
import { useAsyncAction } from "../internal/useAsyncAction";
import { useAuth } from "./useAuth";

export function useProfile() {
  const { refresh } = useAuth();
  const profile = usePluginProfile(false);

  const updateAction = useAsyncAction(async (data: Parameters<typeof profile.save>[0]) => {
    const res = await profile.save(data);
    await refresh();
    return res;
  });
  const passwordAction = useAsyncAction(profile.changePassword);
  const deleteAction = useAsyncAction(profile.remove);

  const updateMe = useCallback(updateAction.run, [updateAction.run]);

  return {
    updateMe,
    isUpdating: updateAction.loading,
    updateError: updateAction.error,
    changePassword: passwordAction.run,
    deleteMe: deleteAction.run,
  };
}
