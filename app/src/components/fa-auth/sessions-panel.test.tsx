import { render, screen, cleanup, fireEvent, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { useAuthMock, useSessionsMock, useDashboardMock } = vi.hoisted(() => ({
  useAuthMock: vi.fn(),
  useSessionsMock: vi.fn(),
  useDashboardMock: vi.fn(),
}));
vi.mock("@fa-m8/astro-auth-m8/react", () => ({ useAuth: useAuthMock }));
vi.mock("@fa-m8/astro-auth-m8/hooks", () => ({
  useSessions: useSessionsMock,
  useDashboard: useDashboardMock,
}));

import { SessionsPanel } from "./sessions-panel";

function sessionsHook(overrides = {}) {
  return {
    current: { provider: "password", jwt_expires_at: null, refresh_expires_at: null },
    reloadCurrent: vi.fn().mockResolvedValue(null),
    sessions: { data: [], count: 0 },
    reload: vi.fn().mockResolvedValue(null),
    revoke: vi.fn().mockResolvedValue(undefined),
    loading: false,
    ...overrides,
  };
}

const dash = { activity: null, reload: vi.fn().mockResolvedValue(null) };

afterEach(() => cleanup());
beforeEach(() => {
  useAuthMock.mockReset();
  useSessionsMock.mockReset().mockReturnValue(sessionsHook());
  useDashboardMock.mockReset().mockReturnValue(dash);
});

describe("SessionsPanel", () => {
  it("hides the admin sessions card for non-superusers", () => {
    useAuthMock.mockReturnValue({ user: { is_superuser: false } });
    render(<SessionsPanel labels={{ adminTitle: "Admin sessions" }} />);
    expect(screen.queryByText("Admin sessions")).toBeNull();
  });

  it("shows the not-loaded state when there is no current session", () => {
    useAuthMock.mockReturnValue({ user: { is_superuser: false } });
    useSessionsMock.mockReturnValue(sessionsHook({ current: null }));
    render(<SessionsPanel labels={{ notLoaded: "No session loaded" }} />);
    expect(screen.getByText("No session loaded")).toBeTruthy();
  });

  it("renders and revokes superuser sessions", async () => {
    const revoke = vi.fn().mockResolvedValue(undefined);
    const reload = vi.fn().mockResolvedValue(null);
    useAuthMock.mockReturnValue({ user: { is_superuser: true } });
    useSessionsMock.mockReturnValue(
      sessionsHook({
        revoke,
        reload,
        sessions: { data: [{ id: "sess-1", refresh_expires_at: null }], count: 1 },
      }),
    );
    render(<SessionsPanel labels={{ adminTitle: "Admin sessions", revoke: "Revoke" }} />);
    expect(screen.getByText("Admin sessions")).toBeTruthy();
    expect(screen.getByText("sess-1")).toBeTruthy();

    fireEvent.click(screen.getByText("Revoke"));
    await waitFor(() => expect(revoke).toHaveBeenCalledWith("sess-1"));
  });
});
