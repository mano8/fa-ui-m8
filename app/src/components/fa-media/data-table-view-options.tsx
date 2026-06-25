"use client";

import * as React from "react";
import { Columns3 } from "lucide-react";
import type { Table as ReactTable } from "@tanstack/react-table";

import { DataTableIconButton } from "./data-table-icon-button";

export interface DataTableViewOptionsLabels {
  columnsLabel: string;
  columnVisibilityLabel: (column: string) => string;
}

interface DataTableViewOptionsProps<TData> {
  table: ReactTable<TData>;
  labels: DataTableViewOptionsLabels;
}

function getColumnLabel(columnId: string): string {
  return columnId
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function DataTableViewOptions<TData>({
  table,
  labels,
}: DataTableViewOptionsProps<TData>) {
  const [open, setOpen] = React.useState(false);
  const columns = table
    .getAllLeafColumns()
    .filter((column) => column.getCanHide());

  if (!columns.length) {
    return null;
  }

  return (
    <div className="relative">
      <DataTableIconButton
        type="button"
        variant="outline"
        size="icon-sm"
        label={labels.columnsLabel}
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <Columns3 aria-hidden="true" />
      </DataTableIconButton>
      <div
        className="absolute right-0 z-20 mt-2 max-w-[calc(100vw-2rem)] min-w-44 rounded-lg border bg-popover p-1 text-popover-foreground shadow-md"
        hidden={!open}
      >
        {columns.map((column) => {
          const columnLabel = getColumnLabel(column.id);

          return (
            <label
              key={column.id}
              className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted"
            >
              <input
                type="checkbox"
                className="size-4"
                checked={column.getIsVisible()}
                aria-label={labels.columnVisibilityLabel(columnLabel)}
                onChange={(event) => column.toggleVisibility(event.currentTarget.checked)}
              />
              <span className="truncate">{columnLabel}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
