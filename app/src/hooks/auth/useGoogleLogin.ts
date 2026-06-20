// src/hooks/auth/useGoogleLogin.ts
import { useCallback } from "react";
import { createPkcePair, exchangeGoogleCode, getGoogleLoginUrl, savePkceVerifier, takePkceVerifier } from "@fa-m8/astro-auth-m8/api";
import { setToken } from "@fa-m8/astro-auth-m8/client";
import { getOAuthRedirect, isValidOAuthRedirect } from "../../lib/authConfig";
import { localeFromPath } from "../../lib/locale";
import { useAuth } from "./useAuth";

export function useGoogleLogin() {
  const { refresh } = useAuth();

  const start = useCallback(async () => {
    const locale = localeFromPath(window.location.pathname);
    const redirectTarget = getOAuthRedirect(locale);
    if (!isValidOAuthRedirect(redirectTarget)) {
      throw new Error("Google OAuth redirect target is not configured.");
    }

    const { verifier, challenge } = await createPkcePair();
    savePkceVerifier(verifier);
    const { url } = await getGoogleLoginUrl({ redirect_target: redirectTarget, code_challenge: challenge });
    window.location.assign(url);
  }, []);

  const complete = useCallback(async (code: string) => {
    const verifier = takePkceVerifier();
    if (!verifier) throw new Error("OAuth flow error: Missing PKCE verifier");
    const data = await exchangeGoogleCode({ code, code_verifier: verifier });
    setToken(data.access_token);
    await refresh();
  }, [refresh]);

  return { start, complete };
}
