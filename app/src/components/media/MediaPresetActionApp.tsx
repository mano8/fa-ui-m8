// src/components/media/MediaPresetActionApp.tsx
import { useEffect, useMemo, useState } from "react";
import { useMediaPresets } from "@mano8/astro-media-m8/hooks";
import type { ImageFormat, ImagePresetPublic, PresetSpec } from "@mano8/astro-media-m8/schemas";
import { Save, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getTranslations, type Locale } from "../../content/i18n/app";
import { localeFromPath } from "../../lib/locale";
import { LoginForm } from "../auth/LoginForm";
import { useAuth } from "../../hooks/auth/useAuth";
import { PluginProviders } from "../app/PluginProviders";

export type MediaPresetAction = "new" | "edit" | "delete";

const FORMATS: ImageFormat[] = ["WEBP", "JPEG", "PNG", "GIF", "AVIF"];
const inputClassName =
  "h-9 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground";

function LoadingState() {
  return (
    <div className="flex min-h-[360px] items-center justify-center">
      <div className="size-8 animate-spin rounded-full border-2 border-muted border-b-primary" />
    </div>
  );
}

function findPreset(presets: ImagePresetPublic[], id: string | null) {
  return presets.find((preset) => preset.id === id) ?? null;
}

function initialSpec(preset: ImagePresetPublic | null): PresetSpec {
  return (
    preset?.spec ?? {
      image_size: { fixed_width: 512, fixed_height: null, fixed_size: null },
      formats: [{ ext: "WEBP", quality: 82 }],
      allow_upscale: false,
      max_byte_size: null,
    }
  );
}

function PresetActionContent({ action }: { action: MediaPresetAction }) {
  const { status } = useAuth();
  const locale = typeof window === "undefined" ? "en" : localeFromPath(window.location.pathname);
  const t = getTranslations(locale);

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

  return <AuthenticatedPresetActionContent action={action} locale={locale} />;
}

