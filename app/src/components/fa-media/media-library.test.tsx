import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { MediaObjectPublic } from "@fa-m8/astro-media-m8/schemas";

const { useMediaObjectsMock } = vi.hoisted(() => ({ useMediaObjectsMock: vi.fn() }));
vi.mock("@fa-m8/astro-media-m8/hooks", () => ({ useMediaObjects: useMediaObjectsMock }));

import { MediaLibrary } from "./media-library";

function mediaObject(overrides: Partial<MediaObjectPublic> = {}): MediaObjectPublic {
  return {
    id: "11111111-1111-4111-8111-111111111111",
    tenant_id: null,
    owner_user_id: "22222222-2222-4222-8222-222222222222",
    category: "asset",
    visibility: "private",
    storage_bucket: "bucket",
    object_key: "objects/file.png",
    original_filename: "file.png",
    mime_type: "image/png",
    extension: "png",
    size_bytes: 2048,
    sha256: null,
    etag: null,
    storage_class: "standard",
    status: "ready",
    scan_status: "clean",
    moderation_status: "approved",
    created_at: "2026-06-25T08:00:00Z",
    updated_at: "2026-06-25T08:00:00Z",
    deleted_at: null,
    ...overrides,
  };
}

function hook(overrides = {}) {
  return {
    items: [mediaObject()],
    count: 1,
    loading: false,
    error: null,
    hasMore: false,
    refresh: vi.fn().mockResolvedValue(undefined),
    loadMore: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

afterEach(() => cleanup());
beforeEach(() => useMediaObjectsMock.mockReset().mockReturnValue(hook()));

describe("MediaLibrary", () => {
  it("renders plugin-hook media through the app controlled table", () => {
    render(<MediaLibrary objectHref={(id) => `/media/object?id=${id}`} />);

    expect(useMediaObjectsMock).toHaveBeenCalledWith(
      expect.objectContaining({ limit: 10, sort_by: "created_at", order: "desc" }),
    );
    expect(screen.getByText("Media library")).toBeTruthy();
    expect(screen.getByRole("link", { name: "file.png" }).getAttribute("href")).toBe(
      "/media/object?id=11111111-1111-4111-8111-111111111111",
    );
    expect(screen.getByText("2.0 KB")).toBeTruthy();
  });

  it("updates hook params from search, category, page size, and sort controls", () => {
    const { rerender } = render(<MediaLibrary />);

    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "avatar" } });
    rerender(<MediaLibrary />);
    expect(useMediaObjectsMock).toHaveBeenLastCalledWith(
      expect.objectContaining({ q: "avatar" }),
    );

    fireEvent.change(screen.getByLabelText("Filter"), { target: { value: "document" } });
    rerender(<MediaLibrary />);
    expect(useMediaObjectsMock).toHaveBeenLastCalledWith(
      expect.objectContaining({ category: "document", q: "avatar" }),
    );

    fireEvent.change(screen.getByLabelText("Rows"), { target: { value: "25" } });
    rerender(<MediaLibrary />);
    expect(useMediaObjectsMock).toHaveBeenLastCalledWith(
      expect.objectContaining({ limit: 25 }),
    );

    fireEvent.click(screen.getByText("Size"));
    rerender(<MediaLibrary />);
    expect(useMediaObjectsMock).toHaveBeenLastCalledWith(
      expect.objectContaining({ sort_by: "size_bytes", order: "asc" }),
    );
  });

  it("loads the next cursor page before moving forward", async () => {
    const loadMore = vi.fn().mockResolvedValue(undefined);
    useMediaObjectsMock.mockReturnValue(
      hook({
        items: Array.from({ length: 10 }, (_, index) =>
          mediaObject({
            id: `${index}`.padStart(8, "0") + "-1111-4111-8111-111111111111",
            original_filename: `file-${index}.png`,
          }),
        ),
        count: 20,
        hasMore: true,
        loadMore,
      }),
    );

    render(<MediaLibrary />);
    fireEvent.click(screen.getByText("Next"));

    await waitFor(() => expect(loadMore).toHaveBeenCalledOnce());
  });

  it("shows plugin hook errors without importing service clients", () => {
    useMediaObjectsMock.mockReturnValue(hook({ error: new Error("boom") }));
    render(<MediaLibrary labels={{ loadError: "Could not load." }} />);
    expect(screen.getByRole("alert").textContent).toContain("Could not load.");
  });
});
