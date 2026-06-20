import { useEffect } from "react";
import { RefreshCw, Trash2 } from "lucide-react";
import { useDashboard } from "../../hooks/auth/useDashboard";
import { useSessions } from "../../hooks/auth/useSessions";
import { useUser } from "../../hooks/auth/useUser";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import type { UsersActivity } from "@fa-m8/astro-auth-m8/schemas";
import type { AppTranslations } from "../../content/i18n/app";

type SessionsTranslations = AppTranslations["auth"]["sessions"];

function formatDate(value: string | null | undefined, fallback: string): string {
  if (!value) return fallback;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

function ActivitySummary({
  title,
  totalLogins,
  totalRegistrations,
  totalUsers,
  t,
}: {
  title: string;
  totalLogins?: number;
  totalRegistrations?: number;
  totalUsers?: number;
  t: SessionsTranslations;
}) {
  return (
    <div className="rounded-md border p-3">
      <h4 className="text-sm font-semibold">{title}</h4>
      <dl className="mt-3 grid grid-cols-3 gap-3 text-sm">
        <div>
          <dt className="text-muted-foreground">{t.logins}</dt>
          <dd className="font-medium">{totalLogins ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">{t.registrations}</dt>
          <dd className="font-medium">{totalRegistrations ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">{t.users}</dt>
          <dd className="font-medium">{totalUsers ?? "-"}</dd>
        </div>
      </dl>
    </div>
  );
}

function activityAdded(stats: UsersActivity | null, model: string): number | undefined {
  return stats?.activity.activity.find((entry) => entry.model === model)?.added;
}

export function SessionInfo({ t }: { t: SessionsTranslations }) {
  const { isSuperuser } = useUser();
  const {
    current,
    reloadCurrent,
    sessions,
    list,
    remove,
    loading,
  } = useSessions();
  const {
    mine,
    reloadMine,
    all,
    reloadAll,
  } = useDashboard();

  useEffect(() => {
    reloadCurrent().catch(() => {});
    reloadMine().catch(() => {});
  }, [reloadCurrent, reloadMine]);

  useEffect(() => {
    if (!isSuperuser) return;
    list().catch(() => {});
    reloadAll().catch(() => {});
  }, [isSuperuser, list, reloadAll]);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>{t.title}</CardTitle>
          <CardDescription>{t.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {current ? (
            <dl className="grid gap-2 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">{t.provider}</dt>
                <dd className="font-medium">{current.provider}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">{t.jwtExpires}</dt>
                <dd className="font-medium text-right">{formatDate(current.jwt_expires_at, t.notAvailable)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">{t.refreshExpires}</dt>
                <dd className="font-medium text-right">{formatDate(current.refresh_expires_at, t.notAvailable)}</dd>
              </div>
            </dl>
          ) : (
            <p className="text-sm text-muted-foreground">{t.notLoaded}</p>
          )}

          <ActivitySummary
            title={t.yourActivity}
            totalLogins={activityAdded(mine, "login")}
            totalRegistrations={activityAdded(mine, "registration")}
            totalUsers={mine?.nb_users}
            t={t}
          />

          <Button type="button" variant="outline" onClick={() => { reloadCurrent(); reloadMine(); }}>
            <RefreshCw />
            {t.refresh}
          </Button>
        </CardContent>
      </Card>

      {isSuperuser && (
        <Card>
          <CardHeader>
            <CardTitle>{t.adminTitle}</CardTitle>
            <CardDescription>{t.adminDescription}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ActivitySummary
              title={t.allActivity}
              totalLogins={activityAdded(all, "login")}
              totalRegistrations={activityAdded(all, "registration")}
              totalUsers={all?.nb_users}
              t={t}
            />

            {sessions.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {loading ? t.loading : t.empty}
              </p>
            ) : (
              <div className="divide-y rounded-md border">
                {sessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between gap-3 p-3">
                    <div className="min-w-0 text-sm">
                      <p className="truncate font-medium">{session.id}</p>
                      <p className="text-muted-foreground">{t.expires} {formatDate(session.refresh_expires_at, t.notAvailable)}</p>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      onClick={async () => {
                        await remove(session.id);
                        await list();
                      }}
                    >
                      <Trash2 />
                      {t.revoke}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
