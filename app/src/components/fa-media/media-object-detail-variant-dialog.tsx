"use client";

// The preset picker dialog behind "generate variants".

import * as React from "react";
import { useMediaPresets } from "@mano8/astro-media-m8/hooks";
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
  dimensionsForPreset,
  errorText,
  normalizePresetSort,
  presetCompare,
  type PresetSelectorRow,
  type PresetSortField,
  type SortDirection,
} from "./media-object-detail-data";
import {
  DEFAULT_CATEGORY_LABELS,
  type MediaObjectLabels,
} from "./media-object-detail-labels";

export function VariantPresetDialog({
  labels,
  categoryTableLabels,
  onClose,
  onGenerate,
}: {
  labels: MediaObjectLabels;
  categoryTableLabels: typeof DEFAULT_CATEGORY_LABELS;
  onClose: () => void;
  onGenerate: (names: string[]) => Promise<void>;
}) {
  const { presets, loading, error } = useMediaPresets();
  const [selection, setSelection] = React.useState<RowSelectionState>({});
  const [q, setQ] = React.useState("");
  const [format, setFormat] = React.useState("");
  const [sortBy, setSortBy] = React.useState<PresetSortField>("name");
  const [sortDir, setSortDir] = React.useState<SortDirection>("asc");
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [generating, setGenerating] = React.useState(false);
  const [generateError, setGenerateError] = React.useState<string | null>(null);

  const rows = React.useMemo<PresetSelectorRow[]>(
    () =>
      presets.map((preset) => {
        const formatValues = preset.spec.formats.map((item) => item.ext);
        return {
          name: preset.name,
          formats: formatValues.join(", "),
          formatValues,
          dimensions: dimensionsForPreset(preset),
          builtin: preset.builtin,
        };
      }),
    [presets],
  );
  const formats = React.useMemo(
    () => [...new Set(rows.flatMap((row) => row.formatValues))].sort(),
    [rows],
  );
  const filtered = React.useMemo(() => {
    const needle = q.trim().toLocaleLowerCase();
    return rows
      .filter((row) =>
        (!needle || row.name.toLocaleLowerCase().includes(needle) || row.formats.toLocaleLowerCase().includes(needle)) &&
        (!format || row.formatValues.includes(format)),
      )
      .sort((left, right) => {
        const result = presetCompare(left, right, sortBy);
        return sortDir === "desc" ? -result : result;
      });
  }, [format, q, rows, sortBy, sortDir]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const pageRows = React.useMemo(
    () => filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [currentPage, filtered, pageSize],
  );
  const selectedCount = Object.values(selection).filter(Boolean).length;

  const sortableHeader = React.useCallback(
    (title: string) =>
      ({ column }: HeaderContext<PresetSelectorRow, unknown>) => (
        <DataTableColumnHeader
          column={column}
          title={title}
          labels={{
            ascOrder: categoryTableLabels.ascending,
            descOrder: categoryTableLabels.descending,
            hideColumn: categoryTableLabels.hideColumn,
          }}
        />
      ),
    [categoryTableLabels.ascending, categoryTableLabels.descending, categoryTableLabels.hideColumn],
  );
  const columns = React.useMemo<ColumnDef<PresetSelectorRow>[]>(
    () => [
      createDataTableSelectionColumn<PresetSelectorRow>({
        selectAllVisible: labels.variants.selectAllPresets,
        selectRow: (row) => labels.variants.selectPreset(row.name),
      }),
      { accessorKey: "name", header: sortableHeader(labels.variants.name) },
      { accessorKey: "formats", header: sortableHeader(labels.variants.format) },
      { accessorKey: "dimensions", header: sortableHeader(labels.variants.dimensions) },
      {
        accessorKey: "builtin",
        header: sortableHeader(labels.variants.builtin),
        cell: ({ row }) => (
          <Badge variant={row.original.builtin ? "secondary" : "outline"}>
            {row.original.builtin ? labels.variants.builtin : labels.variants.custom}
          </Badge>
        ),
      },
    ],
    [labels, sortableHeader],
  );
  const updateSelection: OnChangeFn<RowSelectionState> = (updater) => {
    setSelection((current) => (typeof updater === "function" ? updater(current) : updater));
  };

  async function generateSelected() {
    setGenerating(true);
    setGenerateError(null);
    try {
      await onGenerate(Object.keys(selection).filter((name) => selection[name]));
      onClose();
    } catch (generateFailure) {
      setGenerateError(errorText(generateFailure, labels.variants.generateError));
    } finally {
      setGenerating(false);
    }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-5xl" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>{labels.variants.selectorTitle}</DialogTitle>
          <DialogDescription>{labels.variants.selectorDescription}</DialogDescription>
        </DialogHeader>
        {error ? <p role="alert" className="text-sm text-destructive">{labels.variants.loadError}</p> : null}
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
            setSortBy(normalizePresetSort(next));
            setSortDir(direction ?? "asc");
            setPage(1);
          }}
          q={q}
          onSearchChange={(next) => {
            setQ(next);
            setPage(1);
          }}
          f={format}
          onFilterChange={(next) => {
            setFormat(next);
            setPage(1);
          }}
          filterOptions={{
            title: labels.variants.allFormats,
            multi: false,
            options: formats.map((value) => ({ label: value, value })),
          }}
          getRowId={(row) => row.name}
          rowSelection={selection}
          onRowSelectionChange={updateSelection}
          labels={{
            loading: labels.variants.loading,
            empty: labels.variants.noPresets,
            toolbar: {
              search: labels.variants.search,
              reset: categoryTableLabels.reset,
              viewOptions: { view: labels.variants.columns, toggleColumns: labels.variants.toggleColumns },
              facetedFilter: {
                clear: categoryTableLabels.filterClear,
                empty: categoryTableLabels.filterEmpty,
                selected: categoryTableLabels.filterSelected,
              },
            },
            pagination: {
              selectedRows: () => labels.variants.selectedPresets(selectedCount),
              rowsPerPage: categoryTableLabels.rowsPerPage,
              currentPage: categoryTableLabels.currentPage,
              goToFirstPage: categoryTableLabels.firstPage,
              goToPreviousPage: categoryTableLabels.previousPage,
              goToNextPage: categoryTableLabels.nextPage,
              goToLastPage: categoryTableLabels.lastPage,
            },
          }}
        />
        {generateError ? <p role="alert" className="text-sm text-destructive">{generateError}</p> : null}
        <DialogFooter>
          <Button type="button" variant="ghost" disabled={generating || selectedCount === 0} onClick={() => setSelection({})}>
            {labels.variants.clearSelection}
          </Button>
          <Button type="button" variant="outline" disabled={generating} onClick={onClose}>
            {labels.cancel}
          </Button>
          <Button type="button" disabled={generating || selectedCount === 0} onClick={() => void generateSelected()}>
            {generating ? labels.variants.generating : labels.variants.generateSelected}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
