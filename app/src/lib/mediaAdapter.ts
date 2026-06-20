// src/lib/mediaAdapter.ts
// Wires the media plugin's auth adapter to fa-auth-m8's in-memory token store.
// media-service-m8 only accepts fa-auth-m8 tokens, so the adapter reads the same
// access token (and refresh) the auth plugin already manages — no second store.
import { getToken } from "@fa-m8/astro-auth-m8/client";
import { refreshToken, getProfile } from "@fa-m8/astro-auth-m8/api";
import {
  createFaAuthAdapter,
  setMediaAuthAdapter,
  type MediaAuthAdapter,
} from "@fa-m8/astro-media-m8/auth-adapter";

let adapter: MediaAuthAdapter | null = null;

/** Build and register the fa-auth-backed media adapter once, then reuse it. */
export function getMediaAdapter(): MediaAuthAdapter {
  if (!adapter) {
    adapter = createFaAuthAdapter({
      getToken,
      refreshToken,
      // Used only for client-side superuser gating of admin media operations.
      getUser: () => getProfile().catch(() => null),
      isSuperuser: (user) => Boolean((user as { is_superuser?: boolean } | null)?.is_superuser),
    });
    setMediaAuthAdapter(adapter);
  }
  return adapter;
}
