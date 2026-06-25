"use client";

import * as React from "react";
import { useMediaObjects } from "@fa-m8/astro-media-m8/hooks";
import type {
  MediaCategory,
  MediaObjectPublic,
  ObjectListParams,
  SortField,
  SortOrder,
} from "@fa-m8/astro-media-m8/schemas";
import type { ColumnDef } from "@tanstack/react-table";

import { DataTableApi, type DataTableApiLabels } from "@/components/fa-media/data-table-api";
import { humanizeBytes } from "@/components/fa-media/media-storage-chart";
import {
  parseMediaLibraryCategory,
  parseMediaLibraryUrlState,
  stringifyMediaLibraryUrlState,
} from "@/components/fa-media/media-library-url-state";

const SORT_FIELDS: SortField[] = ["created_at", "size_bytes"];

export interface MediaLibraryLabels {
  title: string;
  filename: string;
  category: string;
  status: string;
  size: string;
  created: string;
  open: string;
  loadError: string;
  table: Partial<DataTableApiLabels>;
  categories: Record<MediaCategory, string>;
  statuses: Record<MediaObjectPublic["status"], string>;
}

const DEFAULT_LABELS: MediaLibraryLabels = {
  title: "Media library",
  filename: "Filename",
  category: "Category",
  status: "Status",
  size: "Size",
  created: "Created",
  open: "Open",
  loadError: "Failed to load media.",
  table: {},
  categories: {
    avatar: "Avatar",
    document: "Document",
    asset: "Asset",
    chat_attachment: "Chat attachment",
    export: "Export",
    receipt: "Receipt",
  },
  statuses: {
    pending_upload: "Pending",
    uploaded: "Uploaded",
    processing: "Processing",
    ready: "Ready",
    failed: "Failed",
    deleted: "Deleted",
    rejected: "Rejected",
  },
};

export interface MediaLibraryProps {
  objectHref?: (id: string) => string;
  initial?: ObjectListParams;
  labels?: Partial<MediaLibraryLabels>;
}

function normalizeSort(value: string | undefined): SortField {
  return SORT_FIELDS.includes(value as SortField) ? (value as SortField) : "created_at";
}

function formatDate(value: string) {
  try {
    return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(
      new Date(value),
    );
  } catch {
    return value;
  }
}

