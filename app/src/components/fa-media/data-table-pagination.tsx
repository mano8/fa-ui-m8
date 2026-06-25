"use client";

import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import type { Table as ReactTable } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";

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
    <div className="flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2">
        <span>{labels.rowsSummary(fromRow, toRow, rowCount)}</span>
        {loading && hasRows ? <span role="status">{labels.loadingMessage}</span> : null}
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2">
        <label className="flex items-center gap-2 whitespace-nowrap">
          <span>{labels.pageSizeLabel}</span>
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

        <span className="whitespace-nowrap">{labels.pageSummary(page, pageCount)}</span>

        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            aria-label={labels.previousPage}
            title={labels.previousPage}
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
            title={labels.nextPage}
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight aria-hidden="true" />
          </Button>
        </div>
      </div>
    </div>
  );
}
