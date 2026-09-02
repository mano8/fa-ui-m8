"use client";

// The image-variants card: the generated renditions, the preset picker that
// creates them, and the delete confirmation. Split out of media-object-detail.tsx,
// and split again internally so the table and dialog stay separately readable.

import * as React from "react";
import { ImageIcon, Layers3, Trash2 } from "lucide-react";
import { useMediaVariants } from "@mano8/astro-media-m8/hooks";
import type { VariantPublic } from "@mano8/astro-media-m8/schemas";

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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { errorText, formatBytes, formatDate } from "./media-object-detail-data";
import type { CategoryTableLabels, MediaObjectLabels } from "./media-object-detail-labels";
import { VariantPresetDialog } from "./media-object-detail-variant-dialog";

function VariantsTable({
  items,
  locale,
  labels,
  onDelete,
}: {
  items: readonly VariantPublic[];
  locale: string;
  labels: MediaObjectLabels;
  onDelete: (variant: VariantPublic) => void;
}) {
  return (
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
              <TableCell>
                {variant.width && variant.height ? `${variant.width}×${variant.height}` : "—"}
              </TableCell>
              <TableCell>{formatBytes(variant.size_bytes, locale)}</TableCell>
              <TableCell>{formatDate(variant.created_at, locale)}</TableCell>
              <TableCell className="text-right">
                <Button
                  type="button"
                  variant="destructive"
                  size="xs"
                  onClick={() => onDelete(variant)}
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
  );
}

function VariantDeleteDialog({
  variant,
  onOpenChange,
  deleting,
  deleteError,
  onConfirm,
  labels,
}: {
  variant: VariantPublic | null;
  onOpenChange: (open: boolean) => void;
  deleting: boolean;
  deleteError: string | null;
  onConfirm: () => void;
  labels: MediaObjectLabels;
}) {
  return (
    <AlertDialog open={variant !== null} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{labels.variants.deleteTitle}</AlertDialogTitle>
          <AlertDialogDescription>
            {variant ? labels.variants.deleteDescription(variant.variant_name) : ""}
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
              onConfirm();
            }}
          >
            {labels.variants.confirmDelete}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/** Deletion state for one variant, kept out of the component body. */
function useVariantDeletion(
  remove: (id: string) => Promise<unknown>,
  fallbackError: string,
) {
  const [variant, setVariant] = React.useState<VariantPublic | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [deleting, setDeleting] = React.useState(false);

  const open = (next: VariantPublic) => {
    setError(null);
    setVariant(next);
  };

  const confirm = async () => {
    if (!variant) return;
    setDeleting(true);
    setError(null);
    try {
      await remove(variant.id);
      setVariant(null);
    } catch (failure) {
      setError(errorText(failure, fallbackError));
    } finally {
      setDeleting(false);
    }
  };

  return { variant, setVariant, error, deleting, open, confirm };
}

/** The card shell: heading, the generate action, and the variants table or its empty states. */
interface VariantsFeed {
  items: readonly VariantPublic[];
  loading: boolean;
  error: unknown;
  job: { variants_created: number; variants_expected: number } | null | undefined;
}

function VariantsCard({
  feed,
  locale,
  labels,
  onGenerate,
  onDelete,
}: {
  feed: VariantsFeed;
  locale: string;
  labels: MediaObjectLabels;
  onGenerate: () => void;
  onDelete: (variant: VariantPublic) => void;
}) {
  const { items, loading, error, job } = feed;
  return (
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
          <Button type="button" size="sm" onClick={onGenerate}>
            <Layers3 aria-hidden="true" />
            {labels.variants.generate}
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        {error ? (
          <p role="alert" className="text-sm text-destructive">{labels.variants.loadError}</p>
        ) : null}
        {loading && items.length === 0 ? (
          <p className="text-sm text-muted-foreground">{labels.loading}</p>
        ) : null}
        {!loading && items.length === 0 ? (
          <p className="text-sm text-muted-foreground">{labels.variants.empty}</p>
        ) : null}
        {items.length > 0 ? (
          <VariantsTable items={items} locale={locale} labels={labels} onDelete={onDelete} />
        ) : null}
      </CardContent>
      {job ? (
        <CardFooter className="text-sm text-muted-foreground">
          {labels.variants.jobProgress(job.variants_created, job.variants_expected)}
        </CardFooter>
      ) : null}
    </Card>
  );
}

export function ImageVariants({
  objectId,
  locale,
  labels,
  categoryTableLabels,
}: {
  objectId: string;
  locale: string;
  labels: MediaObjectLabels;
  categoryTableLabels: CategoryTableLabels;
}) {
  const { items, loading, error, job, generate, remove } = useMediaVariants(objectId);
  const [selectorOpen, setSelectorOpen] = React.useState(false);
  const deletion = useVariantDeletion(remove, labels.variants.deleteError);

  return (
    <>
      <VariantsCard
        feed={{ items, loading, error, job }}
        locale={locale}
        labels={labels}
        onGenerate={() => setSelectorOpen(true)}
        onDelete={deletion.open}
      />

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

      <VariantDeleteDialog
        variant={deletion.variant}
        onOpenChange={(open) => !open && deletion.setVariant(null)}
        deleting={deletion.deleting}
        deleteError={deletion.error}
        onConfirm={() => void deletion.confirm()}
        labels={labels}
      />
    </>
  );
}
