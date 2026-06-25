"use client";

import * as React from "react";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Search,
  SlidersHorizontal,
  type LucideIcon,
} from "lucide-react";
import {
  type ColumnDef,
  type OnChangeFn,
  type PaginationState,
  type SortingState,
  type Updater,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export type DataTableApiSortDirection = "asc" | "desc";

export interface DataTableApiLabels {
  searchLabel: string;
  searchPlaceholder: string;
  filterLabel: string;
  filterPlaceholder: string;
  loadingMessage: string;
  emptyMessage: string;
  pageSizeLabel: string;
  previousPage: string;
  nextPage: string;
  sortAscending: string;
  sortDescending: string;
  clearSort: string;
  pageSummary: (page: number, pageCount: number) => string;
  rowsSummary: (from: number, to: number, rowCount: number) => string;
}

export interface DataTableApiProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  page: number;
  pageSize: number;
  rowCount: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  sortBy?: string;
  sortDir?: DataTableApiSortDirection;
  onSortChange?: (
    sortBy: string | undefined,
    sortDir: DataTableApiSortDirection | undefined,
  ) => void;
  q?: string;
  onSearchChange?: (q: string) => void;
  filterValue?: string;
  onFilterChange?: (value: string) => void;
  loading?: boolean;
  toolbarAction?: React.ReactNode;
  pageSizeOptions?: number[];
  labels?: Partial<DataTableApiLabels>;
  className?: string;
}

const defaultLabels: DataTableApiLabels = {
  searchLabel: "Search",
  searchPlaceholder: "Search...",
  filterLabel: "Filter",
  filterPlaceholder: "Filter...",
  loadingMessage: "Loading...",
  emptyMessage: "No results.",
  pageSizeLabel: "Rows per page",
  previousPage: "Previous page",
  nextPage: "Next page",
  sortAscending: "Sort ascending",
  sortDescending: "Sort descending",
  clearSort: "Clear sorting",
  pageSummary: (page, pageCount) => `Page ${page} of ${pageCount}`,
  rowsSummary: (from, to, rowCount) => `${from}-${to} of ${rowCount}`,
};

function resolveUpdater<TValue>(
  updater: Updater<TValue>,
  previous: TValue,
): TValue {
  if (typeof updater === "function") {
    return (updater as (old: TValue) => TValue)(previous);
  }

  return updater;
}

function normalizePositiveInt(value: number, fallback: number): number {
  return Number.isFinite(value) && value > 0 ? Math.trunc(value) : fallback;
}

function SortIcon({
  direction,
  icon: Icon,
}: {
  direction: false | DataTableApiSortDirection;
  icon?: LucideIcon;
}) {
  if (Icon) {
    return <Icon aria-hidden="true" className="size-3.5" />;
  }

  if (direction === "asc") {
    return <ArrowUp aria-hidden="true" className="size-3.5" />;
  }

  if (direction === "desc") {
    return <ArrowDown aria-hidden="true" className="size-3.5" />;
  }

  return <ArrowUpDown aria-hidden="true" className="size-3.5" />;
}

function getSortAssistiveLabel(
  direction: false | DataTableApiSortDirection,
  labels: DataTableApiLabels,
): string {
  if (direction === "asc") {
    return labels.sortDescending;
  }

  if (direction === "desc") {
    return labels.clearSort;
  }

  return labels.sortAscending;
}

