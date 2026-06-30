import { render, screen, cleanup, fireEvent, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";

const { useUsersMock, requireRoleMock } = vi.hoisted(() => ({
  useUsersMock: vi.fn(),
  // Default: superuser → RequireRole renders its children.
  requireRoleMock: vi.fn(({ children }: { children: ReactNode }) => children),
}));
vi.mock("@mano8/astro-auth-m8/react", () => ({ RequireRole: requireRoleMock }));
vi.mock("@mano8/astro-auth-m8/hooks", () => ({ useUsers: useUsersMock }));

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

  it("renders a table-only user list sorted by email", () => {
    useUsersMock.mockReturnValue(
      hook({
        users: {
          data: [
            { id: "u2", email: "z@x.io", full_name: "Zed", avatar: null, role: "user", provider: "password", is_active: true, email_verified: false, is_superuser: false },
            { id: "u1", email: "a@x.io", full_name: "A", avatar: null, role: "admin", provider: "google", is_active: true, email_verified: true, is_superuser: false },
          ],
          count: 2,
        },
      }),
    );
    render(<AdminUsersPanel labels={{ users: "users" }} />);
    expect(screen.getByText("2 / 2 users")).toBeTruthy();
    expect(screen.queryByDisplayValue("a@x.io")).toBeNull();

    const rows = screen.getAllByRole("row");
    expect(rows[1]?.textContent).toContain("a@x.io");
    expect(rows[2]?.textContent).toContain("z@x.io");
  });

  it("filters users by email, full name, role, and provider", () => {
    useUsersMock.mockReturnValue(
      hook({
        users: {
          data: [
            { id: "u1", email: "reader@x.io", full_name: "Ada Reader", avatar: null, role: "reader", provider: "password", is_active: true, email_verified: false, is_superuser: false },
            { id: "u2", email: "admin@x.io", full_name: "Grace Admin", avatar: null, role: "admin", provider: "google", is_active: true, email_verified: true, is_superuser: false },
          ],
          count: 2,
        },
      }),
    );
    render(<AdminUsersPanel />);

    fireEvent.change(screen.getByLabelText("Search"), { target: { value: "grace" } });
    expect(screen.getByText("admin@x.io")).toBeTruthy();
    expect(screen.queryByText("reader@x.io")).toBeNull();

    fireEvent.change(screen.getByLabelText("Role"), { target: { value: "reader" } });
    expect(screen.getByText("No users match the current filters.")).toBeTruthy();

    fireEvent.change(screen.getByLabelText("Search"), { target: { value: "" } });
    fireEvent.change(screen.getByLabelText("Provider"), { target: { value: "password" } });
    expect(screen.getByText("reader@x.io")).toBeTruthy();
    expect(screen.queryByText("admin@x.io")).toBeNull();
  });

  it("opens a delete page with user details before deleting", async () => {
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
    render(<AdminUsersPanel labels={{ delete: "Delete", confirmDelete: "Confirm delete" }} />);
    fireEvent.click(screen.getByText("Delete"));
    expect(remove).not.toHaveBeenCalled();
    expect(screen.getByText("Are you sure you want to delete this user?")).toBeTruthy();
    expect(screen.getByText("z@x.io")).toBeTruthy();

    fireEvent.click(screen.getByText("Confirm delete"));
    await waitFor(() => expect(remove).toHaveBeenCalledWith("u9"));
    expect(reload).toHaveBeenCalled();
  });
});
