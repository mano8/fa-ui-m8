"use client";

import * as React from "react";
import { Download, FolderTree, Settings2, Trash2 } from "lucide-react";
import { useDownloadUrl, useMediaObject } from "@mano8/astro-media-m8/hooks";
import type {
  MediaCategory,
  MediaObjectPublic,
  MediaVisibility,
} from "@mano8/astro-media-m8/schemas";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import type { MediaCategoriesLabels } from "./media-categories";
import {
  CategorySelectorDialog,
  SelectedCategoryHierarchy,
} from "./media-object-detail-category-dialog";
import {
  errorText,
  formatBytes,
  formatDate,
  isBrowserPreviewable,
  isImageMediaObject,
} from "./media-object-detail-data";
import {
  DEFAULT_CATEGORY_LABELS,
  DEFAULT_LABELS,
  type MediaObjectLabels,
} from "./media-object-detail-labels";
import { ImageVariants } from "./media-object-detail-variants";

// Re-exported so consumers and tests keep importing them from this module.
export { isBrowserPreviewable, isImageMediaObject } from "./media-object-detail-data";
export type { MediaObjectLabels } from "./media-object-detail-labels";

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

