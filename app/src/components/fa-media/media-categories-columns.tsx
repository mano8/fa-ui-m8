"use client";

// Column definitions for the category table. Split out of media-categories.tsx
// so the component keeps to wiring and the cell markup stays readable.

import * as React from "react";
import { FolderTree, Pencil, Plus, Trash2 } from "lucide-react";
import type { ColumnDef, HeaderContext } from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTableColumnHeader } from "@/components/m8-ui/data-table-column-header";
import type { CategoryRow } from "./media-categories-data";
import type { MediaCategoriesLabels } from "./media-categories-labels";

export interface CategoryRowActions {
  openEdit: (row: CategoryRow) => void;
  openCreate: (parentId: number | null) => void;
  openDelete: (row: CategoryRow) => void;
}

/** The name cell: indented by depth, with the compact action row for narrow screens. */
function NameCell({
  row,
  t,
  actions,
}: {
  row: CategoryRow;
  t: MediaCategoriesLabels;
  actions: CategoryRowActions;
}) {
  return (
    <div
      className="min-w-48"
      data-category-depth={row.depth}
      style={{ paddingInlineStart: `${Math.max(0, row.depth - 1) * 1.25}rem` }}
    >
      <div className="flex items-center gap-2 font-medium" aria-label={row.path}>
        {row.depth > 1 ? (
          <span className="text-muted-foreground" aria-hidden="true">└</span>
        ) : null}
        <FolderTree className="size-4 text-muted-foreground" aria-hidden="true" />
        <span>{row.name}</span>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">{row.path}</p>
      <div className="mt-1 flex flex-wrap gap-1 sm:hidden">
        <Button type="button" variant="link" size="xs" onClick={() => actions.openEdit(row)}>
          {t.edit}
        </Button>
        <Button type="button" variant="link" size="xs" onClick={() => actions.openCreate(row.id)}>
          {t.addChild}
        </Button>
        <Button type="button" variant="link" size="xs" onClick={() => actions.openDelete(row)}>
          {t.delete}
        </Button>
      </div>
    </div>
  );
}

/** The wide-screen action cell. */
function ActionsCell({
  row,
  t,
  actions,
}: {
  row: CategoryRow;
  t: MediaCategoriesLabels;
  actions: CategoryRowActions;
}) {
  return (
    <div className="hidden min-w-56 flex-wrap justify-end gap-1 sm:flex">
      <Button type="button" variant="ghost" size="xs" onClick={() => actions.openEdit(row)}>
        <Pencil aria-hidden="true" />
        {t.edit}
      </Button>
      <Button type="button" variant="ghost" size="xs" onClick={() => actions.openCreate(row.id)}>
        <Plus aria-hidden="true" />
        {t.addChild}
      </Button>
      <Button type="button" variant="destructive" size="xs" onClick={() => actions.openDelete(row)}>
        <Trash2 aria-hidden="true" />
        {t.delete}
      </Button>
    </div>
  );
}

export function useCategoryColumns(
  t: MediaCategoriesLabels,
  actions: CategoryRowActions,
): ColumnDef<CategoryRow>[] {
  const sortableHeader = React.useCallback(
    (title: string) =>
      ({ column }: HeaderContext<CategoryRow, unknown>) => (
        <DataTableColumnHeader
          column={column}
          title={title}
          labels={{ ascOrder: t.ascending, descOrder: t.descending, hideColumn: t.hideColumn }}
        />
      ),
    [t.ascending, t.descending, t.hideColumn],
  );

  return React.useMemo<ColumnDef<CategoryRow>[]>(
    () => [
      {
        accessorKey: "name",
        header: sortableHeader(t.name),
        cell: ({ row }) => <NameCell row={row.original} t={t} actions={actions} />,
      },
      { accessorKey: "parent", header: sortableHeader(t.parent) },
      {
        accessorKey: "path",
        header: sortableHeader(t.path),
        cell: ({ row }) => <span className="text-muted-foreground">{row.original.path}</span>,
      },
      { accessorKey: "depth", header: sortableHeader(t.depth) },
      {
        accessorKey: "directCount",
        header: sortableHeader(t.directCount),
        cell: ({ row }) => <Badge variant="outline">{row.original.directCount}</Badge>,
      },
      {
        accessorKey: "totalCount",
        header: sortableHeader(t.totalCount),
        cell: ({ row }) => <Badge variant="secondary">{row.original.totalCount}</Badge>,
      },
      {
        id: "actions",
        header: () => <div className="text-right">{t.actions}</div>,
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => <ActionsCell row={row.original} t={t} actions={actions} />,
      },
    ],
    [actions, sortableHeader, t],
  );
}
