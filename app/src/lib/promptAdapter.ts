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

/** Build and register the fa-auth-backed prompt adapter for the current auth user. */
export function getPromptAdapter(getUser: () => unknown | Promise<unknown>): PromptAuthAdapter {
  // No local `isSuperuser` binding on purpose. The plugin's own
  // `defaultIsSuperuser` honours the explicit `is_superuser` flag *and* the
  // configured `adminRole` floor (D-C2, admin and above); a host-side
  // `Boolean(user.is_superuser)` override re-narrowed that to superusers only
  // and forked plugin logic into the host, which this repository does not do.
  const adapter = createFaAuthAdapter({
    getToken,
    refreshToken,
    getUser
  });
  setPromptAuthAdapter(adapter);
  return adapter;
}
