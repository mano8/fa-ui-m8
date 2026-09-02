"use client";

// The assigned-category hierarchy and the category picker dialog, split from
// media-object-detail.tsx so each stays independently readable.

import * as React from "react";
import { FolderTree } from "lucide-react";
import { useCategoryTree } from "@mano8/astro-media-m8/hooks";
import type { MediaObjectCategoryRef } from "@mano8/astro-media-m8/schemas";
import type {
  ColumnDef,
  HeaderContext,
  OnChangeFn,
  RowSelectionState,
} from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DataTable, createDataTableSelectionColumn } from "@/components/m8-ui/data-table";
import { DataTableColumnHeader } from "@/components/m8-ui/data-table-column-header";
import {
  categoryCompare,
  flattenCategories,
  normalizeCategorySort,
  selectedCategoryTree,
  selectedState,
  type CategorySelectorRow,
  type CategorySortField,
  type HierarchyFilter,
  type SelectedCategoryNode,
  type SortDirection,
} from "./media-object-detail-data";
import {
  DEFAULT_CATEGORY_LABELS,
  type MediaObjectLabels,
} from "./media-object-detail-labels";

export function SelectedCategoryHierarchy({
  categories,
  selectedLabel,
}: {
  categories: readonly MediaObjectCategoryRef[];
  selectedLabel: string;
}) {
  const roots = selectedCategoryTree(categories);

  function render(nodes: readonly SelectedCategoryNode[], depth = 0): React.ReactNode {
    return (
      <ul className={depth ? "ml-3 border-l pl-3" : "space-y-1"}>
        {nodes.map((node) => (
          <li key={node.path} className="py-1">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <FolderTree className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              <span className={node.selected ? "font-medium" : "text-muted-foreground"}>{node.name}</span>
              {node.selected ? <Badge variant="secondary">{selectedLabel}</Badge> : null}
            </div>
            {node.children.length ? render(node.children, depth + 1) : null}
          </li>
        ))}
      </ul>
    );
  }

  return render(roots);
}

