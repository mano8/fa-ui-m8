// Locks in C24/H22 (b): the host must not re-narrow the prompt admin floor.
// The plugin owns admin detection (D-C2: `admin` and above, plus an explicit
// is_superuser flag), so this host binds no `isSuperuser` of its own and
// defaults `adminRole` to "admin" rather than "is_superuser".
import { cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import type { PromptAuthAdapter } from "@mano8/astro-prompt-m8/auth-adapter";

const authState = vi.hoisted(() => ({ user: null as unknown }));
const promptProviderState = vi.hoisted(() => ({
  adapters: [] as PromptAuthAdapter[],
  configs: [] as Record<string, unknown>[]
}));
const promptAuthAdapter = vi.hoisted(() => ({ setPromptAuthAdapter: vi.fn() }));
const bindingState = vi.hoisted(() => ({ last: null as Record<string, unknown> | null }));
const authClient = vi.hoisted(() => ({ getToken: vi.fn(() => "token") }));
const authApi = vi.hoisted(() => ({
  refreshToken: vi.fn(async () => ({ access_token: "next-token" }))
}));

vi.mock("../../hooks/auth/useAuth", () => ({
  useAuth: () => ({ user: authState.user })
}));

vi.mock("@mano8/astro-auth-m8/client", () => ({ getToken: authClient.getToken }));
vi.mock("@mano8/astro-auth-m8/api", () => ({ refreshToken: authApi.refreshToken }));

vi.mock("@mano8/astro-prompt-m8/auth-adapter", () => ({
  createFaAuthAdapter(bindings: {
    getToken: () => string | null;
    refreshToken?: () => Promise<{ access_token?: string } | string | null | undefined>;
    getUser?: () => unknown | Promise<unknown>;
    isSuperuser?: (user?: unknown) => boolean;
  }): PromptAuthAdapter {
    bindingState.last = bindings as unknown as Record<string, unknown>;
    return {
      getAccessToken: bindings.getToken,
      refresh: async () => {
        const result = await bindings.refreshToken?.();
        if (!result) return null;
        return typeof result === "string" ? result : result.access_token ?? null;
      },
      getUser: bindings.getUser,
      isSuperuser: bindings.isSuperuser
    };
  },
  setPromptAuthAdapter: promptAuthAdapter.setPromptAuthAdapter
}));

vi.mock("@mano8/astro-prompt-m8/react", async () => {
  const React = await vi.importActual<typeof import("react")>("react");

  return {
    PromptProvider({
      children,
      adapter,
      config
    }: {
      children: ReactNode;
      adapter: PromptAuthAdapter;
      config: Record<string, unknown>;
    }) {
      promptProviderState.adapters.push(adapter);
      promptProviderState.configs.push(config);
      return React.createElement("section", null, children);
    }
  };
});

import { PromptProvider } from "./PromptProvider";

afterEach(() => {
  cleanup();
  vi.unstubAllEnvs();
});

beforeEach(() => {
  authState.user = null;
  promptProviderState.adapters = [];
  promptProviderState.configs = [];
  bindingState.last = null;
  promptAuthAdapter.setPromptAuthAdapter.mockClear();
  authClient.getToken.mockClear();
  authApi.refreshToken.mockClear();
});

function renderProvider() {
  return render(
    <PromptProvider>
      <span>prompt</span>
    </PromptProvider>
  );
}

describe("PromptProvider", () => {
  it("uses the surrounding auth context as the prompt adapter user source", async () => {
    const user = { id: "user-1", role: "admin" };
    authState.user = user;

    renderProvider();

    const adapter = promptProviderState.adapters.at(-1)!;
    expect(await adapter.getUser?.()).toBe(user);
    expect(adapter.getAccessToken()).toBe("token");
    await expect(adapter.refresh?.()).resolves.toBe("next-token");
    expect(promptAuthAdapter.setPromptAuthAdapter).toHaveBeenCalledWith(adapter);
  });

  it("binds no host-side isSuperuser, leaving admin detection to the plugin", () => {
    renderProvider();

    expect(bindingState.last).not.toBeNull();
    expect(bindingState.last).not.toHaveProperty("isSuperuser");
  });

  it("defaults the admin floor to admin, matching require_admin on the service", () => {
    renderProvider();

    // apiBase is asserted loosely on purpose: `getViteConfig` loads the real
    // astro.config.mjs, so a developer's local .env bakes it in through the
    // integration's vite `define` and the literal differs from CI's.
    expect(promptProviderState.configs.at(-1)).toMatchObject({
      apiPrefix: "",
      adminRole: "admin"
    });
  });

  it("lets the build-time define override the admin floor", () => {
    vi.stubEnv("PUBLIC_FA_PROMPT_ADMIN_ROLE", "is_superuser");

    renderProvider();

    expect(promptProviderState.configs.at(-1)).toMatchObject({ adminRole: "is_superuser" });
  });
});
