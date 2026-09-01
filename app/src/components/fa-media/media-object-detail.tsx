"use client";

import * as React from "react";
import {
  Download,
  FolderTree,
  ImageIcon,
  Layers3,
  Settings2,
  Trash2,
} from "lucide-react";
import {
  useCategoryTree,
  useDownloadUrl,
  useMediaObject,
  useMediaPresets,
  useMediaVariants,
} from "@mano8/astro-media-m8/hooks";
import type {
  CategoryNode,
  ImagePresetPublic,
  MediaCategory,
  MediaObjectCategoryRef,
  MediaObjectPublic,
  MediaVisibility,
  VariantPublic,
} from "@mano8/astro-media-m8/schemas";
import type {
  ColumnDef,
  HeaderContext,
  OnChangeFn,
  RowSelectionState,
} from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DataTable,
  createDataTableSelectionColumn,
} from "@/components/m8-ui/data-table";
import { DataTableColumnHeader } from "@/components/m8-ui/data-table-column-header";
import type { MediaCategoriesLabels } from "./media-categories";

type SortDirection = "asc" | "desc";
type HierarchyFilter = "root" | "nested";
type CategorySortField = "name" | "parent" | "path" | "depth";
type PresetSortField = "name" | "formats" | "dimensions" | "builtin";

interface CategorySelectorRow {
  id: number;
  name: string;
  parentId: number | null;
  parent: string;
  path: string;
  depth: number;
}

interface PresetSelectorRow {
  name: string;
  formats: string;
  formatValues: string[];
  dimensions: string;
  builtin: boolean;
}

export interface MediaObjectLabels {
  loading: string;
  loadError: string;
  notFound: string;
  detailsTitle: string;
  status: string;
  scan: string;
  mime: string;
  size: string;
  category: string;
  created: string;
  visibility: string;
  privateVisibility: string;
  publicVisibility: string;
  tenantVisibility: string;
  sensitiveVisibility: string;
  visibilityError: string;
  categoriesTitle: string;
  categoriesDescription: string;
  selectedCategory: string;
  chooseCategories: string;
  changeCategories: string;
  noCategories: string;
  categorySelectorTitle: string;
  categorySelectorDescription: string;
  selectedCategories: (count: number) => string;
  selectAllCategories: string;
  selectCategory: (name: string) => string;
  clearSelection: string;
  applyCategories: string;
  savingCategories: string;
  categorySaveError: string;
  download: string;
  preparingDownload: string;
  downloadReady: string;
  downloadError: string;
  preview: string;
  openingPreview: string;
  previewError: string;
  delete: string;
  deleteTitle: string;
  deleteDescription: string;
  confirmDelete: string;
  deleting: string;
  deleteError: string;
  cancel: string;
  scanValues: Record<string, string>;
  variants: {
    title: string;
    description: string;
    generate: string;
    empty: string;
    loadError: string;
    name: string;
    format: string;
    dimensions: string;
    size: string;
    created: string;
    actions: string;
    delete: string;
    deleteTitle: string;
    deleteDescription: (name: string) => string;
    confirmDelete: string;
    deleteError: string;
    selectorTitle: string;
    selectorDescription: string;
    search: string;
    allFormats: string;
    columns: string;
    toggleColumns: string;
    loading: string;
    noPresets: string;
    builtin: string;
    custom: string;
    selectAllPresets: string;
    selectPreset: (name: string) => string;
    selectedPresets: (count: number) => string;
    clearSelection: string;
    generateSelected: string;
    generating: string;
    generateError: string;
    jobProgress: (created: number, expected: number) => string;
  };
}

const DEFAULT_CATEGORY_LABELS: Pick<
  MediaCategoriesLabels,
  | "name"
  | "parent"
  | "path"
  | "depth"
  | "root"
  | "topLevel"
  | "nested"
  | "hierarchy"
  | "search"
  | "reset"
  | "columns"
  | "toggleColumns"
  | "loading"
  | "empty"
  | "loadError"
  | "filterClear"
  | "filterEmpty"
  | "filterSelected"
  | "rowsPerPage"
  | "currentPage"
  | "firstPage"
  | "previousPage"
  | "nextPage"
  | "lastPage"
  | "ascending"
  | "descending"
  | "hideColumn"
