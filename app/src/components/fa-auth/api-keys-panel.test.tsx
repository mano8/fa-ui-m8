import {
  render,
  screen,
  cleanup,
  fireEvent,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { useApiKeysMock } = vi.hoisted(() => ({ useApiKeysMock: vi.fn() }));
vi.mock("@mano8/astro-auth-m8/hooks", () => ({ useApiKeys: useApiKeysMock }));

import { ApiKeysPanel } from "./api-keys-panel";

function key(overrides = {}) {
  return {
    id: "k1",
    name: "CI key",
    expires_at: null,
    last_used_at: null,
    revoked: false,
    ...overrides,
  };
}

function hook(overrides = {}) {
  return {
    apiKeys: [],
    loading: false,
    reload: vi.fn().mockResolvedValue([]),
    create: vi.fn().mockResolvedValue({}),
    createdKey: null,
    revoke: vi.fn().mockResolvedValue("ok"),
    ...overrides,
  };
}

afterEach(() => cleanup());
beforeEach(() => useApiKeysMock.mockReset().mockReturnValue(hook()));

describe("ApiKeysPanel", () => {
  it("renders the empty state when there are no keys", () => {
    render(<ApiKeysPanel labels={{ empty: "No tokens" }} />);
    expect(screen.getByText("No tokens")).toBeTruthy();
  });

  it("lists keys in the data-table", () => {
    useApiKeysMock.mockReturnValue(hook({ apiKeys: [key({ name: "CI key" })] }));
    render(<ApiKeysPanel />);
    expect(screen.getByText("CI key")).toBeTruthy();
  });

  it("mints a new key from the popup form", async () => {
    const create = vi.fn().mockResolvedValue({});
    useApiKeysMock.mockReturnValue(hook({ create }));
    render(<ApiKeysPanel labels={{ mint: "Mint new key" }} />);

    fireEvent.click(screen.getByText("Mint new key"));
    fireEvent.change(screen.getByLabelText("Token name"), {
      target: { value: "deploy" },
    });
    // Submit button inside the dialog.
    fireEvent.click(screen.getByRole("button", { name: "Mint new key" }));

    await waitFor(() =>
      expect(create).toHaveBeenCalledWith(
        expect.objectContaining({ name: "deploy", ttl_hours: 720 }),
      ),
    );
  });

  it("reveals the one-time plaintext after creation", async () => {
    const create = vi.fn().mockResolvedValue({});
    useApiKeysMock.mockReturnValue(
      hook({ create, createdKey: { plaintext: "secret-token-xyz" } }),
    );
    render(<ApiKeysPanel labels={{ mint: "Mint new key", securityNotice: "Copy now" }} />);

    fireEvent.click(screen.getByText("Mint new key"));
    fireEvent.click(screen.getByRole("button", { name: "Mint new key" }));

    await waitFor(() => expect(screen.getByText("secret-token-xyz")).toBeTruthy());
    expect(screen.getByText("Copy now")).toBeTruthy();
  });

  it("revokes a key after confirming in the alert dialog", async () => {
    const revoke = vi.fn().mockResolvedValue("ok");
    useApiKeysMock.mockReturnValue(
      hook({ revoke, apiKeys: [key({ id: "k2", name: "Old key" })] }),
    );
    render(<ApiKeysPanel labels={{ revoke: "Revoke" }} />);

    // The row action opens the confirm dialog; it does not revoke directly.
    fireEvent.click(screen.getAllByText("Revoke")[0]!);
    expect(revoke).not.toHaveBeenCalled();

    const dialog = screen.getByRole("alertdialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "Revoke" }));
    await waitFor(() => expect(revoke).toHaveBeenCalledWith("k2"));
  });
});
