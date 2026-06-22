import { render, screen, cleanup, fireEvent, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";

const { useUsersMock, requireRoleMock } = vi.hoisted(() => ({
  useUsersMock: vi.fn(),
  // Default: superuser → RequireRole renders its children.
  requireRoleMock: vi.fn(({ children }: { children: ReactNode }) => children),
}));
vi.mock("@fa-m8/astro-auth-m8/react", () => ({ RequireRole: requireRoleMock }));
vi.mock("@fa-m8/astro-auth-m8/hooks", () => ({ useUsers: useUsersMock }));

import { AdminUsersPanel } from "./admin-users-panel";

function hook(overrides = {}) {
  return {
    users: { data: [], count: 0 },
    loading: false,
    error: null,
    reload: vi.fn().mockResolvedValue(null),
    create: vi.fn().mockResolvedValue({}),
    update: vi.fn().mockResolvedValue({}),
    remove: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

afterEach(() => cleanup());
beforeEach(() => {
  useUsersMock.mockReset().mockReturnValue(hook());
  requireRoleMock.mockReset().mockImplementation(({ children }: { children: ReactNode }) => children);
});

describe("AdminUsersPanel", () => {
  it("is gated behind the package RequireRole superuser guard", () => {
    requireRoleMock.mockImplementation(() => null); // simulate non-superuser
    const { container } = render(<AdminUsersPanel />);
    expect(requireRoleMock).toHaveBeenCalledWith(
      expect.objectContaining({ superuser: true }),
      undefined,
    );
    expect(container.querySelector("table")).toBeNull();
  });

  it("renders the user table with the live count", () => {
    useUsersMock.mockReturnValue(
      hook({
        users: {
          data: [
            { id: "u1", email: "a@x.io", full_name: "A", avatar: null, role: "user", provider: "password", is_active: true, email_verified: true, is_superuser: false },
          ],
          count: 1,
        },
      }),
    );
    render(<AdminUsersPanel labels={{ users: "users" }} />);
    expect(screen.getByText("1 users")).toBeTruthy();
    expect(screen.getByDisplayValue("a@x.io")).toBeTruthy();
  });

  it("deletes a user and reloads", async () => {
    const remove = vi.fn().mockResolvedValue(undefined);
    const reload = vi.fn().mockResolvedValue(null);
    useUsersMock.mockReturnValue(
      hook({
        remove,
        reload,
        users: {
          data: [
            { id: "u9", email: "z@x.io", full_name: null, avatar: null, role: "user", provider: "password", is_active: true, email_verified: false, is_superuser: false },
          ],
          count: 1,
        },
      }),
    );
    render(<AdminUsersPanel labels={{ delete: "Delete" }} />);
    fireEvent.click(screen.getByText("Delete"));
    await waitFor(() => expect(remove).toHaveBeenCalledWith("u9"));
    expect(reload).toHaveBeenCalled();
  });
});
