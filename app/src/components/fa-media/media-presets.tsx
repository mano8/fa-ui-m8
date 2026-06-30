"use client";

import * as React from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useMediaPresets } from "@mano8/astro-media-m8/hooks";
import type { ImageFormat, ImagePresetPublic } from "@mano8/astro-media-m8/schemas";
import type { ColumnDef } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { DataTableApi, type DataTableApiLabels } from "@/components/fa-media/data-table-api";
import { DataTableIconButton } from "@/components/fa-media/data-table-icon-button";

const FORMATS: ImageFormat[] = ["WEBP", "JPEG", "PNG", "GIF", "AVIF"];
const selectClassName =
  "h-9 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground sm:w-44";

export interface MediaPresetsLabels {
  title: string;
  name: string;
  format: string;
  width: string;
  quality: string;
  builtin: string;
  created: string;
  actions: string;
  add: string;
  edit: string;
  delete: string;
  readonly: string;
  allFormats: string;
  yes: string;
  no: string;
  loadError: string;
  table: Partial<DataTableApiLabels>;
}

const DEFAULT_LABELS: MediaPresetsLabels = {
  title: "Presets",
  name: "Name",
  format: "Format",
  width: "Width",
  quality: "Quality",
  builtin: "Built-in",
  created: "Created",
  actions: "Actions",
  add: "Add preset",
  edit: "Edit",
  delete: "Delete",
  readonly: "Read-only",
  allFormats: "All formats",
  yes: "Yes",
  no: "No",
  loadError: "Failed to load presets.",
  table: {},
};

type SortField = "name" | "format" | "width" | "quality" | "builtin" | "created_at";
type SortDir = "asc" | "desc";

export interface MediaPresetsProps {
  baseHref: string;
  labels?: Partial<MediaPresetsLabels>;
}

function presetKey(preset: ImagePresetPublic): string {
  return preset.id ?? preset.name;
}

function primaryFormat(preset: ImagePresetPublic): string {
  return preset.spec.formats.at(0)?.ext ?? "";
}

function primaryQuality(preset: ImagePresetPublic): number {
  return preset.spec.formats.at(0)?.quality ?? 0;
}

function presetWidth(preset: ImagePresetPublic): number | null {
  return preset.spec.image_size.fixed_width ?? preset.spec.image_size.fixed_size;
}

function formatDate(value: string | null) {
  if (!value) return "";
  try {
    return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(
      new Date(value),
    );
  } catch {
    return value;
  }
}

function comparePreset(left: ImagePresetPublic, right: ImagePresetPublic, field: SortField): number {
  if (field === "name") return left.name.localeCompare(right.name);
  if (field === "format") return primaryFormat(left).localeCompare(primaryFormat(right));
  if (field === "width") return (presetWidth(left) ?? 0) - (presetWidth(right) ?? 0);
  if (field === "quality") return primaryQuality(left) - primaryQuality(right);
  if (field === "builtin") return Number(left.builtin) - Number(right.builtin);
  return (left.created_at ?? "").localeCompare(right.created_at ?? "");
}

function normalizeSort(value: string | undefined): SortField {
  return ["name", "format", "width", "quality", "builtin", "created_at"].includes(value ?? "")
    ? (value as SortField)
    : "name";
}