export function CategorySelectorDialog({
  assigned,
  labels,
  tableLabels,
  saving,
  onClose,
  onApply,
}: {
  assigned: readonly MediaObjectCategoryRef[];
  labels: MediaObjectLabels;
  tableLabels: typeof DEFAULT_CATEGORY_LABELS;
  saving: boolean;
  onClose: () => void;
  onApply: (ids: number[]) => Promise<void>;
}) {
  const { tree, loading, error } = useCategoryTree();
  const rows = React.useMemo(
    () => flattenCategories(tree, tableLabels.root, "", 1),
    [tableLabels.root, tree],
  );
  const [selection, setSelection] = React.useState<RowSelectionState>(() =>
    selectedState(assigned.map((category) => category.id)),
  );
  const [q, setQ] = React.useState("");
  const [hierarchy, setHierarchy] = React.useState<HierarchyFilter | "">("");
  const [sortBy, setSortBy] = React.useState<CategorySortField>("path");
  const [sortDir, setSortDir] = React.useState<SortDirection>("asc");
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

  const filtered = React.useMemo(() => {
    const needle = q.trim().toLocaleLowerCase();
    return rows
      .filter((row) => {
        const matchesSearch =
          !needle ||
          row.name.toLocaleLowerCase().includes(needle) ||
          row.parent.toLocaleLowerCase().includes(needle) ||
          row.path.toLocaleLowerCase().includes(needle);
        const matchesHierarchy =
          !hierarchy ||
          (hierarchy === "root" ? row.parentId === null : row.parentId !== null);
        return matchesSearch && matchesHierarchy;
      })
      .sort((left, right) => {
        const result = categoryCompare(left, right, sortBy);
        return sortDir === "desc" ? -result : result;
      });
  }, [hierarchy, q, rows, sortBy, sortDir]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const pageRows = React.useMemo(
    () => filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [currentPage, filtered, pageSize],
  );
  const selectedCount = Object.values(selection).filter(Boolean).length;

  const sortableHeader = React.useCallback(
    (title: string) =>
      ({ column }: HeaderContext<CategorySelectorRow, unknown>) => (
        <DataTableColumnHeader
          column={column}
          title={title}
          labels={{
            ascOrder: tableLabels.ascending,
            descOrder: tableLabels.descending,
            hideColumn: tableLabels.hideColumn,
          }}
        />
      ),
    [tableLabels.ascending, tableLabels.descending, tableLabels.hideColumn],
  );

  const columns = React.useMemo<ColumnDef<CategorySelectorRow>[]>(
    () => [
      createDataTableSelectionColumn<CategorySelectorRow>({
        selectAllVisible: labels.selectAllCategories,
        selectRow: (row) => labels.selectCategory(row.name),
      }),
      {
        accessorKey: "name",
        header: sortableHeader(tableLabels.name),
        cell: ({ row }) => (
          <div className="min-w-44" style={{ paddingInlineStart: `${Math.min(row.original.depth - 1, 8) * 0.75}rem` }}>
            <div className="flex items-center gap-2 font-medium">
              <FolderTree className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              <span>{row.original.name}</span>
            </div>
          </div>
        ),
      },
      { accessorKey: "path", header: sortableHeader(tableLabels.path) },
      { accessorKey: "parent", header: sortableHeader(tableLabels.parent) },
      { accessorKey: "depth", header: sortableHeader(tableLabels.depth) },
    ],
    [labels, sortableHeader, tableLabels.depth, tableLabels.name, tableLabels.parent, tableLabels.path],
  );

  const updateSelection: OnChangeFn<RowSelectionState> = (updater) => {
    setSelection((current) => (typeof updater === "function" ? updater(current) : updater));
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-5xl" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>{labels.categorySelectorTitle}</DialogTitle>
          <DialogDescription>{labels.categorySelectorDescription}</DialogDescription>
        </DialogHeader>
        {error ? <p role="alert" className="text-sm text-destructive">{tableLabels.loadError}</p> : null}
        <DataTable
          columns={columns}
          data={pageRows}
          loading={loading}
          rowCount={filtered.length}
          page={currentPage}
          pageSize={pageSize}
          pageSizeOptions={[10, 25, 50, 100]}
          onPageChange={setPage}
          onPageSizeChange={(next) => {
            setPageSize(next);
            setPage(1);
          }}
          sortBy={sortBy}
          sortDir={sortDir}
          onSortChange={(next, direction) => {
            setSortBy(normalizeCategorySort(next));
            setSortDir(direction ?? "asc");
            setPage(1);
          }}
          q={q}
          onSearchChange={(next) => {
            setQ(next);
            setPage(1);
          }}
          f={hierarchy}
          onFilterChange={(next) => {
            setHierarchy(next as HierarchyFilter | "");
            setPage(1);
          }}
          filterOptions={{
            title: tableLabels.hierarchy,
            multi: false,
            options: [
              { label: tableLabels.topLevel, value: "root" },
              { label: tableLabels.nested, value: "nested" },
            ],
          }}
          getRowId={(row) => String(row.id)}
          rowSelection={selection}
          onRowSelectionChange={updateSelection}
          labels={{
            loading: tableLabels.loading,
            empty: tableLabels.empty,
            toolbar: {
              search: tableLabels.search,
              reset: tableLabels.reset,
              viewOptions: { view: tableLabels.columns, toggleColumns: tableLabels.toggleColumns },
              facetedFilter: {
                clear: tableLabels.filterClear,
                empty: tableLabels.filterEmpty,
                selected: tableLabels.filterSelected,
              },
            },
            pagination: {
              selectedRows: () => labels.selectedCategories(selectedCount),
              rowsPerPage: tableLabels.rowsPerPage,
              currentPage: tableLabels.currentPage,
              goToFirstPage: tableLabels.firstPage,
              goToPreviousPage: tableLabels.previousPage,
              goToNextPage: tableLabels.nextPage,
              goToLastPage: tableLabels.lastPage,
            },
          }}
        />
        <DialogFooter>
          <Button type="button" variant="ghost" disabled={saving || selectedCount === 0} onClick={() => setSelection({})}>
            {labels.clearSelection}
          </Button>
          <Button type="button" variant="outline" disabled={saving} onClick={onClose}>
            {labels.cancel}
          </Button>
          <Button
            type="button"
            disabled={saving}
            onClick={() => void onApply(Object.keys(selection).filter((id) => selection[id]).map(Number).sort((a, b) => a - b))}
          >
            {saving ? labels.savingCategories : labels.applyCategories}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
