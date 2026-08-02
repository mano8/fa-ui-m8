// src/components/auth/AccountApp.tsx
import { useEffect, useState } from "react";
import { LogOut } from "lucide-react";
import { useAuth } from "../../hooks/auth/useAuth";
import { useUser } from "../../hooks/auth/useUser";
import { LoginForm } from "./LoginForm";
import { PluginProviders } from "../app/PluginProviders";
// Account skins from the @fa-m8-auth registry (logic stays the live package dep
// via its useAuth/useProfile/useSessions/useApiKeys/useUsers hooks); copied in
// with `shadcn add` — see app README. Locale stays owned by the app: each panel
// takes its strings via `labels`.
import { DashboardOverview } from "@/components/fa-auth/dashboard-overview";
import { ProfilePanel } from "@/components/fa-auth/profile-panel";
import { SessionsPanel } from "@/components/fa-auth/sessions-panel";
import { ApiKeysPanel } from "@/components/fa-auth/api-keys-panel";
import { AdminUsersPanel } from "@/components/fa-auth/admin-users-panel";
import { Button } from "../../components/ui/button";
import { getTranslations } from "../../content/i18n/app";
import { localeFromPath } from "../../lib/locale";

export type AccountView = "dashboard" | "profile" | "sessions" | "apiKeys" | "admin";
const ACCOUNT_ROUTE_EVENT = "fa-ui-m8:account-route";

function accountViewFromPath(pathname: string): AccountView | null {
  const path = pathname.replace(/\/$/, "");
  if (/^\/(en|es|fr)\/user\/account$/.test(path)) return "dashboard";
  if (/^\/(en|es|fr)\/user\/account\/profile$/.test(path)) return "profile";
  if (/^\/(en|es|fr)\/user\/account\/sessions$/.test(path)) return "sessions";
  if (/^\/(en|es|fr)\/user\/account\/api-keys$/.test(path)) return "apiKeys";
  if (/^\/(en|es|fr)\/user\/account\/admin$/.test(path)) return "admin";
  if (/^\/(en|es|fr)\/user\/account\/admin\/.+/.test(path)) return "admin";
  return null;
}

function LoadingState() {
  return (
    <div className="flex min-h-[360px] items-center justify-center">
      <div className="size-8 animate-spin rounded-full border-2 border-muted border-b-primary" />
    </div>
  );
}

// #lizard forgives(nloc, cyclomatic_complexity) -- view dispatch is declarative JSX.
function AppShellContent({ view }: { view: AccountView }) {
  const { status, logout, user } = useAuth();
  const { isSuperuser } = useUser();
  const locale = typeof window === "undefined" ? "en" : localeFromPath(window.location.pathname);
  const t = getTranslations(locale);
  const activeView: AccountView = view === "admin" && !isSuperuser ? "dashboard" : view;

  if (status === "loading") return <LoadingState />;

  if (status === "unauthenticated") {
    return (
      <div className="fa-auth-login-centered">
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
    <div className="not-content flex w-full max-w-none flex-col gap-6">
      <div className="flex flex-col gap-4 border-b pb-3 mb-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0 space-y-2">
          <h1 className="text-2xl font-semibold tracking-normal text-foreground md:text-3xl">
            {t.auth.dashboard.title}
          </h1>
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span className="min-w-0 break-all font-medium text-foreground sm:break-normal sm:truncate">{user?.email}</span>
            <span className="rounded-md border px-2 py-0.5 text-xs uppercase tracking-normal">{user?.role}</span>
            {user?.provider ? <span>{user.provider}</span> : null}
          </div>
        </div>
        <Button variant="outline" onClick={logout} className="w-full justify-center gap-2 sm:w-auto">
          <LogOut className="size-4" />
          {t.auth.dashboard.signOut}
        </Button>
      </div>

      <div className="flex flex-col gap-6 py-4">
        {activeView === "dashboard" ? (
          <DashboardOverview labels={t.auth.dashboard.overview} />
        ) : null}
        {activeView === "profile" ? (
          <ProfilePanel labels={t.auth.profile} />
        ) : null}
        {activeView === "sessions" ? (
          <SessionsPanel labels={t.auth.sessions} />
        ) : null}
        {activeView === "apiKeys" ? (
          <ApiKeysPanel labels={t.auth.apiKeys} />
        ) : null}
        {isSuperuser && activeView === "admin" ? (
          <AdminUsersPanel labels={t.auth.adminUsers} />
        ) : null}
      </div>
    </div>
  );
}

export default function AccountApp({ view = "dashboard" }: { view?: AccountView }) {
  const [currentView, setCurrentView] = useState<AccountView>(() =>
    typeof window === "undefined" ? view : (accountViewFromPath(window.location.pathname) ?? view),
  );

  useEffect(() => {
    const syncFromLocation = () => {
      const nextView = accountViewFromPath(window.location.pathname);
      if (nextView) setCurrentView(nextView);
    };
    const onAccountRoute = (event: Event) => {
      const nextView = (event as CustomEvent<{ view?: AccountView }>).detail?.view;
      if (nextView) setCurrentView(nextView);
    };

    window.addEventListener("popstate", syncFromLocation);
    window.addEventListener(ACCOUNT_ROUTE_EVENT, onAccountRoute);
    syncFromLocation();
    return () => {
      window.removeEventListener("popstate", syncFromLocation);
      window.removeEventListener(ACCOUNT_ROUTE_EVENT, onAccountRoute);
    };
  }, []);

  return (
    <PluginProviders>
      <AppShellContent view={currentView} />
    </PluginProviders>
  );
}
