// Row shape and the pure transforms behind the category manager. Kept free of
// React so the flatten/filter/sort rules can be read and tested on their own.

import type { CategoryNode } from "@mano8/astro-media-m8/schemas";

export type SortField = "name" | "parent" | "path" | "depth" | "directCount" | "totalCount";
export type SortDirection = "asc" | "desc";
export type HierarchyFilter = "root" | "nested";

export interface CategoryRow {
  id: number;
  name: string;
  parentId: number | null;
  parent: string;
  path: string;
  depth: number;
  directCount: number;
  totalCount: number;
}

export interface CategoryEditorState {
  mode: "create" | "edit";
  id: number | null;
  name: string;
  parentId: number | null;
}

export const ROOT_VALUE = "__root__";

export const EMPTY_EDITOR: CategoryEditorState = {
  mode: "create",
  id: null,
  name: "",
  parentId: null,
};

const SORT_FIELDS: readonly string[] = [
  "name",
  "parent",
  "path",
  "depth",
  "directCount",
  "totalCount",
];

/** Depth-first flatten of the category tree into table rows. */
export function flattenCategories(
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

export function compareRows(left: CategoryRow, right: CategoryRow, field: SortField): number {
  if (field === "depth" || field === "directCount" || field === "totalCount") {
    return left[field] - right[field];
  }
  return left[field].localeCompare(right[field]);
}

export function normalizeSort(value: string | undefined): SortField {
  return SORT_FIELDS.includes(value ?? "") ? (value as SortField) : "name";
}

export function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

function matchesSearch(row: CategoryRow, needle: string): boolean {
  if (!needle) return true;
  return (
    row.name.toLocaleLowerCase().includes(needle) ||
    row.path.toLocaleLowerCase().includes(needle) ||
    row.parent.toLocaleLowerCase().includes(needle)
  );
}

function matchesHierarchy(row: CategoryRow, hierarchy: HierarchyFilter | ""): boolean {
  if (!hierarchy) return true;
  return hierarchy === "root" ? row.parentId === null : row.parentId !== null;
}

/** Search and hierarchy filtering, then the active sort. */
export function filterAndSortRows(
  rows: readonly CategoryRow[],
  options: {
    q: string;
    hierarchy: HierarchyFilter | "";
    sortBy: SortField;
    sortDir: SortDirection;
  },
): CategoryRow[] {
  const needle = options.q.trim().toLocaleLowerCase();
  const filtered = rows.filter(
    (row) => matchesSearch(row, needle) && matchesHierarchy(row, options.hierarchy),
  );
  return filtered.sort((left, right) => {
    const result = compareRows(left, right, options.sortBy);
    return options.sortDir === "desc" ? -result : result;
  });
}
