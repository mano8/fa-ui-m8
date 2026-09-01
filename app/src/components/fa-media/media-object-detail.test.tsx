import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { CategoryNode, ImagePresetPublic, MediaObjectPublic } from "@mano8/astro-media-m8/schemas";

const {
  useCategoryTreeMock,
  useDownloadUrlMock,
  useMediaObjectMock,
  useMediaPresetsMock,
  useMediaVariantsMock,
  updateMock,
  removeMock,
  generateMock,
  downloadRequestMock,
} = vi.hoisted(() => ({
  useCategoryTreeMock: vi.fn(),
  useDownloadUrlMock: vi.fn(),
  useMediaObjectMock: vi.fn(),
  useMediaPresetsMock: vi.fn(),
  useMediaVariantsMock: vi.fn(),
  updateMock: vi.fn(),
  removeMock: vi.fn(),
  generateMock: vi.fn(),
  downloadRequestMock: vi.fn(),
}));

vi.mock("@mano8/astro-media-m8/hooks", () => ({
  useCategoryTree: useCategoryTreeMock,
  useDownloadUrl: useDownloadUrlMock,
  useMediaObject: useMediaObjectMock,
  useMediaPresets: useMediaPresetsMock,
  useMediaVariants: useMediaVariantsMock,
}));

import { MediaObjectDetail, isBrowserPreviewable, isImageMediaObject } from "./media-object-detail";

function category(
  id: number,
  name: string,
  parentId: number | null,
  children: CategoryNode[] = [],
): CategoryNode {
  return {
    id,
    owner_id: "22222222-2222-4222-8222-222222222222",
    tenant_id: null,
    name,
    slug: name.toLocaleLowerCase(),
    parent_id: parentId,
    object_count: 0,
    total_object_count: 0,
    children,
  };
}

function mediaObject(overrides: Partial<MediaObjectPublic> = {}): MediaObjectPublic {
  return {
    id: "11111111-1111-4111-8111-111111111111",
    tenant_id: null,
    owner_user_id: "22222222-2222-4222-8222-222222222222",
    category: "document",
    visibility: "private",
    storage_bucket: "media",
    object_key: "objects/file.pdf",
    original_filename: "file.pdf",
    mime_type: "application/pdf",
    extension: "pdf",
    size_bytes: 651214,
    sha256: null,
    etag: null,
    storage_class: "standard",
    status: "ready",
    scan_status: "clean",
    moderation_status: "approved",
    categories: [{ id: 3, name: "Invoices", path: "Documents / Finance / Invoices" }],
    created_at: "2026-08-31T12:00:00Z",
    updated_at: "2026-08-31T12:00:00Z",
    deleted_at: null,
    ...overrides,
  };
}

function preset(name: string, ext: "WEBP" | "JPEG" = "WEBP"): ImagePresetPublic {
  return {
    id: null,
    name,
    builtin: true,
    created_at: null,
    updated_at: null,
    spec: {
      image_size: { fixed_width: 320, fixed_height: 180, fixed_size: null },
      formats: [{ ext, quality: 80 }],
      allow_upscale: false,
      max_byte_size: null,
    },
  };
}

afterEach(() => cleanup());

beforeEach(() => {
  updateMock.mockReset().mockImplementation(async (patch) => ({ ...mediaObject(), ...patch }));
  removeMock.mockReset().mockResolvedValue(undefined);
  generateMock.mockReset().mockResolvedValue({
    id: "33333333-3333-4333-8333-333333333333",
    media_object_id: "11111111-1111-4111-8111-111111111111",
    owner_user_id: "22222222-2222-4222-8222-222222222222",
    status: "completed",
    requested_presets: ["thumb"],
    variants_expected: 1,
    variants_created: 1,
    error: null,
    created_at: "2026-08-31T12:00:00Z",
    updated_at: "2026-08-31T12:00:00Z",
  });
  useMediaObjectMock.mockReset().mockReturnValue({
    object: mediaObject(),
    loading: false,
    error: null,
    update: updateMock,
    remove: removeMock,
  });
  useDownloadUrlMock.mockReset().mockReturnValue({
    data: null,
    loading: false,
    error: null,
    request: downloadRequestMock.mockReset().mockResolvedValue({
      url: "https://storage.example/file",
      expires_at: "2026-08-31T12:10:00Z",
    }),
  });
  useCategoryTreeMock.mockReset().mockReturnValue({
    tree: [
      category(1, "Documents", null, [
        category(2, "Finance", 1, [category(3, "Invoices", 2)]),
      ]),
    ],
    loading: false,
    error: null,
  });
  useMediaPresetsMock.mockReset().mockReturnValue({ presets: [preset("thumb"), preset("photo", "JPEG")], loading: false, error: null });
  useMediaVariantsMock.mockReset().mockReturnValue({
    items: [],
    loading: false,
    error: null,
    job: null,
    generate: generateMock,
    remove: vi.fn().mockResolvedValue(undefined),
  });
});

