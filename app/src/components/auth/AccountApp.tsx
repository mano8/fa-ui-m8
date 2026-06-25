// src/components/auth/AccountApp.tsx
import { useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { KeyRound, LayoutDashboard, LogOut, Shield, UserRound, Activity } from "lucide-react";
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
import { NavigationMenu, NavigationMenuItem, NavigationMenuList } from "../../components/ui/navigation-menu";
import { getTranslations } from "../../content/i18n/app";
import { localeFromPath } from "../../lib/locale";
import { cn } from "../../lib/utils";

type AccountView = "dashboard" | "profile" | "sessions" | "apiKeys" | "admin";
type AccountNavItem = { id: AccountView; label: string; icon: LucideIcon };

function LoadingState() {
  return (
    <div className="flex min-h-[360px] items-center justify-center">
      <div className="size-8 animate-spin rounded-full border-2 border-muted border-b-primary" />
    </div>
  );
}

function AppShellContent() {
  const { status, logout, user } = useAuth();
  const { isSuperuser } = useUser();
  const [activeView, setActiveView] = useState<AccountView>("dashboard");
  const locale = typeof window === "undefined" ? "en" : localeFromPath(window.location.pathname);
  const t = getTranslations(locale);

  const navItems = useMemo(() => {
    const items: AccountNavItem[] = [
      { id: "dashboard" as const, label: t.auth.dashboard.overview.navLabel, icon: LayoutDashboard },
      { id: "profile" as const, label: t.auth.profile.title, icon: UserRound },
      { id: "sessions" as const, label: t.auth.sessions.title, icon: Activity },
      { id: "apiKeys" as const, label: t.auth.apiKeys.navLabel, icon: KeyRound },
    ];
    if (isSuperuser) items.push({ id: "admin" as const, label: t.auth.adminUsers.title, icon: Shield });
    return items;
  }, [isSuperuser, t]);

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
    <div className="not-content mx-auto w-full max-w-6xl space-y-6">
      <div className="flex flex-col gap-4 border-b pb-5 lg:flex-row lg:items-end lg:justify-between">
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

      <div className="space-y-4">
        <NavigationMenu viewport={false} className="w-full max-w-none justify-stretch">
          <div className="-mx-1 overflow-x-auto px-1 pb-1">
            <NavigationMenuList
              className={cn(
                "flex h-auto min-w-max items-stretch gap-1 rounded-lg border border-border bg-muted/40 p-1 md:grid md:min-w-0 md:w-full md:grid-cols-2 md:justify-stretch",
                isSuperuser ? "lg:grid-cols-5" : "lg:grid-cols-4"
              )}
            >
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = activeView === item.id;
              return (
                <NavigationMenuItem key={item.id}>
                  <button
                    type="button"
                    aria-current={active ? "page" : undefined}
                    className="inline-flex h-9 w-full min-w-fit items-center justify-start gap-2 rounded-md px-3 text-sm font-medium whitespace-nowrap transition-colors outline-none select-none hover:bg-background hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 md:min-w-0 md:justify-center data-[active=true]:bg-background data-[active=true]:text-foreground data-[active=true]:shadow-xs"
                    data-active={active}
                    onClick={() => setActiveView(item.id)}
                  >
                    <Icon className="size-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </button>
                </NavigationMenuItem>
              );
            })}
            </NavigationMenuList>
          </div>
        </NavigationMenu>

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

export default function AccountApp() {
  return (
    <PluginProviders>
      <AppShellContent />
    </PluginProviders>
  );
}
