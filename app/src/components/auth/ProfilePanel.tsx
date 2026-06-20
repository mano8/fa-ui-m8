// src/components/auth/ProfilePanel.tsx
import { useState, type FormEvent } from "react";
import { useUser } from "../../hooks/auth/useUser";
import { useProfile } from "../../hooks/auth/useProfile";
import { UserUpdateMeSchema, UpdatePasswordSchema } from "@fa-m8/astro-auth-m8/schemas";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import type { AppTranslations } from "../../content/i18n/app";

type ProfileTranslations = AppTranslations["auth"]["profile"];

function errorMessage(err: unknown, fallback: string): string {
  return err instanceof Error && err.message ? err.message : fallback;
}

/** Map known backend (English) auth messages to the active locale, falling back to the raw message. */
function translatePasswordError(err: unknown, t: ProfileTranslations): string {
  const raw = errorMessage(err, t.passwordFailed);
  const known: Record<string, string> = {
    "Incorrect password": t.incorrectPasswordError,
    "New password cannot be the same as the current one": t.samePasswordError,
  };
  return known[raw] ?? raw;
}

export function ProfilePanel({ t }: { t: ProfileTranslations }) {
  const { user } = useUser();
  const { updateMe, isUpdating, changePassword } = useProfile();

  const [profileSuccess, setProfileSuccess] = useState(false);
  const [passSuccess, setPassSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleUpdateProfile = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    setProfileSuccess(false);

    const formData = new FormData(e.currentTarget);
    // Email is not editable here; optional fields submit as null when left blank
    // so an empty avatar clears the value instead of failing URL validation.
    const result = UserUpdateMeSchema.safeParse({
      full_name: formData.get("full_name")?.toString().trim() || null,
      avatar: formData.get("avatar")?.toString().trim() || null,
    });
    if (!result.success) {
      result.error.issues.forEach((i) => setErrors((prev) => ({ ...prev, [i.path[0]]: i.message })));
      return;
    }

    try {
      await updateMe(result.data);
      setProfileSuccess(true);
    } catch (err) {
      setErrors({ profileApi: errorMessage(err, t.failed) });
    }
  };

  const handleChangePassword = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    setPassSuccess(false);

    const formData = new FormData(e.currentTarget);
    const rawData = Object.fromEntries(formData);

    const result = UpdatePasswordSchema.safeParse(rawData);
    if (!result.success) {
      result.error.issues.forEach((i) => setErrors((prev) => ({ ...prev, [i.path[0]]: i.message })));
      return;
    }

    try {
      await changePassword(result.data);
      setPassSuccess(true);
      e.currentTarget.reset();
    } catch (err) {
      setErrors({ passApi: translatePasswordError(err, t) });
    }
  };

  if (!user) return null;

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Profile Info Form */}
      <Card>
        <CardHeader>
          <CardTitle>{t.title}</CardTitle>
          <CardDescription>{t.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            {profileSuccess && <div className="p-2 text-sm text-emerald-600 bg-emerald-50 rounded">{t.saved}</div>}
            {errors.profileApi && <div className="p-2 text-sm text-destructive bg-destructive/10 rounded">{errors.profileApi}</div>}
            
            <div className="space-y-1">
              <Label htmlFor="email">{t.email}</Label>
              <Input id="email" value={user.email} type="email" readOnly disabled aria-readonly="true" />
              <p className="text-xs text-muted-foreground">{t.emailReadOnly}</p>
            </div>

            <div className="space-y-1">
              <Label htmlFor="full_name">{t.fullName}</Label>
              <Input id="full_name" name="full_name" defaultValue={user.full_name || ""} />
            </div>

            <div className="space-y-1">
              <Label htmlFor="avatar">{t.avatar}</Label>
              <Input
                id="avatar"
                name="avatar"
                type="url"
                defaultValue={user.avatar || ""}
                placeholder={t.avatarPlaceholder}
              />
              {errors.avatar && <p className="text-xs text-destructive">{errors.avatar}</p>}
            </div>

            <Button type="submit" disabled={isUpdating}>
              {isUpdating ? t.saving : t.submit}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Password Adjuster (Only shown if provider is password based) */}
      <Card>
        <CardHeader>
          <CardTitle>{t.passwordTitle}</CardTitle>
          <CardDescription>{t.passwordDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          {user.provider === "google" ? (
            <p className="text-sm text-muted-foreground italic pt-4">
              {t.googlePasswordDisabled}
            </p>
          ) : (
            <form onSubmit={handleChangePassword} className="space-y-4">
              {passSuccess && <div className="p-2 text-sm text-emerald-600 bg-emerald-50 rounded">{t.credentialsRotated}</div>}
              {errors.passApi && <div className="p-2 text-sm text-destructive bg-destructive/10 rounded">{errors.passApi}</div>}

              <div className="space-y-1">
                <Label htmlFor="current_password">{t.currentPassword}</Label>
                <Input id="current_password" name="current_password" type="password" required />
              </div>

              <div className="space-y-1">
                <Label htmlFor="new_password">{t.newPassword}</Label>
                <Input id="new_password" name="new_password" type="password" required />
                {errors.new_password && <p className="text-xs text-destructive">{errors.new_password}</p>}
              </div>

              <Button type="submit" variant="secondary">{t.changePassword}</Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
