import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";

const authState = vi.hoisted(() => ({
  status: "authenticated" as "loading" | "authenticated" | "unauthenticated",
  isSuperuser: true,
}));

vi.mock("../../hooks/auth/useAuth", () => ({
  useAuth: () => ({ status: authState.status }),
}));

vi.mock("../../hooks/auth/useUser", () => ({
  useUser: () => ({ isSuperuser: authState.isSuperuser }),
}));

vi.mock("../app/PluginProviders", () => ({
  PluginProviders({ children }: { children: ReactNode }) {
    return <>{children}</>;
  },
}));

vi.mock("@mano8/astro-media-m8/react", () => ({
  MediaLibrary({ initialUploadOpen = false }: { initialUploadOpen?: boolean }) {
    return <div data-testid="media-library" data-upload-open={String(initialUploadOpen)} />;
  },
  CategoryManager() {
    return <div data-testid="category-manager" />;
  },
}));

vi.mock("../auth/LoginForm", () => ({ LoginForm: () => <div data-testid="login" /> }));
vi.mock("@/components/fa-media/media-dashboard-overview", () => ({
  MediaDashboardOverview: () => <div data-testid="media-admin" />,
}));
vi.mock("@/components/fa-media/media-maintenance-panel", () => ({
  MediaMaintenancePanel: () => <div data-testid="media-maintenance" />,
}));
vi.mock("@/components/fa-media/media-presets", () => ({
  MediaPresets: () => <div data-testid="media-presets" />,
}));

import MediaApp from "./MediaApp";

beforeEach(() => {
  authState.status = "authenticated";
  authState.isSuperuser = true;
});

afterEach(() => cleanup());

describe("MediaApp route composition", () => {
  it("keeps /media/upload as a library alias with the upload dialog initially open", () => {
    window.history.replaceState({}, "", "/es/media/upload");

    render(<MediaApp view="upload" />);

    expect(screen.getByTestId("media-library").getAttribute("data-upload-open")).toBe("true");
    expect(screen.queryByTestId("category-manager")).toBeNull();
  });

  it("mounts the plugin-owned category CRUD manager on /media/categories", () => {
    window.history.replaceState({}, "", "/fr/media/categories");

    render(<MediaApp view="categories" />);

    expect(screen.getByTestId("category-manager")).toBeTruthy();
    expect(screen.queryByTestId("media-library")).toBeNull();
  });
});
