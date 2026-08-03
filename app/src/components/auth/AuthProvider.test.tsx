import { cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";

const pluginAuth = vi.hoisted(() => ({
  current: {
    user: null,
    loading: false,
    login: vi.fn(),
    logout: vi.fn(),
    reload: vi.fn(),
  },
}));

vi.mock("@mano8/astro-auth-m8/react", () => ({
  AuthProvider({ children }: { children: ReactNode }) {
    return <>{children}</>;
  },
  useAuth() {
    return pluginAuth.current;
  },
}));

import { AuthProvider } from "./AuthProvider";
import { useAuth } from "../../hooks/auth/useAuth";

type LocalAuth = ReturnType<typeof useAuth>;

afterEach(() => cleanup());

beforeEach(() => {
  pluginAuth.current = {
    user: null,
    loading: false,
    login: vi.fn(),
    logout: vi.fn(),
    reload: vi.fn(),
  };
});

function Probe({ expose }: { expose: (value: LocalAuth) => void }) {
  const auth = useAuth();
  expose(auth);
  return null;
}

describe("AuthProvider", () => {
  it("keeps local action callbacks stable when plugin context object identity changes", () => {
    const values: LocalAuth[] = [];
    const view = render(
      <AuthProvider>
        <Probe expose={(value) => values.push(value)} />
      </AuthProvider>,
    );
    const first = values.at(-1)!;

    pluginAuth.current = { ...pluginAuth.current };
    view.rerender(
      <AuthProvider>
        <Probe expose={(value) => values.push(value)} />
      </AuthProvider>,
    );
    const second = values.at(-1)!;

    expect(second.login).toBe(first.login);
    expect(second.logout).toBe(first.logout);
    expect(second.refresh).toBe(first.refresh);
  });
});