> = {
  name: "Name",
  parent: "Parent",
  path: "Path",
  depth: "Depth",
  root: "Root",
  topLevel: "Top level",
  nested: "Nested",
  hierarchy: "Hierarchy",
  search: "Search categories",
  reset: "Reset",
  columns: "Columns",
  toggleColumns: "Toggle columns",
  loading: "Loading categories...",
  empty: "No categories match the current filters.",
  loadError: "Could not load categories.",
  filterClear: "Clear",
  filterEmpty: "No hierarchy options found.",
  filterSelected: (count) => `${count} selected`,
  rowsPerPage: "Rows per page",
  currentPage: (current, total) => `Page ${current} of ${total}`,
  firstPage: "Go to first page",
  previousPage: "Go to previous page",
  nextPage: "Go to next page",
  lastPage: "Go to last page",
  ascending: "Ascending",
  descending: "Descending",
  hideColumn: "Hide column",
};

const DEFAULT_LABELS: MediaObjectLabels = {
  loading: "Loading media object...",
  loadError: "Could not load this media object.",
  notFound: "Media object not found.",
  detailsTitle: "File details",
  status: "Status",
  scan: "Scan",
  mime: "MIME type",
  size: "Size",
  category: "Media type",
  created: "Created",
  visibility: "Visibility",
  privateVisibility: "Private",
  publicVisibility: "Public",
  tenantVisibility: "Tenant",
  sensitiveVisibility: "Sensitive",
  visibilityError: "Could not update visibility.",
  categoriesTitle: "User categories",
  categoriesDescription: "File this object in one or more categories.",
  selectedCategory: "Selected",
  chooseCategories: "Choose categories",
  changeCategories: "Change categories",
  noCategories: "No user categories selected.",
  categorySelectorTitle: "Select user categories",
  categorySelectorDescription: "Search and filter the full hierarchy, then select categories from the first column.",
  selectedCategories: (count) => `${count} categories selected`,
  selectAllCategories: "Select all categories on this page",
  selectCategory: (name) => `Select ${name}`,
  clearSelection: "Clear selection",
  applyCategories: "Apply categories",
  savingCategories: "Saving...",
  categorySaveError: "Could not save the selected categories.",
  download: "Get download link",
  preparingDownload: "Preparing link...",
  downloadReady: "Download file",
  downloadError: "Could not prepare the download link.",
  preview: "Open preview",
  openingPreview: "Opening preview...",
  previewError: "Could not open a browser preview.",
  delete: "Delete file",
  deleteTitle: "Delete this file?",
  deleteDescription: "This removes the media object and cannot be undone.",
  confirmDelete: "Delete file",
  deleting: "Deleting...",
  deleteError: "Could not delete this file.",
  cancel: "Cancel",
  scanValues: { clean: "Clean", pending: "Pending", infected: "Infected", failed: "Failed" },
  variants: {
    title: "Image variants",
    description: "Create and manage derived image sizes and formats.",
    generate: "Generate variants",
    empty: "No variants have been generated.",
    loadError: "Could not load image variants.",
    name: "Name",
    format: "Format",
    dimensions: "Dimensions",
    size: "Size",
    created: "Created",
    actions: "Actions",
    delete: "Delete",
    deleteTitle: "Delete variant?",
    deleteDescription: (name) => `Delete the ${name} variant?`,
    confirmDelete: "Delete variant",
    deleteError: "Could not delete the variant.",
    selectorTitle: "Select variant presets",
    selectorDescription: "Search and filter presets, then select them from the first column.",
    search: "Search presets",
    allFormats: "Format",
    columns: "Columns",
    toggleColumns: "Toggle columns",
    loading: "Loading presets...",
    noPresets: "No presets match the current filters.",
    builtin: "Built-in",
    custom: "Custom",
    selectAllPresets: "Select all presets on this page",
    selectPreset: (name) => `Select ${name}`,
    selectedPresets: (count) => `${count} presets selected`,
    clearSelection: "Clear selection",
    generateSelected: "Generate selected",
    generating: "Generating...",
    generateError: "Could not generate image variants.",
    jobProgress: (created, expected) => `${created} of ${expected} variants created`,
  },
};

