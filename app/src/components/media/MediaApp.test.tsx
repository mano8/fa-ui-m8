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
  MediaLibrary({
    initialUploadOpen = false,
    labels,
  }: {
    initialUploadOpen?: boolean;
    labels?: { title?: string; searchPlaceholder?: string; uploadMedia?: string };
  }) {
    return (
      <div
        data-testid="media-library"
        data-upload-open={String(initialUploadOpen)}
        data-title={labels?.title}
        data-search={labels?.searchPlaceholder}
        data-upload={labels?.uploadMedia}
      />
    );
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
vi.mock("@/components/fa-media/media-categories", () => ({
  MediaCategories: () => <div data-testid="media-categories" />,
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
    expect(screen.queryByTestId("media-categories")).toBeNull();
  });

  it("mounts the host shadcn category manager on /media/categories", () => {
    window.history.replaceState({}, "", "/fr/media/categories");

    render(<MediaApp view="categories" />);

    expect(screen.getByTestId("media-categories")).toBeTruthy();
    expect(screen.queryByTestId("media-library")).toBeNull();
  });

  it.each([
    ["en", "Media library", "Search filename", "Upload media"],
    ["fr", "Médiathèque", "Rechercher un fichier", "Téléverser un média"],
    ["es", "Biblioteca multimedia", "Buscar archivo", "Subir archivo"],
  ])("passes the %s media labels to every plugin-owned library form", (locale, title, search, upload) => {
    window.history.replaceState({}, "", `/${locale}/media/`);

    render(<MediaApp view="library" />);

    const library = screen.getByTestId("media-library");
    expect(library.getAttribute("data-title")).toBe(title);
    expect(library.getAttribute("data-search")).toBe(search);
    expect(library.getAttribute("data-upload")).toBe(upload);
  });
});
