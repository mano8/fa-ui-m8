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
      }),
    );

    expect(state).toEqual({
      page: 2,
      pageSize: 25,
      q: "hero asset",
      sort: "size_bytes",
      order: "asc",
      category: "document",
    });
  });

  it("merges initial defaults and strips invalid category values", () => {
    const state = parseMediaLibraryUrlState(new URLSearchParams("category=unknown"), {
      limit: 50,
      q: "avatar",
      sort_by: "size_bytes",
      order: "asc",
      category: "receipt",
    });

    expect(state).toEqual({
      page: 1,
      pageSize: 50,
      q: "avatar",
      sort: "size_bytes",
      order: "asc",
      category: "",
    });
  });

  it("stringifies only supported URL state fields", () => {
    expect(
      stringifyMediaLibraryUrlState({
        page: 3,
        pageSize: 10,
        q: "hero asset",
        sort: "created_at",
        order: "desc",
        category: "asset",
      }),
    ).toBe("page=3&pageSize=10&q=hero+asset&sort=created_at&order=desc&category=asset");
  });
});