export function MediaPresets({ baseHref, labels }: MediaPresetsProps) {
  const t: MediaPresetsLabels = {
    ...DEFAULT_LABELS,
    ...labels,
    table: { ...DEFAULT_LABELS.table, ...labels?.table },
  };
  const { presets, loading, error } = useMediaPresets();
  const [q, setQ] = React.useState("");
  const [format, setFormat] = React.useState<ImageFormat | "">("");
  const [sortBy, setSortBy] = React.useState<SortField>("name");
  const [sortDir, setSortDir] = React.useState<SortDir>("asc");
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

  const filtered = React.useMemo(() => {
    const needle = q.trim().toLocaleLowerCase();
    const next = presets.filter((preset) => {
      const matchesName = !needle || preset.name.toLocaleLowerCase().includes(needle);
      const matchesFormat = !format || preset.spec.formats.some((item) => item.ext === format);
      return matchesName && matchesFormat;
    });

    return next.sort((left, right) => {
      const result = comparePreset(left, right, sortBy);
      return sortDir === "desc" ? -result : result;
    });
  }, [format, presets, q, sortBy, sortDir]);

  React.useEffect(() => {
    const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
    if (page > pageCount) setPage(pageCount);
  }, [filtered.length, page, pageSize]);

  const pageItems = React.useMemo(
    () => filtered.slice((page - 1) * pageSize, page * pageSize),
    [filtered, page, pageSize],
  );

  const columns = React.useMemo<ColumnDef<ImagePresetPublic>[]>(
    () => [
      {
        accessorKey: "name",
        header: t.name,
        cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
      },
      {
        id: "actions",
        header: () => <div className="flex justify-center">{t.actions}</div>,
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => {
          const preset = row.original;
          const id = preset.id;

          if (!id || preset.builtin) {
            return <div className="text-center text-xs text-muted-foreground">{t.readonly}</div>;
          }

          return (
            <div className="flex items-center justify-center gap-1">
              <DataTableIconButton asChild label={`${t.edit} ${preset.name}`} variant="outline" size="icon-sm">
                <a href={`${baseHref}/edit?id=${encodeURIComponent(id)}`}>
                  <Pencil aria-hidden="true" />
                </a>
              </DataTableIconButton>
              <DataTableIconButton asChild label={`${t.delete} ${preset.name}`} variant="destructive" size="icon-sm">
                <a href={`${baseHref}/delete?id=${encodeURIComponent(id)}`}>
                  <Trash2 aria-hidden="true" />
                </a>
              </DataTableIconButton>
            </div>
          );
        },
      },
      {
        id: "format",
        header: t.format,
        accessorFn: primaryFormat,
        cell: ({ row }) => row.original.spec.formats.map((item) => item.ext).join(", "),
      },
      {
        id: "width",
        header: t.width,
        accessorFn: presetWidth,
        cell: ({ row }) => presetWidth(row.original) ?? "-",
      },
      {
        id: "quality",
        header: t.quality,
        accessorFn: primaryQuality,
      },
      {
        id: "builtin",
        header: t.builtin,
        accessorFn: (preset) => preset.builtin,
        cell: ({ row }) => (row.original.builtin ? t.yes : t.no),
      },
      {
        accessorKey: "created_at",
        header: t.created,
        cell: ({ row }) => formatDate(row.original.created_at),
      },
    ],
    [baseHref, t],
  );

  const filterControls = (
    <label className="min-w-0">
      <span className="sr-only">{t.format}</span>
      <select
        aria-label={t.format}
        className={selectClassName}
        value={format}
        onChange={(event) => {
          setFormat(event.currentTarget.value as ImageFormat | "");
          setPage(1);
        }}
      >
        <option value="">{t.allFormats}</option>
        {FORMATS.map((value) => (
          <option key={value} value={value}>
            {value}
          </option>
        ))}
      </select>
    </label>
  );

  return (
    <section className="not-content space-y-4">
      <div className="flex flex-col gap-1 pb-3 mb-2">
        <h2 className="text-xl font-semibold tracking-normal">{t.title}</h2>
        {error ? (
          <p role="alert" className="text-sm text-destructive">
            {t.loadError}
          </p>
        ) : null}
      </div>
      <DataTableApi
        columns={columns}
        data={pageItems}
        rowCount={filtered.length}
        loading={loading}
        page={page}
        pageSize={pageSize}
        pageSizeOptions={[10, 25, 50]}
        onPageChange={setPage}
        onPageSizeChange={(nextPageSize) => {
          setPageSize(nextPageSize);
          setPage(1);
        }}
        sortBy={sortBy}
        sortDir={sortDir}
        onSortChange={(nextSort, nextOrder) => {
          setSortBy(normalizeSort(nextSort));
          setSortDir(nextOrder ?? "asc");
          setPage(1);
        }}
        q={q}
        onSearchChange={(nextQ) => {
          setQ(nextQ);
          setPage(1);
        }}
        filterControls={filterControls}
        toolbarAction={
          <Button asChild size="sm" className="gap-2">
            <a href={`${baseHref}/new`}>
              <Plus className="size-4" />
              {t.add}
            </a>
          </Button>
        }
        labels={t.table}
      />
    </section>
  );
}
