"use client";

// The category DataTable and its label/filter wiring, split from
// media-categories.tsx so the component stays at composition height.

import { Plus } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/m8-ui/data-table";
import { normalizeSort, type CategoryRow, type HierarchyFilter } from "./media-categories-data";
import { dataTableLabels, type MediaCategoriesLabels } from "./media-categories-labels";
import type { CategoryTableState } from "./media-categories-state";

export function CategoryTable({
  table,
  columns,
  loading,
  onAdd,
  t,
}: {
  table: CategoryTableState;
  columns: ColumnDef<CategoryRow>[];
  loading: boolean;
  onAdd: () => void;
  t: MediaCategoriesLabels;
}) {
  return (
    <DataTable
      columns={columns}
      data={table.pageRows}
      loading={loading}
      rowCount={table.filteredRows.length}
      page={table.currentPage}
      pageSize={table.pageSize}
      pageSizeOptions={[10, 25, 50]}
      onPageChange={table.setPage}
      onPageSizeChange={(nextPageSize) => {
        table.setPageSize(nextPageSize);
        table.setPage(1);
      }}
      sortBy={table.sortBy}
      sortDir={table.sortDir}
      onSortChange={(nextSort, nextDirection) => {
        table.setSortBy(normalizeSort(nextSort));
        table.setSortDir(nextDirection ?? "asc");
        table.setPage(1);
      }}
      q={table.q}
      onSearchChange={(nextQuery) => {
        table.setQ(nextQuery);
        table.setPage(1);
      }}
      f={table.hierarchy}
      onFilterChange={(nextFilter) => {
        table.setHierarchy(nextFilter as HierarchyFilter | "");
        table.setPage(1);
      }}
      filterOptions={{
        title: t.hierarchy,
        multi: false,
        options: [
          { label: t.topLevel, value: "root" },
          { label: t.nested, value: "nested" },
        ],
      }}
      visibility={{ depth: false }}
      getRowId={(row) => String(row.id)}
      addButton={
        <Button type="button" size="sm" onClick={onAdd}>
          <Plus aria-hidden="true" />
          {t.add}
        </Button>
      }
      labels={dataTableLabels(t)}
    />
  );
}
