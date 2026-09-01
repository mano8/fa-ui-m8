"use client";

import * as React from "react";
import { FolderTree, Pencil, Plus, Trash2 } from "lucide-react";
import { useCategoryTree } from "@mano8/astro-media-m8/hooks";
import type { CategoryNode } from "@mano8/astro-media-m8/schemas";
import type { ColumnDef, HeaderContext } from "@tanstack/react-table";

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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable } from "@/components/m8-ui/data-table";
import { DataTableColumnHeader } from "@/components/m8-ui/data-table-column-header";

type SortField = "name" | "parent" | "path" | "depth" | "directCount" | "totalCount";
type SortDirection = "asc" | "desc";
type HierarchyFilter = "root" | "nested";

interface CategoryRow {
  id: number;
  name: string;
  parentId: number | null;
  parent: string;
  path: string;
  depth: number;
  directCount: number;
  totalCount: number;
}

interface CategoryEditorState {
  mode: "create" | "edit";
  id: number | null;
  name: string;
  parentId: number | null;
}

export interface MediaCategoriesLabels {
  title: string;
  description: string;
  name: string;
  parent: string;
  path: string;
  depth: string;
  directCount: string;
  totalCount: string;
  actions: string;
  root: string;
  topLevel: string;
  nested: string;
  hierarchy: string;
  add: string;
  addTitle: string;
  addDescription: string;
  addChild: string;
  edit: string;
  editTitle: string;
  editDescription: string;
  delete: string;
  deleteTitle: string;
  deleteDescription: (name: string) => string;
  confirmDelete: string;
  save: string;
  saving: string;
  cancel: string;
  search: string;
  reset: string;
  columns: string;
  toggleColumns: string;
  loading: string;
  empty: string;
  loadError: string;
  saveError: string;
  deleteError: string;
  filterClear: string;
  filterEmpty: string;
  filterSelected: (count: number) => string;
  selectedRows: (selected: number, total: number) => string;
  rowsPerPage: string;
  currentPage: (current: number, total: number) => string;
  firstPage: string;
  previousPage: string;
  nextPage: string;
  lastPage: string;
  ascending: string;
  descending: string;
  hideColumn: string;
}

const ROOT_VALUE = "__root__";
const EMPTY_EDITOR: CategoryEditorState = {
  mode: "create",
  id: null,
  name: "",
  parentId: null,
};

