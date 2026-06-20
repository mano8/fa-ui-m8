// src/components/auth/ApiKeysPanel.tsx
import { useEffect, useState, type FormEvent } from "react";
import { useApiKeys } from "../../hooks/auth/useApiKeys";
import { ApiKeyCreateSchema } from "@fa-m8/astro-auth-m8/schemas";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui/card";
import type { AppTranslations } from "../../content/i18n/app";

type ApiKeysTranslations = AppTranslations["auth"]["apiKeys"];

// Backend currently accepts whole-hour TTLs only; sub-hour units need an auth-API change.
const TTL_UNIT_HOURS = { hours: 1, days: 24, weeks: 168 } as const;
type TtlUnit = keyof typeof TTL_UNIT_HOURS;

export function ApiKeysPanel({ t }: { t: ApiKeysTranslations }) {
  const { keys, loading, reload, create, isCreating, lastCreated, revoke } = useApiKeys();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    reload().catch(() => {});
  }, [reload]);

  const handleCreateToken = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCopied(false);
    const formData = new FormData(e.currentTarget);

    const amount = Number(formData.get("ttl_amount")) || 1;
    const unit = (formData.get("ttl_unit")?.toString() as TtlUnit) || "days";
    const ttl_hours = Math.max(1, Math.round(amount * (TTL_UNIT_HOURS[unit] ?? 24)));

    const parsedData = ApiKeyCreateSchema.parse({
      name: formData.get("name")?.toString() || t.defaultName,
      ttl_hours,
    });

    await create(parsedData);
    await reload();
    e.currentTarget.reset();
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t.createTitle}</CardTitle>
          <CardDescription>{t.createDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateToken} className="flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-[200px] space-y-1">
              <Label htmlFor="name">{t.name}</Label>
              <Input id="name" name="name" placeholder={t.namePlaceholder} required />
            </div>
            <div className="w-24 space-y-1">
              <Label htmlFor="ttl_amount">{t.ttl}</Label>
              <Input id="ttl_amount" name="ttl_amount" type="number" min={1} defaultValue="30" required />
            </div>
            <div className="w-32 space-y-1">
              <Label htmlFor="ttl_unit">{t.ttlUnit}</Label>
              <select
                id="ttl_unit"
                name="ttl_unit"
                defaultValue="days"
                className="h-9 w-full rounded-md border bg-background px-2 text-sm"
              >
                <option value="hours">{t.unitHours}</option>
                <option value="days">{t.unitDays}</option>
                <option value="weeks">{t.unitWeeks}</option>
              </select>
            </div>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? t.generating : t.mint}
            </Button>
          </form>

          {lastCreated && (
            <div className="mt-4 p-4 border border-amber-200 bg-amber-50 rounded-md text-amber-900 space-y-2">
              <p className="text-sm font-bold">{t.securityNotice}</p>
              <div className="flex items-center gap-2 bg-white p-2 rounded border font-mono text-xs overflow-x-auto">
                <span className="flex-1 select-all break-all">{lastCreated.plaintext}</span>
                <Button size="sm" variant="ghost" onClick={() => handleCopy(lastCreated.plaintext)}>
                  {copied ? t.copied : t.copy}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t.activeTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && keys.length === 0 ? (
            <p className="text-sm text-muted-foreground py-2 italic">{t.loading}</p>
          ) : keys.length === 0 ? (
            <p className="text-sm text-muted-foreground py-2 italic">{t.empty}</p>
          ) : (
            <div className="divide-y divide-border">
              {keys.map((key) => (
                <div key={key.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <h4 className="text-sm font-semibold">{key.name}</h4>
                    <p className="text-xs text-muted-foreground">
                      {t.expires}: {key.expires_at ? new Date(key.expires_at).toLocaleString() : t.notAvailable}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t.lastUsed}: {key.last_used_at ? new Date(key.last_used_at).toLocaleString() : t.notUsed}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {key.revoked ? t.revoked : t.active}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="destructive"
                    disabled={key.revoked}
                    onClick={async () => {
                      await revoke(key.id);
                      await reload();
                    }}
                  >
                    {t.revoke}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
