import {
  makeListSchema,
  mergeAndNormalize,
  stringifyListUrlParams,
  type ListParams,
} from "@fa-m8/astro-media-m8/list-params";
import type {
  MediaCategory,
  MediaObjectStatus,
  ObjectListParams,
  SortField,
  SortOrder,
} from "@fa-m8/astro-media-m8/schemas";

const SORT_FIELDS = [
  "original_filename",
  "category",
  "status",
  "size_bytes",
  "created_at",
] as const satisfies readonly SortField[];
const PAGE_SIZES = [10, 25, 50] as const;
const CATEGORIES = [
  "avatar",
  "document",
  "asset",
  "chat_attachment",
  "export",
  "receipt",
] as const satisfies readonly MediaCategory[];
const STATUSES = [
  "pending_upload",
  "uploaded",
  "processing",
  "ready",
  "failed",
  "deleted",
  "rejected",
] as const satisfies readonly MediaObjectStatus[];

const mediaLibraryListSchema = makeListSchema({
  allowedSorts: SORT_FIELDS,
  allowedPageSizes: PAGE_SIZES,
  defaultSort: "original_filename",
  defaultOrder: "asc",
  defaultPage: 1,
  defaultPageSize: 10,
});

export interface MediaLibraryUrlState extends ListParams<SortField> {
  category: MediaCategory | "";
  status: MediaObjectStatus | "";
}

function normalizeCategory(value: string | null | undefined): MediaCategory | "" {
  return CATEGORIES.includes(value as MediaCategory) ? (value as MediaCategory) : "";
}

function normalizeStatus(value: string | null | undefined): MediaObjectStatus | "" {
  return STATUSES.includes(value as MediaObjectStatus) ? (value as MediaObjectStatus) : "";
}

export function parseMediaLibraryCategory(value: string | null | undefined): MediaCategory | "" {
  return normalizeCategory(value);
}

export function parseMediaLibraryStatus(value: string | null | undefined): MediaObjectStatus | "" {
  return normalizeStatus(value);
}

function defaultStateFromInitial(initial: ObjectListParams): MediaLibraryUrlState {
  const normalized = mergeAndNormalize(
    mediaLibraryListSchema,
    {
      page: 1,
      pageSize: 10,
      q: "",
      sort: "original_filename",
      order: "asc",
    },
    {
      pageSize: initial.limit,
      q: initial.q,
      sort: initial.sort_by,
      order: initial.order,
    },
  );

  return {
    ...normalized,
    category: normalizeCategory(initial.category),
    status: normalizeStatus(initial.status),
  };
}

export function parseMediaLibraryUrlState(
  source: URLSearchParams,
  initial: ObjectListParams = {},
): MediaLibraryUrlState {
  const defaults = defaultStateFromInitial(initial);
  const normalized = mergeAndNormalize(
    mediaLibraryListSchema,
    {
      page: defaults.page,
      pageSize: defaults.pageSize,
      q: defaults.q,
      sort: defaults.sort,
      order: defaults.order,
    },
    source,
  );

  return {
    ...normalized,
    category: normalizeCategory(source.get("category") ?? defaults.category),
    status: normalizeStatus(source.get("status") ?? defaults.status),
  };
}

export function stringifyMediaLibraryUrlState(state: MediaLibraryUrlState): string {
  const query = new URLSearchParams(
    stringifyListUrlParams({
      page: state.page,
      pageSize: state.pageSize,
      q: state.q,
      sort: state.sort,
      order: state.order,
    }),
  );

  if (state.category !== "") {
    query.set("category", state.category);
  } else {
    query.delete("category");
  }

  if (state.status !== "") {
    query.set("status", state.status);
  } else {
    query.delete("status");
  }

  return query.toString();
}
