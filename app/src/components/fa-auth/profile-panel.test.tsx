import { render, screen, cleanup, fireEvent, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { useAuthMock, useProfileMock } = vi.hoisted(() => ({
  useAuthMock: vi.fn(),
  useProfileMock: vi.fn(),
}));
vi.mock("@fa-m8/astro-auth-m8/react", () => ({ useAuth: useAuthMock }));
vi.mock("@fa-m8/astro-auth-m8/hooks", () => ({ useProfile: useProfileMock }));

import { ProfilePanel } from "./profile-panel";

const passwordUser = {
  id: "u1",
  email: "user@example.com",
  full_name: "Ada",
  avatar: null,
  role: "user",
  provider: "password",
  is_superuser: false,
};

afterEach(() => cleanup());
beforeEach(() => {
  useAuthMock.mockReset();
  useProfileMock.mockReset();
});

describe("ProfilePanel", () => {
  it("renders nothing when there is no signed-in user", () => {
    useAuthMock.mockReturnValue({ user: null, reload: vi.fn() });
    useProfileMock.mockReturnValue({ save: vi.fn(), changePassword: vi.fn() });
    const { container } = render(<ProfilePanel />);
    expect(container.firstChild).toBeNull();
  });

  it("shows the password form for password-based accounts", () => {
    useAuthMock.mockReturnValue({ user: passwordUser, reload: vi.fn() });
    useProfileMock.mockReturnValue({ save: vi.fn(), changePassword: vi.fn() });
    render(<ProfilePanel labels={{ currentPassword: "Current password" }} />);
    expect(screen.getByLabelText("Current password")).toBeTruthy();
  });

  it("hides the password form and shows the SSO note for Google accounts", () => {
    useAuthMock.mockReturnValue({ user: { ...passwordUser, provider: "google" }, reload: vi.fn() });
    useProfileMock.mockReturnValue({ save: vi.fn(), changePassword: vi.fn() });
    render(<ProfilePanel labels={{ googlePasswordDisabled: "SSO managed" }} />);
    expect(screen.getByText("SSO managed")).toBeTruthy();
    expect(screen.queryByLabelText(/current password/i)).toBeNull();
  });

  it("saves the profile then reloads the auth user", async () => {
    const save = vi.fn().mockResolvedValue({});
    const reload = vi.fn().mockResolvedValue(null);
    useAuthMock.mockReturnValue({ user: passwordUser, reload });
    useProfileMock.mockReturnValue({ save, changePassword: vi.fn() });
    render(<ProfilePanel labels={{ saved: "Saved!" }} />);

    fireEvent.change(screen.getByLabelText("Full name"), { target: { value: "Grace" } });
    fireEvent.submit(screen.getByLabelText("Full name").closest("form")!);

    await waitFor(() => expect(save).toHaveBeenCalledWith({ full_name: "Grace", avatar: null }));
    expect(reload).toHaveBeenCalled();
    expect(await screen.findByText("Saved!")).toBeTruthy();
  });
});
