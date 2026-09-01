"use client";

// The create/edit form and the delete confirmation for the category manager.

import * as React from "react";

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
import { ROOT_VALUE, type CategoryEditorState, type CategoryRow } from "./media-categories-data";
import type { MediaCategoriesLabels } from "./media-categories-labels";

export function CategoryEditorDialog({
  open,
  onOpenChange,
  editor,
  setEditor,
  parentOptions,
  saving,
  formError,
  onSubmit,
  t,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editor: CategoryEditorState;
  setEditor: React.Dispatch<React.SetStateAction<CategoryEditorState>>;
  parentOptions: readonly CategoryRow[];
  saving: boolean;
  formError: string | null;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  t: MediaCategoriesLabels;
}) {
  const creating = editor.mode === "create";
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false}>
        <form className="grid gap-4" onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle>{creating ? t.addTitle : t.editTitle}</DialogTitle>
            <DialogDescription>
              {creating ? t.addDescription : t.editDescription}
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
            <Button
              type="button"
              variant="outline"
              disabled={saving}
              onClick={() => onOpenChange(false)}
            >
              {t.cancel}
            </Button>
            <Button type="submit" disabled={saving || !editor.name.trim()}>
              {saving ? t.saving : t.save}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function CategoryDeleteDialog({
  row,
  onOpenChange,
  deleting,
  deleteError,
  onConfirm,
  t,
}: {
  row: CategoryRow | null;
  onOpenChange: (open: boolean) => void;
  deleting: boolean;
  deleteError: string | null;
  onConfirm: () => void;
  t: MediaCategoriesLabels;
}) {
  return (
    <AlertDialog open={row !== null} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t.deleteTitle}</AlertDialogTitle>
          <AlertDialogDescription>
            {row ? t.deleteDescription(row.name) : ""}
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
              onConfirm();
            }}
          >
            {t.confirmDelete}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
