// src/lib/mediaAdapter.ts
// Wires the media plugin's auth adapter to fa-auth-m8's in-memory token store.
// media-service-m8 only accepts fa-auth-m8 tokens, so the adapter reads the same
// access token (and refresh) the auth plugin already manages — no second store.
import { getToken } from "@mano8/astro-auth-m8/client";
import { refreshToken } from "@mano8/astro-auth-m8/api";
import {
  createFaAuthAdapter,
  setMediaAuthAdapter,
  type MediaAuthAdapter,
} from "@mano8/astro-media-m8/auth-adapter";

type MediaUser = { is_superuser?: boolean } | null | undefined;

function isSuperuser(user: unknown): boolean {
  return Boolean((user as MediaUser)?.is_superuser);
}

/** Build and register the fa-auth-backed media adapter for the current auth user. */
export function getMediaAdapter(getUser: () => unknown | Promise<unknown>): MediaAuthAdapter {
  const adapter = createFaAuthAdapter({
    getToken,
    refreshToken,
    getUser,
    // Used only for client-side superuser gating of admin media operations.
    isSuperuser,
  });
  setMediaAuthAdapter(adapter);
  return adapter;
}
