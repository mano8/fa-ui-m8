"use client";

import * as React from "react";
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

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

import { DataTableColumnHeader } from "./data-table-column-header";
import { DataTablePagination } from "./data-table-pagination";
import { DataTableToolbar } from "./data-table-toolbar";

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
  columnsLabel: string;
  columnVisibilityLabel: (column: string) => string;
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
  filterControls?: React.ReactNode;
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
  columnsLabel: "Columns",
  columnVisibilityLabel: (column) => `Toggle ${column}`,
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
  filterControls,
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
    sortDescFirst: false,
    onPaginationChange: handlePaginationChange,
    onSortingChange: handleSortingChange,
    pageCount,
    rowCount: safeRowCount,
    state: { pagination, sorting },
  });

  return (
    <div className={cn("space-y-3", className)}>
      <DataTableToolbar
        table={table}
        labels={labels}
        q={q}
        onSearchChange={onSearchChange}
        filterValue={filterValue}
        onFilterChange={onFilterChange}
        filterControls={filterControls}
        toolbarAction={toolbarAction}
      />

      <div className="overflow-hidden rounded-md border" aria-busy={loading}>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : (
                        <DataTableColumnHeader column={header.column} labels={labels}>
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                        </DataTableColumnHeader>
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

      <DataTablePagination
        table={table}
        labels={labels}
        loading={loading}
        fromRow={fromRow}
        toRow={toRow}
        rowCount={safeRowCount}
        page={safePage}
        pageCount={pageCount}
        pageSize={safePageSize}
        pageSizeOptions={normalizedPageSizes}
        hasRows={table.getRowModel().rows.length > 0}
      />
    </div>
  );
}
