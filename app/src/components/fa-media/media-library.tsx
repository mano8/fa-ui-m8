"use client";

import * as React from "react";
import { Eye, Trash2 } from "lucide-react";
import { deleteObject } from "@mano8/astro-media-m8/api";
import { useMediaObjects } from "@mano8/astro-media-m8/hooks";
import type {
  MediaCategory,
  MediaObjectPublic,
  MediaObjectStatus,
  ObjectListParams,
  SortField,
} from "@mano8/astro-media-m8/schemas";
import type { ColumnDef } from "@tanstack/react-table";

import { DataTableApi, type DataTableApiLabels } from "@/components/fa-media/data-table-api";
import { DataTableIconButton } from "@/components/fa-media/data-table-icon-button";
import { humanizeBytes } from "@/components/fa-media/media-storage-chart";
import {
  parseMediaLibraryCategory,
  parseMediaLibraryStatus,
  parseMediaLibraryUrlState,
  stringifyMediaLibraryUrlState,
} from "@/components/fa-media/media-library-url-state";

const SORT_FIELDS: SortField[] = [
  "original_filename",
  "category",
  "status",
  "size_bytes",
  "created_at",
];
const CATEGORIES: MediaCategory[] = [
  "avatar",
  "document",
  "asset",
  "chat_attachment",
  "export",
  "receipt",
];
const STATUSES: MediaObjectStatus[] = [
  "pending_upload",
  "uploaded",
  "processing",
  "ready",
  "failed",
  "deleted",
  "rejected",
];
const selectClassName =
  "h-9 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground sm:w-44";

export interface MediaLibraryLabels {
  title: string;
  filename: string;
  category: string;
  status: string;
  size: string;
  created: string;
  actions: string;
  open: string;
  view: string;
  delete: string;
  deleteError: string;
  allCategories: string;
  allStatuses: string;
  loadError: string;
  table: Partial<DataTableApiLabels>;
  categories: Record<MediaCategory, string>;
  statuses: Record<MediaObjectStatus, string>;
}

