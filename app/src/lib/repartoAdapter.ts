// Wires the reparto plugin's auth adapter to fa-auth-m8's in-memory token store.
// reparto-docente-m8 only accepts fa-auth-m8 tokens, so the adapter reads the
// same access token and refresh path the auth plugin already manages.
import { refreshToken } from "@mano8/astro-auth-m8/api";
import { getToken } from "@mano8/astro-auth-m8/client";
import {
  createFaAuthAdapter,
  setRepartoAuthAdapter,
  type RepartoAuthAdapter
} from "@mano8/astro-reparto-m8/auth-adapter";

function resolveLoginPath(pathname: string): string {
  const [, locale = ""] = pathname.split("/");
  return ["en", "es", "fr"].includes(locale) ? `/${locale}/auth/login` : "/auth/login";
}

/** Build and register the fa-auth-backed reparto adapter for host-composed UI. */
export function getRepartoAdapter(): RepartoAuthAdapter {
  const adapter = createFaAuthAdapter({
    getToken,
    refreshToken,
    onUnauthenticated: () => {
      if (typeof window === "undefined") return;
      const { pathname, search } = window.location;
      const loginPath = resolveLoginPath(pathname);
      window.location.assign(`${loginPath}?next=${encodeURIComponent(pathname + search)}`);
    }
  });
  setRepartoAuthAdapter(adapter);
  return adapter;
}
