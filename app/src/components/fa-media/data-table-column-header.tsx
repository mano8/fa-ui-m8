"use client";

import * as React from "react";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  type LucideIcon,
} from "lucide-react";
import type { Column } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";

export type DataTableSortDirection = "asc" | "desc";

export interface DataTableColumnHeaderLabels {
  sortAscending: string;
  sortDescending: string;
  clearSort: string;
}

interface DataTableColumnHeaderProps<TData, TValue> {
  column: Column<TData, TValue>;
  labels: DataTableColumnHeaderLabels;
  children: React.ReactNode;
  icon?: LucideIcon;
}

function SortIcon({
  direction,
  icon: Icon,
}: {
  direction: false | DataTableSortDirection;
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
  direction: false | DataTableSortDirection,
  labels: DataTableColumnHeaderLabels,
): string {
  if (direction === "asc") {
    return labels.sortDescending;
  }

  if (direction === "desc") {
    return labels.clearSort;
  }

  return labels.sortAscending;
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  labels,
  children,
  icon,
}: DataTableColumnHeaderProps<TData, TValue>) {
  const direction = column.getIsSorted();

  if (!column.getCanSort()) {
    return children;
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="-ml-2 h-8 max-w-full px-2"
      onClick={column.getToggleSortingHandler()}
    >
      <span className="truncate">{children}</span>
      <SortIcon direction={direction} icon={icon} />
      <span className="sr-only">{getSortAssistiveLabel(direction, labels)}</span>
    </Button>
  );
}
