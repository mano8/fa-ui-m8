import { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  CircleUserRound,
  Images,
  LoaderCircle,
  LogIn,
  LogOut,
  UserPlus,
} from "lucide-react";
import { AuthProvider } from "../auth/AuthProvider";
import { useAuth } from "../../hooks/auth/useAuth";

type AccountNavMenuLabels = {
  account: string;
  accountSettings: string;
  createAccount: string;
  media: string;
  signedIn: string;
  signIn: string;
  signOut: string;
};

type AccountNavMenuProps = {
  accountHref: string;
  loginHref: string;
  logoutHref: string;
  mediaHref: string;
  signupHref: string;
  labels: AccountNavMenuLabels;
};

function AccountMenuContent({
  accountHref,
  loginHref,
  logoutHref,
  mediaHref,
  signupHref,
  labels,
}: AccountNavMenuProps) {
  const { status, user } = useAuth();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const authenticated = status === "authenticated";
  const loading = status === "loading";

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
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

  const label = authenticated ? (user?.email ?? labels.signedIn) : labels.signIn;
  const statusLabel = loading ? "Checking session" : authenticated ? labels.signedIn : labels.signIn;
  const iconClassName = loading
    ? "size-4 text-[var(--sl-color-gray-3)]"
    : authenticated
      ? "size-4 text-emerald-400"
      : "size-4 text-amber-300";

  return (
    <div ref={rootRef} className="relative inline-flex">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={label}
        title={label}
        className="inline-flex h-8 items-center gap-1 rounded-lg border border-[var(--sl-color-gray-5)] px-2 text-sm font-semibold text-[var(--sl-color-white)] transition-colors hover:bg-[var(--sl-color-gray-6)]"
        onClick={() => setOpen((value) => !value)}
      >
        <span className="relative inline-flex">
          <CircleUserRound className={iconClassName} />
          <span className="sr-only">{statusLabel}</span>
          {loading ? <LoaderCircle className="absolute -bottom-1 -right-1 size-2.5 animate-spin text-[var(--sl-color-gray-2)]" /> : null}
        </span>
        <ChevronDown className="size-3 opacity-80" />
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-10 z-50 w-56 overflow-hidden rounded-lg border border-[var(--sl-color-gray-5)] bg-[var(--sl-color-black)] py-1 text-sm text-[var(--sl-color-white)] shadow-xl"
        >
          {authenticated ? (
            <>
              <div className="border-b border-[var(--sl-color-gray-5)] px-3 py-2 text-xs text-[var(--sl-color-gray-2)]">
                <span className="block truncate">{user?.email ?? labels.signedIn}</span>
              </div>
              <a role="menuitem" className="flex items-center gap-2 px-3 py-2 hover:bg-[var(--sl-color-gray-6)]" href={accountHref}>
                <CircleUserRound className="size-4" />
                <span>{labels.accountSettings}</span>
              </a>
              <a role="menuitem" className="flex items-center gap-2 px-3 py-2 hover:bg-[var(--sl-color-gray-6)]" href={mediaHref}>
                <Images className="size-4" />
                <span>{labels.media}</span>
              </a>
              <a role="menuitem" className="flex items-center gap-2 border-t border-[var(--sl-color-gray-5)] px-3 py-2 hover:bg-[var(--sl-color-gray-6)]" href={logoutHref}>
                <LogOut className="size-4" />
                <span>{labels.signOut}</span>
              </a>
            </>
          ) : (
            <>
              <a role="menuitem" className="flex items-center gap-2 px-3 py-2 hover:bg-[var(--sl-color-gray-6)]" href={loginHref}>
                <LogIn className="size-4" />
                <span>{labels.signIn}</span>
              </a>
              <a role="menuitem" className="flex items-center gap-2 px-3 py-2 hover:bg-[var(--sl-color-gray-6)]" href={signupHref}>
                <UserPlus className="size-4" />
                <span>{labels.createAccount}</span>
              </a>
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}

export default function AccountNavMenu(props: AccountNavMenuProps) {
  return (
    <AuthProvider>
      <AccountMenuContent {...props} />
    </AuthProvider>
  );
}