export function DataTableApi<TData, TValue>({
  columns,
  data,
  page,
  pageSize,
  rowCount,
  onPageChange,
  onPageSizeChange,
  sortBy,
  sortDir,
  onSortChange,
  q,
  onSearchChange,
  filterValue,
  onFilterChange,
  loading = false,
  toolbarAction,
  pageSizeOptions = [10, 20, 50],
  labels: labelOverrides,
  className,
}: DataTableApiProps<TData, TValue>) {
  const labels = React.useMemo(
    () => ({ ...defaultLabels, ...labelOverrides }),
    [labelOverrides],
  );
  const safePageSize = normalizePositiveInt(pageSize, 10);
  const safeRowCount = Math.max(0, Math.trunc(rowCount));
  const pageCount = Math.max(1, Math.ceil(safeRowCount / safePageSize));
  const safePage = Math.min(
    pageCount,
    normalizePositiveInt(page, 1),
  );
  const pagination = React.useMemo<PaginationState>(
    () => ({ pageIndex: safePage - 1, pageSize: safePageSize }),
    [safePage, safePageSize],
  );
  const sorting = React.useMemo<SortingState>(
    () => (sortBy ? [{ id: sortBy, desc: sortDir === "desc" }] : []),
    [sortBy, sortDir],
  );
  const normalizedPageSizes = React.useMemo(
    () =>
      Array.from(new Set([...pageSizeOptions, safePageSize]))
        .filter((size) => size > 0)
        .sort((left, right) => left - right),
    [pageSizeOptions, safePageSize],
  );
  const fromRow = safeRowCount === 0 ? 0 : pagination.pageIndex * safePageSize + 1;
  const toRow = Math.min(safeRowCount, safePage * safePageSize);
  const showSearch = q !== undefined || onSearchChange !== undefined;
  const showFilter = filterValue !== undefined || onFilterChange !== undefined;

  const handlePaginationChange = React.useCallback<OnChangeFn<PaginationState>>(
    (updater) => {
      const next = resolveUpdater(updater, pagination);
      const nextPage = normalizePositiveInt(next.pageIndex + 1, 1);
      const nextPageSize = normalizePositiveInt(next.pageSize, safePageSize);

      if (nextPage !== safePage) {
        onPageChange(nextPage);
      }

      if (nextPageSize !== safePageSize) {
        onPageSizeChange(nextPageSize);
      }
    },
    [onPageChange, onPageSizeChange, pagination, safePage, safePageSize],
  );

  const handleSortingChange = React.useCallback<OnChangeFn<SortingState>>(
    (updater) => {
      const next = resolveUpdater(updater, sorting);
      const nextSort = next.at(0);
      onSortChange?.(
        nextSort?.id,
        nextSort ? (nextSort.desc ? "desc" : "asc") : undefined,
      );
    },
    [onSortChange, sorting],
  );

  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
    manualFiltering: true,
    manualPagination: true,
    manualSorting: true,
    onPaginationChange: handlePaginationChange,
    onSortingChange: handleSortingChange,
    pageCount,
    rowCount: safeRowCount,
    state: { pagination, sorting },
  });

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center">
          {showSearch ? (
            <label className="relative min-w-0 sm:max-w-xs sm:flex-1">
              <span className="sr-only">{labels.searchLabel}</span>
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                aria-label={labels.searchLabel}
                className="pl-8"
                value={q ?? ""}
                onChange={(event) => onSearchChange?.(event.currentTarget.value)}
                placeholder={labels.searchPlaceholder}
              />
            </label>
          ) : null}

          {showFilter ? (
            <label className="relative min-w-0 sm:max-w-xs sm:flex-1">
              <span className="sr-only">{labels.filterLabel}</span>
              <SlidersHorizontal
                aria-hidden="true"
                className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                aria-label={labels.filterLabel}
                className="pl-8"
                value={filterValue ?? ""}
                onChange={(event) => onFilterChange?.(event.currentTarget.value)}
                placeholder={labels.filterPlaceholder}
              />
            </label>
          ) : null}
        </div>

        {toolbarAction ? (
          <div className="flex shrink-0 items-center justify-end gap-2">
            {toolbarAction}
          </div>
        ) : null}
      </div>

      <div className="rounded-md border" aria-busy={loading}>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const direction = header.column.getIsSorted();

                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : header.column.getCanSort() ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="-ml-2 h-8 max-w-full px-2"
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          <span className="truncate">
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                          </span>
                          <SortIcon direction={direction} />
                          <span className="sr-only">
                            {getSortAssistiveLabel(direction, labels)}
                          </span>
                        </Button>
                      ) : (
                        flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  {loading ? labels.loadingMessage : labels.emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <span>{labels.rowsSummary(fromRow, toRow, safeRowCount)}</span>
          {loading && table.getRowModel().rows.length ? (
            <span role="status">{labels.loadingMessage}</span>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          <label className="flex items-center gap-2 whitespace-nowrap">
            <span>{labels.pageSizeLabel}</span>
            <select
              aria-label={labels.pageSizeLabel}
              className="h-8 rounded-lg border border-input bg-background px-2 text-sm text-foreground"
              value={safePageSize}
              onChange={(event) => {
                table.setPageSize(Number(event.currentTarget.value));
              }}
            >
              {normalizedPageSizes.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>

          <span className="whitespace-nowrap">
            {labels.pageSummary(safePage, pageCount)}
          </span>

          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              aria-label={labels.previousPage}
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft aria-hidden="true" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              aria-label={labels.nextPage}
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <ChevronRight aria-hidden="true" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
