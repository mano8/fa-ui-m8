import { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  ChevronDown,
  CircleUserRound,
  KeyRound,
  LayoutDashboard,
  LoaderCircle,
  LogIn,
  Shield,
  UserRound,
} from "lucide-react";
import { AuthProvider } from "../auth/AuthProvider";
import { useAuth } from "../../hooks/auth/useAuth";

type AccountSidebarFooterLabels = {
  accountSettings: string;
  dashboard: string;
  profile: string;
  sessions: string;
  credentials: string;
  adminUsers: string;
  signIn: string;
  signedIn: string;
};

type AccountSidebarFooterProps = {
  accountHref: string;
  loginHref: string;
  labels: AccountSidebarFooterLabels;
};

const ACCOUNT_ROUTE_EVENT = "fa-ui-m8:account-route";
const ACCOUNT_MENU_OPEN_KEY = "fa-ui-m8:account-sidebar-menu-open";
const ACCOUNT_PATH_PATTERN = /^\/(en|es|fr)\/user\/account(?:\/.*)?$/;

function normalizePath(pathname: string) {
  return pathname.replace(/\/$/, "");
}

function initialMenuOpen() {
  if (typeof window === "undefined") return false;
  return window.sessionStorage.getItem(ACCOUNT_MENU_OPEN_KEY) === "true";
}

function isAccountRouteLink(target: EventTarget | null) {
  if (!(target instanceof Element)) return false;
  const anchor = target.closest("a[href]");
  if (!(anchor instanceof HTMLAnchorElement)) return false;
  const url = new URL(anchor.href);
  return url.origin === window.location.origin && ACCOUNT_PATH_PATTERN.test(url.pathname);
}

function AccountSidebarFooterContent({ accountHref, loginHref, labels }: AccountSidebarFooterProps) {
  const { status, user } = useAuth();
  const [open, setOpen] = useState(initialMenuOpen);
  const rootRef = useRef<HTMLDivElement>(null);
  const [activePath, setActivePath] = useState(() =>
    typeof window === "undefined" ? "" : normalizePath(window.location.pathname),
  );
  const accountBase = normalizePath(accountHref);

  useEffect(() => {
    const sync = () => setActivePath(normalizePath(window.location.pathname));
    window.addEventListener("popstate", sync);
    window.addEventListener(ACCOUNT_ROUTE_EVENT, sync);
    sync();
    return () => {
      window.removeEventListener("popstate", sync);
      window.removeEventListener(ACCOUNT_ROUTE_EVENT, sync);
    };
  }, []);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      if (isAccountRouteLink(event.target)) return;
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  useEffect(() => {
    window.sessionStorage.setItem(ACCOUNT_MENU_OPEN_KEY, String(open));
  }, [open]);

  const items = useMemo(
    () => [
      { href: accountHref, label: labels.dashboard, icon: LayoutDashboard },
      { href: `${accountHref}/profile`, label: labels.profile, icon: UserRound },
      { href: `${accountHref}/sessions`, label: labels.sessions, icon: Activity },
      { href: `${accountHref}/api-keys`, label: labels.credentials, icon: KeyRound },
      ...(user?.is_superuser
        ? [{ href: `${accountHref}/admin`, label: labels.adminUsers, icon: Shield }]
        : []),
    ],
    [accountHref, labels, user?.is_superuser],
  );

  if (status === "loading") {
    return (
      <div className="fa-account-sidebar-footer" aria-busy="true">
        <div className="fa-account-sidebar-status">
          <LoaderCircle className="size-4 animate-spin" />
          <span>{labels.signedIn}</span>
        </div>
      </div>
    );
  }

  if (status !== "authenticated") {
    return (
      <div className="fa-account-sidebar-footer">
        <a className="fa-account-sidebar-link fa-account-sidebar-primary" href={loginHref}>
          <LogIn className="size-4" />
          <span>{labels.signIn}</span>
        </a>
      </div>
    );
  }

  return (
    <div ref={rootRef} className="fa-account-sidebar-footer">
      <button
        type="button"
        className="fa-account-sidebar-trigger"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((value) => !value)}
      >
        <CircleUserRound className="size-4" />
        <span className="fa-account-sidebar-trigger-text">
          <span>{labels.accountSettings}</span>
          <span title={user?.email ?? labels.signedIn}>{user?.email ?? labels.signedIn}</span>
        </span>
        <ChevronDown className="fa-account-sidebar-caret size-4" data-open={open} />
      </button>

      {open ? (
        <nav className="fa-account-sidebar-menu" aria-label={labels.accountSettings}>
          {items.map((item) => {
            const Icon = item.icon;
            const itemPath = normalizePath(item.href);
            const active = itemPath === activePath
              || (item.href === accountHref && activePath === accountBase)
              || (itemPath.endsWith("/admin") && activePath.startsWith(`${itemPath}/`));
            return (
              <a
                key={item.href}
                className="fa-account-sidebar-link"
                aria-current={active ? "page" : undefined}
                href={item.href}
              >
                <Icon className="size-4" />
                <span>{item.label}</span>
              </a>
            );
          })}
        </nav>
      ) : null}
    </div>
  );
}

export default function AccountSidebarFooter(props: AccountSidebarFooterProps) {
  return (
    <AuthProvider>
      <AccountSidebarFooterContent {...props} />
    </AuthProvider>
  );
}
