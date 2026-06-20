// src/hooks/auth/useUsers.ts
import { useUsers as usePluginUsers } from "@fa-m8/astro-auth-m8/hooks";
import { useUser } from "./useUser";

function forbidden(): Promise<never> {
  return Promise.reject(new Error("This action requires a superuser account."));
}

export function useUsers() {
  const { isSuperuser } = useUser();
  const users = usePluginUsers(false);

  return {
    users: users.users?.data ?? [],
    count: users.users?.count ?? 0,
    loading: users.loading,
    error: users.error instanceof Error ? users.error.message : users.error ? String(users.error) : null,
    reload: isSuperuser ? users.reload : forbidden,
    create: isSuperuser ? users.create : forbidden,
    signup: users.signup,
    get: isSuperuser ? users.get : forbidden,
    update: isSuperuser ? users.update : forbidden,
    remove: isSuperuser ? users.remove : forbidden,
  };
}