const DEFAULT_LABELS: MediaLibraryLabels = {
  title: "Media library",
  filename: "Filename",
  category: "Category",
  status: "Status",
  size: "Size",
  created: "Created",
  actions: "Actions",
  open: "Open",
  view: "View",
  delete: "Delete",
  deleteError: "Failed to delete media.",
  allCategories: "All categories",
  allStatuses: "All statuses",
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
  return SORT_FIELDS.includes(value as SortField) ? (value as SortField) : "original_filename";
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

function mediaLabel(object: MediaObjectPublic): string {
  return object.original_filename ?? object.id;
}

const EMPTY_INITIAL_PARAMS: ObjectListParams = {};

export function MediaLibrary({
  objectHref,
  initial = EMPTY_INITIAL_PARAMS,
  labels,
}: MediaLibraryProps) {
  const t = React.useMemo<MediaLibraryLabels>(
    () => ({
      ...DEFAULT_LABELS,
      ...labels,
      table: { ...DEFAULT_LABELS.table, ...labels?.table },
      categories: { ...DEFAULT_LABELS.categories, ...labels?.categories },
      statuses: { ...DEFAULT_LABELS.statuses, ...labels?.statuses },
    }),
    [labels],
  );
  const initialParams = React.useMemo<ObjectListParams>(
    () => initial,
    [initial],
  );
  const [urlState, setUrlState] = React.useState(() =>
    typeof window === "undefined"
      ? parseMediaLibraryUrlState(new URLSearchParams(), initialParams)
      : parseMediaLibraryUrlState(new URLSearchParams(window.location.search), initialParams),
  );
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const [actionError, setActionError] = React.useState<string | null>(null);
  const loadMoreRef = React.useRef(false);
  const { page, pageSize, q, category, status, sort: sortBy, order: sortDir } = urlState;

  React.useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const syncFromLocation = () => {
      setUrlState(parseMediaLibraryUrlState(new URLSearchParams(window.location.search), initialParams));
    };

    window.addEventListener("popstate", syncFromLocation);
    return () => window.removeEventListener("popstate", syncFromLocation);
  }, [initialParams]);

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
      ...initialParams,
      limit: pageSize,
      q: q.trim() || undefined,
      category: category || undefined,
      status: status || undefined,
      sort_by: sortBy,
      order: sortDir,
    }),
    [category, initialParams, pageSize, q, sortBy, sortDir, status],
  );
  const { items, count, loading, error, hasMore, refresh, loadMore } = useMediaObjects(params);

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

  const handleDelete = React.useCallback(
    async (object: MediaObjectPublic) => {
      setActionError(null);
      setDeletingId(object.id);
      try {
        await deleteObject(object.id);
        await refresh();
      } catch {
        setActionError(t.deleteError);
      } finally {
        setDeletingId(null);
      }
    },
    [refresh, t.deleteError],
  );

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
        cell: ({ row }) => {
          const object = row.original;
          const label = mediaLabel(object);
          return objectHref ? (
            <a className="font-medium text-primary hover:underline" href={objectHref(object.id)}>
              {label}
            </a>
          ) : (
            <span className="font-medium">{label}</span>
          );
        },
      },
      {
        id: "actions",
        header: () => <div className="flex justify-center">{t.actions}</div>,
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => {
          const object = row.original;
          const label = mediaLabel(object);
          const href = objectHref?.(object.id);

          return (
            <div className="flex items-center justify-center gap-1">
              {href ? (
                <DataTableIconButton asChild label={`${t.view} ${label}`} variant="outline" size="icon-sm">
                  <a href={href}>
                    <Eye aria-hidden="true" />
                  </a>
                </DataTableIconButton>
              ) : null}
              <DataTableIconButton
                type="button"
                label={`${t.delete} ${label}`}
                variant="destructive"
                size="icon-sm"
                disabled={deletingId === object.id}
                onClick={() => void handleDelete(object)}
              >
                <Trash2 aria-hidden="true" />
              </DataTableIconButton>
            </div>
          );
        },
      },
      {
        accessorKey: "category",
        header: t.category,
        cell: ({ row }) => t.categories[row.original.category],
      },
      {
        accessorKey: "status",
        header: t.status,
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
    [deletingId, handleDelete, objectHref, t],
  );

  const filterControls = (
    <>
      <label className="min-w-0">
        <span className="sr-only">{t.category}</span>
        <select
          aria-label={t.category}
          className={selectClassName}
          value={category}
          onChange={(event) => {
            const nextCategory = parseMediaLibraryCategory(event.currentTarget.value);
            setUrlState((current) => ({
              ...current,
              category: nextCategory,
              page: 1,
            }));
          }}
        >
          <option value="">{t.allCategories}</option>
          {CATEGORIES.map((value) => (
            <option key={value} value={value}>
              {t.categories[value]}
            </option>
          ))}
        </select>
      </label>
      <label className="min-w-0">
        <span className="sr-only">{t.status}</span>
        <select
          aria-label={t.status}
          className={selectClassName}
          value={status}
          onChange={(event) => {
            const nextStatus = parseMediaLibraryStatus(event.currentTarget.value);
            setUrlState((current) => ({
              ...current,
              status: nextStatus,
              page: 1,
            }));
          }}
        >
          <option value="">{t.allStatuses}</option>
          {STATUSES.map((value) => (
            <option key={value} value={value}>
              {t.statuses[value]}
            </option>
          ))}
        </select>
      </label>
    </>
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
      <div className="flex flex-col gap-1 pb-3 mb-2">
        <h2 className="text-xl font-semibold tracking-normal">{t.title}</h2>
        {error ? (
          <p role="alert" className="text-sm text-destructive">
            {t.loadError}
          </p>
        ) : null}
        {actionError ? (
          <p role="alert" className="text-sm text-destructive">
            {actionError}
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
            order: nextOrder ?? "asc",
            page: 1,
          }));
        }}
        q={q}
        onSearchChange={(nextQ) => {
          setUrlState((current) => ({ ...current, q: nextQ, page: 1 }));
        }}
        filterControls={filterControls}
        labels={t.table}
      />
    </section>
  );
}
