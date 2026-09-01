// src/components/media/MediaObjectApp.tsx
// Object-detail island. Starlight is static, so the object id can't come from a
// dynamic [id] route — it's read from the `?id=` query param at hydration time.
// Same AuthProvider + MediaProvider + auth gate as the studio.
import { ArrowLeft } from "lucide-react";
import { MediaObjectDetail } from "@/components/fa-media/media-object-detail";
import { LoginForm } from "../auth/LoginForm";
import { useAuth } from "../../hooks/auth/useAuth";
import { getTranslations } from "../../content/i18n/app";
import { localeFromPath } from "../../lib/locale";
import { PluginProviders } from "../app/PluginProviders";

function LoadingState() {
  return (
    <div className="flex min-h-[360px] items-center justify-center">
      <div className="size-8 animate-spin rounded-full border-2 border-muted border-b-primary" />
    </div>
  );
}

function ObjectShell() {
  const { status } = useAuth();
  const locale = typeof window === "undefined" ? "en" : localeFromPath(window.location.pathname);
  const t = getTranslations(locale);
  const libraryHref = `/${locale}/media`;
  const objectId =
    typeof window === "undefined"
      ? ""
      : new URLSearchParams(window.location.search).get("id") ?? "";

  if (status === "loading") return <LoadingState />;

  if (status === "unauthenticated") {
    return (
      <div className="fa-auth-login-centered">
        <p className="mb-6 text-center text-sm text-muted-foreground">{t.media.signInPrompt}</p>
        <LoginForm
          errorMessage={t.auth.login.invalidCredentials}
          loginTitle={t.auth.login.title}
          loginDescription={t.auth.login.description}
          userLabel={t.auth.login.username}
          usernamePlaceholder={t.auth.login.usernamePlaceholder}
          passwordLabel={t.auth.login.password}
          signInButtonText={t.auth.login.submit}
          signinWithGoogleButtonText={t.auth.login.google}
          signinLabel={t.auth.login.signingIn}
          orText={t.auth.login.or}
          googleUnavailableText={t.auth.login.googleUnavailable}
        />
      </div>
    );
  }

  return (
    <div className="not-content mx-auto w-full max-w-6xl space-y-4">
      <a
        href={libraryHref}
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        {t.media.object.back}
      </a>
      {objectId ? (
        <MediaObjectDetail
          objectId={objectId}
          locale={locale}
          labels={t.media.object}
          categoryTableLabels={t.media.categories}
          statusLabels={t.media.library.statuses}
          categoryTypeLabels={t.media.library.categories}
          onDeleted={() => {
            window.location.href = libraryHref;
          }}
        />
      ) : (
        <p className="text-sm text-muted-foreground">{t.media.object.missingId}</p>
      )}
    </div>
  );
}

export default function MediaObjectApp() {
  return (
    <PluginProviders media>
      <ObjectShell />
    </PluginProviders>
  );
}
