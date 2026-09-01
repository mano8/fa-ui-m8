// Labels for the object detail view, kept beside the component the way
// data-table-labels.ts sits beside the data table.

import type { MediaCategoriesLabels } from "./media-categories";

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

export const DEFAULT_CATEGORY_LABELS: Pick<
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

export const DEFAULT_LABELS: MediaObjectLabels = {
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


/** The category-table label subset the object detail view passes down. */
export type CategoryTableLabels = typeof DEFAULT_CATEGORY_LABELS;
