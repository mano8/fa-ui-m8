"use client";

import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import type { Table as ReactTable } from "@tanstack/react-table";

import { DataTableIconButton } from "./data-table-icon-button";

export interface DataTablePaginationLabels {
  loadingMessage: string;
  pageSizeLabel: string;
  previousPage: string;
  nextPage: string;
  pageSummary: (page: number, pageCount: number) => string;
  rowsSummary: (from: number, to: number, rowCount: number) => string;
}

interface DataTablePaginationProps<TData> {
  table: ReactTable<TData>;
  labels: DataTablePaginationLabels;
  loading: boolean;
  fromRow: number;
  toRow: number;
  rowCount: number;
  page: number;
  pageCount: number;
  pageSize: number;
  pageSizeOptions: number[];
  hasRows: boolean;
}

// #lizard forgives(nloc, parameter_count) -- Lizard expands destructured table props.
export function DataTablePagination<TData>({
  table,
  labels,
  loading,
  fromRow,
  toRow,
  rowCount,
  page,
  pageCount,
  pageSize,
  pageSizeOptions,
  hasRows,
}: DataTablePaginationProps<TData>) {
  return (
    <div className="grid gap-2 text-sm text-muted-foreground sm:flex sm:items-center sm:justify-between">
      <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
        <span className="whitespace-nowrap">{labels.rowsSummary(fromRow, toRow, rowCount)}</span>
        {loading && hasRows ? <span role="status">{labels.loadingMessage}</span> : null}
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-2 sm:flex sm:flex-wrap sm:justify-end">
        <label className="flex min-w-0 items-center gap-2 justify-self-start sm:justify-self-auto">
          <span className="hidden whitespace-nowrap md:inline">{labels.pageSizeLabel}</span>
          <select
            aria-label={labels.pageSizeLabel}
            className="h-8 rounded-lg border border-input bg-background px-2 text-sm text-foreground"
            value={pageSize}
            onChange={(event) => {
              table.setPageSize(Number(event.currentTarget.value));
            }}
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>

        <span className="min-w-0 truncate text-right text-xs sm:text-sm">
          {labels.pageSummary(page, pageCount)}
        </span>

        <div className="flex items-center gap-1">
          <DataTableIconButton
            type="button"
            variant="outline"
            size="icon-sm"
            label={labels.previousPage}
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft aria-hidden="true" />
          </DataTableIconButton>
          <DataTableIconButton
            type="button"
            variant="outline"
            size="icon-sm"
            label={labels.nextPage}
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight aria-hidden="true" />
          </DataTableIconButton>
        </div>
      </div>
    </div>
  );
}
