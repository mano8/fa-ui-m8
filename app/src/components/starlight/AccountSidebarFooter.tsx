import { useEffect } from "react";
import { CircleUserRound, LoaderCircle, LogIn, LogOut } from "lucide-react";
import { AuthProvider } from "../auth/AuthProvider";
import { useAuth } from "../../hooks/auth/useAuth";

type AccountSidebarFooterLabels = {
  signIn: string;
  signOut: string;
  signedIn: string;
};

type AccountSidebarFooterProps = {
  accountHref: string;
  loginHref: string;
  logoutHref: string;
  labels: AccountSidebarFooterLabels;
};

const ACCOUNT_NAV_SLOT_ID = "fa-account-nav-slot";

function AccountSidebarFooterContent({ accountHref, loginHref, logoutHref, labels }: AccountSidebarFooterProps) {
  const { status, user } = useAuth();
  const authenticated = status === "authenticated";
  const isSuperuser = Boolean(user?.is_superuser);

  // Reveal the native Starlight account menu only for signed-in users, and
  // drop the admin entry unless the current user is a superuser.
  useEffect(() => {
    const slot = document.getElementById(ACCOUNT_NAV_SLOT_ID);
    if (!slot) return;
    slot.hidden = !authenticated;

    const adminLink = slot.querySelector<HTMLElement>("[data-account-admin]");
    if (adminLink) {
      const adminItem = adminLink.closest("li") ?? adminLink;
      adminItem.hidden = !(authenticated && isSuperuser);
    }
  }, [authenticated, isSuperuser]);

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

  if (!authenticated) {
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
    <div className="fa-account-sidebar-footer fa-account-footer-bar">
      <a
        className="fa-account-footer-user"
        href={accountHref}
        title={user?.email ?? labels.signedIn}
        aria-label={user?.email ?? labels.signedIn}
      >
        <CircleUserRound className="size-4" />
      </a>
      <a className="fa-account-sidebar-link fa-account-footer-logout" href={logoutHref}>
        <LogOut className="size-4" />
        <span>{labels.signOut}</span>
      </a>
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
