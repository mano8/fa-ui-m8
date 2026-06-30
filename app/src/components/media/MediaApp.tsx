// src/components/media/MediaApp.tsx
// Route-driven media studio island. It mirrors AccountApp so all media pages
// share the auth/media providers while Starlight owns the page routes.
import { useEffect, useState } from "react";
import { MediaLibrary, MediaUploadDropzone } from "@mano8/astro-media-m8/react";
import { LoginForm } from "../auth/LoginForm";
import { useAuth } from "../../hooks/auth/useAuth";
import { useUser } from "../../hooks/auth/useUser";
import { getTranslations } from "../../content/i18n/app";
import { localeFromPath } from "../../lib/locale";
import { PluginProviders } from "../app/PluginProviders";
import { MediaDashboardOverview } from "@/components/fa-media/media-dashboard-overview";
import { MediaMaintenancePanel } from "@/components/fa-media/media-maintenance-panel";
import { MediaPresets } from "@/components/fa-media/media-presets";

export type MediaView = "library" | "upload" | "presets" | "admin" | "maintenance";
const MEDIA_ROUTE_EVENT = "fa-ui-m8:media-route";

function mediaViewFromPath(pathname: string): MediaView | null {
  const path = pathname.replace(/\/$/, "");
  if (/^\/(en|es|fr)\/media$/.test(path)) return "library";
  if (/^\/(en|es|fr)\/media\/upload$/.test(path)) return "upload";
  if (/^\/(en|es|fr)\/media\/presets$/.test(path)) return "presets";
  if (/^\/(en|es|fr)\/media\/admin$/.test(path)) return "admin";
  if (/^\/(en|es|fr)\/media\/maintenance$/.test(path)) return "maintenance";
  return null;
}

function pathForMediaView(locale: string, view: MediaView): string {
  if (view === "library") return `/${locale}/media`;
  return `/${locale}/media/${view}`;
}

function LoadingState() {
  return (
    <div className="flex min-h-[360px] items-center justify-center">
      <div className="size-8 animate-spin rounded-full border-2 border-muted border-b-primary" />
    </div>
  );
}

function AppShellContent({ view }: { view: MediaView }) {
  const { status } = useAuth();
  const { isSuperuser } = useUser();
  const locale = typeof window === "undefined" ? "en" : localeFromPath(window.location.pathname);
  const t = getTranslations(locale);
  const activeView: MediaView =
    !isSuperuser && (view === "admin" || view === "maintenance") ? "library" : view;
  const objectHref = (id: string) => `/${locale}/media/object?id=${encodeURIComponent(id)}`;

  const navigateMediaView = (nextView: MediaView) => {
    window.location.assign(pathForMediaView(locale, nextView));
  };

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
    <div className="not-content w-full max-w-none space-y-6">
      <div className="space-y-2 border-b pb-3 mb-3">
        <h1 className="text-2xl font-semibold tracking-normal text-foreground md:text-3xl">
          {t.media.title}
        </h1>
        <p className="text-sm text-muted-foreground">{t.media.description}</p>
      </div>

      <div className="space-y-4 pb-3">
        {activeView === "library" ? (
          <MediaLibrary objectHref={objectHref} />
        ) : null}
        {activeView === "upload" ? (
          <MediaUploadDropzone onUploaded={() => navigateMediaView("library")} />
        ) : null}
        {activeView === "presets" ? (
          <MediaPresets baseHref={`/${locale}/media/presets`} labels={t.media.presets} />
        ) : null}
        {activeView === "admin" && isSuperuser ? (
          <MediaDashboardOverview labels={t.media.admin.overview} />
        ) : null}
        {activeView === "maintenance" && isSuperuser ? (
          <MediaMaintenancePanel labels={t.media.admin.maintenance} />
        ) : null}
      </div>
    </div>
  );
}

export default function MediaApp({ view = "library" }: { view?: MediaView }) {
  const [currentView, setCurrentView] = useState<MediaView>(() =>
    typeof window === "undefined" ? view : (mediaViewFromPath(window.location.pathname) ?? view),
  );

  useEffect(() => {
    const syncFromLocation = () => {
      const nextView = mediaViewFromPath(window.location.pathname);
      if (nextView) setCurrentView(nextView);
    };
    const onMediaRoute = (event: Event) => {
      const nextView = (event as CustomEvent<{ view?: MediaView }>).detail?.view;
      if (nextView) setCurrentView(nextView);
    };

    window.addEventListener("popstate", syncFromLocation);
    window.addEventListener(MEDIA_ROUTE_EVENT, onMediaRoute);
    syncFromLocation();
    return () => {
      window.removeEventListener("popstate", syncFromLocation);
      window.removeEventListener(MEDIA_ROUTE_EVENT, onMediaRoute);
    };
  }, []);

  return (
    <PluginProviders media>
      <AppShellContent view={currentView} />
    </PluginProviders>
  );
}
