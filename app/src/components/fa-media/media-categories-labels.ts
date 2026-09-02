// Labels for the category manager, kept beside the component the way
// data-table-labels.ts sits beside the data table.

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

export const DEFAULT_LABELS: MediaCategoriesLabels = {
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

/** DataTable's own label bag, projected from the category labels. */
export function dataTableLabels(t: MediaCategoriesLabels) {
  return {
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
  };
}