function AuthenticatedPresetActionContent({
  action,
  locale,
}: {
  action: MediaPresetAction;
  locale: Locale;
}) {
  const t = getTranslations(locale);
  const baseHref = `/${locale}/media/presets`;
  const id = typeof window === "undefined" ? null : new URLSearchParams(window.location.search).get("id");
  const { presets, loading, error: loadError, create, update, remove } = useMediaPresets();
  const preset = useMemo(() => findPreset(presets, id), [id, presets]);
  const spec = initialSpec(action === "new" ? null : preset);
  const [name, setName] = useState(action === "new" ? "" : (preset?.name ?? ""));
  const [width, setWidth] = useState(spec.image_size.fixed_width ?? spec.image_size.fixed_size ?? 512);
  const [format, setFormat] = useState<ImageFormat>(spec.formats.at(0)?.ext ?? "WEBP");
  const [quality, setQuality] = useState(spec.formats.at(0)?.quality ?? 82);
  const [allowUpscale, setAllowUpscale] = useState(spec.allow_upscale);
  const [maxBytes, setMaxBytes] = useState(spec.max_byte_size ?? 0);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (action === "new" || !preset) return;
    const nextSpec = preset.spec;
    setName(preset.name);
    setWidth(nextSpec.image_size.fixed_width ?? nextSpec.image_size.fixed_size ?? 512);
    setFormat(nextSpec.formats.at(0)?.ext ?? "WEBP");
    setQuality(nextSpec.formats.at(0)?.quality ?? 82);
    setAllowUpscale(nextSpec.allow_upscale);
    setMaxBytes(nextSpec.max_byte_size ?? 0);
  }, [action, preset]);

  const title =
    action === "new"
      ? t.media.presets.addTitle
      : action === "edit"
        ? t.media.presets.editTitle
        : t.media.presets.deleteTitle;

  const body = (): PresetSpec => ({
    image_size: { fixed_width: Math.max(1, width), fixed_height: null, fixed_size: null },
    formats: [{ ext: format, quality: Math.min(100, Math.max(1, quality)) }],
    allow_upscale: allowUpscale,
    max_byte_size: maxBytes > 0 ? maxBytes : null,
  });

  const save = async () => {
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      if (action === "new") {
        await create({ name: name.trim(), spec: body() });
      } else if (preset?.id) {
        await update(preset.id, { spec: body() });
      }
      setMessage(t.media.presets.saved);
      window.location.assign(baseHref);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.media.presets.saveError);
    } finally {
      setBusy(false);
    }
  };

  const deletePreset = async () => {
    if (!preset?.id) return;
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      await remove(preset.id);
      setMessage(t.media.presets.deleted);
      window.location.assign(baseHref);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.media.presets.deleteError);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="not-content mx-auto w-full max-w-6xl space-y-6">
      <div className="space-y-2 border-b pb-3 mb-3">
        <h1 className="text-2xl font-semibold tracking-normal text-foreground md:text-3xl">
          {title}
        </h1>
        <p className="text-sm text-muted-foreground">{t.media.description}</p>
      </div>

      <section className="not-content space-y-4 pb-3">
        {loading && action !== "new" ? <LoadingState /> : null}
        {loadError ? (
          <p role="alert" className="text-sm text-destructive">
            {t.media.presets.loadError}
          </p>
        ) : null}
        {!loading && !loadError && action !== "new" && !preset ? (
          <p role="alert" className="text-sm text-destructive">
            {t.media.presets.missing}
          </p>
        ) : null}
        {preset?.builtin ? (
          <p role="alert" className="text-sm text-destructive">
            {t.media.presets.readonly}
          </p>
        ) : null}
        {message ? <p className="text-sm text-emerald-600">{message}</p> : null}
        {error ? (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        ) : null}

        {action === "delete" ? (
          <div className="rounded-md border border-destructive/40 p-4">
            <p className="mb-4 text-sm">{t.media.presets.deletePrompt}</p>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="destructive"
                className="gap-2"
                disabled={busy || !preset?.id || preset.builtin}
                onClick={() => void deletePreset()}
              >
                <Trash2 className="size-4" />
                {t.media.presets.confirmDelete}
              </Button>
              <Button asChild type="button" variant="outline">
                <a href={baseHref}>{t.media.presets.cancel}</a>
              </Button>
            </div>
          </div>
        ) : (
          <form
            className="grid gap-4 rounded-md border p-4"
            onSubmit={(event) => {
              event.preventDefault();
              void save();
            }}
          >
            <label className="grid gap-2">
              <span className="text-sm font-medium">{t.media.presets.name}</span>
              <input
                className={inputClassName}
                value={name}
                disabled={action !== "new"}
                required
                onChange={(event) => setName(event.currentTarget.value)}
              />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-medium">{t.media.presets.width}</span>
              <input
                className={inputClassName}
                type="number"
                min={1}
                value={width}
                onChange={(event) => setWidth(Number(event.currentTarget.value))}
              />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-medium">{t.media.presets.format}</span>
              <select
                className={inputClassName}
                value={format}
                onChange={(event) => setFormat(event.currentTarget.value as ImageFormat)}
              >
                {FORMATS.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-medium">{t.media.presets.quality}</span>
              <input
                className={inputClassName}
                type="number"
                min={1}
                max={100}
                value={quality}
                onChange={(event) => setQuality(Number(event.currentTarget.value))}
              />
            </label>
            <label className="flex items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                checked={allowUpscale}
                onChange={(event) => setAllowUpscale(event.currentTarget.checked)}
              />
              {t.media.presets.allowUpscale}
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-medium">{t.media.presets.maxBytes}</span>
              <input
                className={inputClassName}
                type="number"
                min={0}
                value={maxBytes}
                onChange={(event) => setMaxBytes(Number(event.currentTarget.value))}
              />
            </label>
            <div className="flex flex-wrap gap-2">
              <Button type="submit" className="gap-2" disabled={busy || preset?.builtin || (action === "new" && !name.trim())}>
                <Save className="size-4" />
                {t.media.presets.save}
              </Button>
              <Button asChild type="button" variant="outline">
                <a href={baseHref}>{t.media.presets.cancel}</a>
              </Button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}

export default function MediaPresetActionApp({ action }: { action: MediaPresetAction }) {
  return (
    <PluginProviders media>
      <PresetActionContent action={action} />
    </PluginProviders>
  );
}
