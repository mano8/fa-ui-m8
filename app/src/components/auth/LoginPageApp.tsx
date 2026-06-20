// src/components/auth/LoginPageApp.tsx
import { useEffect, useState } from "react";
import { AuthProvider } from "./AuthProvider";
import { useAuth } from "../../hooks/auth/useAuth";
import { LoginForm } from "./LoginForm";
import { localePath } from "../../lib/locale";
import { getTranslations, type Locale } from "../../content/i18n/app";

function LoginShield({ locale }: { locale: Locale }) {
  const { status } = useAuth();
  const t = getTranslations(locale);
  const [isSuccessBanner, setIsSuccessBanner] = useState(false);

  useEffect(() => {
    // If they already have a live session cookie/token, eject them back to dashboard
    if (status === "authenticated") {
      window.location.replace(localePath(locale, "/user/account"));
    }
    // Check if they came from the signup portal successfully
    if (typeof window !== "undefined") {
      setIsSuccessBanner(new URLSearchParams(window.location.search).get("registered") === "true");
    }
  }, [status, locale]);

  if (status === "loading" || status === "authenticated") {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {isSuccessBanner && (
        <div className="max-w-md mx-auto p-3 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md text-center font-medium">
          {t.auth.login.registered}
        </div>
      )}
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

type LoginPageAppProps = {
  locale: Locale;
};

export default function LoginPageApp(props: LoginPageAppProps) {
  return (
    <AuthProvider>
      <LoginShield locale={props.locale} />
    </AuthProvider>
  );
}
