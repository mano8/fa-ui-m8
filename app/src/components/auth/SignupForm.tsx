// src/components/auth/SignupForm.tsx
import { useState, type FormEvent } from "react";
import { signupUser } from "@fa-m8/astro-auth-m8/api";
import { UserRegisterSchema } from "@fa-m8/astro-auth-m8/schemas";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../../components/ui/card";
import { localePath } from "../../lib/locale";
import { getTranslations, type Locale } from "../../content/i18n/app";

export function SignupForm({ locale }: { locale: Locale }) {
  const t = getTranslations(locale).auth.signup;
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormErrors({});
    setApiError(null);
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData);

    const result = UserRegisterSchema.safeParse(data);
    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        if (issue.path[0]) errors[issue.path[0].toString()] = issue.message;
      });
      setFormErrors(errors);
      setIsSubmitting(false);
      return;
    }

    try {
      await signupUser(result.data);
      // On success, bump them to login with a friendly query parameter
      window.location.assign(`${localePath(locale, "/auth/login")}?registered=true`);
    } catch (err) {
      setApiError(
        err instanceof Error
          ? err.message
          : t.failed,
      );
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="not-content w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl text-center">{t.title}</CardTitle>
        <CardDescription className="text-center">
          {t.description}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {apiError && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md font-medium">
              {apiError}
            </div>
          )}

          <div className="space-y-1">
            <Label htmlFor="full_name" className="pb-2">{t.fullName}</Label>
            <Input id="full_name" name="full_name" placeholder={t.fullNamePlaceholder} />
          </div>

          <div className="space-y-1">
            <Label htmlFor="email" className="pb-2">{t.email}</Label>
            <Input id="email" name="email" type="email" placeholder={t.emailPlaceholder} required />
            {formErrors.email && <p className="text-xs text-destructive">{formErrors.email}</p>}
          </div>

          <div className="space-y-1">
            <Label htmlFor="password" className="pb-2">{t.password}</Label>
            <Input id="password" name="password" type="password" placeholder="********" required />
            {formErrors.password && <p className="text-xs text-destructive">{formErrors.password}</p>}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? t.submitting : t.submit}
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            {t.alreadyHaveAccount}{" "}
            <a href={localePath(locale, "/auth/login")} className="text-primary hover:underline font-medium">{t.signIn}</a>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
