// src/lib/promptAdapter.ts
// Wires the prompt plugin's auth adapter to fa-auth-m8's in-memory token store.
// prompt-engine-m8 only accepts fa-auth-m8 tokens, so the adapter reads the same
// access token (and refresh) the auth plugin already manages — no second store.
import { getToken } from "@mano8/astro-auth-m8/client";
import { refreshToken } from "@mano8/astro-auth-m8/api";
import {
  createFaAuthAdapter,
  setPromptAuthAdapter,
  type PromptAuthAdapter
} from "@mano8/astro-prompt-m8/auth-adapter";

type PromptUser = { is_superuser?: boolean } | null | undefined;

function isSuperuser(user: unknown): boolean {
  return Boolean((user as PromptUser)?.is_superuser);
}

/** Build and register the fa-auth-backed prompt adapter for the current auth user. */
export function getPromptAdapter(getUser: () => unknown | Promise<unknown>): PromptAuthAdapter {
  const adapter = createFaAuthAdapter({
    getToken,
    refreshToken,
    getUser,
    // Used only for client-side superuser gating of admin prompt operations.
    isSuperuser
  });
  setPromptAuthAdapter(adapter);
  return adapter;
}