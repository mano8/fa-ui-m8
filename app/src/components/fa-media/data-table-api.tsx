"use client";

import * as React from "react";
import {
  type ColumnDef,
  type OnChangeFn,
  type SortingState,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";

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

export type DataTableApiSortDir = "asc" | "desc";

export interface DataTableApiLabels {
  searchPlaceholder: string;
  searchLabel: string;
  filterLabel: string;
  allFilterOption: string;
  loading: string;
  empty: string;
  rowsSummary: (from: number, to: number, total: number) => string;
  pageSummary: (page: number, pageCount: number) => string;
  previousPage: string;
  nextPage: string;
  pageSize: string;
}

const DEFAULT_LABELS: DataTableApiLabels = {
  searchPlaceholder: "Search...",
  searchLabel: "Search",
  filterLabel: "Filter",
  allFilterOption: "All",
  loading: "Loading...",
  empty: "No results.",
  rowsSummary: (from, to, total) => `${from}-${to} of ${total}`,
  pageSummary: (page, pageCount) => `Page ${page} of ${pageCount}`,
  previousPage: "Previous",
  nextPage: "Next",
  pageSize: "Rows",
};

export interface DataTableApiFilterOption {
  value: string;
  label: string;
}

export interface DataTableApiProps<TData, TValue, TSort extends string = string> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  rowCount: number;
  loading?: boolean;
  page: number;
  pageSize: number;
  pageSizeOptions?: readonly number[];
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  sortBy?: TSort;
  sortDir?: DataTableApiSortDir;
  onSortChange?: (sortBy: TSort, sortDir: DataTableApiSortDir) => void;
  q?: string;
  onSearchChange?: (value: string) => void;
  filterValue?: string;
  filterOptions?: readonly DataTableApiFilterOption[];
  onFilterChange?: (value: string) => void;
  labels?: Partial<DataTableApiLabels>;
  toolbarAction?: React.ReactNode;
}

function HeaderSortIcon({ state }: { state: false | "asc" | "desc" }) {
  if (state === "asc") return <ArrowUp className="size-3.5" aria-hidden="true" />;
  if (state === "desc") return <ArrowDown className="size-3.5" aria-hidden="true" />;
  return <ChevronsUpDown className="size-3.5 opacity-60" aria-hidden="true" />;
}

export function DataTableApi<TData, TValue, TSort extends string = string>({
  columns,
  data,
  rowCount,
  loading = false,
  page,
  pageSize,
  pageSizeOptions = [10, 25, 50],
  onPageChange,
  onPageSizeChange,
  sortBy,
  sortDir = "asc",
  onSortChange,
  q = "",
  onSearchChange,
  filterValue = "",
  filterOptions,
  onFilterChange,
  labels,
  toolbarAction,
}: DataTableApiProps<TData, TValue, TSort>) {
  const t = { ...DEFAULT_LABELS, ...labels };
  const pageCount = Math.max(1, Math.ceil(rowCount / pageSize));
  const safePage = Math.min(Math.max(page, 1), pageCount);
  const sorting = React.useMemo<SortingState>(
    () => (sortBy ? [{ id: sortBy, desc: sortDir === "desc" }] : []),
    [sortBy, sortDir],
  );
  const handleSortingChange = React.useCallback<OnChangeFn<SortingState>>(
    (updater) => {
      if (!onSortChange) return;
      const next = typeof updater === "function" ? updater(sorting) : updater;
      const first = next[0];
      if (!first) return;
      onSortChange(first.id as TSort, first.desc ? "desc" : "asc");
    },
    [onSortChange, sorting],
  );

  const table = useReactTable({
    data,
    columns,
    rowCount,
    pageCount,
    manualFiltering: true,
    manualPagination: true,
    manualSorting: true,
    enableSortingRemoval: false,
    sortDescFirst: false,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: handleSortingChange,
    state: {
      sorting,
      pagination: { pageIndex: safePage - 1, pageSize },
    },
  });
  const from = rowCount === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const to = Math.min(rowCount, (safePage - 1) * pageSize + data.length);
  const previousDisabled = safePage <= 1 || loading;
  const nextDisabled = safePage >= pageCount || loading;

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center">
          {onSearchChange ? (
            <Input
              type="search"
              value={q}
              onChange={(event) => onSearchChange(event.currentTarget.value)}
              placeholder={t.searchPlaceholder}
              aria-label={t.searchLabel}
              className="sm:max-w-xs"
            />
          ) : null}
          {filterOptions && onFilterChange ? (
            <select
              value={filterValue}
              onChange={(event) => onFilterChange(event.currentTarget.value)}
              aria-label={t.filterLabel}
              className="h-8 min-w-0 rounded-lg border border-input bg-background px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 sm:w-48"
            >
              <option value="">{t.allFilterOption}</option>
              {filterOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          ) : null}
        </div>
        {toolbarAction ? <div className="shrink-0">{toolbarAction}</div> : null}
      </div>

      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : canSort ? (
                        <button
                          type="button"
                          className="inline-flex items-center gap-1 whitespace-nowrap font-medium"
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          <HeaderSortIcon state={header.column.getIsSorted()} />
                        </button>
                      ) : (
                        flexRender(header.column.columnDef.header, header.getContext())
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading && data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  {t.loading}
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
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
                  {t.empty}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <div aria-live="polite">{t.rowsSummary(from, to, rowCount)}</div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="inline-flex items-center gap-2">
            <span>{t.pageSize}</span>
            <select
              value={pageSize}
              onChange={(event) => onPageSizeChange(Number(event.currentTarget.value))}
              aria-label={t.pageSize}
              className="h-8 rounded-lg border border-input bg-background px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              {pageSizeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <span>{t.pageSummary(safePage, pageCount)}</span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onPageChange(safePage - 1)}
            disabled={previousDisabled}
            className={cn(previousDisabled && "opacity-50")}
          >
            {t.previousPage}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onPageChange(safePage + 1)}
            disabled={nextDisabled}
            className={cn(nextDisabled && "opacity-50")}
          >
            {t.nextPage}
          </Button>
        </div>
      </div>
    </div>
  );
}
