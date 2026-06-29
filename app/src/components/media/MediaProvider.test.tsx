import { cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import type { MediaAuthAdapter } from "@fa-m8/astro-media-m8/auth-adapter";

const authState = vi.hoisted(() => ({ user: null as unknown }));
const mediaProviderState = vi.hoisted(() => ({ adapters: [] as MediaAuthAdapter[] }));
const mediaAuthAdapter = vi.hoisted(() => ({ setMediaAuthAdapter: vi.fn() }));
const authClient = vi.hoisted(() => ({ getToken: vi.fn(() => "token") }));
const authApi = vi.hoisted(() => ({ refreshToken: vi.fn(async () => ({ access_token: "next-token" })) }));

vi.mock("../../hooks/auth/useAuth", () => ({
  useAuth: () => ({ user: authState.user }),
}));

vi.mock("@fa-m8/astro-auth-m8/client", () => ({
  getToken: authClient.getToken,
}));

vi.mock("@fa-m8/astro-auth-m8/api", () => ({
  refreshToken: authApi.refreshToken,
}));

vi.mock("@fa-m8/astro-media-m8/auth-adapter", () => ({
  createFaAuthAdapter(bindings: {
    getToken: () => string | null;
    refreshToken?: () => Promise<{ access_token?: string } | string | null | undefined>;
    getUser?: () => unknown | Promise<unknown>;
    isSuperuser?: (user?: unknown) => boolean;
  }): MediaAuthAdapter {
    return {
      getAccessToken: bindings.getToken,
      refresh: async () => {
        const result = await bindings.refreshToken?.();
        if (!result) return null;
        return typeof result === "string" ? result : result.access_token ?? null;
      },
      getUser: bindings.getUser,
      isSuperuser: bindings.isSuperuser,
    };
  },
  setMediaAuthAdapter: mediaAuthAdapter.setMediaAuthAdapter,
}));

vi.mock("@fa-m8/astro-media-m8/react", async () => {
  const React = await vi.importActual<typeof import("react")>("react");

  return {
    MediaProvider({
      children,
      adapter,
    }: {
      children: ReactNode;
      adapter: MediaAuthAdapter;
    }) {
      mediaProviderState.adapters.push(adapter);
      return React.createElement("section", null, children);
    },
  };
});

import { MediaProvider } from "./MediaProvider";

afterEach(() => cleanup());

beforeEach(() => {
  authState.user = null;
  mediaProviderState.adapters = [];
  mediaAuthAdapter.setMediaAuthAdapter.mockClear();
  authClient.getToken.mockClear();
  authApi.refreshToken.mockClear();
});

describe("MediaProvider", () => {
  it("uses the surrounding auth context as the media adapter user source", async () => {
    const adminUser = { id: "user-1", is_superuser: true };
    const regularUser = { id: "user-2", is_superuser: false };
    authState.user = adminUser;

    const view = render(
      <MediaProvider>
        <span>media</span>
      </MediaProvider>,
    );

    const firstAdapter = mediaProviderState.adapters.at(-1)!;
    expect(await firstAdapter.getUser?.()).toBe(adminUser);
    expect(firstAdapter.isSuperuser?.(adminUser)).toBe(true);
    expect(firstAdapter.getAccessToken()).toBe("token");
    await expect(firstAdapter.refresh?.()).resolves.toBe("next-token");
    expect(mediaAuthAdapter.setMediaAuthAdapter).toHaveBeenCalledWith(firstAdapter);

    authState.user = regularUser;
    view.rerender(
      <MediaProvider>
        <span>media</span>
      </MediaProvider>,
    );

    const secondAdapter = mediaProviderState.adapters.at(-1)!;
    expect(secondAdapter).not.toBe(firstAdapter);
    expect(await secondAdapter.getUser?.()).toBe(regularUser);
    expect(secondAdapter.isSuperuser?.(regularUser)).toBe(false);
    expect(mediaAuthAdapter.setMediaAuthAdapter).toHaveBeenCalledWith(secondAdapter);
  });
});
