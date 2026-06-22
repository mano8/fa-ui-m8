// src/components/media/MediaApp.tsx
// Media studio island, mirroring AccountApp: AuthProvider + MediaProvider, an
// auth gate (the media service only accepts fa-auth tokens), and tabbed views
// built from the @fa-m8/astro-media-m8 React components. Admin is superuser-only.
import "../../styles/media.css";
import { useMemo, useState } from "react";
import { Images, UploadCloud, SlidersHorizontal, ShieldCheck, Wrench } from "lucide-react";
import {
  MediaLibrary,
  MediaUploadDropzone,
  PresetEditor,
} from "@fa-m8/astro-media-m8/react";
import { AuthProvider } from "../auth/AuthProvider";
import { LoginForm } from "../auth/LoginForm";
import { useAuth } from "../../hooks/auth/useAuth";
import { useUser } from "../../hooks/auth/useUser";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { getTranslations } from "../../content/i18n/app";
import { localeFromPath } from "../../lib/locale";
import { MediaProvider } from "./MediaProvider";
// Admin skins from the @fa-m8-media registry (logic stays the live package dep
// via its useMediaAdmin hook); copied in with `shadcn add` — see app README.
// The admin landing view is the storage dashboard; destructive ops live behind
// confirmations in the superuser-only Maintenance tab. Locale stays app-owned:
// each panel takes its strings via `labels`.
import { MediaDashboardOverview } from "@/components/fa-media/media-dashboard-overview";
import { MediaMaintenancePanel } from "@/components/fa-media/media-maintenance-panel";

type MediaView = "library" | "upload" | "presets" | "admin" | "maintenance";

function LoadingState() {
  return (
    <div className="flex min-h-[360px] items-center justify-center">
      <div className="size-8 animate-spin rounded-full border-2 border-muted border-b-primary" />
    </div>
  );
}

function MediaShell() {
  const { status } = useAuth();
  const { isSuperuser } = useUser();
  const [activeView, setActiveView] = useState<MediaView>("library");
  const locale = typeof window === "undefined" ? "en" : localeFromPath(window.location.pathname);
  const t = getTranslations(locale);

  const navItems = useMemo(() => {
    const items = [
      { id: "library" as const, label: t.media.tabs.library, icon: Images },
      { id: "upload" as const, label: t.media.tabs.upload, icon: UploadCloud },
      { id: "presets" as const, label: t.media.tabs.presets, icon: SlidersHorizontal },
    ];
    if (isSuperuser) {
      items.push({ id: "admin" as const, label: t.media.tabs.admin, icon: ShieldCheck });
      items.push({ id: "maintenance" as const, label: t.media.tabs.maintenance, icon: Wrench });
    }
    return items;
  }, [isSuperuser, t]);

  const objectHref = (id: string) => `/${locale}/media/object?id=${encodeURIComponent(id)}`;

  if (status === "loading") return <LoadingState />;

  if (status === "unauthenticated") {
    return (
      <div className="py-10">
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
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <div className="space-y-2 border-b pb-5">
        <h1 className="text-2xl font-semibold tracking-normal text-foreground md:text-3xl">
          {t.media.title}
        </h1>
        <p className="text-sm text-muted-foreground">{t.media.description}</p>
      </div>

      <Card className="border-muted/80 shadow-none">
        <CardContent className="p-2">
          <div className="grid grid-cols-2 gap-1 md:grid-cols-3 lg:grid-cols-5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const selected = activeView === item.id;
              return (
                <Button
                  key={item.id}
                  type="button"
                  variant={selected ? "default" : "ghost"}
                  className="h-10 justify-start gap-2 px-3 text-sm"
                  onClick={() => setActiveView(item.id)}
                >
                  <Icon className="size-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {activeView === "library" ? <MediaLibrary objectHref={objectHref} /> : null}
      {activeView === "upload" ? (
        <MediaUploadDropzone onUploaded={() => setActiveView("library")} />
      ) : null}
      {activeView === "presets" ? <PresetEditor /> : null}
      {activeView === "admin" && isSuperuser ? (
        <MediaDashboardOverview labels={t.media.admin.overview} />
      ) : null}
      {activeView === "maintenance" && isSuperuser ? (
        <MediaMaintenancePanel labels={t.media.admin.maintenance} />
      ) : null}
    </div>
  );
}

export default function MediaApp() {
  return (
    <AuthProvider>
      <MediaProvider>
        <MediaShell />
      </MediaProvider>
    </AuthProvider>
  );
}
