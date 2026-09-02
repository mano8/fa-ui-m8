"use client";

import * as React from "react";
import { useCategoryTree } from "@mano8/astro-media-m8/hooks";

import { useCategoryColumns } from "./media-categories-columns";
import { flattenCategories } from "./media-categories-data";
import { CategoryDeleteDialog, CategoryEditorDialog } from "./media-categories-dialogs";
import { DEFAULT_LABELS, type MediaCategoriesLabels } from "./media-categories-labels";
import {
  useCategoryDeletion,
  useCategoryEditor,
  useCategoryTable,
} from "./media-categories-state";
import { CategoryTable } from "./media-categories-table";

export type { MediaCategoriesLabels } from "./media-categories-labels";

export function MediaCategories({ labels }: { labels?: Partial<MediaCategoriesLabels> }) {
  const t = React.useMemo<MediaCategoriesLabels>(
    () => ({ ...DEFAULT_LABELS, ...labels }),
    [labels],
  );
  const { tree, loading, error, create, update, remove } = useCategoryTree();
  const rows = React.useMemo(() => flattenCategories(tree, t.root, "", 1), [t.root, tree]);

  const table = useCategoryTable(rows);
  const editor = useCategoryEditor({ create, update, saveError: t.saveError });
  const deletion = useCategoryDeletion({ remove, deleteError: t.deleteError });

  const parentOptions = React.useMemo(
    () => rows.filter((row) => row.id !== editor.editor.id),
    [editor.editor.id, rows],
  );

  const actions = React.useMemo(
    () => ({
      openEdit: editor.openEdit,
      openCreate: editor.openCreate,
      openDelete: deletion.open,
    }),
    [deletion.open, editor.openCreate, editor.openEdit],
  );
  const columns = useCategoryColumns(t, actions);

  return (
    <section className="not-content min-w-0 space-y-4">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold tracking-normal">{t.title}</h2>
        <p className="text-sm text-muted-foreground">{t.description}</p>
        {error ? <p role="alert" className="text-sm text-destructive">{t.loadError}</p> : null}
      </div>

      <CategoryTable
        table={table}
        columns={columns}
        loading={loading}
        onAdd={() => editor.openCreate()}
        t={t}
      />

      <CategoryEditorDialog
        controller={editor}
        parentOptions={parentOptions}
        onSubmit={(event) => void editor.submit(event)}
        t={t}
      />

      <CategoryDeleteDialog
        row={deletion.row}
        onOpenChange={(open) => !open && deletion.setRow(null)}
        deleting={deletion.deleting}
        deleteError={deletion.error}
        onConfirm={() => void deletion.confirm()}
        t={t}
      />
    </section>
  );
}
