"use client";

// Table state and the two mutation flows behind the category manager. Holding
// them here keeps MediaCategories itself down to wiring and markup.

import * as React from "react";

import {
  EMPTY_EDITOR,
  errorMessage,
  filterAndSortRows,
  type CategoryEditorState,
  type CategoryRow,
  type HierarchyFilter,
  type SortDirection,
  type SortField,
} from "./media-categories-data";

export type CategoryTableState = ReturnType<typeof useCategoryTable>;
export type CategoryEditorController = ReturnType<typeof useCategoryEditor>;

/** Search, hierarchy filter, sort and pagination over the flattened rows. */
export function useCategoryTable(rows: readonly CategoryRow[]) {
  const [q, setQ] = React.useState("");
  const [hierarchy, setHierarchy] = React.useState<HierarchyFilter | "">("");
  const [sortBy, setSortBy] = React.useState<SortField>("path");
  const [sortDir, setSortDir] = React.useState<SortDirection>("asc");
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

  const filteredRows = React.useMemo(
    () => filterAndSortRows(rows, { q, hierarchy, sortBy, sortDir }),
    [hierarchy, q, rows, sortBy, sortDir],
  );

  const pageCount = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const currentPage = Math.min(page, pageCount);

  const pageRows = React.useMemo(
    () => filteredRows.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [currentPage, filteredRows, pageSize],
  );

  return {
    q,
    hierarchy,
    sortBy,
    sortDir,
    pageSize,
    currentPage,
    filteredRows,
    pageRows,
    setPage,
    setPageSize,
    setSortBy,
    setSortDir,
    setQ,
    setHierarchy,
  };
}

/** Create/edit dialog state and its submit. */
export function useCategoryEditor(options: {
  create: (input: { name: string; parent_id: number | null }) => Promise<unknown>;
  update: (id: number, input: { name: string; parent_id: number | null }) => Promise<unknown>;
  saveError: string;
}) {
  const { create, update, saveError } = options;
  const [open, setOpen] = React.useState(false);
  const [editor, setEditor] = React.useState<CategoryEditorState>(EMPTY_EDITOR);
  const [saving, setSaving] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);

  const openCreate = React.useCallback((parentId: number | null = null) => {
    setEditor({ mode: "create", id: null, name: "", parentId });
    setFormError(null);
    setOpen(true);
  }, []);

  const openEdit = React.useCallback((row: CategoryRow) => {
    setEditor({ mode: "edit", id: row.id, name: row.name, parentId: row.parentId });
    setFormError(null);
    setOpen(true);
  }, []);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
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
      setOpen(false);
      setEditor(EMPTY_EDITOR);
    } catch (mutationError) {
      setFormError(errorMessage(mutationError, saveError));
    } finally {
      setSaving(false);
    }
  };

  return { open, setOpen, editor, setEditor, saving, formError, openCreate, openEdit, submit };
}

/** Delete confirmation state and its confirm. */
export function useCategoryDeletion(options: {
  remove: (id: number) => Promise<unknown>;
  deleteError: string;
}) {
  const { remove, deleteError } = options;
  const [row, setRow] = React.useState<CategoryRow | null>(null);
  const [deleting, setDeleting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const open = React.useCallback((next: CategoryRow) => {
    setError(null);
    setRow(next);
  }, []);

  const confirm = async () => {
    if (!row) return;
    setDeleting(true);
    setError(null);
    try {
      await remove(row.id);
      setRow(null);
    } catch (mutationError) {
      setError(errorMessage(mutationError, deleteError));
    } finally {
      setDeleting(false);
    }
  };

  return { row, setRow, deleting, error, open, confirm };
}
