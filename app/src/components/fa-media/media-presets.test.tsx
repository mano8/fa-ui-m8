import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ImagePresetPublic } from "@mano8/astro-media-m8/schemas";

const { useMediaPresetsMock } = vi.hoisted(() => ({ useMediaPresetsMock: vi.fn() }));

vi.mock("@mano8/astro-media-m8/hooks", () => ({
  useMediaPresets: useMediaPresetsMock,
}));

import { MediaPresets } from "./media-presets";

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

function hook(overrides = {}) {
  return {
    presets: [
      preset(),
      preset({
        id: "22222222-2222-4222-8222-222222222222",
        name: "avatar",
        builtin: true,
        spec: {
          image_size: { fixed_width: 128, fixed_height: null, fixed_size: null },
          formats: [{ ext: "PNG", quality: 90 }],
          allow_upscale: false,
          max_byte_size: null,
        },
      }),
    ],
    loading: false,
    error: null,
    ...overrides,
  };
}

beforeEach(() => {
  useMediaPresetsMock.mockReset().mockReturnValue(hook());
});

afterEach(() => cleanup());

describe("MediaPresets", () => {
  it("renders presets as a searchable table with actions in the second column", () => {
    render(<MediaPresets baseHref="/en/media/presets" />);

    const headers = screen.getAllByRole("columnheader").map((header) => header.textContent ?? "");
    expect(headers.map((header) => header.replace(/\s+/g, " ").trim())).toEqual([
      "NameSort descending",
      "Actions",
      "FormatSort ascending",
      "WidthSort ascending",
      "QualitySort ascending",
      "Built-inSort ascending",
      "CreatedSort ascending",
    ]);

    expect(screen.getByRole("link", { name: /add preset/i }).getAttribute("href")).toBe(
      "/en/media/presets/new",
    );
    expect(screen.getByRole("link", { name: /edit hero/i }).getAttribute("href")).toBe(
      "/en/media/presets/edit?id=11111111-1111-4111-8111-111111111111",
    );
    expect(screen.getByRole("link", { name: /delete hero/i }).getAttribute("href")).toBe(
      "/en/media/presets/delete?id=11111111-1111-4111-8111-111111111111",
    );
    expect(screen.getByText("Read-only")).toBeTruthy();
  });

  it("filters presets by name and format", () => {
    render(<MediaPresets baseHref="/en/media/presets" />);

    fireEvent.change(screen.getByRole("textbox", { name: /search/i }), {
      target: { value: "avatar" },
    });
    expect(screen.queryByText("hero")).toBeNull();
    expect(screen.getByText("avatar")).toBeTruthy();

    fireEvent.change(screen.getByRole("combobox", { name: "Format" }), {
      target: { value: "WEBP" },
    });
    expect(screen.getByText("No results.")).toBeTruthy();
  });
});
