import { render, screen, cleanup, fireEvent, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { useApiKeysMock } = vi.hoisted(() => ({ useApiKeysMock: vi.fn() }));
vi.mock("@mano8/astro-auth-m8/hooks", () => ({ useApiKeys: useApiKeysMock }));

import { ApiKeysPanel } from "./api-keys-panel";

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

  it("lists keys and surfaces the one-time plaintext for a freshly created key", () => {
    useApiKeysMock.mockReturnValue(
      hook({
        apiKeys: [{ id: "k1", name: "CI key", expires_at: null, last_used_at: null, revoked: false }],
        createdKey: { plaintext: "secret-token-xyz" },
      }),
    );
    render(<ApiKeysPanel labels={{ securityNotice: "Copy now" }} />);
    expect(screen.getByText("CI key")).toBeTruthy();
    expect(screen.getByText("secret-token-xyz")).toBeTruthy();
    expect(screen.getByText("Copy now")).toBeTruthy();
  });

  it("mints a new key from the form", async () => {
    const create = vi.fn().mockResolvedValue({});
    useApiKeysMock.mockReturnValue(hook({ create }));
    render(<ApiKeysPanel labels={{ mint: "Mint new key" }} />);

    fireEvent.change(screen.getByLabelText("Token name"), { target: { value: "deploy" } });
    fireEvent.click(screen.getByText("Mint new key"));

    await waitFor(() =>
      expect(create).toHaveBeenCalledWith(expect.objectContaining({ name: "deploy", ttl_hours: 720 })),
    );
  });

  it("revokes a key", async () => {
    const revoke = vi.fn().mockResolvedValue("ok");
    useApiKeysMock.mockReturnValue(
      hook({
        revoke,
        apiKeys: [{ id: "k2", name: "Old key", expires_at: null, last_used_at: null, revoked: false }],
      }),
    );
    render(<ApiKeysPanel labels={{ revoke: "Revoke token" }} />);
    fireEvent.click(screen.getByText("Revoke token"));
    await waitFor(() => expect(revoke).toHaveBeenCalledWith("k2"));
  });
});