describe("MediaObjectDetail", () => {
  it("shows two-column details, a full selected hierarchy, and a scalable category selector", async () => {
    render(<MediaObjectDetail objectId="11111111-1111-4111-8111-111111111111" />);

    expect(screen.getByRole("heading", { name: "file.pdf" })).toBeTruthy();
    expect(screen.getByText("MIME type").nextElementSibling?.textContent).toBe("application/pdf");
    expect(screen.getByText("Documents")).toBeTruthy();
    expect(screen.getByText("Finance")).toBeTruthy();
    expect(screen.getByText("Invoices")).toBeTruthy();
    expect(screen.getByText("Selected")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Open preview" }).getAttribute("target")).toBe("_blank");
    expect(screen.queryByRole("heading", { name: "Image variants" })).toBeNull();
    expect(useMediaVariantsMock).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Change categories" }));
    const dialog = screen.getByRole("dialog", { name: "Select user categories" });
    expect(within(dialog).getByRole("textbox", { name: "Search categories" })).toBeTruthy();
    expect(within(dialog).getByRole("button", { name: "Hierarchy" })).toBeTruthy();
    expect(within(dialog).getByRole("button", { name: "Columns" })).toBeTruthy();
    expect(within(dialog).queryByRole("button", { name: "Edit" })).toBeNull();
    expect(within(dialog).queryByRole("button", { name: "Delete" })).toBeNull();

    fireEvent.click(within(dialog).getByRole("checkbox", { name: "Select Finance" }));
    fireEvent.click(within(dialog).getByRole("button", { name: "Apply categories" }));

    await waitFor(() => expect(updateMock).toHaveBeenCalledWith({ category_ids: [2, 3] }));
  });

  it("offers the preset DataTable only for images and generates selected variants", async () => {
    useMediaObjectMock.mockReturnValue({
      object: mediaObject({ mime_type: "image/png", original_filename: "photo.png", categories: [] }),
      loading: false,
      error: null,
      update: updateMock,
      remove: removeMock,
    });

    render(<MediaObjectDetail objectId="11111111-1111-4111-8111-111111111111" />);

    expect(screen.getByRole("heading", { name: "Image variants" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Generate variants" }));
    const dialog = screen.getByRole("dialog", { name: "Select variant presets" });
    expect(within(dialog).getByRole("textbox", { name: "Search presets" })).toBeTruthy();
    expect(
      within(dialog)
        .getAllByRole("button", { name: "Format" })
        .some((button) => button.getAttribute("aria-haspopup") === "dialog"),
    ).toBe(true);
    fireEvent.click(within(dialog).getByRole("checkbox", { name: "Select thumb" }));
    fireEvent.click(within(dialog).getByRole("button", { name: "Generate selected" }));

    await waitFor(() => expect(generateMock).toHaveBeenCalledWith(["thumb"]));
  });

  it("requests downloads and protects deletion behind a confirmation dialog", async () => {
    const onDeleted = vi.fn();
    render(
      <MediaObjectDetail
        objectId="11111111-1111-4111-8111-111111111111"
        onDeleted={onDeleted}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Get download link" }));
    await waitFor(() => expect(downloadRequestMock).toHaveBeenCalledOnce());

    fireEvent.click(screen.getByRole("button", { name: "Delete file" }));
    const dialog = screen.getByRole("alertdialog", { name: "Delete this file?" });
    expect(within(dialog).getByText("This removes the media object and cannot be undone.")).toBeTruthy();
    fireEvent.click(within(dialog).getByRole("button", { name: "Delete file" }));

    await waitFor(() => expect(removeMock).toHaveBeenCalledOnce());
    await waitFor(() => expect(onDeleted).toHaveBeenCalledOnce());
  });
});

describe("media object eligibility", () => {
  it("fails closed for variants and previews only safe browser-renderable MIME families", () => {
    expect(isImageMediaObject(mediaObject({ mime_type: "image/webp" }))).toBe(true);
    expect(isImageMediaObject(mediaObject({ mime_type: "application/pdf" }))).toBe(false);
    expect(isBrowserPreviewable(mediaObject({ mime_type: "application/pdf" }))).toBe(true);
    expect(isBrowserPreviewable(mediaObject({ mime_type: "video/mp4" }))).toBe(true);
    expect(isBrowserPreviewable(mediaObject({ mime_type: "application/zip" }))).toBe(false);
  });
});