export function MediaLibrary({ objectHref, initial = {}, labels }: MediaLibraryProps) {
  const t: MediaLibraryLabels = {
    ...DEFAULT_LABELS,
    ...labels,
    table: { ...DEFAULT_LABELS.table, ...labels?.table },
    categories: { ...DEFAULT_LABELS.categories, ...labels?.categories },
    statuses: { ...DEFAULT_LABELS.statuses, ...labels?.statuses },
  };
  const [urlState, setUrlState] = React.useState(() =>
    typeof window === "undefined"
      ? parseMediaLibraryUrlState(new URLSearchParams(), initial)
      : parseMediaLibraryUrlState(new URLSearchParams(window.location.search), initial),
  );
  const loadMoreRef = React.useRef(false);
  const { page, pageSize, q, category, sort: sortBy, order: sortDir } = urlState;

  React.useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const syncFromLocation = () => {
      setUrlState(parseMediaLibraryUrlState(new URLSearchParams(window.location.search), initial));
    };

    window.addEventListener("popstate", syncFromLocation);
    return () => window.removeEventListener("popstate", syncFromLocation);
  }, [initial]);

  React.useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const nextSearch = stringifyMediaLibraryUrlState(urlState);
    const currentSearch = window.location.search.replace(/^\?/, "");

    if (nextSearch === currentSearch) {
      return;
    }

    const nextUrl = nextSearch
      ? `${window.location.pathname}?${nextSearch}${window.location.hash}`
      : `${window.location.pathname}${window.location.hash}`;
    window.history.replaceState(window.history.state, "", nextUrl);
  }, [urlState]);

  const params = React.useMemo<ObjectListParams>(
    () => ({
      ...initial,
      limit: pageSize,
      q: q.trim() || undefined,
      category: category || undefined,
      sort_by: sortBy,
      order: sortDir,
    }),
    [category, initial, pageSize, q, sortBy, sortDir],
  );
  const { items, count, loading, error, hasMore, loadMore } = useMediaObjects(params);

  React.useEffect(() => {
    const pageCount = Math.max(1, Math.ceil(Math.max(count, items.length) / pageSize));

    if (page > pageCount) {
      setUrlState((current) => ({ ...current, page: pageCount }));
    }
  }, [count, items.length, page, pageSize]);

  React.useEffect(() => {
    const neededItems = page * pageSize;

    if (loading || loadMoreRef.current || page <= 1 || items.length >= neededItems || !hasMore) {
      return;
    }

    loadMoreRef.current = true;
    void loadMore().finally(() => {
      loadMoreRef.current = false;
    });
  }, [hasMore, items.length, loadMore, loading, page, pageSize]);

  const pageItems = React.useMemo(
    () => items.slice((page - 1) * pageSize, page * pageSize),
    [items, page, pageSize],
  );
  const rowCount = Math.max(count, items.length);

  const columns = React.useMemo<ColumnDef<MediaObjectPublic>[]>(
    () => [
      {
        accessorKey: "original_filename",
        header: t.filename,
        enableSorting: false,
        cell: ({ row }) => {
          const object = row.original;
          const label = object.original_filename ?? object.id;
          return objectHref ? (
            <a className="font-medium text-primary hover:underline" href={objectHref(object.id)}>
              {label}
            </a>
          ) : (
            label
          );
        },
      },
      {
        accessorKey: "category",
        header: t.category,
        enableSorting: false,
        cell: ({ row }) => t.categories[row.original.category],
      },
      {
        accessorKey: "status",
        header: t.status,
        enableSorting: false,
        cell: ({ row }) => (
          <span className="inline-flex h-7 items-center rounded-md border bg-muted/40 px-2 text-xs font-medium">
            {t.statuses[row.original.status]}
          </span>
        ),
      },
      {
        accessorKey: "size_bytes",
        header: t.size,
        cell: ({ row }) => humanizeBytes(row.original.size_bytes),
      },
      {
        accessorKey: "created_at",
        header: t.created,
        cell: ({ row }) => formatDate(row.original.created_at),
      },
    ],
    [objectHref, t],
  );

  const handlePageChange = React.useCallback(
    (nextPage: number) => {
      if (nextPage < 1 || nextPage === page) return;
      const needsMore = nextPage > page && nextPage * pageSize > items.length && hasMore;
      if (needsMore) {
        void loadMore().then(() =>
          setUrlState((current) => ({ ...current, page: nextPage })),
        );
        return;
      }
      setUrlState((current) => ({ ...current, page: nextPage }));
    },
    [hasMore, items.length, loadMore, page, pageSize],
  );

  return (
    <section className="not-content space-y-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-semibold tracking-normal">{t.title}</h2>
        {error ? (
          <p role="alert" className="text-sm text-destructive">
            {t.loadError}
          </p>
        ) : null}
      </div>
      <DataTableApi
        columns={columns}
        data={pageItems}
        rowCount={rowCount}
        loading={loading}
        page={page}
        pageSize={pageSize}
        pageSizeOptions={[10, 25, 50]}
        onPageChange={handlePageChange}
        onPageSizeChange={(nextPageSize) => {
          setUrlState((current) => ({ ...current, pageSize: nextPageSize, page: 1 }));
        }}
        sortBy={sortBy}
        sortDir={sortDir}
        onSortChange={(nextSort, nextOrder) => {
          setUrlState((current) => ({
            ...current,
            sort: normalizeSort(nextSort),
            order: nextOrder ?? "desc",
            page: 1,
          }));
        }}
        q={q}
        onSearchChange={(nextQ) => {
          setUrlState((current) => ({ ...current, q: nextQ, page: 1 }));
        }}
        filterValue={category}
        onFilterChange={(nextCategory) => {
          setUrlState((current) => ({
            ...current,
            category: parseMediaLibraryCategory(nextCategory),
            page: 1,
          }));
        }}
        labels={t.table}
      />
    </section>
  );
}
