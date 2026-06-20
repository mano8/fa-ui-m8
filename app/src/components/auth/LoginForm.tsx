// src/components/auth/LoginForm.tsx
import { useState, type FormEvent } from "react";
import { useAuth } from "../../hooks/auth/useAuth";
import { useGoogleLogin } from "../../hooks/auth/useGoogleLogin";
import { LoginFormSchema } from "@fa-m8/astro-auth-m8/schemas";
import { isGoogleLoginAvailable } from "../../lib/authConfig";
import { localeFromPath } from "../../lib/locale";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";

export type LoginFormProps = {
  errorMessage?: string;
  loginTitle?: string;
  loginDescription?: string;
  userLabel?: string;
  usernamePlaceholder?: string;
  passwordLabel?: string;
  signInButtonText?: string;
  signinWithGoogleButtonText?: string;
  signinLabel?: string;
  orText?: string;
  googleUnavailableText?: string;
};

export function LoginForm({
  errorMessage = "Invalid credentials. Please try again.",
  loginTitle = "Welcome Back",
  loginDescription = "Sign in to manage your account and security credentials",
  userLabel = "Email address",
  usernamePlaceholder = "you@example.com",
  passwordLabel = "Password",
  signInButtonText = "Sign In with Password",
  signinWithGoogleButtonText = "Continue with Google",
  signinLabel = "Signing in...",
  orText = "or",
  googleUnavailableText = "Google sign-in is not available.",
}: LoginFormProps = {}) {
  const { login } = useAuth();
  const { start: startGoogleLogin } = useGoogleLogin();
  const locale = typeof window === "undefined" ? "en" : localeFromPath(window.location.pathname);
  const googleAvailable = typeof window !== "undefined" && isGoogleLoginAvailable(locale);
  
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

    // Validate using the pre-authored Zod Schema
    const result = LoginFormSchema.safeParse(data);
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
      await login(result.data);
    } catch (err) {
      const message = err instanceof Error ? err.message : errorMessage;
      setApiError(message || errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setApiError(null);
    try {
      await startGoogleLogin();
    } catch (err) {
      setApiError(err instanceof Error ? err.message : googleUnavailableText);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl text-center">{loginTitle}</CardTitle>
        <CardDescription className="text-center">
          {loginDescription}
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
            <Label htmlFor="username">{userLabel}</Label>
            <Input id="username" name="username" type="email" placeholder={usernamePlaceholder} required />
            {formErrors.username && <p className="text-xs text-destructive">{formErrors.username}</p>}
          </div>

          <div className="space-y-1">
            <Label htmlFor="password">{passwordLabel}</Label>
            <Input id="password" name="password" type="password" required />
            {formErrors.password && <p className="text-xs text-destructive">{formErrors.password}</p>}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? signinLabel : signInButtonText}
          </Button>
          
          {googleAvailable && (
            <>
              <div className="relative w-full my-2 text-center text-xs after:absolute after:top-1/2 after:left-0 after:h-[1px] after:w-full after:bg-border after:-z-10">
                <span className="bg-background px-2 text-muted-foreground uppercase">{orText}</span>
              </div>

              <Button type="button" variant="outline" className="w-full" onClick={handleGoogleLogin}>
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                {signinWithGoogleButtonText}
              </Button>
            </>
          )}
        </CardFooter>
      </form>
    </Card>
  );
}
