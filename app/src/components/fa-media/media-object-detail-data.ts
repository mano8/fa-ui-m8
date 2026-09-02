// Row shapes and the pure transforms behind the object detail view. No React,
// so the flatten/compare/format rules stay readable and testable on their own.

import type {
  CategoryNode,
  ImagePresetPublic,
  MediaObjectCategoryRef,
  MediaObjectPublic,
} from "@mano8/astro-media-m8/schemas";
import type { RowSelectionState } from "@tanstack/react-table";

export type SortDirection = "asc" | "desc";
export type HierarchyFilter = "root" | "nested";
export type CategorySortField = "name" | "parent" | "path" | "depth";
export type PresetSortField = "name" | "formats" | "dimensions" | "builtin";

export interface CategorySelectorRow {
  id: number;
  name: string;
  parentId: number | null;
  parent: string;
  path: string;
  depth: number;
}

export interface PresetSelectorRow {
  name: string;
  formats: string;
  formatValues: string[];
  dimensions: string;
  builtin: boolean;
}

export function errorText(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

export function flattenCategories(
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

export function categoryCompare(
  left: CategorySelectorRow,
  right: CategorySelectorRow,
  field: CategorySortField,
): number {
  if (field === "depth") return left.depth - right.depth;
  return left[field].localeCompare(right[field]);
}

export function normalizeCategorySort(value: string | undefined): CategorySortField {
  return ["name", "parent", "path", "depth"].includes(value ?? "")
    ? (value as CategorySortField)
    : "path";
}

export function presetCompare(
  left: PresetSelectorRow,
  right: PresetSelectorRow,
  field: PresetSortField,
): number {
  if (field === "builtin") return Number(left.builtin) - Number(right.builtin);
  return left[field].localeCompare(right[field]);
}

export function normalizePresetSort(value: string | undefined): PresetSortField {
  return ["name", "formats", "dimensions", "builtin"].includes(value ?? "")
    ? (value as PresetSortField)
    : "name";
}

export function selectedState(ids: readonly (number | string)[]): RowSelectionState {
  return Object.fromEntries(ids.map((id) => [String(id), true]));
}

export function dimensionsForPreset(preset: ImagePresetPublic): string {
  const size = preset.spec.image_size;
  if (size.fixed_width && size.fixed_height) return `${size.fixed_width}×${size.fixed_height}`;
  if (size.fixed_width) return `${size.fixed_width}px`;
  if (size.fixed_height) return `${size.fixed_height}px`;
  if (size.fixed_size) return `${size.fixed_size}px`;
  return "—";
}

export function formatBytes(value: number, locale: string): string {
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

export function formatDate(value: string, locale: string): string {
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

export interface SelectedCategoryNode {
  name: string;
  path: string;
  selected: boolean;
  children: SelectedCategoryNode[];
}

export function selectedCategoryTree(categories: readonly MediaObjectCategoryRef[]): SelectedCategoryNode[] {
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
