import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import type { ImagePresetPublic } from "@fa-m8/astro-media-m8/schemas";

const authState = vi.hoisted(() => ({ status: "loading" as "loading" | "authenticated" | "unauthenticated" }));
const useMediaPresetsMock = vi.hoisted(() => vi.fn());

vi.mock("../../hooks/auth/useAuth", () => ({
  useAuth: () => ({ status: authState.status }),
}));

vi.mock("../app/PluginProviders", () => ({
  PluginProviders({ children }: { children: ReactNode }) {
    return <>{children}</>;
  },
}));

vi.mock("@fa-m8/astro-media-m8/hooks", () => ({
  useMediaPresets: useMediaPresetsMock,
}));

import MediaPresetActionApp from "./MediaPresetActionApp";

function preset(overrides: Partial<ImagePresetPublic> = {}): ImagePresetPublic {
  return {
    id: "11111111-1111-4111-8111-111111111111",
    name: "hero",
    builtin: false,
    created_at: "2026-06-25T00:00:00Z",
    updated_at: "2026-06-25T00:00:00Z",
    spec: {
      image_size: { fixed_width: 512, fixed_height: null, fixed_size: null },
      formats: [{ ext: "WEBP", quality: 82 }],
      allow_upscale: false,
      max_byte_size: null,
    },
    ...overrides,
  };
}

beforeEach(() => {
  authState.status = "loading";
  useMediaPresetsMock.mockReset().mockReturnValue({
    presets: [preset()],
    loading: false,
    error: null,
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  });
  window.history.replaceState(
    {},
    "",
    "/en/media/presets/edit?id=11111111-1111-4111-8111-111111111111",
  );
});

afterEach(() => cleanup());

describe("MediaPresetActionApp", () => {
  it("does not query presets until auth has restored the session", () => {
    render(<MediaPresetActionApp action="edit" />);

    expect(useMediaPresetsMock).not.toHaveBeenCalled();
  });

  it("finds the selected preset after auth is restored", () => {
    authState.status = "authenticated";

    render(<MediaPresetActionApp action="edit" />);

    expect(useMediaPresetsMock).toHaveBeenCalledOnce();
    expect(screen.getByDisplayValue("hero")).toBeTruthy();
    expect(screen.queryByText("Preset not found.")).toBeNull();
  });
});
