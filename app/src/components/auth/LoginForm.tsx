// src/components/auth/LoginForm.tsx
import {
  LoginForm as SharedLoginForm,
  type LoginFormProps as SharedLoginFormProps,
} from "@fa-m8/astro-auth-m8/default-ui";
import { useGoogleLogin } from "../../hooks/auth/useGoogleLogin";
import { isGoogleLoginAvailable } from "../../lib/authConfig";
import { localeFromPath } from "../../lib/locale";
import { buttonVariants } from "../ui/button";

export type LoginFormProps = Pick<
  SharedLoginFormProps,
  | "errorMessage"
  | "loginTitle"
  | "loginDescription"
  | "userLabel"
  | "usernamePlaceholder"
  | "passwordLabel"
  | "signInButtonText"
  | "signinWithGoogleButtonText"
  | "signinLabel"
  | "orText"
  | "googleUnavailableText"
>;

const inputClassName =
  "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40";

function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24">
      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

export function LoginForm(props: LoginFormProps = {}) {
  const { start: startGoogleLogin } = useGoogleLogin();
  const locale = typeof window === "undefined" ? "en" : localeFromPath(window.location.pathname);
  const googleAvailable = typeof window !== "undefined" && isGoogleLoginAvailable(locale);

  return (
    <SharedLoginForm
      {...props}
      googleEnabled={googleAvailable}
      googleIcon={<GoogleIcon />}
      onGoogleLogin={startGoogleLogin}
      classNames={{
        root: "not-content group/card flex w-full max-w-md flex-col gap-(--card-spacing) overflow-hidden rounded-xl bg-card py-(--card-spacing) text-sm text-card-foreground ring-1 ring-foreground/10 [--card-spacing:--spacing(4)] has-data-[slot=card-footer]:pb-0 has-[>img:first-child]:pt-0 *:[img:first-child]:rounded-t-xl *:[img:last-child]:rounded-b-xl",
        header: "group/card-header @container/card-header grid auto-rows-min items-start gap-1 rounded-t-xl px-(--card-spacing) has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto] [.border-b]:pb-(--card-spacing)",
        title: "text-center font-heading text-2xl leading-snug font-medium",
        description: "text-center text-sm text-muted-foreground",
        content: "space-y-4 px-(--card-spacing)",
        error: "rounded-md bg-destructive/10 p-3 text-sm font-medium text-destructive",
        field: "space-y-1",
        label: "flex items-center gap-2 pb-2 text-sm leading-none font-medium select-none",
        input: inputClassName,
        fieldError: "text-xs text-destructive",
        footer: "flex flex-col items-center gap-3 rounded-b-xl border-t bg-muted/50 p-(--card-spacing)",
        submitButton: buttonVariants({ className: "w-full" }),
        divider: "relative my-2 w-full text-center text-xs after:absolute after:left-0 after:top-1/2 after:-z-10 after:h-[1px] after:w-full after:bg-border",
        dividerText: "bg-background px-2 text-muted-foreground uppercase",
        googleButton: buttonVariants({ variant: "outline", className: "w-full" }),
        googleIcon: "mr-2 inline-flex",
      }}
    />
  );
}
