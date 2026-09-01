import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import type { ImagePresetPublic } from "@mano8/astro-media-m8/schemas";

const authState = vi.hoisted(() => ({ status: "loading" as "loading" | "authenticated" | "unauthenticated" }));
const useMediaPresetsMock = vi.hoisted(() => vi.fn());
const presetMutations = vi.hoisted(() => ({ create: vi.fn(), update: vi.fn(), remove: vi.fn() }));

vi.mock("../../hooks/auth/useAuth", () => ({
  useAuth: () => ({ status: authState.status }),
}));

vi.mock("../app/PluginProviders", () => ({
  PluginProviders({ children }: { children: ReactNode }) {
    return <>{children}</>;
  },
}));

vi.mock("@mano8/astro-media-m8/hooks", () => ({
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
  presetMutations.create.mockReset().mockImplementation(() => new Promise(() => undefined));
  presetMutations.update.mockReset().mockImplementation(() => new Promise(() => undefined));
  presetMutations.remove.mockReset().mockImplementation(() => new Promise(() => undefined));
  useMediaPresetsMock.mockReset().mockReturnValue({
    presets: [preset()],
    loading: false,
    error: null,
    create: presetMutations.create,
    update: presetMutations.update,
    remove: presetMutations.remove,
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

  it("creates a preset with every form setting", () => {
    authState.status = "authenticated";
    window.history.replaceState({}, "", "/en/media/presets/new");

    render(<MediaPresetActionApp action="new" />);

    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "thumbnail" } });
    fireEvent.change(screen.getByLabelText("Width"), { target: { value: "320" } });
    fireEvent.change(screen.getByLabelText("Format"), { target: { value: "JPEG" } });
    fireEvent.change(screen.getByLabelText("Quality"), { target: { value: "75" } });
    fireEvent.click(screen.getByLabelText("Allow upscale"));
    fireEvent.change(screen.getByLabelText("Max bytes"), { target: { value: "4096" } });
    fireEvent.submit(screen.getByRole("button", { name: "Save" }).closest("form")!);

    expect(presetMutations.create).toHaveBeenCalledWith({
      name: "thumbnail",
      spec: {
        image_size: { fixed_width: 320, fixed_height: null, fixed_size: null },
        formats: [{ ext: "JPEG", quality: 75 }],
        allow_upscale: true,
        max_byte_size: 4096,
      },
    });
  });

  it("updates an existing preset without allowing its stable name to change", () => {
    authState.status = "authenticated";

    render(<MediaPresetActionApp action="edit" />);

    expect(screen.getByLabelText("Name")).toHaveProperty("disabled", true);
    fireEvent.change(screen.getByLabelText("Width"), { target: { value: "640" } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(presetMutations.update).toHaveBeenCalledWith(
      "11111111-1111-4111-8111-111111111111",
      expect.objectContaining({
        spec: expect.objectContaining({ image_size: { fixed_width: 640, fixed_height: null, fixed_size: null } }),
      }),
    );
  });

  it("requires the explicit delete action and removes the selected preset", () => {
    authState.status = "authenticated";

    render(<MediaPresetActionApp action="delete" />);

    expect(screen.getByText("Are you sure you want to delete this preset?")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Yes, delete preset" }));
    expect(presetMutations.remove).toHaveBeenCalledWith("11111111-1111-4111-8111-111111111111");
  });
});