const DEFAULT_LABELS: MediaCategoriesLabels = {
  title: "Categories",
  description: "Organize media with a searchable category hierarchy.",
  name: "Name",
  parent: "Parent",
  path: "Path",
  depth: "Depth",
  directCount: "Direct items",
  totalCount: "Total items",
  actions: "Actions",
  root: "Root",
  topLevel: "Top level",
  nested: "Nested",
  hierarchy: "Hierarchy",
  add: "Add category",
  addTitle: "Add category",
  addDescription: "Create a top-level category or place it below an existing category.",
  addChild: "Add child",
  edit: "Edit",
  editTitle: "Edit category",
  editDescription: "Change the category name or its position in the hierarchy.",
  delete: "Delete",
  deleteTitle: "Delete category?",
  deleteDescription: (name) => `Delete ${name}? Categories with children cannot be deleted.`,
  confirmDelete: "Delete category",
  save: "Save",
  saving: "Saving...",
  cancel: "Cancel",
  search: "Search categories",
  reset: "Reset",
  columns: "Columns",
  toggleColumns: "Toggle columns",
  loading: "Loading categories...",
  empty: "No categories match the current filters.",
  loadError: "Could not load categories.",
  saveError: "Could not save the category.",
  deleteError: "Could not delete the category.",
  filterClear: "Clear",
  filterEmpty: "No hierarchy options found.",
  filterSelected: (count) => `${count} selected`,
  selectedRows: (_selected, total) => `${total} categories`,
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

function flattenCategories(
  nodes: readonly CategoryNode[],
  parentName: string,
  parentPath: string,
  depth: number,
): CategoryRow[] {
  return nodes.flatMap((node) => {
    const path = parentPath ? `${parentPath} / ${node.name}` : node.name;
    const row: CategoryRow = {
      id: node.id,
      name: node.name,
      parentId: node.parent_id,
      parent: parentName,
      path,
      depth,
      directCount: node.object_count,
      totalCount: node.total_object_count,
    };
    return [row, ...flattenCategories(node.children, node.name, path, depth + 1)];
  });
}

function compareRows(left: CategoryRow, right: CategoryRow, field: SortField): number {
  if (field === "depth" || field === "directCount" || field === "totalCount") {
    return left[field] - right[field];
  }
  return left[field].localeCompare(right[field]);
}

function normalizeSort(value: string | undefined): SortField {
  return ["name", "parent", "path", "depth", "directCount", "totalCount"].includes(value ?? "")
    ? (value as SortField)
    : "name";
}

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

export function MediaCategories({ labels }: { labels?: Partial<MediaCategoriesLabels> }) {
  const t = React.useMemo(() => ({ ...DEFAULT_LABELS, ...labels }), [labels]);
  const { tree, loading, error, create, update, remove } = useCategoryTree();
  const rows = React.useMemo(() => flattenCategories(tree, t.root, "", 1), [t.root, tree]);
  const [q, setQ] = React.useState("");
  const [hierarchy, setHierarchy] = React.useState<HierarchyFilter | "">("");
  const [sortBy, setSortBy] = React.useState<SortField>("path");
  const [sortDir, setSortDir] = React.useState<SortDirection>("asc");
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [editorOpen, setEditorOpen] = React.useState(false);
  const [editor, setEditor] = React.useState<CategoryEditorState>(EMPTY_EDITOR);
  const [saving, setSaving] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [deleteRow, setDeleteRow] = React.useState<CategoryRow | null>(null);
  const [deleting, setDeleting] = React.useState(false);
  const [deleteError, setDeleteError] = React.useState<string | null>(null);

  const parentOptions = React.useMemo(
    () => rows.filter((row) => row.id !== editor.id),
    [editor.id, rows],
  );

  const filteredRows = React.useMemo(() => {
    const needle = q.trim().toLocaleLowerCase();
    const filtered = rows.filter((row) => {
      const matchesSearch =
        !needle ||
        row.name.toLocaleLowerCase().includes(needle) ||
        row.path.toLocaleLowerCase().includes(needle) ||
        row.parent.toLocaleLowerCase().includes(needle);
      const matchesHierarchy =
        !hierarchy ||
        (hierarchy === "root" ? row.parentId === null : row.parentId !== null);
      return matchesSearch && matchesHierarchy;
    });
    return filtered.sort((left, right) => {
      const result = compareRows(left, right, sortBy);
      return sortDir === "desc" ? -result : result;
    });
  }, [hierarchy, q, rows, sortBy, sortDir]);

  const pageCount = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const currentPage = Math.min(page, pageCount);

  const pageRows = React.useMemo(
    () => filteredRows.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [currentPage, filteredRows, pageSize],
  );

  const openCreate = React.useCallback((parentId: number | null = null) => {
    setEditor({ mode: "create", id: null, name: "", parentId });
    setFormError(null);
    setEditorOpen(true);
  }, []);

  const openEdit = React.useCallback((row: CategoryRow) => {
    setEditor({ mode: "edit", id: row.id, name: row.name, parentId: row.parentId });
    setFormError(null);
    setEditorOpen(true);
  }, []);

  const openDelete = React.useCallback((row: CategoryRow) => {
    setDeleteError(null);
    setDeleteRow(row);
  }, []);

  const submitEditor = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = editor.name.trim();
    if (!name) return;
    setSaving(true);
    setFormError(null);
    try {
      if (editor.mode === "create") {
        await create({ name, parent_id: editor.parentId });
      } else if (editor.id !== null) {
        await update(editor.id, { name, parent_id: editor.parentId });
      }
      setEditorOpen(false);
      setEditor(EMPTY_EDITOR);
    } catch (mutationError) {
      setFormError(errorMessage(mutationError, t.saveError));
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteRow) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await remove(deleteRow.id);
      setDeleteRow(null);
    } catch (mutationError) {
      setDeleteError(errorMessage(mutationError, t.deleteError));
    } finally {
      setDeleting(false);
    }
  };

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

  const columns = React.useMemo<ColumnDef<CategoryRow>[]>(
    () => [
      {
        accessorKey: "name",
        header: sortableHeader(t.name),
        cell: ({ row }) => (
          <div
            className="min-w-48"
            data-category-depth={row.original.depth}
            style={{ paddingInlineStart: `${Math.max(0, row.original.depth - 1) * 1.25}rem` }}
          >
            <div className="flex items-center gap-2 font-medium" aria-label={row.original.path}>
              {row.original.depth > 1 ? (
                <span className="text-muted-foreground" aria-hidden="true">└</span>
              ) : null}
              <FolderTree className="size-4 text-muted-foreground" aria-hidden="true" />
              <span>{row.original.name}</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{row.original.path}</p>
            <div className="mt-1 flex flex-wrap gap-1 sm:hidden">
              <Button type="button" variant="link" size="xs" onClick={() => openEdit(row.original)}>
                {t.edit}
              </Button>
              <Button type="button" variant="link" size="xs" onClick={() => openCreate(row.original.id)}>
                {t.addChild}
              </Button>
              <Button type="button" variant="link" size="xs" onClick={() => openDelete(row.original)}>
                {t.delete}
              </Button>
            </div>
          </div>
        ),
      },
      {
        accessorKey: "parent",
        header: sortableHeader(t.parent),
      },
      {
        accessorKey: "path",
        header: sortableHeader(t.path),
        cell: ({ row }) => <span className="text-muted-foreground">{row.original.path}</span>,
      },
      {
        accessorKey: "depth",
        header: sortableHeader(t.depth),
      },
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
        cell: ({ row }) => (
          <div className="hidden min-w-56 flex-wrap justify-end gap-1 sm:flex">
            <Button type="button" variant="ghost" size="xs" onClick={() => openEdit(row.original)}>
              <Pencil aria-hidden="true" />
              {t.edit}
            </Button>
            <Button type="button" variant="ghost" size="xs" onClick={() => openCreate(row.original.id)}>
              <Plus aria-hidden="true" />
              {t.addChild}
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="xs"
              onClick={() => openDelete(row.original)}
            >
              <Trash2 aria-hidden="true" />
              {t.delete}
            </Button>
          </div>
        ),
      },
    ],
    [openCreate, openDelete, openEdit, sortableHeader, t],
  );

  return (
    <section className="not-content min-w-0 space-y-4">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold tracking-normal">{t.title}</h2>
        <p className="text-sm text-muted-foreground">{t.description}</p>
        {error ? <p role="alert" className="text-sm text-destructive">{t.loadError}</p> : null}
      </div>

      <DataTable
        columns={columns}
        data={pageRows}
        loading={loading}
        rowCount={filteredRows.length}
        page={currentPage}
        pageSize={pageSize}
        pageSizeOptions={[10, 25, 50]}
        onPageChange={setPage}
        onPageSizeChange={(nextPageSize) => {
          setPageSize(nextPageSize);
          setPage(1);
        }}
        sortBy={sortBy}
        sortDir={sortDir}
        onSortChange={(nextSort, nextDirection) => {
          setSortBy(normalizeSort(nextSort));
          setSortDir(nextDirection ?? "asc");
          setPage(1);
        }}
        q={q}
        onSearchChange={(nextQuery) => {
          setQ(nextQuery);
          setPage(1);
        }}
        f={hierarchy}
        onFilterChange={(nextFilter) => {
          setHierarchy(nextFilter as HierarchyFilter | "");
          setPage(1);
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
          <Button type="button" size="sm" onClick={() => openCreate()}>
            <Plus aria-hidden="true" />
            {t.add}
          </Button>
        }
        labels={{
          loading: t.loading,
          empty: t.empty,
          toolbar: {
            search: t.search,
            reset: t.reset,
            viewOptions: { view: t.columns, toggleColumns: t.toggleColumns },
            facetedFilter: {
              clear: t.filterClear,
              empty: t.filterEmpty,
              selected: t.filterSelected,
            },
          },
          pagination: {
            selectedRows: t.selectedRows,
            rowsPerPage: t.rowsPerPage,
            currentPage: t.currentPage,
            goToFirstPage: t.firstPage,
            goToPreviousPage: t.previousPage,
            goToNextPage: t.nextPage,
            goToLastPage: t.lastPage,
          },
        }}
      />

      <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
        <DialogContent showCloseButton={false}>
          <form className="grid gap-4" onSubmit={(event) => void submitEditor(event)}>
            <DialogHeader>
              <DialogTitle>{editor.mode === "create" ? t.addTitle : t.editTitle}</DialogTitle>
              <DialogDescription>
                {editor.mode === "create" ? t.addDescription : t.editDescription}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-2">
              <Label htmlFor="media-category-name">{t.name}</Label>
              <Input
                id="media-category-name"
                autoFocus
                value={editor.name}
                disabled={saving}
                onChange={(event) => {
                  const name = event.currentTarget.value;
                  setEditor((current) => ({ ...current, name }));
                }}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="media-category-parent">{t.parent}</Label>
              <Select
                value={editor.parentId === null ? ROOT_VALUE : String(editor.parentId)}
                disabled={saving}
                onValueChange={(value) =>
                  setEditor((current) => ({
                    ...current,
                    parentId: value === ROOT_VALUE ? null : Number(value),
                  }))
                }
              >
                <SelectTrigger id="media-category-parent" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectItem value={ROOT_VALUE}>{t.root}</SelectItem>
                  {parentOptions.map((option) => (
                    <SelectItem key={option.id} value={String(option.id)}>
                      {option.path}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {formError ? <p role="alert" className="text-sm text-destructive">{formError}</p> : null}
            <DialogFooter>
              <Button type="button" variant="outline" disabled={saving} onClick={() => setEditorOpen(false)}>
                {t.cancel}
              </Button>
              <Button type="submit" disabled={saving || !editor.name.trim()}>
                {saving ? t.saving : t.save}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteRow !== null} onOpenChange={(open) => !open && setDeleteRow(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.deleteTitle}</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteRow ? t.deleteDescription(deleteRow.name) : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteError ? <p role="alert" className="text-sm text-destructive">{deleteError}</p> : null}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>{t.cancel}</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={deleting}
              onClick={(event) => {
                event.preventDefault();
                void confirmDelete();
              }}
            >
              {t.confirmDelete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
