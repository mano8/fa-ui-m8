"use client";

import * as React from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import type { Table as ReactTable } from "@tanstack/react-table";

import { Input } from "@/components/ui/input";

import { DataTableViewOptions } from "./data-table-view-options";

export interface DataTableToolbarLabels {
  searchLabel: string;
  searchPlaceholder: string;
  filterLabel: string;
  filterPlaceholder: string;
  columnsLabel: string;
  columnVisibilityLabel: (column: string) => string;
}

interface DataTableToolbarProps<TData> {
  table: ReactTable<TData>;
  labels: DataTableToolbarLabels;
  q?: string;
  onSearchChange?: (q: string) => void;
  filterValue?: string;
  onFilterChange?: (value: string) => void;
  filterControls?: React.ReactNode;
  toolbarAction?: React.ReactNode;
}

// #lizard forgives(nloc, parameter_count) -- Lizard expands destructured table props.
export function DataTableToolbar<TData>({
  table,
  labels,
  q,
  onSearchChange,
  filterValue,
  onFilterChange,
  filterControls,
  toolbarAction,
}: DataTableToolbarProps<TData>) {
  const showSearch = q !== undefined || onSearchChange !== undefined;
  const showFilter =
    !filterControls && (filterValue !== undefined || onFilterChange !== undefined);

  return (
    <div className="grid gap-2 sm:flex sm:items-center sm:justify-between">
      <div className="grid min-w-0 flex-1 gap-2 sm:flex sm:items-center">
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

        {filterControls ? (
          <div className="grid min-w-0 gap-2 sm:flex sm:items-center">
            {filterControls}
          </div>
        ) : null}
      </div>

      <div className="flex min-w-0 shrink-0 flex-wrap items-center justify-end gap-2 [&_button]:whitespace-nowrap">
        <DataTableViewOptions table={table} labels={labels} />
        {toolbarAction}
      </div>
    </div>
  );
}