function errorText(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

function flattenCategories(
  nodes: readonly CategoryNode[],
  parentName: string,
  parentPath: string,
  depth: number,
): CategorySelectorRow[] {
  return nodes.flatMap((node) => {
    const path = parentPath ? `${parentPath} / ${node.name}` : node.name;
    return [
      {
        id: node.id,
        name: node.name,
        parentId: node.parent_id,
        parent: parentName,
        path,
        depth,
      },
      ...flattenCategories(node.children, node.name, path, depth + 1),
    ];
  });
}

function categoryCompare(
  left: CategorySelectorRow,
  right: CategorySelectorRow,
  field: CategorySortField,
): number {
  if (field === "depth") return left.depth - right.depth;
  return left[field].localeCompare(right[field]);
}

function normalizeCategorySort(value: string | undefined): CategorySortField {
  return ["name", "parent", "path", "depth"].includes(value ?? "")
    ? (value as CategorySortField)
    : "path";
}

function presetCompare(
  left: PresetSelectorRow,
  right: PresetSelectorRow,
  field: PresetSortField,
): number {
  if (field === "builtin") return Number(left.builtin) - Number(right.builtin);
  return left[field].localeCompare(right[field]);
}

function normalizePresetSort(value: string | undefined): PresetSortField {
  return ["name", "formats", "dimensions", "builtin"].includes(value ?? "")
    ? (value as PresetSortField)
    : "name";
}

function selectedState(ids: readonly (number | string)[]): RowSelectionState {
  return Object.fromEntries(ids.map((id) => [String(id), true]));
}

function dimensionsForPreset(preset: ImagePresetPublic): string {
  const size = preset.spec.image_size;
  if (size.fixed_width && size.fixed_height) return `${size.fixed_width}×${size.fixed_height}`;
  if (size.fixed_width) return `${size.fixed_width}px`;
  if (size.fixed_height) return `${size.fixed_height}px`;
  if (size.fixed_size) return `${size.fixed_size}px`;
  return "—";
}

function formatBytes(value: number, locale: string): string {
  if (value < 1024) return `${new Intl.NumberFormat(locale).format(value)} B`;
  const units = ["KB", "MB", "GB", "TB"];
  let amount = value / 1024;
  let index = 0;
  while (amount >= 1024 && index < units.length - 1) {
    amount /= 1024;
    index += 1;
  }
  return `${new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(amount)} ${units[index]}`;
}

function formatDate(value: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export function isImageMediaObject(object: Pick<MediaObjectPublic, "mime_type">): boolean {
  return object.mime_type?.toLocaleLowerCase().startsWith("image/") ?? false;
}

export function isBrowserPreviewable(object: Pick<MediaObjectPublic, "mime_type">): boolean {
  const mime = object.mime_type?.toLocaleLowerCase().split(";", 1)[0].trim() ?? "";
  return (
    mime.startsWith("image/") ||
    mime.startsWith("audio/") ||
    mime.startsWith("video/") ||
    [
      "application/pdf",
      "application/json",
      "application/xml",
      "text/plain",
      "text/csv",
      "text/markdown",
      "text/xml",
    ].includes(mime)
  );
}

interface SelectedCategoryNode {
  name: string;
  path: string;
  selected: boolean;
  children: SelectedCategoryNode[];
}

function selectedCategoryTree(categories: readonly MediaObjectCategoryRef[]): SelectedCategoryNode[] {
  const roots: SelectedCategoryNode[] = [];
  for (const category of categories) {
    const parts = category.path.split(" / ").filter(Boolean);
    let level = roots;
    let path = "";
    for (const [index, name] of parts.entries()) {
      path = path ? `${path} / ${name}` : name;
      let node = level.find((candidate) => candidate.name === name);
      if (!node) {
        node = { name, path, selected: false, children: [] };
        level.push(node);
      }
      if (index === parts.length - 1) node.selected = true;
      level = node.children;
    }
  }
  return roots;
}

function SelectedCategoryHierarchy({
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

function CategorySelectorDialog({
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

function VariantPresetDialog({
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

function ImageVariants({
  objectId,
  locale,
  labels,
  categoryTableLabels,
}: {
  objectId: string;
  locale: string;
  labels: MediaObjectLabels;
  categoryTableLabels: typeof DEFAULT_CATEGORY_LABELS;
}) {
  const { items, loading, error, job, generate, remove } = useMediaVariants(objectId);
  const [selectorOpen, setSelectorOpen] = React.useState(false);
  const [deleteVariant, setDeleteVariant] = React.useState<VariantPublic | null>(null);
  const [deleteError, setDeleteError] = React.useState<string | null>(null);
  const [deleting, setDeleting] = React.useState(false);

  async function confirmDelete() {
    if (!deleteVariant) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await remove(deleteVariant.id);
      setDeleteVariant(null);
    } catch (failure) {
      setDeleteError(errorText(failure, labels.variants.deleteError));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>
            <h3 className="flex items-center gap-2">
              <ImageIcon className="size-4" aria-hidden="true" />
              {labels.variants.title}
            </h3>
          </CardTitle>
          <CardDescription>{labels.variants.description}</CardDescription>
          <CardAction>
            <Button type="button" size="sm" onClick={() => setSelectorOpen(true)}>
              <Layers3 aria-hidden="true" />
              {labels.variants.generate}
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          {error ? <p role="alert" className="text-sm text-destructive">{labels.variants.loadError}</p> : null}
          {loading && items.length === 0 ? <p className="text-sm text-muted-foreground">{labels.loading}</p> : null}
          {!loading && items.length === 0 ? <p className="text-sm text-muted-foreground">{labels.variants.empty}</p> : null}
          {items.length > 0 ? (
            <div className="overflow-hidden rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{labels.variants.name}</TableHead>
                    <TableHead>{labels.variants.format}</TableHead>
                    <TableHead>{labels.variants.dimensions}</TableHead>
                    <TableHead>{labels.variants.size}</TableHead>
                    <TableHead>{labels.variants.created}</TableHead>
                    <TableHead className="text-right">{labels.variants.actions}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((variant) => (
                    <TableRow key={variant.id}>
                      <TableCell className="font-medium">{variant.variant_name}</TableCell>
                      <TableCell>{variant.format}</TableCell>
                      <TableCell>{variant.width && variant.height ? `${variant.width}×${variant.height}` : "—"}</TableCell>
                      <TableCell>{formatBytes(variant.size_bytes, locale)}</TableCell>
                      <TableCell>{formatDate(variant.created_at, locale)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          type="button"
                          variant="destructive"
                          size="xs"
                          onClick={() => {
                            setDeleteError(null);
                            setDeleteVariant(variant);
                          }}
                        >
                          <Trash2 aria-hidden="true" />
                          {labels.variants.delete}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : null}
        </CardContent>
        {job ? <CardFooter className="text-sm text-muted-foreground">{labels.variants.jobProgress(job.variants_created, job.variants_expected)}</CardFooter> : null}
      </Card>

      {selectorOpen ? (
        <VariantPresetDialog
          labels={labels}
          categoryTableLabels={categoryTableLabels}
          onClose={() => setSelectorOpen(false)}
          onGenerate={async (names) => {
            await generate(names);
          }}
        />
      ) : null}

      <AlertDialog open={deleteVariant !== null} onOpenChange={(open) => !open && setDeleteVariant(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{labels.variants.deleteTitle}</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteVariant ? labels.variants.deleteDescription(deleteVariant.variant_name) : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteError ? <p role="alert" className="text-sm text-destructive">{deleteError}</p> : null}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>{labels.cancel}</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={deleting}
              onClick={(event) => {
                event.preventDefault();
                void confirmDelete();
              }}
            >
              {labels.variants.confirmDelete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export function MediaObjectDetail({
  objectId,
  locale = "en",
  labels: labelOverrides,
  categoryTableLabels: categoryLabelOverrides,
  statusLabels = {},
  categoryTypeLabels = {},
  onDeleted,
}: {
  objectId: string;
  locale?: string;
  labels?: Partial<MediaObjectLabels>;
  categoryTableLabels?: Partial<MediaCategoriesLabels>;
  statusLabels?: Partial<Record<MediaObjectPublic["status"], string>>;
  categoryTypeLabels?: Partial<Record<MediaCategory, string>>;
  onDeleted?: () => void;
}) {
  const labels = React.useMemo<MediaObjectLabels>(
    () => ({
      ...DEFAULT_LABELS,
      ...labelOverrides,
      scanValues: { ...DEFAULT_LABELS.scanValues, ...labelOverrides?.scanValues },
      variants: { ...DEFAULT_LABELS.variants, ...labelOverrides?.variants },
    }),
    [labelOverrides],
  );
  const categoryTableLabels = React.useMemo(
    () => ({ ...DEFAULT_CATEGORY_LABELS, ...categoryLabelOverrides }),
    [categoryLabelOverrides],
  );
  const { object, loading, error, update, remove } = useMediaObject(objectId);
  const download = useDownloadUrl(objectId);
  const [categorySelectorOpen, setCategorySelectorOpen] = React.useState(false);
  const [savingCategories, setSavingCategories] = React.useState(false);
  const [categoryError, setCategoryError] = React.useState<string | null>(null);
  const [savingVisibility, setSavingVisibility] = React.useState(false);
  const [visibilityError, setVisibilityError] = React.useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);
  const [deleteError, setDeleteError] = React.useState<string | null>(null);
  const [downloadIntent, setDownloadIntent] = React.useState<"download" | "preview" | null>(null);

  if (loading && !object) return <p className="text-sm text-muted-foreground">{labels.loading}</p>;
  if (error) return <p role="alert" className="text-sm text-destructive">{labels.loadError}</p>;
  if (!object) return <p className="text-sm text-muted-foreground">{labels.notFound}</p>;

  async function updateVisibility(value: MediaVisibility) {
    setSavingVisibility(true);
    setVisibilityError(null);
    try {
      await update({ visibility: value });
    } catch (failure) {
      setVisibilityError(errorText(failure, labels.visibilityError));
    } finally {
      setSavingVisibility(false);
    }
  }

  async function saveCategories(ids: number[]) {
    setSavingCategories(true);
    setCategoryError(null);
    try {
      await update({ category_ids: ids });
      setCategorySelectorOpen(false);
    } catch (failure) {
      setCategoryError(errorText(failure, labels.categorySaveError));
    } finally {
      setSavingCategories(false);
    }
  }

  async function deleteObject() {
    setDeleting(true);
    setDeleteError(null);
    try {
      await remove();
      setDeleteOpen(false);
      onDeleted?.();
    } catch (failure) {
      setDeleteError(errorText(failure, labels.deleteError));
    } finally {
      setDeleting(false);
    }
  }

  async function openPreview(event: React.MouseEvent<HTMLAnchorElement>) {
    if (download.data) return;
    event.preventDefault();
    setDownloadIntent("preview");
    const previewWindow = window.open("about:blank", "_blank");
    if (previewWindow) previewWindow.opener = null;
    try {
      const result = await download.request();
      if (previewWindow) {
        previewWindow.location.replace(result.url);
      } else {
        window.open(result.url, "_blank", "noopener,noreferrer");
      }
    } catch {
      previewWindow?.close();
    }
  }

  const scanStatus = object.scan_status ?? "";
  const metadata = [
    [labels.status, statusLabels[object.status] ?? object.status],
    [labels.scan, labels.scanValues[scanStatus] ?? scanStatus],
    [labels.mime, object.mime_type],
    [labels.size, formatBytes(object.size_bytes, locale)],
    [labels.category, categoryTypeLabels[object.category] ?? object.category],
    [labels.created, formatDate(object.created_at, locale)],
  ];
  const visibilityOptions: { value: MediaVisibility; label: string }[] = [
    { value: "private", label: labels.privateVisibility },
    { value: "public", label: labels.publicVisibility },
    { value: "tenant", label: labels.tenantVisibility },
    { value: "sensitive", label: labels.sensitiveVisibility },
  ];

  return (
    <section className="not-content min-w-0 space-y-4">
      <div className="min-w-0 pb-3">
        <h2 className="break-words text-2xl font-semibold tracking-normal">{object.original_filename ?? object.id}</h2>
      </div>

      <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.8fr)]">
        <Card>
          <CardHeader>
            <CardTitle>{labels.detailsTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid min-w-0 grid-cols-[minmax(6.5rem,0.38fr)_minmax(0,1fr)] overflow-hidden rounded-lg border text-sm">
              {metadata.map(([label, value]) => (
                <React.Fragment key={label}>
                  <dt className="border-b bg-muted/40 px-3 py-2 font-medium text-muted-foreground last:border-b-0">{label}</dt>
                  <dd className="min-w-0 break-words border-b px-3 py-2 last:border-b-0">{value || "—"}</dd>
                </React.Fragment>
              ))}
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{labels.visibility}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Select
              value={object.visibility}
              disabled={savingVisibility}
              onValueChange={(value) => void updateVisibility(value as MediaVisibility)}
            >
              <SelectTrigger className="w-full" aria-label={labels.visibility}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {visibilityOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {visibilityError ? <p role="alert" className="text-sm text-destructive">{visibilityError}</p> : null}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderTree className="size-4" aria-hidden="true" />
            {labels.categoriesTitle}
          </CardTitle>
          <CardDescription>{labels.categoriesDescription}</CardDescription>
          <CardAction>
            <Button type="button" variant="outline" size="sm" onClick={() => setCategorySelectorOpen(true)}>
              <Settings2 aria-hidden="true" />
              {object.categories.length ? labels.changeCategories : labels.chooseCategories}
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          {object.categories.length ? (
            <div className="rounded-lg border bg-muted/20 p-3">
              <SelectedCategoryHierarchy
                categories={object.categories}
                selectedLabel={labels.selectedCategory}
              />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">{labels.noCategories}</p>
          )}
          {categoryError ? <p role="alert" className="mt-2 text-sm text-destructive">{categoryError}</p> : null}
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={download.loading}
          onClick={() => {
            setDownloadIntent("download");
            void download.request().catch(() => undefined);
          }}
        >
          <Download aria-hidden="true" />
          {download.loading ? labels.preparingDownload : labels.download}
        </Button>
        {isBrowserPreviewable(object) ? (
          <Button asChild variant="outline">
            <a
              href={download.data?.url ?? "#"}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(event) => void openPreview(event)}
            >
              {download.loading && downloadIntent === "preview" ? labels.openingPreview : labels.preview}
            </a>
          </Button>
        ) : null}
        {download.data ? (
          <Button asChild>
            <a href={download.data.url} rel="noreferrer">{labels.downloadReady}</a>
          </Button>
        ) : null}
        <Button
          type="button"
          variant="destructive"
          onClick={() => {
            setDeleteError(null);
            setDeleteOpen(true);
          }}
        >
          <Trash2 aria-hidden="true" />
          {labels.delete}
        </Button>
      </div>
      {download.error ? (
        <p role="alert" className="text-sm text-destructive">
          {downloadIntent === "preview" ? labels.previewError : labels.downloadError}
        </p>
      ) : null}

      {isImageMediaObject(object) ? (
        <ImageVariants
          objectId={object.id}
          locale={locale}
          labels={labels}
          categoryTableLabels={categoryTableLabels}
        />
      ) : null}

      {categorySelectorOpen ? (
        <CategorySelectorDialog
          assigned={object.categories}
          labels={labels}
          tableLabels={categoryTableLabels}
          saving={savingCategories}
          onClose={() => setCategorySelectorOpen(false)}
          onApply={saveCategories}
        />
      ) : null}

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{labels.deleteTitle}</AlertDialogTitle>
            <AlertDialogDescription>{labels.deleteDescription}</AlertDialogDescription>
          </AlertDialogHeader>
          {deleteError ? <p role="alert" className="text-sm text-destructive">{deleteError}</p> : null}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>{labels.cancel}</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={deleting}
              onClick={(event) => {
                event.preventDefault();
                void deleteObject();
              }}
            >
              {deleting ? labels.deleting : labels.confirmDelete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
