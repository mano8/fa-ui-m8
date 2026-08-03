import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { MediaObjectPublic } from "@mano8/astro-media-m8/schemas";

const { deleteObjectMock, useMediaObjectsMock } = vi.hoisted(() => ({
  deleteObjectMock: vi.fn(),
  useMediaObjectsMock: vi.fn(),
}));
vi.mock("@mano8/astro-media-m8/hooks", () => ({ useMediaObjects: useMediaObjectsMock }));
vi.mock("@mano8/astro-media-m8/api", () => ({ deleteObject: deleteObjectMock }));

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
beforeEach(() => {
  window.history.replaceState({}, "", "/en/media");
  deleteObjectMock.mockReset().mockResolvedValue(undefined);
  useMediaObjectsMock.mockReset().mockReturnValue(hook());
});

describe("MediaLibrary", () => {
  it("renders plugin-hook media through the app controlled table", () => {
    render(<MediaLibrary objectHref={(id) => `/media/object?id=${id}`} />);

    expect(useMediaObjectsMock).toHaveBeenCalledWith(
      expect.objectContaining({ limit: 10, sort_by: "original_filename", order: "asc" }),
    );
    expect(screen.getByText("Media library")).toBeTruthy();
    expect(screen.getByRole("link", { name: "file.png" }).getAttribute("href")).toBe(
      "/media/object?id=11111111-1111-4111-8111-111111111111",
    );
    expect(screen.getByRole("link", { name: "View file.png" }).getAttribute("href")).toBe(
      "/media/object?id=11111111-1111-4111-8111-111111111111",
    );
    expect(screen.getByRole("button", { name: "Delete file.png" })).toBeTruthy();
    const columnHeaders = screen.getAllByRole("columnheader").map((header) =>
      (header.textContent ?? "").replace(/Sort (ascending|descending)|Clear sorting/g, ""),
    );
    expect(columnHeaders).toEqual(["Filename", "Actions", "Category", "Status", "Size", "Created"]);
    expect(screen.getByRole("link", { name: "View file.png" }).closest("div")?.className).toContain(
      "justify-center",
    );
    expect(screen.getByText("2.0 KB")).toBeTruthy();
  });

  it("updates hook params from search, category, status, page size, and sort controls", () => {
    render(<MediaLibrary />);

    fireEvent.change(screen.getByRole("textbox", { name: "Search" }), {
      target: { value: "avatar" },
    });
    expect(useMediaObjectsMock).toHaveBeenLastCalledWith(
      expect.objectContaining({ q: "avatar" }),
    );
    expect(window.location.search).toContain("q=avatar");

    fireEvent.change(screen.getByRole("combobox", { name: "Category" }), {
      target: { value: "document" },
    });
    expect(useMediaObjectsMock).toHaveBeenLastCalledWith(
      expect.objectContaining({ category: "document", q: "avatar" }),
    );
    expect(window.location.search).toContain("category=document");

    fireEvent.change(screen.getByRole("combobox", { name: "Status" }), {
      target: { value: "ready" },
    });
    expect(useMediaObjectsMock).toHaveBeenLastCalledWith(
      expect.objectContaining({ status: "ready", category: "document", q: "avatar" }),
    );
    expect(window.location.search).toContain("status=ready");

    fireEvent.change(screen.getByLabelText("Rows per page"), { target: { value: "25" } });
    expect(useMediaObjectsMock).toHaveBeenLastCalledWith(
      expect.objectContaining({ limit: 25 }),
    );
    expect(window.location.search).toContain("pageSize=25");

    fireEvent.click(screen.getByRole("button", { name: /Size/ }));
    expect(useMediaObjectsMock).toHaveBeenLastCalledWith(
      expect.objectContaining({ sort_by: "size_bytes", order: "asc" }),
    );
    expect(window.location.search).toContain("sort=size_bytes");
    expect(window.location.search).toContain("order=asc");
  });

  it("deletes a row through the plugin API and refreshes the list", async () => {
    const refresh = vi.fn().mockResolvedValue(undefined);
    useMediaObjectsMock.mockReturnValue(hook({ refresh }));

    render(<MediaLibrary />);
    fireEvent.click(screen.getByRole("button", { name: "Delete file.png" }));

    await waitFor(() =>
      expect(deleteObjectMock).toHaveBeenCalledWith("11111111-1111-4111-8111-111111111111"),
    );
    expect(refresh).toHaveBeenCalledOnce();
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
    fireEvent.click(screen.getByRole("button", { name: "Next page" }));

    await waitFor(() => expect(loadMore).toHaveBeenCalledOnce());
  });

  it("hydrates from URL state and loads enough cursor pages for a deep link", async () => {
    const loadMore = vi.fn().mockResolvedValue(undefined);
    window.history.replaceState(
      {},
      "",
      "/en/media?page=2&pageSize=25&q=hero+asset&sort=size_bytes&order=asc&category=document",
    );
    useMediaObjectsMock.mockReturnValue(
      hook({
        items: Array.from({ length: 25 }, (_, index) =>
          mediaObject({
            id: `${index}`.padStart(8, "0") + "-1111-4111-8111-111111111111",
            original_filename: `file-${index}.png`,
            category: "document",
          }),
        ),
        count: 50,
        hasMore: true,
        loadMore,
      }),
    );

    render(<MediaLibrary />);

    expect(useMediaObjectsMock).toHaveBeenCalledWith(
      expect.objectContaining({
        limit: 25,
        q: "hero asset",
        category: "document",
        sort_by: "size_bytes",
        order: "asc",
      }),
    );
    await waitFor(() => expect(loadMore).toHaveBeenCalledOnce());
  });

  it("resyncs from browser navigation state", async () => {
    render(<MediaLibrary />);

    window.history.pushState({}, "", "/en/media?page=3&pageSize=50&q=receipt&sort=size_bytes&order=asc");
    window.dispatchEvent(new PopStateEvent("popstate"));

    await waitFor(() =>
      expect(useMediaObjectsMock).toHaveBeenLastCalledWith(
        expect.objectContaining({
          limit: 50,
          q: "receipt",
          sort_by: "size_bytes",
          order: "asc",
        }),
      ),
    );
  });

  it("shows plugin hook errors without importing service clients", () => {
    useMediaObjectsMock.mockReturnValue(hook({ error: new Error("boom") }));
    render(<MediaLibrary labels={{ loadError: "Could not load." }} />);
    expect(screen.getByRole("alert").textContent).toContain("Could not load.");
  });
});
