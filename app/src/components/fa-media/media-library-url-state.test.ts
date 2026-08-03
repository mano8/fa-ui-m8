import { describe, expect, it } from "vitest";

import {
  parseMediaLibraryUrlState,
  stringifyMediaLibraryUrlState,
} from "./media-library-url-state";

describe("media-library-url-state", () => {
  it("parses URL params with plugin list helper normalization", () => {
    const state = parseMediaLibraryUrlState(
      new URLSearchParams({
        page: "2",
        pageSize: "25",
        q: "  hero   asset  ",
        sort: "size_bytes",
        order: "ASC",
        category: "document",
        status: "ready",
      }),
    );

    expect(state).toEqual({
      page: 2,
      pageSize: 25,
      q: "hero asset",
      sort: "size_bytes",
      order: "asc",
      category: "document",
      status: "ready",
    });
  });

  it("merges initial defaults and strips invalid category and status values", () => {
    const state = parseMediaLibraryUrlState(new URLSearchParams("category=unknown&status=unknown"), {
      limit: 50,
      q: "avatar",
      sort_by: "size_bytes",
      order: "asc",
      category: "receipt",
      status: "processing",
    });

    expect(state).toEqual({
      page: 1,
      pageSize: 50,
      q: "avatar",
      sort: "size_bytes",
      order: "asc",
      category: "",
      status: "",
    });
  });

  it("stringifies only supported URL state fields", () => {
    expect(
      stringifyMediaLibraryUrlState({
        page: 3,
        pageSize: 10,
        q: "hero asset",
        sort: "original_filename",
        order: "asc",
        category: "asset",
        status: "ready",
      }),
    ).toBe("page=3&pageSize=10&q=hero+asset&sort=original_filename&order=asc&category=asset&status=ready");
  });
});
