// src/components/auth/LogoutPageApp.tsx
import { useEffect } from "react";
import { AuthProvider } from "./AuthProvider";
import { useAuth } from "../../hooks/auth/useAuth";
import { localePath } from "../../lib/locale";
import { getTranslations, type Locale } from "../../content/i18n/app";

function LogoutExecutor({ locale }: { locale: Locale }) {
  const { logout } = useAuth();
  const t = getTranslations(locale).auth.logout;

  useEffect(() => {
    logout().finally(() => {
      // Force complete hard redirection to erase remaining client memory state cleanly
      window.location.replace(localePath(locale, "/auth/login"));
    });
  }, [logout, locale]);

  return (
    <div className="text-center space-y-3">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
      <p className="text-sm text-muted-foreground font-medium">{t.clearing}</p>
    </div>
  );
}

export default function LogoutPageApp({ locale }: { locale: Locale }) {
  return (
    <AuthProvider>
      <LogoutExecutor locale={locale} />
    </AuthProvider>
  );
}
