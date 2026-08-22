// Locks in C24/H22 (a): the provider must read the env names the faReparto
// integration actually defines (PUBLIC_FA_REPARTO_*), and must not fall back to
// "/fastapi" — a segment reparto-docente-m8 never mounts.
import { cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import type { RepartoAuthAdapter } from "@mano8/astro-reparto-m8/auth-adapter";

const repartoProviderState = vi.hoisted(() => ({
  adapters: [] as RepartoAuthAdapter[],
  configs: [] as Record<string, unknown>[]
}));
const repartoAuthAdapter = vi.hoisted(() => ({ setRepartoAuthAdapter: vi.fn() }));
const authClient = vi.hoisted(() => ({ getToken: vi.fn(() => "token") }));
const authApi = vi.hoisted(() => ({
  refreshToken: vi.fn(async () => ({ access_token: "next-token" }))
}));

vi.mock("@mano8/astro-auth-m8/client", () => ({ getToken: authClient.getToken }));
vi.mock("@mano8/astro-auth-m8/api", () => ({ refreshToken: authApi.refreshToken }));

vi.mock("@mano8/astro-reparto-m8/auth-adapter", () => ({
  createFaAuthAdapter(bindings: {
    getToken: () => string | null;
    refreshToken?: () => Promise<{ access_token?: string } | string | null | undefined>;
    onUnauthenticated?: (reason: unknown) => void;
  }): RepartoAuthAdapter {
    return {
      getAccessToken: bindings.getToken,
      refresh: async () => {
        const result = await bindings.refreshToken?.();
        if (!result) return null;
        return typeof result === "string" ? result : result.access_token ?? null;
      },
      onUnauthenticated: bindings.onUnauthenticated
    } as RepartoAuthAdapter;
  },
  setRepartoAuthAdapter: repartoAuthAdapter.setRepartoAuthAdapter
}));

vi.mock("@mano8/astro-reparto-m8/react", async () => {
  const React = await vi.importActual<typeof import("react")>("react");

  return {
    RepartoProvider({
      children,
      adapter,
      config
    }: {
      children: ReactNode;
      adapter: RepartoAuthAdapter;
      config: Record<string, unknown>;
    }) {
      repartoProviderState.adapters.push(adapter);
      repartoProviderState.configs.push(config);
      return React.createElement("section", null, children);
    }
  };
});

import { RepartoProvider } from "./RepartoProvider";

afterEach(() => {
  cleanup();
  vi.unstubAllEnvs();
});

beforeEach(() => {
  repartoProviderState.adapters = [];
  repartoProviderState.configs = [];
  repartoAuthAdapter.setRepartoAuthAdapter.mockClear();
  authClient.getToken.mockClear();
  authApi.refreshToken.mockClear();
});

function renderProvider() {
  return render(
    <RepartoProvider>
      <span>reparto</span>
    </RepartoProvider>
  );
}

describe("RepartoProvider", () => {
  it("registers the fa-auth-backed adapter", async () => {
    renderProvider();

    const adapter = repartoProviderState.adapters.at(-1)!;
    expect(adapter.getAccessToken()).toBe("token");
    await expect(adapter.refresh?.()).resolves.toBe("next-token");
    expect(repartoAuthAdapter.setRepartoAuthAdapter).toHaveBeenCalledWith(adapter);
  });

  it("defaults the prefix to empty rather than the unmounted /fastapi segment", () => {
    renderProvider();

    // apiBase is asserted loosely on purpose: `getViteConfig` loads the real
    // astro.config.mjs, so a developer's local .env bakes it in through the
    // integration's vite `define` and the literal differs from CI's.
    expect(repartoProviderState.configs.at(-1)).toMatchObject({ apiPrefix: "" });
  });

  it("reads the env names the faReparto integration defines", () => {
    vi.stubEnv("PUBLIC_FA_REPARTO_API_PREFIX", "/v2");

    renderProvider();

    expect(repartoProviderState.configs.at(-1)).toMatchObject({ apiPrefix: "/v2" });
  });

  it("ignores the operator-facing names the integration never re-exposes", () => {
    // PUBLIC_REPARTO_* are what an operator sets; astro.config.mjs reads them
    // and the integration re-exposes them as PUBLIC_FA_REPARTO_*. A provider
    // reading the operator names sees nothing — which is how the "/fastapi"
    // fallback came to apply on every build.
    vi.stubEnv("PUBLIC_REPARTO_API_BASE", "https://wrong.example/reparto");
    vi.stubEnv("PUBLIC_REPARTO_API_PREFIX", "/fastapi");

    renderProvider();

    const config = repartoProviderState.configs.at(-1)!;
    expect(config.apiPrefix).toBe("");
    expect(config.apiBase).not.toBe("https://wrong.example/reparto");
  });
});
