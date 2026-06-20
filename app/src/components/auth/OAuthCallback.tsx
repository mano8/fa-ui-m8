// src/components/auth/OAuthCallback.tsx
import { useEffect, useState } from "react";
import { useGoogleLogin } from "../../hooks/auth/useGoogleLogin";
import { AuthProvider } from "./AuthProvider";
import { localePath } from "../../lib/locale";
import { getTranslations, type Locale } from "../../content/i18n/app";

export function readOAuthCallback(location: Location): {
  code: string | null;
  error: string | null;
} {
  const query = new URLSearchParams(location.search);
  const fragment = new URLSearchParams(location.hash.replace(/^#/, ""));
  const error =
    fragment.get("error_description") ??
    query.get("error_description") ??
    fragment.get("error") ??
    query.get("error");

  return {
    code: fragment.get("auth_code") ?? query.get("auth_code") ?? query.get("code"),
    error,
  };
}

function CallbackHandler({ locale }: { locale: Locale }) {
  const { complete } = useGoogleLogin();
  const t = getTranslations(locale).auth.callback;
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const { code, error: oauthError } = readOAuthCallback(window.location);

    if (oauthError) {
      setError(oauthError);
      return;
    }

    if (code) {
      complete(code)
        .then(() => {
          // Relocate user to dashboard account home upon token verification.
          window.location.replace(localePath(locale, "/user/account"));
        })
        .catch((err) => {
          setError(err.message || t.payloadFailed);
        });
    } else {
      setError(t.missingCode);
    }
  }, [complete, locale]);

  if (error) {
    return (
      <div className="max-w-md mx-auto my-12 p-4 border border-destructive bg-destructive/10 rounded-md text-destructive text-center">
        <h3 className="font-bold">{t.failureTitle}</h3>
        <p className="text-sm mt-1">{error}</p>
        <a href={localePath(locale, "/auth/login")} className="mt-4 inline-block text-xs underline font-medium">{t.returnToLogin}</a>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] gap-3">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      <p className="text-sm text-muted-foreground font-medium">{t.finalizing}</p>
    </div>
  );
}

export function OAuthCallback({ locale }: { locale: Locale }) {
  return (
    <AuthProvider>
      <CallbackHandler locale={locale} />
    </AuthProvider>
  );
}
