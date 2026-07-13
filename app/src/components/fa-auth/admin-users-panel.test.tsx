import {
  render,
  screen,
  cleanup,
  fireEvent,
  waitFor,
  within,
} from "@testing-library/react";
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

type UserOverrides = Partial<{
  id: string;
  email: string;
  full_name: string | null;
  provider: string;
  role: string;
}>;

function user(overrides: UserOverrides = {}) {
  return {
    id: "u1",
    email: "a@x.io",
    full_name: "Ada",
    avatar: null,
    role: "user",
    provider: "password",
    is_active: true,
    email_verified: false,
    is_superuser: false,
    ...overrides,
  };
}

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
  requireRoleMock
    .mockReset()
    .mockImplementation(({ children }: { children: ReactNode }) => children);
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

  it("renders users in a data-table sorted by email", () => {
    useUsersMock.mockReturnValue(
      hook({
        users: {
          data: [
            user({ id: "u2", email: "z@x.io", full_name: "Zed" }),
            user({ id: "u1", email: "a@x.io", full_name: "Ada" }),
          ],
          count: 2,
        },
      }),
    );
    render(<AdminUsersPanel />);
    const rows = screen.getAllByRole("row");
    // rows[0] is the header row.
    expect(rows[1]?.textContent).toContain("a@x.io");
    expect(rows[2]?.textContent).toContain("z@x.io");
  });

  it("creates a user from the popup form", async () => {
    const create = vi.fn().mockResolvedValue({});
    useUsersMock.mockReturnValue(hook({ create }));
    render(<AdminUsersPanel labels={{ create: "Create user" }} />);

    fireEvent.click(screen.getByText("Create user"));
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "new@x.io" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() =>
      expect(create).toHaveBeenCalledWith(
        expect.objectContaining({
          email: "new@x.io",
          provider: "password",
          role: "user",
        }),
      ),
    );
  });

  it("edits a user through the prefilled popup", async () => {
    const update = vi.fn().mockResolvedValue({});
    useUsersMock.mockReturnValue(
      hook({
        update,
        users: { data: [user({ id: "u9", email: "e@x.io" })], count: 1 },
      }),
    );
    render(<AdminUsersPanel labels={{ edit: "Edit" }} />);

    fireEvent.click(screen.getByText("Edit"));
    const nameInput = screen.getByLabelText("Full name") as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: "Renamed" } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() =>
      expect(update).toHaveBeenCalledWith(
        "u9",
        expect.objectContaining({ full_name: "Renamed" }),
      ),
    );
  });

  it("confirms deletion through the alert dialog before removing", async () => {
    const remove = vi.fn().mockResolvedValue(undefined);
    useUsersMock.mockReturnValue(
      hook({
        remove,
        users: { data: [user({ id: "u9", email: "z@x.io" })], count: 1 },
      }),
    );
    render(<AdminUsersPanel labels={{ delete: "Delete" }} />);

    fireEvent.click(screen.getByText("Delete"));
    expect(remove).not.toHaveBeenCalled();

    const dialog = screen.getByRole("alertdialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "Delete" }));
    await waitFor(() => expect(remove).toHaveBeenCalledWith("u9"));
  });
});
